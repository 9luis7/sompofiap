-- Script para popular a base de dados com dados reais
-- Sistema de Monitoramento de Cargas - Sompo Seguros

-- Inserir motoristas
INSERT INTO drivers (full_name, cpf, cnh_number, cnh_category, phone, email, address, emergency_contact, emergency_phone, is_active, created_at, updated_at) VALUES
('João Silva Santos', '123.456.789-01', '12345678901', 'E', '(11) 99999-1111', 'joao.silva@sompo.com.br', 'Rua das Flores, 123 - São Paulo/SP', 'Maria Silva Santos', '(11) 99999-1112', true, NOW(), NOW()),
('Maria Santos Oliveira', '234.567.890-12', '23456789012', 'E', '(11) 99999-2222', 'maria.santos@sompo.com.br', 'Av. Paulista, 456 - São Paulo/SP', 'João Oliveira', '(11) 99999-2223', true, NOW(), NOW()),
('Pedro Oliveira Costa', '345.678.901-23', '34567890123', 'E', '(11) 99999-3333', 'pedro.oliveira@sompo.com.br', 'Rua Augusta, 789 - São Paulo/SP', 'Ana Costa', '(11) 99999-3334', true, NOW(), NOW()),
('Ana Pereira Lima', '456.789.012-34', '45678901234', 'E', '(11) 99999-4444', 'ana.pereira@sompo.com.br', 'Rua Oscar Freire, 321 - São Paulo/SP', 'Carlos Lima', '(11) 99999-4445', true, NOW(), NOW()),
('Carlos Ferreira Silva', '567.890.123-45', '56789012345', 'E', '(11) 99999-5555', 'carlos.ferreira@sompo.com.br', 'Av. Brigadeiro Faria Lima, 654 - São Paulo/SP', 'Lucia Ferreira', '(11) 99999-5556', true, NOW(), NOW());

-- Inserir veículos
INSERT INTO vehicles (license_plate, vehicle_type, capacity_kg, owner_company, iot_device_id, driver_id, is_active, created_at, updated_at) VALUES
('ABC-1234', 'Truck', 15000, 'Sompo Seguros', 'IOT-001', 1, true, NOW(), NOW()),
('DEF-5678', 'Truck', 12000, 'Sompo Seguros', 'IOT-002', 2, true, NOW(), NOW()),
('GHI-9012', 'Truck', 18000, 'Sompo Seguros', 'IOT-003', 3, true, NOW(), NOW()),
('JKL-3456', 'Truck', 10000, 'Sompo Seguros', 'IOT-004', 4, true, NOW(), NOW()),
('MNO-7890', 'Truck', 20000, 'Sompo Seguros', 'IOT-005', 5, true, NOW(), NOW());

-- Inserir cargas (shipments)
INSERT INTO shipments (shipment_number, vehicle_id, driver_id, origin_address, destination_address, origin_coords, destination_coords, status, cargo_type, cargo_value, estimated_departure, estimated_arrival, created_at, updated_at) VALUES
('SHP-2024-001', 1, 1, 'Centro de Distribuição São Paulo', 'Centro de Distribuição Rio de Janeiro', ST_GeomFromText('POINT(-23.5505 -46.6333)', 4326), ST_GeomFromText('POINT(-22.9068 -43.1729)', 4326), 'in_transit', 'Eletrônicos Premium', 125000.00, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '4 hours', NOW(), NOW()),
('SHP-2024-002', 2, 2, 'Centro de Distribuição São Paulo', 'Centro de Distribuição Belo Horizonte', ST_GeomFromText('POINT(-23.5505 -46.6333)', 4326), ST_GeomFromText('POINT(-19.9191 -43.9386)', 4326), 'in_transit', 'Medicamentos Controlados', 89000.00, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '6 hours', NOW(), NOW()),
('SHP-2024-003', 3, 3, 'Centro de Distribuição São Paulo', 'Centro de Distribuição Curitiba', ST_GeomFromText('POINT(-23.5505 -46.6333)', 4326), ST_GeomFromText('POINT(-25.4289 -49.2671)', 4326), 'in_transit', 'Produtos Químicos', 75000.00, NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '8 hours', NOW(), NOW()),
('SHP-2024-004', 4, 4, 'Centro de Distribuição São Paulo', 'Centro de Distribuição Recife', ST_GeomFromText('POINT(-23.5505 -46.6333)', 4326), ST_GeomFromText('POINT(-8.0476 -34.8770)', 4326), 'planned', 'Roupas e Acessórios', 78000.00, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '12 hours', NOW(), NOW()),
('SHP-2024-005', 5, 5, 'Centro de Distribuição São Paulo', 'Centro de Distribuição Brasília', ST_GeomFromText('POINT(-23.5505 -46.6333)', 4326), ST_GeomFromText('POINT(-15.7942 -47.8822)', 4326), 'in_transit', 'Equipamentos Industriais', 320000.00, NOW() - INTERVAL '3 hours', NOW() + INTERVAL '5 hours', NOW(), NOW());

-- Inserir alertas
INSERT INTO alerts (shipment_id, alert_type, severity, message, location, is_acknowledged, timestamp, created_at, updated_at) VALUES
(1, 'high_risk_zone', 'high', 'Veículo parado em zona de risco por mais de 30 minutos', ST_GeomFromText('POINT(-22.9876 -44.1234)', 4326), false, NOW() - INTERVAL '10 minutes', NOW(), NOW()),
(2, 'route_deviation', 'medium', 'Veículo desviou mais de 5km da rota planejada', ST_GeomFromText('POINT(-20.1234 -40.5678)', 4326), false, NOW() - INTERVAL '15 minutes', NOW(), NOW()),
(3, 'speed_violation', 'medium', 'Veículo excedeu limite de velocidade em 20km/h', ST_GeomFromText('POINT(-26.3456 -50.9012)', 4326), false, NOW() - INTERVAL '20 minutes', NOW(), NOW()),
(5, 'emergency_stop', 'critical', 'PARADA DE EMERGÊNCIA: Veículo parado em zona crítica', ST_GeomFromText('POINT(-15.7942 -47.8822)', 4326), false, NOW() - INTERVAL '5 minutes', NOW(), NOW()),
(1, 'maintenance_required', 'low', 'Manutenção preventiva necessária - óleo do motor', ST_GeomFromText('POINT(-23.5505 -46.6333)', 4326), true, NOW() - INTERVAL '2 hours', NOW(), NOW());

-- Inserir dados de GPS (tracks)
INSERT INTO gps_tracks (vehicle_id, shipment_id, location, speed_kmh, heading_degrees, timestamp, created_at) VALUES
(1, 1, ST_GeomFromText('POINT(-22.9876 -44.1234)', 4326), 0, 0, NOW() - INTERVAL '10 minutes', NOW()),
(2, 2, ST_GeomFromText('POINT(-20.1234 -40.5678)', 4326), 85, 45, NOW() - INTERVAL '15 minutes', NOW()),
(3, 3, ST_GeomFromText('POINT(-26.3456 -50.9012)', 4326), 95, 90, NOW() - INTERVAL '20 minutes', NOW()),
(5, 5, ST_GeomFromText('POINT(-15.7942 -47.8822)', 4326), 0, 0, NOW() - INTERVAL '5 minutes', NOW());

-- Inserir dados de sensores
INSERT INTO sensor_data (vehicle_id, shipment_id, temperature_celsius, humidity_percent, vibration_level, fuel_level_percent, timestamp, created_at) VALUES
(1, 1, 25.5, 60.0, 0.2, 75.0, NOW() - INTERVAL '10 minutes', NOW()),
(2, 2, 22.0, 55.0, 0.1, 80.0, NOW() - INTERVAL '15 minutes', NOW()),
(3, 3, 28.0, 70.0, 0.3, 65.0, NOW() - INTERVAL '20 minutes', NOW()),
(5, 5, 24.0, 58.0, 0.0, 90.0, NOW() - INTERVAL '5 minutes', NOW());

-- Inserir zonas de risco
INSERT INTO risk_zones (zone_name, zone_type, risk_level, location, radius_meters, description, is_active, created_at, updated_at) VALUES
('BR-116 Sul - Zona de Alto Risco', 'highway', 'high', ST_GeomFromText('POINT(-22.9876 -44.1234)', 4326), 5000, 'Zona conhecida por roubos de carga na BR-116', true, NOW(), NOW()),
('BR-040 - Zona Crítica', 'highway', 'critical', ST_GeomFromText('POINT(-15.7942 -47.8822)', 4326), 3000, 'Área de alto risco para roubos', true, NOW(), NOW()),
('BR-381 - Zona de Risco', 'highway', 'medium', ST_GeomFromText('POINT(-20.1234 -40.5678)', 4326), 4000, 'Zona com histórico de incidentes', true, NOW(), NOW());

-- Inserir usuários do sistema
INSERT INTO users (username, email, full_name, role, password_hash, is_active, created_at, updated_at) VALUES
('admin', 'admin@sompo.com.br', 'Administrador do Sistema', 'admin', '$2b$10$example.hash', true, NOW(), NOW()),
('operador1', 'operador1@sompo.com.br', 'Operador de Monitoramento', 'operator', '$2b$10$example.hash', true, NOW(), NOW()),
('supervisor1', 'supervisor1@sompo.com.br', 'Supervisor de Operações', 'supervisor', '$2b$10$example.hash', true, NOW(), NOW());

-- Comentário sobre os dados inseridos
-- Este script cria dados realistas para o sistema de monitoramento:
-- - 5 motoristas com dados completos
-- - 5 veículos associados aos motoristas
-- - 5 cargas em diferentes estados (em trânsito, planejadas)
-- - 5 alertas de diferentes tipos e severidades
-- - Dados de GPS e sensores para monitoramento
-- - 3 zonas de risco geográficas
-- - 3 usuários do sistema com diferentes perfis
