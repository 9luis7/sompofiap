# 🛠️ Scripts do Sistema Sompo

Pasta contendo scripts de automação, utilitários e APIs Python.

---

## 📄 Arquivos

### Scripts Python (Core)

#### `ml_prediction_api.py` 🤖
**API Flask de Machine Learning**

- **Função**: Servidor HTTP que serve o modelo LightGBM para predições em tempo real
- **Porta**: 5000
- **Uso**: Iniciado AUTOMATICAMENTE pelo backend Node.js
- **Endpoints**:
  - `GET /health` - Status da API e modelo
  - `POST /predict` - Predição individual
  - `POST /predict-batch` - Predição em lote
  - `GET /model-info` - Informações do modelo

**Não execute manualmente!** O backend gerencia este processo automaticamente.

---

#### `train_risk_model.py` 📊
**Script de Treinamento do Modelo ML**

- **Função**: Treina modelo LightGBM com dados históricos do DATATRAN
- **Input**: `DadosReais/dados_acidentes.xlsx` (47.192 registros)
- **Output**:
  - `backend/models/risk_model.joblib` - Modelo treinado
  - `backend/models/label_encoders.joblib` - Encoders de categorias
  - `backend/risk_scores.json` - Scores pré-calculados (cache)

**Uso**:
```bash
cd ..
python scripts/train_risk_model.py
```

**Quando executar**:
- Primeira vez que instalar o sistema
- Quando houver novos dados históricos
- Para retreinar com parâmetros diferentes

---

#### `analyze_excel.py` 📈
**Análise Exploratória de Dados**

- **Função**: Analisa o arquivo Excel de acidentes
- **Uso**: Script auxiliar para entender os dados antes do treinamento
- **Output**: Estatísticas no console

```bash
cd ..
python scripts/analyze_excel.py
```

---

### Scripts Batch/PowerShell (Utilitários)

#### `import-data.bat` 📥
**Importação de Dados Históricos**

- **Função**: Importa dados do DATATRAN para o banco PostgreSQL
- **Dados**: 19 anos de acidentes (2007-2025)
- **Uso**:
```bash
cd ..
scripts\import-data.bat
```

**Nota**: Processo demorado (~5 minutos para 100MB de dados)

---

#### `start_ml_api.bat` ⚠️ (OBSOLETO)
**Script Legado de Inicialização ML**

- **Status**: ❌ Não usar mais
- **Motivo**: A API ML agora é iniciada automaticamente pelo backend
- **Mantido**: Apenas para referência/compatibilidade

---

#### `test_prediction.ps1` 🧪
**Script de Teste de Predições**

- **Função**: Testa API de predição ML
- **Uso**:
```powershell
cd ..
.\scripts\test_prediction.ps1
```

Testa:
- Conexão com API Python (porta 5000)
- Predição individual
- Validação de resposta

---

## 🚀 Fluxo de Uso Normal

### 1. Primeira Instalação
```bash
# 1. Treinar modelo (uma vez)
python scripts/train_risk_model.py

# 2. Iniciar sistema
.\start.bat
```

### 2. Uso Diário
```bash
# Apenas iniciar - tudo automático!
.\start.bat
```

### 3. Retreinar Modelo (quando necessário)
```bash
# Atualizar modelo com novos dados
python scripts/train_risk_model.py

# Reiniciar sistema
.\start.bat
```

---

## 📋 Dependências

### Python
```bash
pip install -r requirements-ml.txt
```

Pacotes necessários:
- pandas, numpy, openpyxl (processamento de dados)
- lightgbm, scikit-learn, joblib (ML)
- flask, flask-cors (API)

---

## ⚙️ Configuração Avançada

### Ajustar Hiperparâmetros do Modelo

Edite `train_risk_model.py`:

```python
model = LGBMClassifier(
    n_estimators=200,      # Número de árvores
    max_depth=10,          # Profundidade máxima
    learning_rate=0.05,    # Taxa de aprendizado
    # ... outros parâmetros
)
```

### Alterar Porta da API ML

Edite `ml_prediction_api.py`:

```python
app.run(host='0.0.0.0', port=5000)  # Mudar porta aqui
```

E em `backend/src/services/ml-process-manager.service.ts`:

```typescript
private mlApiUrl: string = 'http://localhost:5000';  // Atualizar aqui
```

---

## 🐛 Troubleshooting

### Erro: "Modelo não encontrado"
```bash
# Solução: Treinar o modelo
python scripts/train_risk_model.py
```

### Erro: "API ML não iniciou"
```bash
# 1. Verificar se Python está instalado
python --version

# 2. Verificar dependências
pip install -r requirements-ml.txt

# 3. Testar manualmente
python scripts/ml_prediction_api.py
```

### Porta 5000 já em uso
```bash
# Windows: Encontrar e matar processo
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 📚 Documentação Relacionada

- **README.md** (raiz) - Documentação principal do sistema
- **docs/database/** - Estrutura do banco de dados
- **docs/specifications/** - Especificações técnicas

---

**Última atualização**: 14/10/2025  
**Versão**: 2.0

