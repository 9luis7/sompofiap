# Estrutura do Banco de Dados - Sistema de Monitoramento de Cargas

> **📁 Localização**: `docs/database/db_structure.md`  
> **🔗 Ver também**: [README do Banco de Dados](README.md)

## Visão Geral
Banco de dados PostgreSQL com extensão PostGIS para suporte a dados geográficos e espaciais.

## Esquema Principal

### 1. Tabela: users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'operator', 'client')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Tabela: vehicles
```sql
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50),
    capacity_kg DECIMAL(10,2),
    owner_company VARCHAR(100),
    iot_device_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Tabela: shipments
```sql
CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    shipment_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_id INTEGER REFERENCES vehicles(id),
    origin_address TEXT,
    destination_address TEXT,
    origin_coords GEOMETRY(POINT, 4326),
    destination_coords GEOMETRY(POINT, 4326),
    planned_route GEOMETRY(LINESTRING, 4326),
    actual_route GEOMETRY(LINESTRING, 4326),
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_transit', 'completed', 'cancelled', 'emergency')),
    cargo_type VARCHAR(100),
    cargo_value DECIMAL(15,2),
    estimated_departure TIMESTAMP,
    actual_departure TIMESTAMP,
    estimated_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Tabela: gps_tracks
```sql
CREATE TABLE gps_tracks (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER REFERENCES shipments(id),
    vehicle_id INTEGER REFERENCES vehicles(id),
    location GEOMETRY(POINT, 4326) NOT NULL,
    speed_kmh DECIMAL(6,2),
    direction DECIMAL(5,2),
    accuracy_meters DECIMAL(6,2),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Tabela: risk_zones
```sql
CREATE TABLE risk_zones (
    id SERIAL PRIMARY KEY,
    zone_name VARCHAR(100),
    zone_type VARCHAR(10) CHECK (zone_type IN ('green', 'yellow', 'red')),
    boundary GEOMETRY(POLYGON, 4326) NOT NULL,
    risk_score DECIMAL(3,2) CHECK (risk_score >= 0 AND risk_score <= 10),
    incident_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Tabela: incidents
```sql
CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER REFERENCES shipments(id),
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(10) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    location GEOMETRY(POINT, 4326),
    description TEXT,
    reported_by INTEGER REFERENCES users(id),
    response_time_minutes INTEGER,
    resolution_status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'false_alarm')),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. Tabela: sensors_data
```sql
CREATE TABLE sensors_data (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    shipment_id INTEGER REFERENCES shipments(id),
    sensor_type VARCHAR(50) NOT NULL,
    sensor_value DECIMAL(10,4),
    unit VARCHAR(20),
    location GEOMETRY(POINT, 4326),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. Tabela: alerts
```sql
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER REFERENCES shipments(id),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(10) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    location GEOMETRY(POINT, 4326),
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by INTEGER REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 9. Tabela: routes_optimized
```sql
CREATE TABLE routes_optimized (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER REFERENCES shipments(id),
    original_route GEOMETRY(LINESTRING, 4326),
    optimized_route GEOMETRY(LINESTRING, 4326),
    optimization_reason TEXT,
    risk_reduction_score DECIMAL(5,2),
    time_savings_minutes INTEGER,
    distance_savings_km DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 10. Tabela: system_settings
```sql
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Índices de Performance

```sql
-- Índices espaciais para consultas geográficas
CREATE INDEX idx_gps_tracks_location ON gps_tracks USING GIST (location);
CREATE INDEX idx_risk_zones_boundary ON risk_zones USING GIST (boundary);
CREATE INDEX idx_shipments_origin_coords ON shipments USING GIST (origin_coords);
CREATE INDEX idx_shipments_destination_coords ON shipments USING GIST (destination_coords);
CREATE INDEX idx_shipments_planned_route ON shipments USING GIST (planned_route);
CREATE INDEX idx_shipments_actual_route ON shipments USING GIST (actual_route);

-- Índices temporais para consultas por tempo
CREATE INDEX idx_gps_tracks_timestamp ON gps_tracks (timestamp);
CREATE INDEX idx_sensors_data_timestamp ON sensors_data (timestamp);
CREATE INDEX idx_alerts_timestamp ON alerts (timestamp);
CREATE INDEX idx_incidents_timestamp ON incidents (timestamp);

-- Índices de relacionamento para consultas frequentes
CREATE INDEX idx_shipments_vehicle_id ON shipments (vehicle_id);
CREATE INDEX idx_shipments_status ON shipments (status);
CREATE INDEX idx_gps_tracks_shipment_id ON gps_tracks (shipment_id);
CREATE INDEX idx_alerts_shipment_id ON alerts (shipment_id);
```

## Views Úteis

### 1. View: active_shipments
```sql
CREATE VIEW active_shipments AS
SELECT
    s.*,
    v.license_plate,
    v.vehicle_type,
    ST_AsText(s.origin_coords) as origin_coords_text,
    ST_AsText(s.destination_coords) as destination_coords_text,
    EXTRACT(EPOCH FROM (s.actual_departure - s.estimated_departure))/60 as departure_delay_minutes
FROM shipments s
JOIN vehicles v ON s.vehicle_id = v.id
WHERE s.status IN ('planned', 'in_transit');
```

### 2. View: risk_zones_summary
```sql
CREATE VIEW risk_zones_summary AS
SELECT
    zone_type,
    COUNT(*) as zone_count,
    SUM(ST_Area(boundary)) as total_area_km2,
    AVG(risk_score) as avg_risk_score,
    SUM(incident_count) as total_incidents
FROM risk_zones
GROUP BY zone_type;
```

### 3. View: recent_alerts
```sql
CREATE VIEW recent_alerts AS
SELECT
    a.*,
    s.shipment_number,
    ST_AsText(a.location) as location_text
FROM alerts a
JOIN shipments s ON a.shipment_id = s.id
WHERE a.timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY a.timestamp DESC;
```

## Funções e Triggers

### 1. Trigger: update_updated_at
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas relevantes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Função: calculate_route_risk
```sql
CREATE OR REPLACE FUNCTION calculate_route_risk(route_geom GEOMETRY)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    risk_score DECIMAL(5,2) := 0;
    zone_record RECORD;
BEGIN
    FOR zone_record IN
        SELECT zone_type, risk_score, boundary
        FROM risk_zones
        WHERE ST_Intersects(route_geom, boundary)
    LOOP
        -- Calcular risco baseado no tipo de zona
        CASE zone_record.zone_type
            WHEN 'red' THEN risk_score := risk_score + zone_record.risk_score * 1.0;
            WHEN 'yellow' THEN risk_score := risk_score + zone_record.risk_score * 0.6;
            WHEN 'green' THEN risk_score := risk_score + zone_record.risk_score * 0.2;
        END CASE;
    END LOOP;

    RETURN risk_score;
END;
$$ LANGUAGE plpgsql;
```

## Considerações de Segurança

1. **Criptografia**: Dados sensíveis criptografados
2. **Row Level Security (RLS)**: Controle de acesso por linha
3. **Auditoria**: Logs de todas as operações críticas
4. **Backup**: Estratégia de backup incremental

## Estratégia de Partitioning

Para tabelas com alto volume de dados (gps_tracks, sensors_data), implementar partitioning por data:
- Partições mensais para dados históricos
- Partições diárias para dados recentes
- Estratégia de retenção de dados (ex: manter 2 anos de histórico)
