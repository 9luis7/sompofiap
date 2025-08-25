import random
from datetime import datetime, timedelta
import json

class DashboardService:
    def __init__(self):
        self.fleet_data = self._generate_fleet_data()
        self.claims_data = self._generate_claims_data()
        self.risk_data = self._generate_risk_data()
        
    def get_overview_data(self):
        """Retorna dados gerais do dashboard"""
        total_fleet = len(self.fleet_data)
        active_vehicles = sum(1 for vehicle in self.fleet_data if vehicle['status'] == 'active')
        high_risk_vehicles = sum(1 for vehicle in self.fleet_data if vehicle['risk_level'] == 'ALTO')
        
        # Cálculo de sinistros do mês atual
        current_month = datetime.now().month
        monthly_claims = sum(1 for claim in self.claims_data if claim['date'].month == current_month)
        
        # Redução de sinistros (simulada)
        last_month_claims = sum(1 for claim in self.claims_data if claim['date'].month == current_month - 1)
        claims_reduction = ((last_month_claims - monthly_claims) / last_month_claims * 100) if last_month_claims > 0 else 0
        
        return {
            "total_fleet": total_fleet,
            "active_vehicles": active_vehicles,
            "high_risk_vehicles": high_risk_vehicles,
            "monthly_claims": monthly_claims,
            "claims_reduction_percentage": round(claims_reduction, 1),
            "system_status": "online",
            "last_updated": datetime.now().isoformat()
        }
    
    def get_fleet_status(self):
        """Retorna status detalhado da frota"""
        status_counts = {}
        risk_counts = {}
        
        for vehicle in self.fleet_data:
            # Contagem por status
            status = vehicle['status']
            status_counts[status] = status_counts.get(status, 0) + 1
            
            # Contagem por nível de risco
            risk_level = vehicle['risk_level']
            risk_counts[risk_level] = risk_counts.get(risk_level, 0) + 1
        
        # Veículos em alerta
        alert_vehicles = [
            vehicle for vehicle in self.fleet_data 
            if vehicle['risk_level'] == 'ALTO' or vehicle['status'] == 'maintenance'
        ]
        
        return {
            "status_distribution": status_counts,
            "risk_distribution": risk_counts,
            "alert_vehicles": alert_vehicles[:10],  # Top 10 veículos em alerta
            "total_vehicles": len(self.fleet_data),
            "last_updated": datetime.now().isoformat()
        }
    
    def get_risk_alerts(self):
        """Retorna alertas de risco ativos"""
        alerts = []
        
        # Alertas baseados em veículos de alto risco
        high_risk_vehicles = [
            vehicle for vehicle in self.fleet_data 
            if vehicle['risk_level'] == 'ALTO'
        ]
        
        for vehicle in high_risk_vehicles[:5]:  # Top 5
            alerts.append({
                "type": "high_risk_vehicle",
                "severity": "ALTO",
                "message": f"Veículo {vehicle['id']} com risco alto",
                "vehicle_id": vehicle['id'],
                "risk_score": vehicle['risk_score'],
                "timestamp": datetime.now().isoformat()
            })
        
        # Alertas baseados em condições climáticas
        weather_alerts = [
            {
                "type": "weather_warning",
                "severity": "MÉDIO",
                "message": "Chuva forte prevista para região Sul",
                "region": "Sul",
                "timestamp": datetime.now().isoformat()
            },
            {
                "type": "weather_warning",
                "severity": "BAIXO",
                "message": "Neblina em rodovias do interior",
                "region": "Interior SP",
                "timestamp": datetime.now().isoformat()
            }
        ]
        alerts.extend(weather_alerts)
        
        # Alertas de tráfego
        traffic_alerts = [
            {
                "type": "traffic_warning",
                "severity": "ALTO",
                "message": "Congestionamento na Marginal Tietê",
                "location": "São Paulo - Marginal Tietê",
                "timestamp": datetime.now().isoformat()
            }
        ]
        alerts.extend(traffic_alerts)
        
        return {
            "alerts": alerts,
            "total_alerts": len(alerts),
            "high_severity": len([a for a in alerts if a['severity'] == 'ALTO']),
            "last_updated": datetime.now().isoformat()
        }
    
    def get_claims_trend(self):
        """Retorna tendência de sinistros ao longo do tempo"""
        # Agrupa sinistros por mês
        monthly_claims = {}
        
        for claim in self.claims_data:
            month_key = f"{claim['date'].year}-{claim['date'].month:02d}"
            monthly_claims[month_key] = monthly_claims.get(month_key, 0) + 1
        
        # Gera dados dos últimos 12 meses
        trend_data = []
        current_date = datetime.now()
        
        for i in range(12):
            date = current_date - timedelta(days=30*i)
            month_key = f"{date.year}-{date.month:02d}"
            count = monthly_claims.get(month_key, 0)
            
            trend_data.append({
                "month": month_key,
                "claims_count": count,
                "date": date.strftime("%Y-%m")
            })
        
        # Inverte para ordem cronológica
        trend_data.reverse()
        
        return {
            "trend_data": trend_data,
            "total_claims": len(self.claims_data),
            "average_monthly_claims": round(len(self.claims_data) / 12, 1),
            "last_updated": datetime.now().isoformat()
        }
    
    def get_risk_distribution(self):
        """Retorna distribuição de riscos por região"""
        region_risks = {}
        
        for vehicle in self.fleet_data:
            region = vehicle['region']
            risk_score = vehicle['risk_score']
            
            if region not in region_risks:
                region_risks[region] = {
                    "total_vehicles": 0,
                    "total_risk": 0,
                    "high_risk_count": 0,
                    "medium_risk_count": 0,
                    "low_risk_count": 0
                }
            
            region_risks[region]["total_vehicles"] += 1
            region_risks[region]["total_risk"] += risk_score
            
            if risk_score > 0.7:
                region_risks[region]["high_risk_count"] += 1
            elif risk_score > 0.4:
                region_risks[region]["medium_risk_count"] += 1
            else:
                region_risks[region]["low_risk_count"] += 1
        
        # Calcula médias de risco
        for region in region_risks:
            total_vehicles = region_risks[region]["total_vehicles"]
            region_risks[region]["average_risk"] = round(
                region_risks[region]["total_risk"] / total_vehicles, 3
            )
        
        return {
            "region_distribution": region_risks,
            "total_regions": len(region_risks),
            "last_updated": datetime.now().isoformat()
        }
    
    def _generate_fleet_data(self):
        """Gera dados simulados da frota"""
        fleet = []
        regions = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Salvador", "Recife"]
        statuses = ["active", "maintenance", "inactive"]
        risk_levels = ["BAIXO", "MÉDIO", "ALTO"]
        
        for i in range(200):
            vehicle = {
                "id": f"VEHICLE{i+1:03d}",
                "plate": f"ABC{random.randint(1000, 9999)}",
                "model": f"Modelo {random.randint(1, 10)}",
                "year": random.randint(2010, 2023),
                "region": random.choice(regions),
                "status": random.choice(statuses),
                "risk_score": round(random.uniform(0.1, 0.9), 3),
                "last_maintenance": (datetime.now() - timedelta(days=random.randint(1, 365))).isoformat(),
                "driver_id": f"DRIVER{random.randint(1, 500):03d}",
                "current_location": f"Lat: {random.uniform(-25, -5)}, Lon: {random.uniform(-50, -35)}"
            }
            
            # Define nível de risco baseado no score
            if vehicle["risk_score"] > 0.7:
                vehicle["risk_level"] = "ALTO"
            elif vehicle["risk_score"] > 0.4:
                vehicle["risk_level"] = "MÉDIO"
            else:
                vehicle["risk_level"] = "BAIXO"
            
            fleet.append(vehicle)
        
        return fleet
    
    def _generate_claims_data(self):
        """Gera dados simulados de sinistros"""
        claims = []
        
        for i in range(1000):
            # Data aleatória nos últimos 2 anos
            days_ago = random.randint(1, 730)
            claim_date = datetime.now() - timedelta(days=days_ago)
            
            claim = {
                "id": f"CLAIM{i+1:04d}",
                "date": claim_date,
                "vehicle_id": f"VEHICLE{random.randint(1, 200):03d}",
                "driver_id": f"DRIVER{random.randint(1, 500):03d}",
                "type": random.choice(["colisão", "roubo", "incêndio", "danos naturais"]),
                "severity": random.choice(["leve", "médio", "grave"]),
                "cost": round(random.uniform(1000, 50000), 2),
                "location": f"Lat: {random.uniform(-25, -5)}, Lon: {random.uniform(-50, -35)}",
                "status": random.choice(["aberto", "em análise", "fechado"])
            }
            
            claims.append(claim)
        
        return claims
    
    def _generate_risk_data(self):
        """Gera dados simulados de risco"""
        risk_data = {
            "weather_conditions": {
                "clear": 0.6,
                "rainy": 0.3,
                "stormy": 0.1
            },
            "traffic_conditions": {
                "low": 0.4,
                "medium": 0.4,
                "high": 0.2
            },
            "road_conditions": {
                "good": 0.7,
                "fair": 0.2,
                "poor": 0.1
            }
        }
        
        return risk_data
