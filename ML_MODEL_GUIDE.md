# 🤖 Guia do Sistema de Modelos ML - Formato Joblib/Pickle

Sistema completo para trabalhar com modelos de Machine Learning salvos em **joblib** ou **pickle**.

---

## 📋 Arquitetura do Sistema

```
┌──────────────────────────┐
│ dados_acidentes.xlsx     │
│ (47K acidentes DATATRAN) │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ train_risk_model.py      │
│ - Treina modelo LightGBM │
│ - Salva em joblib        │
└────────────┬─────────────┘
             │
             ├──────────────────────────────────┐
             │                                  │
             ▼                                  ▼
┌──────────────────────────┐    ┌───────────────────────────┐
│ risk_model.joblib        │    │ risk_scores.json          │
│ (Modelo ML treinado)     │    │ (Scores pré-calculados)   │
└────────────┬─────────────┘    └───────────┬───────────────┘
             │                              │
             ▼                              │
┌──────────────────────────┐               │
│ ml_prediction_api.py     │               │
│ Flask API (porta 5000)   │               │
│ - Carrega modelo joblib  │               │
│ - Predições em tempo real│               │
└────────────┬─────────────┘               │
             │                              │
             │        ┌─────────────────────┘
             │        │
             ▼        ▼
┌──────────────────────────────────────────┐
│ Backend TypeScript (porta 3001)          │
│ ┌──────────────────────────────────────┐ │
│ │ ml-api-client.service.ts             │ │
│ │ - Chama API Python (ML em tempo real)│ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ risk-lookup.service.ts               │ │
│ │ - Usa scores pré-calculados (fallback)│ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## 🚀 Guia de Início Rápido

### Passo 1: Treinar e Salvar Modelo

```bash
# Treina o modelo e salva em backend/models/
python train_risk_model.py
```

**Arquivos gerados:**

- `backend/models/risk_model.joblib` - Modelo LightGBM treinado
- `backend/models/label_encoders.joblib` - Encoders de features categóricas
- `backend/risk_scores.json` - Scores pré-calculados (cache/fallback)

### Passo 2: Iniciar API Python (opcional)

```bash
# Terminal 1: API Python de ML
python ml_prediction_api.py

# Ou no Windows:
start_ml_api.bat
```

API disponível em: `http://localhost:5000`

### Passo 3: Iniciar Backend TypeScript

```bash
# Terminal 2: Backend Node.js
cd backend
npm run build
npm start
```

Backend disponível em: `http://localhost:3001`

---

## 🔄 Dois Modos de Operação

### Modo 1: Scores Pré-calculados (Padrão)

**Vantagens:**

- ⚡ Ultra rápido (~1ms)
- 📦 Sem dependência da API Python
- 💾 Baixo uso de memória
- ✅ Sempre disponível

**Como usar:**

```bash
curl -X POST http://localhost:3001/api/v1/risk/predict \
  -H "Content-Type: application/json" \
  -d '{"uf":"SP", "br":"116", "km":523}'
```

### Modo 2: ML em Tempo Real

**Vantagens:**

- 🎯 Predições mais precisas
- 🧠 Usa modelo treinado diretamente
- 🔄 Sem necessidade de pré-calcular
- 📊 Probabilidades detalhadas

**Como usar:**

```bash
curl -X POST http://localhost:3001/api/v1/risk/predict \
  -H "Content-Type: application/json" \
  -d '{
    "uf":"SP",
    "br":"116",
    "km":523,
    "hour":22,
    "weatherCondition":"chuva",
    "useRealTimeML": true
  }'
```

---

## 📡 API Endpoints

### Backend TypeScript (porta 3001)

#### 1. Status do Sistema

```http
GET /api/v1/risk/status
```

Retorna status de ambos os modos (pré-calculado e ML tempo real).

#### 2. Predição de Risco

```http
POST /api/v1/risk/predict

Body:
{
  "uf": "SP",
  "br": "116",
  "km": 523,
  "hour": 14,
  "dayOfWeek": 2,
  "month": 10,
  "weatherCondition": "chuva",
  "dayPhase": "dia",
  "roadType": "simples",
  "useRealTimeML": true  // false = usa scores pré-calculados
}
```

### API Python Flask (porta 5000)

#### 1. Health Check

```http
GET /health
```

#### 2. Informações do Modelo

```http
GET /model-info
```

#### 3. Predição Direta

```http
POST /predict

Body:
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
```

#### 4. Predição em Lote

```http
POST /predict-batch

Body:
{
  "predictions": [
    {"uf": "SP", "br": 116, "km": 100, ...},
    {"uf": "SP", "br": 116, "km": 200, ...}
  ]
}
```

---

## 🔧 Trabalhando com Modelos

### Salvar Modelo Customizado

```python
import joblib
import lightgbm as lgb

# Treinar seu modelo
model = lgb.LGBMClassifier(...)
model.fit(X_train, y_train)

# Salvar em joblib (recomendado)
joblib.dump(model, 'backend/models/risk_model.joblib')

# Ou em pickle (alternativa)
import pickle
with open('backend/models/risk_model.pkl', 'wb') as f:
    pickle.dump(model, f)
```

### Carregar Modelo

```python
import joblib

# Carregar de joblib
model = joblib.load('backend/models/risk_model.joblib')

# Ou de pickle
import pickle
with open('backend/models/risk_model.pkl', 'rb') as f:
    model = pickle.load(f)

# Fazer predição
prediction = model.predict(X_new)
```

### Atualizar Modelo no Sistema

1. **Treinar novo modelo** e salvar em `backend/models/risk_model.joblib`
2. **Reiniciar API Python**: O modelo será recarregado automaticamente
3. **Não precisa** reiniciar o backend TypeScript

```bash
# Treinar novo modelo
python train_risk_model.py

# Reiniciar apenas API Python (se estiver rodando)
# Ctrl+C e depois:
python ml_prediction_api.py
```

---

## 📊 Formatos Suportados

### Joblib (Recomendado)

```python
import joblib

# Salvar
joblib.dump(model, 'model.joblib')

# Carregar
model = joblib.load('model.joblib')
```

**Vantagens:**

- ✅ Mais eficiente para arrays NumPy
- ✅ Melhor compressão
- ✅ Padrão scikit-learn

### Pickle

```python
import pickle

# Salvar
with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)

# Carregar
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)
```

**Vantagens:**

- ✅ Biblioteca padrão Python
- ✅ Funciona com qualquer objeto Python

---

## 🔐 Boas Práticas

### 1. Versionamento de Modelos

```bash
backend/models/
├── risk_model_v1.0.0.joblib
├── risk_model_v1.1.0.joblib
├── risk_model_latest.joblib -> risk_model_v1.1.0.joblib
└── label_encoders_v1.1.0.joblib
```

### 2. Metadados do Modelo

Salvar junto com o modelo:

```python
import joblib
from datetime import datetime

model_metadata = {
    'model': model,
    'version': '1.1.0',
    'trained_at': datetime.now().isoformat(),
    'accuracy': 0.7718,
    'features': feature_names,
    'encoders': label_encoders
}

joblib.dump(model_metadata, 'risk_model_with_metadata.joblib')
```

### 3. Validação de Modelo

```python
import joblib

# Carregar
data = joblib.load('model.joblib')

# Verificar estrutura
if isinstance(data, dict):
    model = data['model']
    version = data['version']
    print(f"Modelo versão {version} carregado")
else:
    model = data
    print("Modelo carregado (sem metadados)")
```

---

## 🧪 Testes

### Testar Modelo Localmente (Python)

```python
import joblib
import numpy as np

# Carregar modelo
model = joblib.load('backend/models/risk_model.joblib')
encoders = joblib.load('backend/models/label_encoders.joblib')

# Preparar features de teste
test_features = np.array([[
    encoders['uf'].transform(['SP'])[0],  # uf_encoded
    116,  # br
    523,  # km
    14,   # hora
    2,    # dia_semana
    10,   # mes
    encoders['clima_categoria'].transform(['claro'])[0],
    encoders['fase_dia_categoria'].transform(['dia'])[0],
    encoders['tipo_pista_categoria'].transform(['simples'])[0]
]])

# Predição
prediction = model.predict(test_features)
probabilities = model.predict_proba(test_features)

print(f"Classe predita: {prediction[0]}")
print(f"Probabilidades: {probabilities[0]}")
```

### Testar API Python

```bash
# Health check
curl http://localhost:5000/health

# Predição
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"uf":"SP","br":116,"km":523}'
```

### Testar Backend Completo

```bash
# Status (mostra ambos os modos)
curl http://localhost:3001/api/v1/risk/status

# Predição com scores pré-calculados
curl -X POST http://localhost:3001/api/v1/risk/predict \
  -H "Content-Type: application/json" \
  -d '{"uf":"SP","br":"116","km":523}'

# Predição com ML em tempo real
curl -X POST http://localhost:3001/api/v1/risk/predict \
  -H "Content-Type: application/json" \
  -d '{"uf":"SP","br":"116","km":523,"useRealTimeML":true}'
```

---

## 📝 Troubleshooting

### Modelo não carrega

```bash
# Verificar se arquivo existe
ls backend/models/risk_model.joblib

# Se não existir, treinar
python train_risk_model.py
```

### API Python não inicia

```bash
# Instalar dependências
pip install -r requirements-ml.txt

# Verificar porta 5000 não está em uso
netstat -an | findstr ":5000"
```

### Backend não conecta à API Python

```bash
# Verificar se API Python está rodando
curl http://localhost:5000/health

# Se não estiver, iniciar
python ml_prediction_api.py
```

---

## 🎯 Performance

### Comparação de Modos

| Modo                  | Latência | Precisão   | Memória            | Dependências    |
| --------------------- | -------- | ---------- | ------------------ | --------------- |
| Scores Pré-calculados | ~1ms     | Alta       | ~2MB               | Nenhuma         |
| ML Tempo Real         | ~10-50ms | Muito Alta | ~50MB (API Python) | Flask, LightGBM |

### Recomendações

- **Produção com alto volume**: Use scores pré-calculados
- **Casos específicos/raros**: Use ML tempo real
- **Híbrido**: Use pré-calculados como cache, ML tempo real para fallback

---

## 🚀 Deploy

### Opção 1: Apenas Backend TypeScript

```bash
# Copiar risk_scores.json para produção
# Backend funciona sem API Python
npm run build
npm start
```

### Opção 2: Backend + API Python

```bash
# Terminal 1: API Python
python ml_prediction_api.py

# Terminal 2: Backend TypeScript
cd backend
npm run build
npm start
```

### Docker (futuro)

```dockerfile
# Exemplo de Dockerfile para API Python
FROM python:3.11-slim
WORKDIR /app
COPY requirements-ml.txt .
RUN pip install -r requirements-ml.txt
COPY ml_prediction_api.py .
COPY backend/models/ backend/models/
CMD ["python", "ml_prediction_api.py"]
```

---

**Sistema desenvolvido por Sompo - 2025**
**Suporte a Modelos: Joblib, Pickle**
