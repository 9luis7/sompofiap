import random
from datetime import datetime, timedelta
import json

class ScoringService:
    def __init__(self):
        self.driver_scores = self._generate_driver_scores()
        self.vehicle_scores = self._generate_vehicle_scores()
        
    def get_driver_score(self, driver_id):
        """Retorna score de risco de um motorista específico"""
        if driver_id in self.driver_scores:
            return self.driver_scores[driver_id]['score']
        else:
            # Gera score para motorista não encontrado
            return round(random.uniform(0.2, 0.8), 3)
    
    def get_vehicle_score(self, vehicle_id):
        """Retorna score de risco de um veículo específico"""
        if vehicle_id in self.vehicle_scores:
            return self.vehicle_scores[vehicle_id]['score']
        else:
            # Gera score para veículo não encontrado
            return round(random.uniform(0.1, 0.7), 3)
    
    def get_driver_details(self, driver_id):
        """Retorna detalhes completos de um motorista"""
        if driver_id in self.driver_scores:
            return self.driver_scores[driver_id]
        else:
            return self._generate_driver_details(driver_id)
    
    def get_vehicle_details(self, vehicle_id):
        """Retorna detalhes completos de um veículo"""
        if vehicle_id in self.vehicle_scores:
            return self.vehicle_scores[vehicle_id]
        else:
            return self._generate_vehicle_details(vehicle_id)
    
    def get_top_risk_drivers(self, limit=10):
        """Retorna motoristas com maior risco"""
        sorted_drivers = sorted(
            self.driver_scores.items(),
            key=lambda x: x[1]['score'],
            reverse=True
        )
        
        return [
            {
                "driver_id": driver_id,
                "name": details['name'],
                "score": details['score'],
                "risk_level": details['risk_level'],
                "claims_count": details['claims_count']
            }
            for driver_id, details in sorted_drivers[:limit]
        ]
    
    def get_top_risk_vehicles(self, limit=10):
        """Retorna veículos com maior risco"""
        sorted_vehicles = sorted(
            self.vehicle_scores.items(),
            key=lambda x: x[1]['score'],
            reverse=True
        )
        
        return [
            {
                "vehicle_id": vehicle_id,
                "plate": details['plate'],
                "score": details['score'],
                "risk_level": details['risk_level'],
                "age": details['age']
            }
            for vehicle_id, details in sorted_vehicles[:limit]
        ]
    
    def get_score_distribution(self):
        """Retorna distribuição dos scores"""
        driver_scores = [details['score'] for details in self.driver_scores.values()]
        vehicle_scores = [details['score'] for details in self.vehicle_scores.values()]
        
        return {
            "drivers": {
                "low_risk": len([s for s in driver_scores if s < 0.4]),
                "medium_risk": len([s for s in driver_scores if 0.4 <= s < 0.7]),
                "high_risk": len([s for s in driver_scores if s >= 0.7]),
                "average_score": round(sum(driver_scores) / len(driver_scores), 3)
            },
            "vehicles": {
                "low_risk": len([s for s in vehicle_scores if s < 0.4]),
                "medium_risk": len([s for s in vehicle_scores if 0.4 <= s < 0.7]),
                "high_risk": len([s for s in vehicle_scores if s >= 0.7]),
                "average_score": round(sum(vehicle_scores) / len(vehicle_scores), 3)
            }
        }
    
    def _generate_driver_scores(self):
        """Gera scores simulados para motoristas"""
        drivers = {}
        names = [
            "João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa", "Carlos Ferreira",
            "Lucia Rodrigues", "Roberto Almeida", "Fernanda Lima", "Marcos Pereira", "Juliana Gomes",
            "Ricardo Martins", "Patricia Souza", "Andre Barbosa", "Camila Ribeiro", "Felipe Carvalho",
            "Daniela Cardoso", "Thiago Melo", "Vanessa Castro", "Rafael Dias", "Amanda Moreira"
        ]
        
        for i in range(500):
            driver_id = f"DRIVER{i+1:03d}"
            
            # Gera dados do motorista
            age = random.randint(25, 65)
            experience = random.randint(1, 30)
            claims_count = random.randint(0, 8)
            
            # Calcula score baseado em fatores
            base_score = 0.3
            
            # Fatores de idade
            if age < 25 or age > 60:
                base_score += 0.2
            
            # Fatores de experiência
            if experience < 3:
                base_score += 0.3
            elif experience > 20:
                base_score -= 0.1
            
            # Fatores de sinistros
            if claims_count > 5:
                base_score += 0.4
            elif claims_count > 2:
                base_score += 0.2
            
            # Adiciona variação aleatória
            base_score += random.uniform(-0.1, 0.1)
            base_score = max(0.1, min(0.9, base_score))
            
            # Define nível de risco
            if base_score > 0.7:
                risk_level = "ALTO"
            elif base_score > 0.4:
                risk_level = "MÉDIO"
            else:
                risk_level = "BAIXO"
            
            drivers[driver_id] = {
                "name": random.choice(names),
                "age": age,
                "experience_years": experience,
                "claims_count": claims_count,
                "score": round(base_score, 3),
                "risk_level": risk_level,
                "license_type": random.choice(["B", "C", "D", "E"]),
                "last_training": (datetime.now() - timedelta(days=random.randint(30, 365))).isoformat(),
                "violations_count": random.randint(0, 5)
            }
        
        return drivers
    
    def _generate_vehicle_scores(self):
        """Gera scores simulados para veículos"""
        vehicles = {}
        models = [
            "Mercedes-Benz Actros", "Volvo FH", "Scania R", "DAF XF", "Iveco Stralis",
            "MAN TGX", "Renault T", "Ford Cargo", "Chevrolet Silverado", "Fiat Ducato"
        ]
        
        for i in range(200):
            vehicle_id = f"VEHICLE{i+1:03d}"
            
            # Gera dados do veículo
            age = random.randint(0, 15)
            maintenance_score = random.uniform(0.3, 1.0)
            claims_count = random.randint(0, 6)
            
            # Calcula score baseado em fatores
            base_score = 0.2
            
            # Fatores de idade
            if age > 10:
                base_score += 0.3
            elif age > 5:
                base_score += 0.1
            
            # Fatores de manutenção
            if maintenance_score < 0.5:
                base_score += 0.3
            elif maintenance_score < 0.7:
                base_score += 0.1
            
            # Fatores de sinistros
            if claims_count > 3:
                base_score += 0.3
            elif claims_count > 1:
                base_score += 0.1
            
            # Adiciona variação aleatória
            base_score += random.uniform(-0.1, 0.1)
            base_score = max(0.1, min(0.8, base_score))
            
            # Define nível de risco
            if base_score > 0.7:
                risk_level = "ALTO"
            elif base_score > 0.4:
                risk_level = "MÉDIO"
            else:
                risk_level = "BAIXO"
            
            vehicles[vehicle_id] = {
                "plate": f"ABC{random.randint(1000, 9999)}",
                "model": random.choice(models),
                "age": age,
                "maintenance_score": round(maintenance_score, 3),
                "claims_count": claims_count,
                "score": round(base_score, 3),
                "risk_level": risk_level,
                "last_maintenance": (datetime.now() - timedelta(days=random.randint(1, 365))).isoformat(),
                "fuel_type": random.choice(["diesel", "gasolina", "etanol"]),
                "capacity": random.randint(1000, 5000)
            }
        
        return vehicles
    
    def _generate_driver_details(self, driver_id):
        """Gera detalhes para motorista não encontrado"""
        return {
            "name": f"Motorista {driver_id}",
            "age": random.randint(25, 65),
            "experience_years": random.randint(1, 30),
            "claims_count": random.randint(0, 5),
            "score": round(random.uniform(0.2, 0.8), 3),
            "risk_level": "MÉDIO",
            "license_type": "C",
            "last_training": datetime.now().isoformat(),
            "violations_count": random.randint(0, 3)
        }
    
    def _generate_vehicle_details(self, vehicle_id):
        """Gera detalhes para veículo não encontrado"""
        return {
            "plate": f"XYZ{random.randint(1000, 9999)}",
            "model": "Modelo Genérico",
            "age": random.randint(0, 10),
            "maintenance_score": round(random.uniform(0.4, 0.9), 3),
            "claims_count": random.randint(0, 3),
            "score": round(random.uniform(0.1, 0.7), 3),
            "risk_level": "MÉDIO",
            "last_maintenance": datetime.now().isoformat(),
            "fuel_type": "diesel",
            "capacity": random.randint(1000, 3000)
        }
