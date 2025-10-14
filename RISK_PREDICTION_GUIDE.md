# 🤖 Guia de Predição de Risco - Sistema Sompo

Sistema inteligente de predição de gravidade de acidentes usando Machine Learning (LightGBM) com dados reais do DATATRAN (2007-2025).

---

## 📋 Sumário

1. [Visão Geral](#visão-geral)
2. [Como Funciona](#como-funciona)
3. [API Endpoints](#api-endpoints)
4. [Exemplos de Uso](#exemplos-de-uso)
5. [Retreinar o Modelo](#retreinar-o-modelo)
6. [Estrutura Técnica](#estrutura-técnica)

---

## 🎯 Visão Geral

### O que o sistema faz?

Responde a pergunta: **"Dadas as condições atuais (rodovia, KM, hora, clima), qual a probabilidade de um acidente neste local ser grave?"**

### Características

✅ **Modelo LightGBM** treinado com 47.192 acidentes reais  
✅ **77.18% de acurácia** na classificação de gravidade  
✅ **Scores pré-calculados** para lookup instantâneo (sem overhead de ML no backend)  
✅ **4.997 segmentos únicos** mapeados em todo o Brasil  
✅ **8 contextos diferentes** (dia/noite, claro/chuvoso, etc.)  
✅ **Zero dependências pesadas** no backend (sem TensorFlow)

---

## 🔧 Como Funciona

### Arquitetura

```
┌─────────────────────┐
│ dados_acidentes.xlsx │ (47K registros)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ train_risk_model.py │ (Python + LightGBM)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  risk_scores.json   │ (Scores pré-calculados)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│ Backend TypeScript              │
│ (risk-lookup.service.ts)        │
│ - Carrega JSON em memória       │
│ - Lookup instantâneo O(1)       │
│ - APIs REST                     │
└─────────────────────────────────┘
```

### Fluxo de Predição

1. **Cliente** faz requisição: `POST /api/v1/risk/predict`

   ```json
   {
     "uf": "SP",
     "br": "116",
     "km": 523,
     "hour": 22,
     "weatherCondition": "chuva"
   }
   ```

2. **Backend** determina:

   - Segmento: `SP_116_520` (agrupado em 10km)
   - Contexto: `noite_chuvoso`

3. **Lookup** no JSON pré-calculado:

   ```json
   {
     "SP_116_520": {
       "noite_chuvoso": 85.5
     }
   }
   ```

4. **Resposta** em ~1ms:
   ```json
   {
     "risk_score": 85.5,
     "risk_level": "critico",
     "recommendations": [
       "🚨 RISCO CRÍTICO: Considere rota alternativa",
       "🌧️ Chuva: reduza velocidade"
     ]
   }
   ```

---

## 📡 API Endpoints

### 1. Status do Serviço

```http
GET /api/v1/risk/status
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "service": "Risk Prediction Service",
    "status": "ready",
    "message": "Serviço de predição de risco operacional"
  }
}
```

---

### 2. Predição de Risco (Segmento Único)

```http
POST /api/v1/risk/predict
Content-Type: application/json

{
  "uf": "SP",
  "br": "116",
  "km": 523,
  "hour": 14,                    // opcional (0-23)
  "dayOfWeek": 2,                // opcional (0=domingo, 6=sábado)
  "weatherCondition": "chuva"    // opcional
}
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "segment_key": "SP_116_520",
    "risk_score": 72.5,
    "risk_level": "alto",
    "context_used": "dia_chuvoso",
    "recommendations": [
      "⚠️ ALTO RISCO: Atenção redobrada necessária",
      "Reduza velocidade em 20%",
      "🌧️ Chuva: reduza velocidade e aumente distância"
    ],
    "nearby_segments": [
      {
        "segment_key": "SP_116_530",
        "risk_score": 68.2,
        "distance_km": 10
      }
    ]
  }
}
```

---

### 3. Predição de Risco (Rota Completa)

```http
POST /api/v1/risk/predict-route
Content-Type: application/json

{
  "route": [
    { "uf": "SP", "br": "116", "km": 100 },
    { "uf": "SP", "br": "116", "km": 150 },
    { "uf": "SP", "br": "116", "km": 200 }
  ],
  "hour": 22,
  "dayOfWeek": 5,
  "weatherCondition": "claro"
}
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "route_summary": {
      "total_segments": 3,
      "average_risk_score": 65.4,
      "max_risk_score": 78.2,
      "overall_risk_level": "alto",
      "critical_segments": 0,
      "high_risk_segments": 2
    },
    "segments": [
      { "segment_key": "SP_116_100", "risk_score": 58.5, ... },
      { "segment_key": "SP_116_150", "risk_score": 78.2, ... },
      { "segment_key": "SP_116_200", "risk_score": 59.6, ... }
    ],
    "recommendations": [
      "⚠️ Rota com alto risco",
      "Reforce medidas de segurança"
    ]
  }
}
```

---

### 4. Segmentos de Alto Risco

```http
GET /api/v1/risk/high-risk-segments?limit=10
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "segments": [
      {
        "segment_key": "PE_232_50",
        "uf": "PE",
        "br": "232",
        "km": 50,
        "avg_risk_score": 72.9,
        "max_risk_score": 81.5
      },
      ...
    ],
    "total": 10
  }
}
```

---

### 5. Estatísticas do Modelo

```http
GET /api/v1/risk/statistics
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "total_segments": 4997,
    "model_info": {
      "generated_at": "2025-10-14T...",
      "model_type": "LightGBM",
      "accuracy": "77.18%",
      "total_accidents_analyzed": 47192
    },
    "risk_distribution": {
      "baixo": 1234,
      "moderado": 2100,
      "alto": 1200,
      "critico": 463
    }
  }
}
```

---

## 💡 Exemplos de Uso

### Exemplo 1: Verificar risco agora

```bash
curl -X POST http://localhost:3001/api/v1/risk/predict \
  -H "Content-Type: application/json" \
  -d '{
    "uf": "SP",
    "br": "116",
    "km": 523,
    "hour": 22,
    "dayOfWeek": 5,
    "weatherCondition": "chuva"
  }'
```

### Exemplo 2: Consultar top 20 trechos perigosos

```bash
curl http://localhost:3001/api/v1/risk/high-risk-segments?limit=20
```

### Exemplo 3: Analisar rota completa

```bash
curl -X POST http://localhost:3001/api/v1/risk/predict-route \
  -H "Content-Type: application/json" \
  -d '{
    "route": [
      {"uf": "SP", "br": "116", "km": 100},
      {"uf": "SP", "br": "116", "km": 200},
      {"uf": "SP", "br": "116", "km": 300}
    ],
    "hour": 14,
    "weatherCondition": "claro"
  }'
```

---

## 🔄 Retreinar o Modelo

### Quando retreinar?

- Novos dados disponíveis
- Melhorar acurácia
- Adicionar mais contextos

### Como retreinar?

```bash
# 1. Atualizar dados_acidentes.xlsx com novos dados

# 2. Executar script de treinamento
python train_risk_model.py

# 3. Arquivo risk_scores.json será atualizado automaticamente

# 4. Reiniciar backend
cd backend
npm run build
npm start
```

### Customizar treinamento

Edite `train_risk_model.py`:

```python
# Adicionar novos contextos
contextos = [
    {'nome': 'feriado_dia', 'clima': 'claro', ...},
    # ... adicionar mais
]

# Ajustar hiperparâmetros do modelo
model = lgb.LGBMClassifier(
    n_estimators=300,  # aumentar para mais árvores
    max_depth=15,      # aumentar profundidade
    learning_rate=0.05 # diminuir para aprender mais devagar
)
```

---

## 🏗️ Estrutura Técnica

### Arquivos Criados

```
projeto-sompo/
├── train_risk_model.py              # Script de treinamento ML
├── requirements-ml.txt              # Dependências Python
├── backend/
│   ├── risk_scores.json             # Scores pré-calculados (1.29 MB)
│   └── src/
│       ├── services/
│       │   └── risk-lookup.service.ts    # Serviço de lookup
│       ├── controllers/
│       │   └── risk-prediction.controller.ts
│       └── routes/
│           └── risk-prediction.routes.ts
```

### Features do Modelo

1. **uf_encoded**: Estado (codificado 0-26)
2. **br**: Número da rodovia federal
3. **km**: Quilômetro
4. **hora**: Hora do dia (0-23)
5. **dia_semana**: Dia da semana (0-6)
6. **mes**: Mês (1-12)
7. **clima_categoria**: claro, nublado, chuvoso, neblina
8. **fase_dia_categoria**: dia, noite, amanhecer, anoitecer
9. **tipo_pista_categoria**: simples, dupla, multipla

### Contextos Pré-calculados

1. `dia_claro`
2. `dia_nublado`
3. `dia_chuvoso`
4. `noite_claro`
5. `noite_chuvoso`
6. `amanhecer_claro`
7. `anoitecer_claro`
8. `fds_noite_claro`

### Classificação de Risco

| Score  | Nível    | Descrição                  |
| ------ | -------- | -------------------------- |
| 0-39   | Baixo    | Risco aceitável            |
| 40-59  | Moderado | Atenção necessária         |
| 60-79  | Alto     | Atenção redobrada          |
| 80-100 | Crítico  | Considere rota alternativa |

---

## 🎯 Performance

- **Lookup de risco**: ~1ms (O(1) em memória)
- **Predição de rota (10 segmentos)**: ~10ms
- **Memória usada**: ~2MB (JSON carregado)
- **Acurácia do modelo**: 77.18%

---

## 🚀 Próximos Passos

1. ✅ **Modelo treinado** e funcionando
2. ✅ **API REST** completa
3. 🔲 **Integrar no frontend** (dashboard visual)
4. 🔲 **Alertas em tempo real** para cargas em trânsito
5. 🔲 **Sugestão de rotas alternativas** (integração com algoritmos de roteamento)

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verificar logs do backend
2. Testar endpoint de status: `GET /api/v1/risk/status`
3. Verificar se `risk_scores.json` existe em `backend/`
4. Retreinar modelo se necessário

---

**Sistema desenvolvido por Sompo - 2025**
