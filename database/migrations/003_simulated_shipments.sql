-- Migration: Simulated Shipments Table
-- Description: Table to store simulated shipments for demonstration/PoC
-- Date: 2025-01-13

-- Create simulated_shipments table
CREATE TABLE IF NOT EXISTS simulated_shipments (
    id SERIAL PRIMARY KEY,
    shipment_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Current location and route
    current_position GEOMETRY(POINT, 4326),
    route GEOMETRY(LINESTRING, 4326),
    
    -- Origin and destination
    origin VARCHAR(200) NOT NULL,
    destination VARCHAR(200) NOT NULL,
    origin_coords GEOMETRY(POINT, 4326),
    destination_coords GEOMETRY(POINT, 4326),
    
    -- Cargo information
    cargo_type VARCHAR(100) NOT NULL,
    cargo_value DECIMAL(15,2) NOT NULL,
    
    -- Status and timing
    status VARCHAR(20) DEFAULT 'in_transit' CHECK (status IN ('planned', 'in_transit', 'completed', 'paused')),
    start_time TIMESTAMP NOT NULL,
    estimated_arrival TIMESTAMP NOT NULL,
    
    -- Movement data
    current_speed DECIMAL(5,2) DEFAULT 0, -- km/h
    distance_traveled DECIMAL(10,2) DEFAULT 0, -- km
    distance_remaining DECIMAL(10,2) DEFAULT 0, -- km
    progress_percent DECIMAL(5,2) DEFAULT 0, -- 0-100
    
    -- Risk assessment
    overall_risk_score DECIMAL(5,2) DEFAULT 0,
    current_segment_risk DECIMAL(5,2) DEFAULT 0,
    
    -- Metadata
    uf VARCHAR(2),
    br VARCHAR(10),
    current_km DECIMAL(10,2),
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_simulated_shipments_status ON simulated_shipments (status);
CREATE INDEX idx_simulated_shipments_current_position ON simulated_shipments USING GIST (current_position);
CREATE INDEX idx_simulated_shipments_route ON simulated_shipments USING GIST (route);
CREATE INDEX idx_simulated_shipments_uf_br ON simulated_shipments (uf, br);
CREATE INDEX idx_simulated_shipments_last_update ON simulated_shipments (last_update);

-- Create trigger to update last_update timestamp
CREATE OR REPLACE FUNCTION update_simulated_shipments_last_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_update = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_simulated_shipments_last_update
    BEFORE UPDATE ON simulated_shipments
    FOR EACH ROW
    EXECUTE FUNCTION update_simulated_shipments_last_update();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON simulated_shipments TO sompo_user;
GRANT USAGE, SELECT ON SEQUENCE simulated_shipments_id_seq TO sompo_user;

-- Add comments
COMMENT ON TABLE simulated_shipments IS 'Simulated shipments for demonstration and PoC purposes';
COMMENT ON COLUMN simulated_shipments.shipment_number IS 'Unique identifier for the simulated shipment';
COMMENT ON COLUMN simulated_shipments.overall_risk_score IS 'Calculated risk score for the entire route (0-100)';
COMMENT ON COLUMN simulated_shipments.current_segment_risk IS 'Current risk score for the segment being traversed (0-100)';

