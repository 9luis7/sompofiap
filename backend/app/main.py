from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from datetime import datetime, timedelta
import random
import json

from app.models.risk_prediction import RiskPredictionModel
from app.models.route_optimization import RouteOptimizer
from app.services.dashboard_service import DashboardService
from app.services.scoring_service import ScoringService
from app.utils.data_generator import DataGenerator

app = FastAPI(
    title="Sompo IA - Sistema de Redução de Sinistros",
    description="API para predição de riscos e otimização de rotas para seguradora",
    version="1.0.0"
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicialização dos serviços
risk_model = RiskPredictionModel()
route_optimizer = RouteOptimizer()
dashboard_service = DashboardService()
scoring_service = ScoringService()
data_generator = DataGenerator()

@app.get("/")
async def root():
    """Endpoint raiz com informações do sistema"""
    return {
        "message": "Sompo IA - Sistema de Redução de Sinistros",
        "version": "1.0.0",
        "status": "online",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Verificação de saúde da API"""
    return {
        "status": "healthy",
        "services": {
            "risk_prediction": "online",
            "route_optimization": "online",
            "dashboard": "online",
            "scoring": "online"
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/dashboard/overview")
async def get_dashboard_overview():
    """Dados gerais do dashboard"""
    try:
        return dashboard_service.get_overview_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/fleet-status")
async def get_fleet_status():
    """Status atual da frota"""
    try:
        return dashboard_service.get_fleet_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/risk-alerts")
async def get_risk_alerts():
    """Alertas de risco ativos"""
    try:
        return dashboard_service.get_risk_alerts()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/prediction/risk-assessment")
async def predict_risk(request_data: dict):
    """Predição de risco para uma viagem"""
    try:
        # Validação dos dados de entrada
        required_fields = ["driver_id", "vehicle_id", "origin", "destination", "date"]
        for field in required_fields:
            if field not in request_data:
                raise HTTPException(status_code=400, detail=f"Campo obrigatório: {field}")
        
        # Predição de risco
        risk_score = risk_model.predict_risk(request_data)
        
        return {
            "risk_score": risk_score,
            "risk_level": "ALTO" if risk_score > 0.7 else "MÉDIO" if risk_score > 0.4 else "BAIXO",
            "recommendations": risk_model.get_recommendations(risk_score),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/optimization/route")
async def optimize_route(request_data: dict):
    """Otimização de rota considerando risco"""
    try:
        # Validação dos dados de entrada
        required_fields = ["origin", "destination", "preferences"]
        for field in required_fields:
            if field not in request_data:
                raise HTTPException(status_code=400, detail=f"Campo obrigatório: {field}")
        
        # Otimização de rota
        optimized_route = route_optimizer.optimize_route(request_data)
        
        return {
            "optimized_route": optimized_route,
            "total_risk": optimized_route.get("total_risk", 0),
            "estimated_time": optimized_route.get("estimated_time", 0),
            "distance": optimized_route.get("distance", 0),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scoring/driver/{driver_id}")
async def get_driver_score(driver_id: str):
    """Score de risco de um motorista específico"""
    try:
        score = scoring_service.get_driver_score(driver_id)
        return {
            "driver_id": driver_id,
            "risk_score": score,
            "risk_level": "ALTO" if score > 0.7 else "MÉDIO" if score > 0.4 else "BAIXO",
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scoring/vehicle/{vehicle_id}")
async def get_vehicle_score(vehicle_id: str):
    """Score de risco de um veículo específico"""
    try:
        score = scoring_service.get_vehicle_score(vehicle_id)
        return {
            "vehicle_id": vehicle_id,
            "risk_score": score,
            "risk_level": "ALTO" if score > 0.7 else "MÉDIO" if score > 0.4 else "BAIXO",
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/generate-demo")
async def generate_demo_data():
    """Gera dados de demonstração para o protótipo"""
    try:
        data = data_generator.generate_all_data()
        return {
            "message": "Dados de demonstração gerados com sucesso",
            "data_summary": {
                "drivers": len(data.get("drivers", [])),
                "vehicles": len(data.get("vehicles", [])),
                "claims": len(data.get("claims", [])),
                "routes": len(data.get("routes", []))
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/claims-trend")
async def get_claims_trend():
    """Tendência de sinistros ao longo do tempo"""
    try:
        trend_data = dashboard_service.get_claims_trend()
        return trend_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/risk-distribution")
async def get_risk_distribution():
    """Distribuição de riscos por região"""
    try:
        distribution = dashboard_service.get_risk_distribution()
        return distribution
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
