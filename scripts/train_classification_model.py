"""
Script de Treinamento do Modelo de Classificação de Acidentes - Sompo
======================================================================

Treina um RandomForestClassifier para classificar acidentes em 3 categorias:
- Sem Vítimas (0)
- Com Vítimas Feridas (1)
- Com Vítimas Fatais (2)

Autor: Sistema Sompo
Data: 2025-10-14
"""

import pandas as pd
import numpy as np
import joblib
from datetime import datetime
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

print("=" * 80)
print("  SOMPO - Treinamento de Modelo de Classificacao de Acidentes")
print("=" * 80)
print()

# ============================================================================
# STEP 1: Carregar dados do Excel
# ============================================================================

print("[1/5] Carregando dados do Excel...")

excel_path = Path("DadosReais/dados_acidentes.xlsx")

if not excel_path.exists():
    print(f"ERRO: Arquivo nao encontrado: {excel_path}")
    print("   Certifique-se de que o arquivo dados_acidentes.xlsx esta em DadosReais/")
    exit(1)

# Ler Excel
df = pd.read_excel(excel_path)
print(f"   OK {len(df):,} registros carregados")
print(f"   Colunas: {list(df.columns)[:10]}...")
print()

# ============================================================================
# STEP 2: Feature Engineering
# ============================================================================

print("[2/5] Feature Engineering...")

# Limpar e preparar dados
df_clean = df.copy()

# Converter data
if 'data_inversa' in df_clean.columns:
    df_clean['data'] = pd.to_datetime(df_clean['data_inversa'], errors='coerce')
elif 'data' in df_clean.columns:
    df_clean['data'] = pd.to_datetime(df_clean['data'], errors='coerce')
else:
    print("ERRO: Coluna de data nao encontrada")
    exit(1)

# Extrair features temporais
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
        return 2  # Com Vítimas Fatais
    elif row['feridos_graves'] > 0 or row['feridos_leves'] > 0:
        return 1  # Com Vítimas Feridas
    else:
        return 0  # Sem Vítimas

df_clean['classificacao'] = df_clean.apply(classify_severity, axis=1)

# Remover registros sem informações essenciais
df_clean = df_clean.dropna(subset=['uf', 'br', 'km'])

print(f"   OK {len(df_clean):,} registros apos limpeza")
print(f"   Distribuicao de classificacao:")
print(f"      - Sem Vitimas (0): {(df_clean['classificacao'] == 0).sum():,}")
print(f"      - Com Vitimas Feridas (1): {(df_clean['classificacao'] == 1).sum():,}")
print(f"      - Com Vitimas Fatais (2): {(df_clean['classificacao'] == 2).sum():,}")
print()

# ============================================================================
# STEP 3: Preparar features para o modelo
# ============================================================================

print("[3/5] Preparando features para o modelo...")

# Selecionar features relevantes (MESMAS DO MODELO DE RISCO)
features = ['uf', 'br', 'km', 'hora', 'dia_semana', 'mes', 
            'clima_categoria', 'fase_dia_categoria', 'tipo_pista_categoria']

# Criar dataset
df_model = df_clean[features + ['classificacao']].copy()

# Encoding de features categóricas
le_dict = {}
for col in ['uf', 'clima_categoria', 'fase_dia_categoria', 'tipo_pista_categoria']:
    le = LabelEncoder()
    df_model[col + '_encoded'] = le.fit_transform(df_model[col].astype(str))
    le_dict[col] = le

# Features finais para o modelo (9 features)
feature_cols = ['uf_encoded', 'br', 'km', 'hora', 'dia_semana', 'mes',
                'clima_categoria_encoded', 'fase_dia_categoria_encoded', 'tipo_pista_categoria_encoded']

X = df_model[feature_cols]
y = df_model['classificacao']

print(f"   OK Dataset preparado: {X.shape[0]:,} amostras, {X.shape[1]} features")
print(f"   Features: {feature_cols}")
print()

# ============================================================================
# STEP 4: Treinar modelo RandomForest
# ============================================================================

print("[4/5] Treinando modelo RandomForestClassifier...")

# Split treino/teste
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Treinar modelo
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1,
    class_weight='balanced'  # Importante para lidar com classes desbalanceadas
)

print(f"   Treinando com {len(X_train):,} amostras...")
model.fit(X_train, y_train)

# Avaliar
y_pred = model.predict(X_test)
y_pred_proba = model.predict_proba(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"   OK Modelo treinado com sucesso!")
print(f"   Acuracia no conjunto de teste: {accuracy:.2%}")
print()

# Relatório detalhado
print("   Relatorio de Classificacao:")
print(classification_report(y_test, y_pred, 
                            target_names=['Sem Vitimas', 'Com Vitimas Feridas', 'Com Vitimas Fatais']))
print()

# Matriz de confusão
print("   Matriz de Confusao:")
cm = confusion_matrix(y_test, y_pred)
print(cm)
print()

# Feature importance
print("   Importancia das Features:")
feature_importance = pd.DataFrame({
    'feature': feature_cols,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

for idx, row in feature_importance.iterrows():
    print(f"      {row['feature']:30s}: {row['importance']:.4f}")
print()

# ============================================================================
# STEP 5: Salvar modelo e encoders
# ============================================================================

print("[5/5] Salvando modelo e encoders...")

# Salvar modelo
model_save_path = Path("backend/models/modeloClassificacao.joblib")
model_save_path.parent.mkdir(parents=True, exist_ok=True)
joblib.dump(model, model_save_path)
print(f"   OK Modelo salvo em: {model_save_path}")
print(f"   Tamanho: {model_save_path.stat().st_size / 1024:.2f} KB")

# Salvar encoders (reutilizar os mesmos do modelo de risco para compatibilidade)
encoders_save_path = Path("backend/models/label_encoders.joblib")
joblib.dump(le_dict, encoders_save_path)
print(f"   OK Encoders salvos em: {encoders_save_path}")

print()
print("=" * 80)
print("  OK TREINAMENTO CONCLUIDO COM SUCESSO!")
print("=" * 80)
print()
print("Resumo:")
print(f"   - Total de amostras: {len(df_model):,}")
print(f"   - Features: {X.shape[1]}")
print(f"   - Classes: 3 (Sem Vitimas, Com Feridas, Com Fatais)")
print(f"   - Acuracia: {accuracy:.2%}")
print(f"   - Modelo: RandomForestClassifier")
print()
print("O modelo esta pronto para uso na API de Classificacao!")
print("   Execute: python scripts/classification_api.py")
print()


