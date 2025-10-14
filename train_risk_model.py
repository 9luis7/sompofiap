"""
Sistema de Predição de Gravidade de Acidentes - Sompo
=====================================================

Este script treina um modelo LightGBM para classificar a probabilidade de 
acidentes graves baseado em condições contextuais (rodovia, KM, hora, clima).

O output é um arquivo JSON com scores pré-calculados para lookup rápido no backend.

Autor: Sistema Sompo
Data: 2025-10-14
"""

import pandas as pd
import numpy as np
import json
import joblib
from datetime import datetime
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

print("=" * 80)
print("  🚛 SOMPO - Treinamento de Modelo de Risco de Acidentes")
print("=" * 80)
print()

# ============================================================================
# STEP 1: Carregar dados do Excel
# ============================================================================

print("📖 [1/6] Carregando dados do Excel...")

excel_path = Path("DadosReais/dados_acidentes.xlsx")

if not excel_path.exists():
    print(f"❌ ERRO: Arquivo não encontrado: {excel_path}")
    print("   Certifique-se de que o arquivo dados_acidentes.xlsx está em DadosReais/")
    exit(1)

# Ler Excel
df = pd.read_excel(excel_path)
print(f"   ✅ {len(df):,} registros carregados")
print(f"   📊 Colunas: {list(df.columns)[:10]}...")
print()

# ============================================================================
# STEP 2: Feature Engineering
# ============================================================================

print("🔧 [2/6] Feature Engineering...")

# Limpar e preparar dados
df_clean = df.copy()

# Converter data
if 'data_inversa' in df_clean.columns:
    df_clean['data'] = pd.to_datetime(df_clean['data_inversa'], errors='coerce')
elif 'data' in df_clean.columns:
    df_clean['data'] = pd.to_datetime(df_clean['data'], errors='coerce')
else:
    print("❌ ERRO: Coluna de data não encontrada")
    exit(1)

# Extrair features temporais
# horario é datetime.time, converter para hora
df_clean['hora'] = df_clean['horario'].apply(lambda x: x.hour if hasattr(x, 'hour') else 12)
df_clean['dia_semana'] = df_clean['data'].dt.dayofweek  # 0=Monday, 6=Sunday
df_clean['mes'] = df_clean['data'].dt.month

# Mapear condições meteorológicas para categorias simplificadas
weather_mapping = {
    'Céu Claro': 'claro',
    'Sol': 'claro',
    'Nublado': 'nublado',
    'Chuva': 'chuvoso',
    'Garoa/Chuvisco': 'chuvoso',
    'Nevoeiro/Neblina': 'neblina',
    'Vento': 'vento',
    'Ignorado': 'claro',
}

df_clean['clima_categoria'] = df_clean['condicao_metereologica'].map(weather_mapping).fillna('claro')

# Mapear fase do dia
day_phase_mapping = {
    'Pleno dia': 'dia',
    'Plena Noite': 'noite',
    'Amanhecer': 'amanhecer',
    'Anoitecer': 'anoitecer',
}

df_clean['fase_dia_categoria'] = df_clean['fase_dia'].map(day_phase_mapping).fillna('dia')

# Mapear tipo de pista
road_type_mapping = {
    'Dupla': 'dupla',
    'Simples': 'simples',
    'Múltipla': 'multipla',
}

df_clean['tipo_pista_categoria'] = df_clean['tipo_pista'].map(road_type_mapping).fillna('simples')

# Target: Classificação de gravidade
# 0 = sem vítimas, 1 = com feridos, 2 = com mortos
df_clean['mortos'] = df_clean['mortos'].fillna(0).astype(int)
df_clean['feridos_graves'] = df_clean['feridos_graves'].fillna(0).astype(int)
df_clean['feridos_leves'] = df_clean['feridos_leves'].fillna(0).astype(int)

def classify_severity(row):
    if row['mortos'] > 0:
        return 2  # Grave (com mortos)
    elif row['feridos_graves'] > 0:
        return 1  # Moderado (feridos graves)
    elif row['feridos_leves'] > 0:
        return 1  # Moderado (feridos)
    else:
        return 0  # Leve (sem vítimas)

df_clean['gravidade'] = df_clean.apply(classify_severity, axis=1)

# Remover registros sem coordenadas ou informações essenciais
df_clean = df_clean.dropna(subset=['uf', 'br', 'km', 'latitude', 'longitude'])

print(f"   ✅ {len(df_clean):,} registros após limpeza")
print(f"   📊 Distribuição de gravidade:")
print(f"      - Sem vítimas (0): {(df_clean['gravidade'] == 0).sum():,}")
print(f"      - Com feridos (1): {(df_clean['gravidade'] == 1).sum():,}")
print(f"      - Com mortos (2): {(df_clean['gravidade'] == 2).sum():,}")
print()

# ============================================================================
# STEP 3: Preparar features para o modelo
# ============================================================================

print("🎯 [3/6] Preparando features para o modelo...")

# Selecionar features relevantes
features = ['uf', 'br', 'km', 'hora', 'dia_semana', 'mes', 
            'clima_categoria', 'fase_dia_categoria', 'tipo_pista_categoria']

# Criar dataset
df_model = df_clean[features + ['gravidade']].copy()

# Encoding de features categóricas
from sklearn.preprocessing import LabelEncoder

le_dict = {}
for col in ['uf', 'clima_categoria', 'fase_dia_categoria', 'tipo_pista_categoria']:
    le = LabelEncoder()
    df_model[col + '_encoded'] = le.fit_transform(df_model[col].astype(str))
    le_dict[col] = le

# Features finais para o modelo
feature_cols = ['uf_encoded', 'br', 'km', 'hora', 'dia_semana', 'mes',
                'clima_categoria_encoded', 'fase_dia_categoria_encoded', 'tipo_pista_categoria_encoded']

X = df_model[feature_cols]
y = df_model['gravidade']

print(f"   ✅ Dataset preparado: {X.shape[0]:,} amostras, {X.shape[1]} features")
print()

# ============================================================================
# STEP 4: Treinar modelo LightGBM
# ============================================================================

print("🤖 [4/6] Treinando modelo LightGBM...")

try:
    import lightgbm as lgb
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import classification_report, accuracy_score
    
    # Split treino/teste
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Treinar modelo
    model = lgb.LGBMClassifier(
        n_estimators=200,
        max_depth=10,
        learning_rate=0.1,
        num_leaves=31,
        random_state=42,
        verbose=-1
    )
    
    model.fit(X_train, y_train)
    
    # Avaliar
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"   ✅ Modelo treinado com sucesso!")
    print(f"   📊 Acurácia no conjunto de teste: {accuracy:.2%}")
    print()
    print("   📋 Relatório de classificação:")
    print(classification_report(y_test, y_pred, 
                                target_names=['Sem vítimas', 'Com feridos', 'Com mortos']))
    print()
    
    has_model = True
    
    # Salvar modelo treinado
    model_save_path = Path("backend/models/risk_model.joblib")
    model_save_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, model_save_path)
    print(f"   💾 Modelo salvo em: {model_save_path}")
    
    # Salvar também os encoders
    encoders_save_path = Path("backend/models/label_encoders.joblib")
    joblib.dump(le_dict, encoders_save_path)
    print(f"   💾 Encoders salvos em: {encoders_save_path}")
    print()
    
except ImportError:
    print("   ⚠️  LightGBM não instalado. Usando análise estatística simples.")
    print("   💡 Para melhor performance, instale: pip install lightgbm")
    has_model = False
    print()

# ============================================================================
# STEP 5: Gerar scores de risco pré-calculados
# ============================================================================

print("📊 [5/6] Gerando mapa de risco pré-calculado...")

risk_scores = {}

# Agrupar dados por segmentos (UF, BR, KM)
# Agrupar KMs em intervalos de 10km para reduzir combinações
df_clean['km_segment'] = (df_clean['km'] // 10) * 10

# Obter segmentos únicos com estatísticas
segments = df_clean.groupby(['uf', 'br', 'km_segment']).agg({
    'gravidade': ['count', 'mean'],
    'mortos': 'sum',
    'feridos_graves': 'sum',
    'feridos_leves': 'sum',
}).reset_index()

segments.columns = ['uf', 'br', 'km', 'total_acidentes', 'gravidade_media', 
                    'total_mortos', 'total_feridos_graves', 'total_feridos_leves']

print(f"   📍 {len(segments):,} segmentos únicos identificados")

# Condições contextuais para gerar scores
contextos = [
    {'nome': 'dia_claro', 'clima': 'claro', 'fase': 'dia', 'hora': 14, 'dia_semana': 2},
    {'nome': 'dia_nublado', 'clima': 'nublado', 'fase': 'dia', 'hora': 14, 'dia_semana': 2},
    {'nome': 'dia_chuvoso', 'clima': 'chuvoso', 'fase': 'dia', 'hora': 14, 'dia_semana': 2},
    {'nome': 'noite_claro', 'clima': 'claro', 'fase': 'noite', 'hora': 22, 'dia_semana': 2},
    {'nome': 'noite_chuvoso', 'clima': 'chuvoso', 'fase': 'noite', 'hora': 22, 'dia_semana': 2},
    {'nome': 'amanhecer_claro', 'clima': 'claro', 'fase': 'amanhecer', 'hora': 6, 'dia_semana': 1},
    {'nome': 'anoitecer_claro', 'clima': 'claro', 'fase': 'anoitecer', 'hora': 18, 'dia_semana': 5},
    {'nome': 'fds_noite_claro', 'clima': 'claro', 'fase': 'noite', 'hora': 23, 'dia_semana': 6},
]

total_combinations = len(segments) * len(contextos)
print(f"   🔢 Gerando {total_combinations:,} combinações de risco...")

processed = 0

for idx, segment in segments.iterrows():
    uf = segment['uf']
    br = str(int(segment['br'])).zfill(3)
    km = int(segment['km'])
    
    # Chave do segmento
    segment_key = f"{uf}_{br}_{km}"
    
    # Calcular score base do segmento (histórico)
    total_acidentes = segment['total_acidentes']
    gravidade_media = segment['gravidade_media']
    
    # Normalizar para 0-100
    # Score base considera densidade e gravidade
    score_base = min(
        (total_acidentes / 10) * 30 +  # Densidade (max 30 pontos)
        (gravidade_media / 2) * 70,     # Gravidade média (max 70 pontos)
        100
    )
    
    segment_scores = {}
    
    for contexto in contextos:
        if has_model:
            # Usar modelo para prever
            try:
                # Preparar features
                features_input = pd.DataFrame([{
                    'uf_encoded': le_dict['uf'].transform([uf])[0],
                    'br': int(segment['br']),
                    'km': km,
                    'hora': contexto['hora'],
                    'dia_semana': contexto['dia_semana'],
                    'mes': 6,  # Mês médio
                    'clima_categoria_encoded': le_dict['clima_categoria'].transform([contexto['clima']])[0],
                    'fase_dia_categoria_encoded': le_dict['fase_dia_categoria'].transform([contexto['fase']])[0],
                    'tipo_pista_categoria_encoded': le_dict['tipo_pista_categoria'].transform(['simples'])[0],
                }])
                
                # Prever probabilidade
                proba = model.predict_proba(features_input)[0]
                # Score = probabilidade ponderada (feridos*50 + mortos*100)
                score_ml = proba[1] * 50 + proba[2] * 100
                
                # Combinar com score base (60% ML, 40% histórico)
                score_final = score_ml * 0.6 + score_base * 0.4
            except:
                score_final = score_base
        else:
            # Usar análise estatística
            score_final = score_base
            
            # Ajustar por contexto
            if contexto['fase'] == 'noite':
                score_final *= 1.3
            if contexto['clima'] == 'chuvoso':
                score_final *= 1.4
            if contexto['clima'] == 'neblina':
                score_final *= 1.5
            if contexto['dia_semana'] in [5, 6]:  # Fim de semana
                score_final *= 1.2
            
            score_final = min(score_final, 100)
        
        segment_scores[contexto['nome']] = round(score_final, 2)
    
    risk_scores[segment_key] = segment_scores
    
    processed += len(contextos)
    if processed % 10000 == 0:
        print(f"      Processado: {processed:,} / {total_combinations:,} ({processed/total_combinations*100:.1f}%)")

print(f"   ✅ {len(risk_scores):,} segmentos com scores gerados")
print()

# ============================================================================
# STEP 6: Salvar JSON
# ============================================================================

print("💾 [6/6] Salvando arquivo de risco...")

output_path = Path("backend/risk_scores.json")
output_path.parent.mkdir(exist_ok=True)

# Adicionar metadata
output_data = {
    "metadata": {
        "generated_at": datetime.now().isoformat(),
        "total_segments": len(risk_scores),
        "total_accidents_analyzed": len(df_clean),
        "model_type": "LightGBM" if has_model else "Statistical",
        "accuracy": f"{accuracy:.2%}" if has_model else "N/A",
        "contexts": [c['nome'] for c in contextos],
        "score_range": "0-100 (0=baixo risco, 100=alto risco)",
    },
    "scores": risk_scores
}

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print(f"   ✅ Arquivo salvo: {output_path}")
print(f"   📦 Tamanho: {output_path.stat().st_size / 1024 / 1024:.2f} MB")
print()

# Estatísticas finais
all_scores = [score for seg in risk_scores.values() for score in seg.values()]
print("📊 Estatísticas dos Scores:")
print(f"   - Mínimo: {min(all_scores):.2f}")
print(f"   - Máximo: {max(all_scores):.2f}")
print(f"   - Média: {np.mean(all_scores):.2f}")
print(f"   - Mediana: {np.median(all_scores):.2f}")
print()

# Top 10 segmentos mais perigosos
print("🔴 Top 10 Segmentos Mais Perigosos:")
segment_avg_risk = {k: np.mean(list(v.values())) for k, v in risk_scores.items()}
top_10 = sorted(segment_avg_risk.items(), key=lambda x: x[1], reverse=True)[:10]

for i, (segment, avg_score) in enumerate(top_10, 1):
    uf, br, km = segment.split('_')
    print(f"   {i:2d}. {uf}-BR{br} KM {km} - Score médio: {avg_score:.1f}")

print()
print("=" * 80)
print("  ✅ TREINAMENTO CONCLUÍDO COM SUCESSO!")
print("=" * 80)
print()
print("📋 Próximos passos:")
print("   1. O arquivo risk_scores.json foi gerado em backend/")
print("   2. O backend irá carregar este arquivo automaticamente")
print("   3. APIs agora usarão scores pré-calculados para predição rápida")
print()

