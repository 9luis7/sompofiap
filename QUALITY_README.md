# 🚀 Ferramentas de Qualidade de Código

Este projeto implementa um sistema completo de linting e formatação para manter o código organizado, rápido e profissional.

## 🛠️ Ferramentas Implementadas

### **ESLint** - Linting JavaScript
- **Configuração**: `.eslintrc.js`
- **Regras**: Boas práticas ES2022, JSDoc, import/export
- **Integração**: Prettier, JSDoc

### **Prettier** - Formatação de Código
- **Configuração**: `.prettierrc`
- **Padrões**: 2 espaços, aspas simples, 100 chars por linha
- **Arquivos**: JS, TS, CSS, HTML, JSON, MD

### **Stylelint** - Linting CSS
- **Configuração**: `.stylelintrc.js`
- **Regras**: Padrões CSS, organização de propriedades
- **Integração**: Prettier, ordem de propriedades

### **HTMLHint** - Validação HTML
- **Configuração**: `.htmlhintrc`
- **Regras**: Semântica, acessibilidade, boas práticas

### **Flake8** - Linting Python
- **Configuração**: `.flake8`
- **Regras**: Estilo PEP8, complexidade, bugs potenciais

### **Black** - Formatação Python
- **Configuração**: `pyproject.toml`
- **Padrões**: PEP8, 100 chars por linha, formatação automática

### **isort** - Organização de Imports Python
- **Configuração**: `pyproject.toml`
- **Funcionalidade**: Organiza imports automaticamente

### **Husky + lint-staged** - Hooks Git
- **Pre-commit**: Executa linting automaticamente
- **Arquivos**: Apenas arquivos modificados

## 📋 Scripts Disponíveis

```bash
# Linting completo
npm run lint

# Linting específico
npm run lint:js      # JavaScript
npm run lint:css     # CSS
npm run lint:html    # HTML
npm run lint:py      # Python

# Formatação
npm run format       # Formatar todos os arquivos
npm run format:check # Verificar formatação

# Qualidade completa
npm run quality      # Lint + formatação

# Desenvolvimento
npm run dev:all      # Frontend + Backend
```

## 🔧 Configuração VS Code

### **Extensões Recomendadas**
- Prettier - Code formatter
- ESLint
- Stylelint
- Tailwind CSS IntelliSense
- Python
- Flake8
- Black Formatter
- isort

### **Configurações Automáticas**
- Formatação automática ao salvar
- Correção automática de linting
- Integração com ferramentas

## 📁 Estrutura de Arquivos

```
├── .eslintrc.js          # Configuração ESLint
├── .prettierrc           # Configuração Prettier
├── .stylelintrc.js       # Configuração Stylelint
├── .htmlhintrc           # Configuração HTMLHint
├── .flake8               # Configuração Flake8 (Python)
├── pyproject.toml        # Configuração Black/isort (Python)
├── .husky/               # Git hooks
├── .vscode/              # Configurações VS Code
├── .gitignore            # Arquivos ignorados
└── package.json          # Scripts e dependências
```

## 🚀 Como Usar

### **1. Instalação**
```bash
npm install
```

### **2. Verificar Qualidade**
```bash
npm run quality
```

### **3. Corrigir Automaticamente**
```bash
npm run lint        # Corrige problemas de linting
npm run format      # Formata código
```

### **4. Desenvolvimento**
```bash
npm run dev:all     # Inicia frontend + backend
```

## 📊 Benefícios

### **Qualidade**
- ✅ Código consistente e legível
- ✅ Detecção automática de problemas
- ✅ Padrões de codificação uniformes

### **Performance**
- 🚀 Código otimizado
- 🚀 Detecção de anti-patterns
- 🚀 Melhor manutenibilidade

### **Profissionalismo**
- 🎯 Padrões de mercado
- 🎯 Documentação automática (JSDoc)
- 🎯 Integração contínua

## 🔍 Regras Personalizadas

### **ESLint**
- Máximo 100 caracteres por linha
- Máximo 50 linhas por função
- Complexidade máxima 10
- Uso obrigatório de `const` e `let`

### **Stylelint**
- Propriedades CSS organizadas por categoria
- Validação de cores e unidades
- Prevenção de duplicações

### **HTMLHint**
- Tags em minúsculas
- Atributos em minúsculas
- Validação de acessibilidade

### **Flake8 (Python)**
- Estilo PEP8
- Complexidade máxima 10
- Linha máxima 100 caracteres
- Detecção de bugs potenciais

### **Black (Python)**
- Formatação automática PEP8
- 100 caracteres por linha
- Estilo consistente

### **isort (Python)**
- Organização automática de imports
- Perfil Black compatível
- Separação de imports por categoria

## 🚨 Resolução de Problemas

### **Erro de Formatação**
```bash
npm run format
```

### **Erro de Linting**
```bash
npm run lint
```

### **Conflito Prettier/ESLint**
```bash
npm run quality
```

## 📚 Recursos Adicionais

- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Stylelint Rules](https://stylelint.io/user-guide/rules/)
- [HTMLHint Rules](https://github.com/htmlhint/HTMLHint/wiki/Rules)

---

**Desenvolvido com ❤️ pela Equipe Sompo Dev**
