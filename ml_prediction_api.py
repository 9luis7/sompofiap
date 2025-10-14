"""
API Flask para Predição de Risco em Tempo Real
===============================================

Carrega modelo LightGBM salvo em joblib e fornece predições via HTTP REST.

Endpoints:
    POST /predict - Predição de risco para um segmento
    GET /health - Status da API
    GET /model-info - Informações sobre o modelo carregado

Autor: Sistema Sompo
Data: 2025-10-14
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from pathlib import Path
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criar app Flask
app = Flask(__name__)
CORS(app)  # Permitir requisições do backend Node.js

# Variáveis globais para modelo e encoders
model = None
label_encoders = None
model_loaded = False

# Caminhos dos arquivos
MODEL_PATH = Path("backend/models/risk_model.joblib")
ENCODERS_PATH = Path("backend/models/label_encoders.joblib")


def load_model():
    """Carrega o modelo e encoders do disco"""
    global model, label_encoders, model_loaded
    
    try:
        logger.info("🤖 Carregando modelo de ML...")
        
        if not MODEL_PATH.exists():
            logger.error(f"❌ Modelo não encontrado: {MODEL_PATH}")
            logger.error("   Execute: python train_risk_model.py")
            return False
        
        if not ENCODERS_PATH.exists():
            logger.error(f"❌ Encoders não encontrados: {ENCODERS_PATH}")
            logger.error("   Execute: python train_risk_model.py")
            return False
        
        # Carregar modelo
        model = joblib.load(MODEL_PATH)
        logger.info(f"   ✅ Modelo carregado: {MODEL_PATH}")
        
        # Carregar encoders
        label_encoders = joblib.load(ENCODERS_PATH)
        logger.info(f"   ✅ Encoders carregados: {ENCODERS_PATH}")
        
        model_loaded = True
        logger.info("✅ Sistema de predição pronto!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro ao carregar modelo: {e}")
        model_loaded = False
        return False


@app.route('/health', methods=['GET'])
def health():
    """Health check da API"""
    return jsonify({
        'status': 'ok' if model_loaded else 'error',
        'service': 'ML Prediction API',
        'model_loaded': model_loaded,
        'version': '1.0.0'
    })


@app.route('/model-info', methods=['GET'])
def model_info():
    """Informações sobre o modelo"""
    if not model_loaded:
        return jsonify({
            'error': 'Modelo não carregado'
        }), 503
    
    return jsonify({
        'model_type': 'LightGBM',
        'model_class': str(type(model).__name__),
        'features': [
            'uf_encoded', 'br', 'km', 'hora', 'dia_semana', 'mes',
            'clima_categoria_encoded', 'fase_dia_categoria_encoded', 
            'tipo_pista_categoria_encoded'
        ],
        'encoders': list(label_encoders.keys()) if label_encoders else [],
        'classes': ['sem_vitimas', 'com_feridos', 'com_mortos']
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predição de risco
    
    Body JSON:
    {
        "uf": "SP",
        "br": 116,
        "km": 523.5,
        "hour": 14,
        "dayOfWeek": 2,
        "month": 10,
        "weatherCondition": "claro",
        "dayPhase": "dia",
        "roadType": "simples"
    }
    """
    if not model_loaded:
        return jsonify({
            'error': 'Modelo não carregado. Execute train_risk_model.py'
        }), 503
    
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['uf', 'br', 'km']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Campo obrigatório ausente: {field}'
                }), 400
        
        # Extrair e padronizar dados
        uf = str(data['uf']).upper()
        br = int(data['br'])
        km = float(data['km'])
        hour = int(data.get('hour', 12))
        day_of_week = int(data.get('dayOfWeek', 2))
        month = int(data.get('month', 6))
        
        # Mapear condições
        weather = data.get('weatherCondition', 'claro').lower()
        weather_mapping = {
            'claro': 'claro',
            'nublado': 'nublado',
            'chuva': 'chuvoso',
            'chuvoso': 'chuvoso',
            'neblina': 'neblina',
            'nevoeiro': 'neblina'
        }
        clima_categoria = weather_mapping.get(weather, 'claro')
        
        day_phase = data.get('dayPhase', 'dia').lower()
        phase_mapping = {
            'dia': 'dia',
            'noite': 'noite',
            'amanhecer': 'amanhecer',
            'anoitecer': 'anoitecer'
        }
        fase_dia_categoria = phase_mapping.get(day_phase, 'dia')
        
        road_type = data.get('roadType', 'simples').lower()
        road_mapping = {
            'simples': 'simples',
            'dupla': 'dupla',
            'multipla': 'multipla'
        }
        tipo_pista_categoria = road_mapping.get(road_type, 'simples')
        
        # Preparar features para predição
        try:
            uf_encoded = label_encoders['uf'].transform([uf])[0]
            clima_encoded = label_encoders['clima_categoria'].transform([clima_categoria])[0]
            fase_encoded = label_encoders['fase_dia_categoria'].transform([fase_dia_categoria])[0]
            pista_encoded = label_encoders['tipo_pista_categoria'].transform([tipo_pista_categoria])[0]
        except ValueError as e:
            return jsonify({
                'error': f'Valor não reconhecido nos encoders: {e}'
            }), 400
        
        # Criar array de features
        features = np.array([[
            uf_encoded,
            br,
            km,
            hour,
            day_of_week,
            month,
            clima_encoded,
            fase_encoded,
            pista_encoded
        ]])
        
        # Fazer predição
        prediction_class = model.predict(features)[0]
        prediction_proba = model.predict_proba(features)[0]
        
        # Calcular score de risco (0-100)
        # Score ponderado: sem_vitimas*0 + com_feridos*50 + com_mortos*100
        risk_score = prediction_proba[1] * 50 + prediction_proba[2] * 100
        
        # Classificar nível
        if risk_score >= 80:
            risk_level = 'critico'
        elif risk_score >= 60:
            risk_level = 'alto'
        elif risk_score >= 40:
            risk_level = 'moderado'
        else:
            risk_level = 'baixo'
        
        # Gerar recomendações
        recommendations = []
        if risk_level == 'critico':
            recommendations.append('🚨 RISCO CRÍTICO: Considere rota alternativa urgentemente')
            recommendations.append('Reduza velocidade em pelo menos 30%')
        elif risk_level == 'alto':
            recommendations.append('⚠️ ALTO RISCO: Atenção redobrada necessária')
            recommendations.append('Reduza velocidade em 20%')
        elif risk_level == 'moderado':
            recommendations.append('⚡ RISCO MODERADO: Mantenha atenção')
        else:
            recommendations.append('✅ Risco relativamente baixo')
        
        # Adicionar recomendações contextuais
        if hour >= 18 or hour < 6:
            recommendations.append('🌙 Período noturno: use farol alto quando apropriado')
        if clima_categoria == 'chuvoso':
            recommendations.append('🌧️ Chuva: reduza velocidade e aumente distância')
        if clima_categoria == 'neblina':
            recommendations.append('🌫️ Neblina: velocidade reduzida e farol baixo')
        
        return jsonify({
            'success': True,
            'data': {
                'risk_score': round(risk_score, 2),
                'risk_level': risk_level,
                'predicted_class': int(prediction_class),
                'class_probabilities': {
                    'sem_vitimas': round(float(prediction_proba[0]) * 100, 2),
                    'com_feridos': round(float(prediction_proba[1]) * 100, 2),
                    'com_mortos': round(float(prediction_proba[2]) * 100, 2)
                },
                'recommendations': recommendations,
                'input': {
                    'uf': uf,
                    'br': br,
                    'km': km,
                    'context': {
                        'hour': hour,
                        'weather': clima_categoria,
                        'day_phase': fase_dia_categoria,
                        'road_type': tipo_pista_categoria
                    }
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Erro na predição: {e}")
        return jsonify({
            'error': str(e)
        }), 500


@app.route('/predict-batch', methods=['POST'])
def predict_batch():
    """
    Predição em lote
    
    Body JSON:
    {
        "predictions": [
            {"uf": "SP", "br": 116, "km": 100, ...},
            {"uf": "SP", "br": 116, "km": 200, ...}
        ]
    }
    """
    if not model_loaded:
        return jsonify({
            'error': 'Modelo não carregado'
        }), 503
    
    try:
        data = request.get_json()
        predictions_input = data.get('predictions', [])
        
        if not predictions_input:
            return jsonify({
                'error': 'Lista de predições vazia'
            }), 400
        
        results = []
        for pred_input in predictions_input:
            # Simular requisição individual
            with app.test_request_context(
                '/predict',
                method='POST',
                json=pred_input
            ):
                response = predict()
                if isinstance(response, tuple):
                    results.append(response[0].get_json())
                else:
                    results.append(response.get_json())
        
        return jsonify({
            'success': True,
            'data': {
                'predictions': results,
                'total': len(results)
            }
        })
        
    except Exception as e:
        logger.error(f"Erro na predição em lote: {e}")
        return jsonify({
            'error': str(e)
        }), 500


if __name__ == '__main__':
    print()
    print("=" * 80)
    print("  🤖 SOMPO ML Prediction API")
    print("=" * 80)
    print()
    
    # Carregar modelo
    if load_model():
        print()
        print("🚀 Iniciando servidor Flask...")
        print("   📡 http://localhost:5000")
        print("   💡 Endpoints:")
        print("      GET  /health")
        print("      GET  /model-info")
        print("      POST /predict")
        print("      POST /predict-batch")
        print()
        print("=" * 80)
        print()
        
        # Iniciar servidor
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        print()
        print("❌ Falha ao carregar modelo. Execute:")
        print("   python train_risk_model.py")
        print()

