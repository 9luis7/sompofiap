-- Migration: Historical Accidents Table
-- Description: Table to store historical accident data from DATATRAN
-- Date: 2025-10-12

-- Create historical_accidents table
CREATE TABLE IF NOT EXISTS historical_accidents (
    id SERIAL PRIMARY KEY,
    datatran_id VARCHAR(50) UNIQUE,
    
    -- Date and time information
    accident_date TIMESTAMP NOT NULL,
    accident_time VARCHAR(10) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    
    -- Location information
    uf VARCHAR(2) NOT NULL,
    br VARCHAR(10) NOT NULL,
    km DECIMAL(10, 2) NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    location GEOMETRY(POINT, 4326),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    
    -- Accident details
    accident_cause VARCHAR(200),
    accident_type VARCHAR(100),
    accident_classification VARCHAR(50),
    severity VARCHAR(20) DEFAULT 'sem_vitimas' CHECK (severity IN ('sem_vitimas', 'com_feridos', 'com_mortos')),
    
    -- Conditions
    day_phase VARCHAR(50),
    weather_condition VARCHAR(50),
    road_type VARCHAR(50),
    road_layout VARCHAR(100),
    
    -- Victims
    people_involved INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    minor_injuries INTEGER DEFAULT 0,
    serious_injuries INTEGER DEFAULT 0,
    unharmed INTEGER DEFAULT 0,
    vehicles_involved INTEGER DEFAULT 0,
    
    -- Risk scoring
    risk_score DECIMAL(5, 2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_historical_accidents_date ON historical_accidents (accident_date);
CREATE INDEX idx_historical_accidents_uf ON historical_accidents (uf);
CREATE INDEX idx_historical_accidents_br_km ON historical_accidents (br, km);
CREATE INDEX idx_historical_accidents_severity ON historical_accidents (severity);
CREATE INDEX idx_historical_accidents_municipality ON historical_accidents (municipality);
CREATE INDEX idx_historical_accidents_risk_score ON historical_accidents (risk_score);

-- Create spatial index for location queries
CREATE INDEX idx_historical_accidents_location ON historical_accidents USING GIST (location);

-- Create composite indexes for common queries
CREATE INDEX idx_historical_accidents_date_severity ON historical_accidents (accident_date, severity);
CREATE INDEX idx_historical_accidents_uf_br ON historical_accidents (uf, br);

-- Create partitioning by year for optimization (optional, commented out by default)
-- This can be enabled for very large datasets (millions of records)
/*
-- Drop the existing table if implementing partitioning
DROP TABLE IF EXISTS historical_accidents CASCADE;

-- Create partitioned table
CREATE TABLE historical_accidents (
    id SERIAL,
    datatran_id VARCHAR(50),
    accident_date TIMESTAMP NOT NULL,
    accident_time VARCHAR(10) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    br VARCHAR(10) NOT NULL,
    km DECIMAL(10, 2) NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    location GEOMETRY(POINT, 4326),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    accident_cause VARCHAR(200),
    accident_type VARCHAR(100),
    accident_classification VARCHAR(50),
    severity VARCHAR(20) DEFAULT 'sem_vitimas' CHECK (severity IN ('sem_vitimas', 'com_feridos', 'com_mortos')),
    day_phase VARCHAR(50),
    weather_condition VARCHAR(50),
    road_type VARCHAR(50),
    road_layout VARCHAR(100),
    people_involved INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    minor_injuries INTEGER DEFAULT 0,
    serious_injuries INTEGER DEFAULT 0,
    unharmed INTEGER DEFAULT 0,
    vehicles_involved INTEGER DEFAULT 0,
    risk_score DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, accident_date)
) PARTITION BY RANGE (accident_date);

-- Create partitions for each year
CREATE TABLE historical_accidents_2023 PARTITION OF historical_accidents
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

CREATE TABLE historical_accidents_2024 PARTITION OF historical_accidents
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE historical_accidents_2025 PARTITION OF historical_accidents
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Create default partition for other years
CREATE TABLE historical_accidents_default PARTITION OF historical_accidents DEFAULT;
*/

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_historical_accidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_historical_accidents_updated_at
    BEFORE UPDATE ON historical_accidents
    FOR EACH ROW
    EXECUTE FUNCTION update_historical_accidents_updated_at();

-- Create materialized view for quick statistics
CREATE MATERIALIZED VIEW historical_accidents_stats AS
SELECT
    uf,
    br,
    COUNT(*) as total_accidents,
    SUM(deaths) as total_deaths,
    SUM(serious_injuries) as total_serious_injuries,
    SUM(minor_injuries) as total_minor_injuries,
    AVG(risk_score) as avg_risk_score,
    COUNT(CASE WHEN severity = 'com_mortos' THEN 1 END) as fatal_accidents,
    COUNT(CASE WHEN severity = 'com_feridos' THEN 1 END) as injury_accidents,
    COUNT(CASE WHEN severity = 'sem_vitimas' THEN 1 END) as no_injury_accidents,
    MIN(accident_date) as earliest_accident,
    MAX(accident_date) as latest_accident
FROM historical_accidents
GROUP BY uf, br;

-- Create index on materialized view
CREATE INDEX idx_accidents_stats_uf_br ON historical_accidents_stats (uf, br);

-- Create function to refresh statistics
CREATE OR REPLACE FUNCTION refresh_accident_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY historical_accidents_stats;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust user as needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON historical_accidents TO sompo_user;
GRANT SELECT ON historical_accidents_stats TO sompo_user;
GRANT USAGE, SELECT ON SEQUENCE historical_accidents_id_seq TO sompo_user;

-- Add comments for documentation
COMMENT ON TABLE historical_accidents IS 'Historical accident data imported from DATATRAN (2007-2025)';
COMMENT ON COLUMN historical_accidents.datatran_id IS 'Original ID from DATATRAN database';
COMMENT ON COLUMN historical_accidents.risk_score IS 'Calculated risk score (0-100) based on severity and casualties';
COMMENT ON COLUMN historical_accidents.location IS 'PostGIS geometry point (latitude, longitude)';
COMMENT ON MATERIALIZED VIEW historical_accidents_stats IS 'Aggregated statistics by UF and BR for quick queries';

-- Sample query to verify installation
-- SELECT COUNT(*) as total_accidents, 
--        SUM(deaths) as total_deaths,
--        AVG(risk_score) as avg_risk_score
-- FROM historical_accidents;

