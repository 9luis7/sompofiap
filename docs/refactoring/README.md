# 🔄 Sistema de Refatoração e Importação CSV

## 📋 Visão Geral
Sistema completo para refatoração de dados fictícios e importação de dados reais via CSV, preparando o projeto para produção.

## 📁 Arquivos Relacionados
- **[Guia de Refatoração](../REFACTORING_GUIDE.md)** - Documentação completa
- **[Estrutura do Projeto](../PROJECT_STRUCTURE.md)** - Organização final
- **Sistema CSV**: `backend/src/services/csv-import.service.ts`

## 🎯 Objetivos da Refatoração

### ✅ Completado
- ❌ **Remoção de dados fictícios** de todos os controllers
- ✅ **Backend como única fonte de verdade** para dados CSV
- ✅ **Frontend apenas exibe dados** do backend via API
- ✅ **Sistema de importação CSV** completo e funcional
- ✅ **Validação robusta** de estrutura de dados
- ✅ **Templates e exemplos** prontos para uso

### 🚀 Sistema de Importação CSV

#### Tipos de Dados Suportados
- **📦 Shipments** - Cargas e envios
- **🚛 Vehicles** - Veículos da frota
- **🚨 Alerts** - Alertas e incidentes
- **👥 Users** - Usuários do sistema

#### Endpoints da API
```http
GET  /api/v1/csv-import/data-types          # Lista tipos suportados
GET  /api/v1/csv-import/template/{type}     # Gera template CSV
POST /api/v1/csv-import/validate            # Valida estrutura
POST /api/v1/csv-import/import              # Importa dados
```

## 🏗️ Arquitetura Refatorada

### Backend (Fonte de Verdade)
```
backend/
├── src/controllers/           # ✅ Arrays vazios - pronto para dados CSV
│   ├── shipment.controller.ts
│   ├── vehicle.controller.ts
│   ├── alert.controller.ts
│   ├── user.controller.ts
│   ├── risk.controller.ts
│   ├── monitoring.controller.ts
│   └── csv-import.controller.ts  # 🚀 Sistema de importação
├── src/services/
│   └── csv-import.service.ts     # 🚀 Serviço de processamento CSV
├── src/routes/
│   └── csv-import.routes.ts      # 🚀 Rotas de importação
└── uploads/csv/examples/         # 📊 Arquivos de exemplo CSV
```

### Frontend (Apenas Exibição)
```
frontend/
├── index.html                 # ✅ Interface principal
├── modern-app.js             # ✅ Carrega dados APENAS do backend
├── modern-styles.css         # ✅ Estilos
└── data/                     # 📊 Dados estáticos (mapas, etc.)
```

## 🔄 Fluxo de Dados

### 1. Importação de Dados CSV
```
📊 Arquivo CSV → 🔍 Validação → 💾 Backend → 🗄️ Arrays/Database
```

### 2. Exibição no Frontend
```
🖥️ Frontend → 🌐 API Calls → 📡 Backend → 📊 Dados → 🖥️ Interface
```

## 📊 Estrutura dos CSVs

### Shipments (Cargas)
```csv
shipment_number,vehicle_id,status,origin_address,destination_address,cargo_type,cargo_value,planned_departure,planned_arrival,customer_name,customer_contact,special_requirements
SHP-2024-001,VEH-001,in_transit,"São Paulo, SP","Rio de Janeiro, RJ",Eletrônicos,125000.00,2024-01-15 08:00:00,2024-01-15 18:00:00,TechCorp,(11) 99999-9999,Frágil
```

### Vehicles (Veículos)
```csv
license_plate,vehicle_type,capacity_kg,owner_company,iot_device_id,is_active,status,driver_name,current_location_lat,current_location_lng,last_update
ABC-1234,Caminhão,5000.00,Transportadora XYZ,IOT-001,true,in_transit,João Silva,-23.5505,-46.6333,2024-01-15 10:30:00
```

### Alerts (Alertas)
```csv
alert_type,severity,message,shipment_id,vehicle_plate,location,timestamp,is_acknowledged,description
ROUTE_DEVIATION,high,"Veículo saiu da rota planejada",SHP-2024-001,ABC-1234,"-23.5000,-46.6000",2024-01-15 11:00:00,false,"Desvio detectado na BR-116"
```

### Users (Usuários)
```csv
username,email,full_name,role,is_active,department,phone,permissions,last_login
admin.sompo,admin@sompo.com.br,Administrador Sompo,admin,true,Tecnologia,(11) 99999-0001,"all",2024-01-15 09:00:00
```

## 🚀 Como Usar

### 1. Preparar Dados CSV
```bash
# Usar templates gerados pela API
curl http://localhost:5000/api/v1/csv-import/template/shipments > shipments.csv
```

### 2. Validar Estrutura
```bash
# Upload e validação
curl -X POST -F "csvFile=@shipments.csv" -F "dataType=shipments" \
  http://localhost:5000/api/v1/csv-import/validate
```

### 3. Importar Dados
```bash
# Importação final
curl -X POST -F "csvFile=@shipments.csv" -F "dataType=shipments" \
  http://localhost:5000/api/v1/csv-import/import
```

### 4. Visualizar no Frontend
```bash
# Acessar interface
http://localhost:3000
```

## 📁 Arquivos de Exemplo

### Localização
```
backend/uploads/csv/examples/
├── shipments_example.csv    # 5 cargas de exemplo
├── vehicles_example.csv     # 5 veículos de exemplo
├── alerts_example.csv       # 5 alertas de exemplo
└── users_example.csv        # 7 usuários de exemplo
```

### Características
- **Cabeçalhos padronizados** para cada tipo
- **Dados realistas** para demonstração
- **Validação automática** de estrutura
- **Tratamento de erros** robusto

## 🔧 Implementação Técnica

### Backend
- **Controller**: `csv-import.controller.ts` - Upload e processamento
- **Service**: `csv-import.service.ts` - Lógica de importação
- **Routes**: `csv-import.routes.ts` - Endpoints da API
- **Middleware**: Autenticação e validação

### Frontend
- **Carregamento**: `loadRealDataFromBackend()` - Busca dados via API
- **Atualização**: Refresh automático a cada 30 segundos
- **Tratamento**: Fallback para arrays vazios em caso de erro

## ✅ Status da Refatoração

### ✅ Completamente Organizado
- ✅ **Backend** é única fonte de verdade
- ✅ **Frontend** apenas exibe dados
- ✅ **Sistema CSV** funcional e testado
- ✅ **Arquivos desnecessários** removidos
- ✅ **Estrutura limpa** e organizizada
- ✅ **Documentação** completa

### 🚀 Pronto para Produção
- 🚀 **Importação de dados reais** via CSV
- 🚀 **Validação robusta** de estrutura
- 🚀 **API endpoints** funcionais
- 🚀 **Interface responsiva** e moderna
- 🚀 **Atualizações em tempo real**

## 🔮 Próximos Passos (Opcionais)

### 1. Integração com Banco Real
- Conectar com PostgreSQL
- Implementar migrações
- Configurar índices espaciais

### 2. Autenticação Real
- Implementar JWT completo
- Sistema de permissões
- Auditoria de ações

### 3. GPS Real
- Integrar com APIs de GPS
- Dispositivos IoT reais
- Telemetria em tempo real

### 4. Notificações
- Sistema de alertas por email/SMS
- Webhooks para sistemas externos
- Dashboard executivo

## 📚 Referências

### Documentação
- **[Guia de Refatoração](../REFACTORING_GUIDE.md)** - Instruções detalhadas
- **[Estrutura do Projeto](../PROJECT_STRUCTURE.md)** - Organização final
- **[README Principal](../../README.md)** - Visão geral

### Recursos Técnicos
- [CSV Parser Documentation](https://csv.js.org/)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Express Validator](https://express-validator.github.io/docs/)

---

**🎉 RESULTADO: Sistema 100% refatorado e pronto para dados reais!**

**Desenvolvido para Sompo Seguros**  
*Sistema de Monitoramento de Cargas - Refatoração Completa*
