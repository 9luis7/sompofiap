"""
API Flask para Modelo de Classificação de Acidentes - Sompo
============================================================

Carrega modelo de classificação (modeloClassificacao.joblib) e fornece 
predições via HTTP REST.

Endpoints:
    GET /health - Health check
    GET /model-info - Informações sobre o modelo carregado
    POST /classify - Classificar tipo de acidente
    
Autor: Sistema Sompo
Data: 2025-10-14
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import logging
from pathlib import Path
from datetime import datetime

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Caminhos dos modelos
MODEL_PATH = Path("backend/models/modeloClassificacao.joblib")
ENCODERS_PATH = Path("backend/models/label_encoders.joblib")

# Variáveis globais para modelo e encoders
classification_model = None
label_encoders = None
model_loaded_at = None

# Mapeamento de classes (baseado no DATATRAN)
ACCIDENT_CLASSES = [
    "Sem Vítimas",
    "Com Vítimas Feridas", 
    "Com Vítimas Fatais"
]


def load_model():
    """Carrega o modelo e encoders do disco"""
    global classification_model, label_encoders, model_loaded_at
    
    try:
        logger.info("🤖 Carregando modelo de classificação de acidentes...")
        
        # Verificar se arquivos existem
        if not MODEL_PATH.exists():
            logger.error(f"❌ Modelo não encontrado: {MODEL_PATH}")
            return False
            
        if not ENCODERS_PATH.exists():
            logger.error(f"❌ Encoders não encontrados: {ENCODERS_PATH}")
            return False
        
        # Carregar modelo de classificação
        classification_model = joblib.load(MODEL_PATH)
        logger.info(f"   ✅ Modelo de classificação carregado: {MODEL_PATH}")
        
        # Carregar encoders
        label_encoders = joblib.load(ENCODERS_PATH)
        logger.info(f"   ✅ Label encoders carregados: {ENCODERS_PATH}")
        
        model_loaded_at = datetime.now()
        
        logger.info("=" * 60)
        logger.info("✅ MODELO DE CLASSIFICAÇÃO PRONTO!")
        logger.info(f"   Tipo: {type(classification_model).__name__}")
        logger.info(f"   Classes: {len(ACCIDENT_CLASSES)}")
        logger.info(f"   Encoders disponíveis: {list(label_encoders.keys())}")
        logger.info("=" * 60)
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro ao carregar modelo de classificação: {e}", exc_info=True)
        return False


def prepare_features(data):
    """
    Prepara features para o modelo
    
    Args:
        data: Dict com uf, br, km, hour, weatherCondition, dayOfWeek
        
    Returns:
        Array numpy com features preparadas
    """
    try:
        # Extrair e validar dados
        uf = str(data.get('uf', 'SP')).upper()
        br = int(data.get('br', 116))
        km = float(data.get('km', 0))
        hour = int(data.get('hour', 12))
        day_of_week = int(data.get('dayOfWeek', 2))
        month = int(data.get('month', 6))
        
        # Mapear condição meteorológica
        weather_input = str(data.get('weatherCondition', 'claro')).lower()
        weather_mapping = {
            'claro': 'claro',
            'clear': 'claro',
            'sol': 'claro',
            'nublado': 'nublado',
            'cloudy': 'nublado',
            'chuvoso': 'chuvoso',
            'chuva': 'chuvoso',
            'rain': 'chuvoso',
            'neblina': 'neblina',
            'fog': 'neblina',
            'vento': 'vento',
            'wind': 'vento'
        }
        weather = weather_mapping.get(weather_input, 'claro')
        
        # Mapear fase do dia baseado na hora
        if 6 <= hour < 12:
            day_phase = 'amanhecer' if hour < 8 else 'dia'
        elif 12 <= hour < 18:
            day_phase = 'dia'
        elif 18 <= hour < 20:
            day_phase = 'anoitecer'
        else:
            day_phase = 'noite'
            
        # Tipo de pista padrão
        road_type = 'simples'
        
        # Encodar features categóricas
        uf_encoded = label_encoders['uf'].transform([uf])[0] if uf in label_encoders['uf'].classes_ else 0
        weather_encoded = label_encoders['clima_categoria'].transform([weather])[0]
        day_phase_encoded = label_encoders['fase_dia_categoria'].transform([day_phase])[0]
        road_type_encoded = label_encoders['tipo_pista_categoria'].transform([road_type])[0]
        
        # Criar array de features na ordem correta
        features = np.array([
            uf_encoded,
            br,
            km,
            hour,
            day_of_week,
            month,
            weather_encoded,
            day_phase_encoded,
            road_type_encoded
        ])
        
        return features
        
    except Exception as e:
        logger.error(f"Erro ao preparar features: {e}", exc_info=True)
        raise


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy' if classification_model is not None else 'model_not_loaded',
        'service': 'classification-api',
        'model_loaded': classification_model is not None,
        'loaded_at': model_loaded_at.isoformat() if model_loaded_at else None,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/model-info', methods=['GET'])
def model_info():
    """Informações sobre o modelo"""
    if classification_model is None:
        return jsonify({
            'error': 'Modelo não carregado'
        }), 503
    
    return jsonify({
        'model_type': type(classification_model).__name__,
        'classes': ACCIDENT_CLASSES,
        'n_classes': len(ACCIDENT_CLASSES),
        'encoders': list(label_encoders.keys()),
        'loaded_at': model_loaded_at.isoformat() if model_loaded_at else None,
        'model_path': str(MODEL_PATH),
        'features': [
            'uf_encoded',
            'br',
            'km',
            'hora',
            'dia_semana',
            'mes',
            'clima_categoria_encoded',
            'fase_dia_categoria_encoded',
            'tipo_pista_categoria_encoded'
        ]
    })


@app.route('/classify', methods=['POST'])
def classify():
    """
    Endpoint principal de classificação
    
    Request body:
    {
        "uf": "SP",
        "br": "116",
        "km": 523,
        "hour": 22,
        "weatherCondition": "chuvoso",
        "dayOfWeek": 5,
        "month": 10
    }
    
    Response:
    {
        "classification": "Com Vítimas Fatais",
        "confidence": 0.85,
        "probabilities": {
            "Sem Vítimas": 0.05,
            "Com Vítimas Feridas": 0.10,
            "Com Vítimas Fatais": 0.85
        },
        "severity_index": 2
    }
    """
    try:
        if classification_model is None:
            return jsonify({
                'error': 'Modelo não carregado. Execute train_risk_model.py'
            }), 503
        
        # Validar request
        if not request.json:
            return jsonify({'error': 'Request body vazio'}), 400
        
        data = request.json
        
        # Preparar features
        features = prepare_features(data)
        
        # Reshape para predição
        features_reshaped = features.reshape(1, -1)
        
        # Fazer predição
        prediction = classification_model.predict(features_reshaped)[0]
        probabilities = classification_model.predict_proba(features_reshaped)[0]
        
        # Montar resposta
        result = {
            'classification': ACCIDENT_CLASSES[prediction],
            'confidence': float(max(probabilities)),
            'probabilities': {
                ACCIDENT_CLASSES[i]: float(prob) 
                for i, prob in enumerate(probabilities)
            },
            'severity_index': int(prediction),  # 0, 1, ou 2
            'input_summary': {
                'location': f"{data.get('uf')}-BR{data.get('br')} KM {data.get('km')}",
                'time': f"{data.get('hour')}:00",
                'weather': data.get('weatherCondition')
            },
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Classificação: {result['classification']} (confiança: {result['confidence']:.2%})")
        
        return jsonify(result)
        
    except KeyError as e:
        logger.error(f"Campo obrigatório faltando: {e}")
        return jsonify({
            'error': f'Campo obrigatório faltando: {e}',
            'required_fields': ['uf', 'br', 'km', 'hour']
        }), 400
        
    except Exception as e:
        logger.error(f"Erro na classificação: {e}", exc_info=True)
        return jsonify({
            'error': f'Erro ao classificar: {str(e)}'
        }), 500


@app.route('/batch-classify', methods=['POST'])
def batch_classify():
    """
    Classificação em lote
    
    Request body:
    {
        "predictions": [
            { "uf": "SP", "br": "116", "km": 523, "hour": 22, ... },
            { "uf": "RJ", "br": "101", "km": 85, "hour": 14, ... }
        ]
    }
    """
    try:
        if classification_model is None:
            return jsonify({'error': 'Modelo não carregado'}), 503
        
        data = request.json
        predictions_input = data.get('predictions', [])
        
        if not predictions_input:
            return jsonify({'error': 'Lista de predições vazia'}), 400
        
        results = []
        
        for pred_data in predictions_input:
            try:
                features = prepare_features(pred_data)
                features_reshaped = features.reshape(1, -1)
                
                prediction = classification_model.predict(features_reshaped)[0]
                probabilities = classification_model.predict_proba(features_reshaped)[0]
                
                results.append({
                    'classification': ACCIDENT_CLASSES[prediction],
                    'confidence': float(max(probabilities)),
                    'probabilities': {
                        ACCIDENT_CLASSES[i]: float(prob) 
                        for i, prob in enumerate(probabilities)
                    },
                    'severity_index': int(prediction),
                    'input': pred_data
                })
                
            except Exception as e:
                results.append({
                    'error': str(e),
                    'input': pred_data
                })
        
        return jsonify({
            'total': len(results),
            'successful': sum(1 for r in results if 'error' not in r),
            'failed': sum(1 for r in results if 'error' in r),
            'results': results
        })
        
    except Exception as e:
        logger.error(f"Erro na classificação em lote: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint não encontrado'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Erro interno do servidor'}), 500


if __name__ == '__main__':
    print("=" * 60)
    print("  🎯 API de Classificação de Acidentes - Sompo")
    print("=" * 60)
    print()
    
    # Carregar modelo
    if not load_model():
        print("❌ Falha ao carregar modelo. Execute:")
        print("   python scripts/train_risk_model.py")
        exit(1)
    
    print()
    print("🚀 Servidor iniciando na porta 5001...")
    print()
    print("📋 Endpoints disponíveis:")
    print("   GET  http://localhost:5001/health")
    print("   GET  http://localhost:5001/model-info")
    print("   POST http://localhost:5001/classify")
    print("   POST http://localhost:5001/batch-classify")
    print()
    print("=" * 60)
    print()
    
    # Iniciar servidor
    app.run(host='0.0.0.0', port=5001, debug=False)

