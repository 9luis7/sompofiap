-- Migration: Predictive Alerts Table
-- Description: Table to store predictive alerts generated for shipments
-- Date: 2025-01-13

-- Create predictive_alerts table
CREATE TABLE IF NOT EXISTS predictive_alerts (
    id SERIAL PRIMARY KEY,
    
    -- Shipment reference
    shipment_id INTEGER,
    shipment_number VARCHAR(50),
    is_simulated BOOLEAN DEFAULT false,
    
    -- Alert information
    alert_type VARCHAR(50) NOT NULL, -- 'high_risk_area', 'dangerous_time', 'weather_hazard', etc.
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Risk scoring
    risk_score DECIMAL(5,2) NOT NULL,
    historical_score DECIMAL(5,2), -- Score from historical data (0-100)
    ml_prediction_score DECIMAL(5,2), -- Score from ML model (0-100)
    contextual_score DECIMAL(5,2), -- Score from context (time, weather, etc.) (0-100)
    
    -- Location information
    location GEOMETRY(POINT, 4326),
    uf VARCHAR(2),
    br VARCHAR(10),
    km DECIMAL(10,2),
    municipality VARCHAR(100),
    
    -- Segment information (stored as JSON for flexibility)
    segment_info JSONB,
    
    -- Prediction metadata
    prediction_source VARCHAR(50) NOT NULL, -- 'historical', 'ml_model', 'hybrid', 'rules_based'
    confidence DECIMAL(5,2), -- Confidence level (0-100)
    
    -- Recommendations
    recommendations TEXT[],
    actions_suggested TEXT[],
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'expired')),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_predictive_alerts_shipment ON predictive_alerts (shipment_id, is_simulated);
CREATE INDEX idx_predictive_alerts_shipment_number ON predictive_alerts (shipment_number);
CREATE INDEX idx_predictive_alerts_severity ON predictive_alerts (severity);
CREATE INDEX idx_predictive_alerts_status ON predictive_alerts (status);
CREATE INDEX idx_predictive_alerts_location ON predictive_alerts USING GIST (location);
CREATE INDEX idx_predictive_alerts_uf_br ON predictive_alerts (uf, br);
CREATE INDEX idx_predictive_alerts_created_at ON predictive_alerts (created_at DESC);
CREATE INDEX idx_predictive_alerts_risk_score ON predictive_alerts (risk_score DESC);

-- Create GIN index for JSONB segment_info
CREATE INDEX idx_predictive_alerts_segment_info ON predictive_alerts USING GIN (segment_info);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_predictive_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_predictive_alerts_updated_at
    BEFORE UPDATE ON predictive_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_predictive_alerts_updated_at();

-- Create materialized view for alert statistics
CREATE MATERIALIZED VIEW alert_statistics AS
SELECT
    DATE(created_at) as alert_date,
    severity,
    alert_type,
    COUNT(*) as alert_count,
    AVG(risk_score) as avg_risk_score,
    COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM predictive_alerts
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), severity, alert_type;

-- Create index on materialized view
CREATE INDEX idx_alert_statistics_date ON alert_statistics (alert_date DESC);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON predictive_alerts TO sompo_user;
GRANT USAGE, SELECT ON SEQUENCE predictive_alerts_id_seq TO sompo_user;
GRANT SELECT ON alert_statistics TO sompo_user;

-- Add comments
COMMENT ON TABLE predictive_alerts IS 'Predictive alerts generated for shipments based on historical data and ML predictions';
COMMENT ON COLUMN predictive_alerts.risk_score IS 'Composite risk score (0-100) calculated from multiple sources';
COMMENT ON COLUMN predictive_alerts.segment_info IS 'JSON object with detailed segment information (start_km, end_km, avg_accidents, etc.)';
COMMENT ON COLUMN predictive_alerts.prediction_source IS 'Source of the prediction: historical data, ML model, or hybrid approach';
COMMENT ON MATERIALIZED VIEW alert_statistics IS 'Aggregated alert statistics for the last 30 days';

