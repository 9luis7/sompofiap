-- Script de configuração inicial do banco de dados
-- Sistema de Monitoramento de Cargas - Sompo Seguros

-- Criar banco de dados
CREATE DATABASE sompo_monitoring
    WITH OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'pt_BR.UTF-8'
    LC_CTYPE = 'pt_BR.UTF-8'
    TEMPLATE = template0;

-- Conectar ao banco
\c sompo_monitoring;

-- Instalar extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Criar usuário da aplicação (opcional)
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'sompo_user') THEN
      CREATE USER sompo_user WITH PASSWORD 'sompo_password';
   END IF;
END
$$;

-- Conceder permissões
GRANT ALL PRIVILEGES ON DATABASE sompo_monitoring TO sompo_user;
GRANT ALL ON SCHEMA public TO sompo_user;

-- Verificar instalação do PostGIS
SELECT PostGIS_version();

-- ===== TABELAS PRINCIPAIS =====

-- 1. Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
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

-- 2. Tabela de motoristas
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    cnh_number VARCHAR(20) UNIQUE NOT NULL,
    cnh_category VARCHAR(5) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de veículos
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50),
    capacity_kg DECIMAL(10,2),
    owner_company VARCHAR(100),
    iot_device_id VARCHAR(50),
    driver_id INTEGER REFERENCES drivers(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de cargas
CREATE TABLE IF NOT EXISTS shipments (
    id SERIAL PRIMARY KEY,
    shipment_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_id INTEGER REFERENCES vehicles(id),
    driver_id INTEGER REFERENCES drivers(id),
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

-- 5. Tabela de rastreamento GPS
CREATE TABLE IF NOT EXISTS gps_tracks (
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

-- 6. Tabela de zonas de risco
CREATE TABLE IF NOT EXISTS risk_zones (
    id SERIAL PRIMARY KEY,
    zone_name VARCHAR(100),
    zone_type VARCHAR(10) CHECK (zone_type IN ('green', 'yellow', 'red')),
    boundary GEOMETRY(POLYGON, 4326) NOT NULL,
    risk_score DECIMAL(3,2) CHECK (risk_score >= 0 AND risk_score <= 10),
    incident_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabela de incidentes
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER REFERENCES shipments(id),
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(10) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    location GEOMETRY(POINT, 4326),
    description TEXT,
    reported_by INTEGER REFERENCES users(id),
    response_time_minutes INTEGER,
    resolution_status VARCHAR(20) DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'investigating', 'resolved', 'false_alarm')),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabela de dados de sensores
CREATE TABLE IF NOT EXISTS sensors_data (
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

-- 9. Tabela de alertas
CREATE TABLE IF NOT EXISTS alerts (
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

-- ===== DADOS DE EXEMPLO =====

-- Inserir usuários
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@sompo.com', '$2b$10$hash_placeholder', 'Administrador Sistema', 'admin'),
('operador1', 'operador1@sompo.com', '$2b$10$hash_placeholder', 'João Operador', 'operator'),
('cliente1', 'cliente1@sompo.com', '$2b$10$hash_placeholder', 'Maria Cliente', 'client')
ON CONFLICT (username) DO NOTHING;

-- Inserir motoristas
INSERT INTO drivers (full_name, cpf, cnh_number, cnh_category, phone, email) VALUES
('João Silva Santos', '123.456.789-01', '12345678901', 'E', '(11) 99999-1111', 'joao.silva@email.com'),
('Maria Santos Oliveira', '987.654.321-02', '98765432102', 'E', '(11) 99999-2222', 'maria.santos@email.com'),
('Pedro Oliveira Costa', '456.789.123-03', '45678912303', 'E', '(11) 99999-3333', 'pedro.oliveira@email.com'),
('Ana Costa Lima', '789.123.456-04', '78912345604', 'E', '(11) 99999-4444', 'ana.costa@email.com')
ON CONFLICT (cpf) DO NOTHING;

-- Inserir veículos
INSERT INTO vehicles (license_plate, vehicle_type, capacity_kg, owner_company, iot_device_id, driver_id) VALUES
('ABC-1234', 'Caminhão Truck', 8000.00, 'Transportadora ABC Ltda', 'IOT-001', 1),
('DEF-5678', 'Caminhão 3/4', 4000.00, 'Transportadora DEF Ltda', 'IOT-002', 2),
('GHI-9012', 'Caminhão Truck', 8000.00, 'Transportadora GHI Ltda', 'IOT-003', 3),
('JKL-3456', 'Caminhão 3/4', 4000.00, 'Transportadora JKL Ltda', 'IOT-004', 4)
ON CONFLICT (license_plate) DO NOTHING;

-- Inserir cargas
INSERT INTO shipments (shipment_number, vehicle_id, driver_id, origin_address, destination_address, origin_coords, destination_coords, status, cargo_type, cargo_value, estimated_departure, estimated_arrival) VALUES
('SHP-2024-001', 1, 1, 'São Paulo, SP - Centro', 'Rio de Janeiro, RJ - Centro', ST_SetSRID(ST_MakePoint(-46.6388, -23.5489), 4326), ST_SetSRID(ST_MakePoint(-43.1729, -22.9068), 4326), 'in_transit', 'Eletrônicos Premium', 125000.00, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '4 hours'),
('SHP-2024-002', 2, 2, 'Belo Horizonte, MG - Centro', 'Salvador, BA - Centro', ST_SetSRID(ST_MakePoint(-43.9386, -19.9191), 4326), ST_SetSRID(ST_MakePoint(-38.5011, -12.9714), 4326), 'in_transit', 'Medicamentos Controlados', 89000.00, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '6 hours'),
('SHP-2024-003', 3, 3, 'Curitiba, PR - Centro', 'Porto Alegre, RS - Centro', ST_SetSRID(ST_MakePoint(-49.2744, -25.4289), 4326), ST_SetSRID(ST_MakePoint(-51.2306, -30.0346), 4326), 'in_transit', 'Produtos Químicos', 75000.00, NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '3 hours'),
('SHP-2024-004', 4, 4, 'Brasília, DF - Centro', 'Goiânia, GO - Centro', ST_SetSRID(ST_MakePoint(-47.8645, -15.7942), 4326), ST_SetSRID(ST_MakePoint(-49.2533, -16.6864), 4326), 'in_transit', 'Alimentos Perecíveis', 45000.00, NOW() - INTERVAL '45 minutes', NOW() + INTERVAL '2 hours')
ON CONFLICT (shipment_number) DO NOTHING;

-- Inserir dados GPS atuais
INSERT INTO gps_tracks (shipment_id, vehicle_id, location, speed_kmh, direction, accuracy_meters, timestamp) VALUES
(1, 1, ST_SetSRID(ST_MakePoint(-44.1234, -22.9876), 4326), 65.5, 180.0, 5.0, NOW()),
(2, 2, ST_SetSRID(ST_MakePoint(-40.5678, -20.1234), 4326), 72.3, 45.0, 3.0, NOW()),
(3, 3, ST_SetSRID(ST_MakePoint(-50.9012, -26.3456), 4326), 58.7, 270.0, 4.0, NOW()),
(4, 4, ST_SetSRID(ST_MakePoint(-48.3456, -16.7890), 4326), 80.1, 90.0, 2.0, NOW())
ON CONFLICT DO NOTHING;

-- Inserir zonas de risco
INSERT INTO risk_zones (zone_name, zone_type, boundary, risk_score) VALUES
('BR-116 Sul - Zona de Alto Risco', 'red', ST_SetSRID(ST_GeomFromText('POLYGON((-44.2 -23.0, -44.0 -23.0, -44.0 -22.9, -44.2 -22.9, -44.2 -23.0))'), 4326), 8.5),
('BR-381 - Zona de Médio Risco', 'yellow', ST_SetSRID(ST_GeomFromText('POLYGON((-44.5 -20.0, -44.3 -20.0, -44.3 -19.8, -44.5 -19.8, -44.5 -20.0))'), 4326), 6.2),
('BR-101 - Zona de Baixo Risco', 'green', ST_SetSRID(ST_GeomFromText('POLYGON((-50.5 -26.5, -50.3 -26.5, -50.3 -26.3, -50.5 -26.3, -50.5 -26.5))'), 4326), 2.1)
ON CONFLICT DO NOTHING;

-- Inserir alertas reais
INSERT INTO alerts (shipment_id, alert_type, severity, message, location, timestamp) VALUES
(1, 'high_risk_zone', 'high', 'Veículo ABC-1234 entrou na BR-116 Sul - Zona de Alto Risco', ST_SetSRID(ST_MakePoint(-44.1234, -22.9876), 4326), NOW() - INTERVAL '10 minutes'),
(2, 'route_deviation', 'medium', 'Veículo DEF-5678 desviou da rota planejada em 2.3km', ST_SetSRID(ST_MakePoint(-40.5678, -20.1234), 4326), NOW() - INTERVAL '5 minutes'),
(3, 'speed_violation', 'medium', 'Veículo GHI-9012 excedeu limite de velocidade em 20km/h', ST_SetSRID(ST_MakePoint(-50.9012, -26.3456), 4326), NOW() - INTERVAL '15 minutes'),
(4, 'vehicle_stopped', 'high', 'Veículo JKL-3456 parado em zona de risco por mais de 30 minutos', ST_SetSRID(ST_MakePoint(-48.3456, -16.7890), 4326), NOW() - INTERVAL '35 minutes')
ON CONFLICT DO NOTHING;

-- ===== ÍNDICES DE PERFORMANCE =====

-- Índices espaciais para consultas geográficas
CREATE INDEX IF NOT EXISTS idx_gps_tracks_location ON gps_tracks USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_risk_zones_boundary ON risk_zones USING GIST (boundary);
CREATE INDEX IF NOT EXISTS idx_shipments_origin_coords ON shipments USING GIST (origin_coords);
CREATE INDEX IF NOT EXISTS idx_shipments_destination_coords ON shipments USING GIST (destination_coords);
CREATE INDEX IF NOT EXISTS idx_shipments_planned_route ON shipments USING GIST (planned_route);
CREATE INDEX IF NOT EXISTS idx_shipments_actual_route ON shipments USING GIST (actual_route);

-- Índices temporais para consultas por tempo
CREATE INDEX IF NOT EXISTS idx_gps_tracks_timestamp ON gps_tracks (timestamp);
CREATE INDEX IF NOT EXISTS idx_sensors_data_timestamp ON sensors_data (timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts (timestamp);
CREATE INDEX IF NOT EXISTS idx_incidents_timestamp ON incidents (timestamp);

-- Índices de relacionamento para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_shipments_vehicle_id ON shipments (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_shipments_driver_id ON shipments (driver_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments (status);
CREATE INDEX IF NOT EXISTS idx_gps_tracks_shipment_id ON gps_tracks (shipment_id);
CREATE INDEX IF NOT EXISTS idx_alerts_shipment_id ON alerts (shipment_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON vehicles (driver_id);

-- ===== FUNÇÕES ÚTEIS =====

-- Função para calcular distância entre pontos
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DOUBLE PRECISION,
    lng1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lng2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
    dlat DOUBLE PRECISION;
    dlng DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
    earth_radius DOUBLE PRECISION := 6371; -- km
BEGIN
    dlat := RADIANS(lat2 - lat1);
    dlng := RADIANS(lng2 - lng1);

    a := SIN(dlat/2) * SIN(dlat/2) +
         COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
         SIN(dlng/2) * SIN(dlng/2);

    c := 2 * ATAN2(SQRT(a), SQRT(1-a));

    RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se ponto está dentro de zona de risco
CREATE OR REPLACE FUNCTION is_point_in_risk_zone(
    point_lat DOUBLE PRECISION,
    point_lng DOUBLE PRECISION
) RETURNS TABLE(
    zone_id INTEGER,
    zone_name VARCHAR(100),
    zone_type VARCHAR(10),
    risk_score DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rz.id,
        rz.zone_name,
        rz.zone_type,
        rz.risk_score
    FROM risk_zones rz
    WHERE ST_Contains(rz.boundary, ST_SetSRID(ST_MakePoint(point_lng, point_lat), 4326));
END;
$$ LANGUAGE plpgsql;

-- ===== VIEWS ÚTEIS =====

-- View para alertas com informações completas
CREATE OR REPLACE VIEW alert_details AS
SELECT
    a.id as alert_id,
    a.alert_type,
    a.severity,
    a.message,
    a.location,
    a.timestamp,
    a.is_acknowledged,
    s.id as shipment_id,
    s.shipment_number,
    s.cargo_type,
    s.cargo_value,
    s.status as shipment_status,
    v.id as vehicle_id,
    v.license_plate,
    v.vehicle_type,
    d.id as driver_id,
    d.full_name as driver_name,
    d.phone as driver_phone,
    ST_X(a.location) as longitude,
    ST_Y(a.location) as latitude
FROM alerts a
JOIN shipments s ON a.shipment_id = s.id
JOIN vehicles v ON s.vehicle_id = v.id
JOIN drivers d ON s.driver_id = d.id
WHERE a.is_acknowledged = FALSE
ORDER BY a.timestamp DESC;

-- Comentários nas tabelas (documentação)
COMMENT ON DATABASE sompo_monitoring IS 'Sistema de Monitoramento de Cargas - Sompo Seguros';
COMMENT ON EXTENSION postgis IS 'Extensão PostGIS para suporte a dados geográficos';

-- Configurações de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET pg_stat_statements.track_utility = 'off';

-- Notificar conclusão
DO $$
BEGIN
    RAISE NOTICE 'Banco de dados configurado com sucesso!';
    RAISE NOTICE 'PostGIS instalado e funções criadas.';
    RAISE NOTICE 'Dados de exemplo inseridos.';
    RAISE NOTICE 'Usuário sompo_user criado (senha: sompo_password).';
END
$$;
