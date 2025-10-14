# 🗄️ Documentação do Banco de Dados

## 📋 Visão Geral
Banco de dados PostgreSQL com extensão PostGIS para suporte a dados geográficos e espaciais.

## 📁 Arquivos Relacionados
- **[Estrutura do Banco](db_structure.md)** - Esquema completo das tabelas
- **[Setup SQL](../database/setup.sql)** - Scripts de configuração
- **[Dados de Exemplo](../database/seed-data.sql)** - Dados para demonstração

## 🏗️ Arquitetura

### Tecnologias
- **PostgreSQL**: v12+ com extensão PostGIS
- **Dados Geográficos**: Coordenadas, polígonos, linhas
- **Índices Espaciais**: Otimização para consultas geográficas
- **Partitioning**: Para tabelas de alto volume

### Tabelas Principais
- `users` - Usuários do sistema
- `vehicles` - Veículos/caminhões
- `shipments` - Envios/cargas
- `gps_tracks` - Rastreamento GPS
- `risk_zones` - Zonas de risco geográficas
- `incidents` - Incidentes ocorridos
- `sensors_data` - Dados de sensores IoT
- `alerts` - Alertas do sistema

## 🚀 Configuração

### Instalação do PostgreSQL + PostGIS
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-12-postgis-3

# CentOS/RHEL
sudo yarn install postgis35_12

# Windows: Use instalador oficial com PostGIS
```

### Configuração do Banco
```sql
-- Criar banco de dados
CREATE DATABASE sompo_monitoring;

-- Instalar extensão PostGIS
CREATE EXTENSION postgis;

-- Criar usuário
CREATE USER sompo_user WITH PASSWORD 'sompo_password';
GRANT ALL PRIVILEGES ON DATABASE sompo_monitoring TO sompo_user;
```

### Executar Setup
```bash
# Executar scripts de configuração
psql -U sompo_user -d sompo_monitoring -f database/setup.sql
psql -U sompo_user -d sompo_monitoring -f database/seed-data.sql
```

## 📊 Funcionalidades Geográficas

### Recursos PostGIS
- **Armazenamento**: Coordenadas geográficas (POINT, LINESTRING, POLYGON)
- **Cálculos**: Distâncias, áreas, interseções
- **Análise Espacial**: Clustering, buffer zones, spatial joins
- **Otimização**: Índices espaciais (GIST)

### Consultas Geográficas
```sql
-- Encontrar cargas próximas a uma zona de risco
SELECT s.* FROM shipments s, risk_zones r 
WHERE ST_DWithin(s.origin_coords, r.boundary, 1000);

-- Calcular distância entre pontos
SELECT ST_Distance(origin_coords, destination_coords) 
FROM shipments WHERE id = 1;

-- Verificar se rota passa por zona vermelha
SELECT * FROM shipments s, risk_zones r 
WHERE ST_Intersects(s.planned_route, r.boundary) 
AND r.zone_type = 'red';
```

## 🔒 Segurança

### Configurações de Segurança
- **Criptografia**: Dados sensíveis criptografados
- **Row Level Security (RLS)**: Controle de acesso por linha
- **Auditoria**: Logs de todas as operações críticas
- **Backup**: Estratégia de backup incremental

### Controle de Acesso
```sql
-- Habilitar RLS
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Política de acesso para operadores
CREATE POLICY operator_policy ON shipments
FOR ALL TO operator_role
USING (true);
```

## 📈 Performance

### Índices Recomendados
```sql
-- Índices espaciais
CREATE INDEX idx_gps_tracks_location ON gps_tracks USING GIST (location);
CREATE INDEX idx_risk_zones_boundary ON risk_zones USING GIST (boundary);

-- Índices temporais
CREATE INDEX idx_gps_tracks_timestamp ON gps_tracks (timestamp);
CREATE INDEX idx_alerts_timestamp ON alerts (timestamp);
```

### Estratégia de Partitioning
- **Tabelas de Alto Volume**: gps_tracks, sensors_data
- **Partições Mensais**: Para dados históricos
- **Partições Diárias**: Para dados recentes
- **Retenção**: 2 anos de histórico

## 🔧 Manutenção

### Backup Automático
```bash
# Backup completo
pg_dump -U sompo_user sompo_monitoring > backup_$(date +%Y%m%d).sql

# Backup apenas dados
pg_dump -U sompo_user -a sompo_monitoring > data_backup.sql

# Backup apenas estrutura
pg_dump -U sompo_user -s sompo_monitoring > schema_backup.sql
```

### Monitoramento
```sql
-- Verificar tamanho das tabelas
SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables WHERE schemaname = 'public';

-- Verificar performance de queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;
```

## 📚 Referências

### Documentação Oficial
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Spatial SQL Reference](https://postgis.net/docs/reference.html)

### Recursos Úteis
- [PostGIS Tutorial](https://postgis.net/workshops/postgis-intro/)
- [Spatial Indexing](https://postgis.net/docs/using_postgis_dbmanagement.html#spatial_indexes)
- [Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

**Desenvolvido para Sompo Seguros**  
*Sistema de Monitoramento de Cargas - Banco de Dados*
