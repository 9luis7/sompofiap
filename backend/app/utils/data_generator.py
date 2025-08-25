import random
import json
from datetime import datetime, timedelta

class DataGenerator:
    def __init__(self):
        self.cities = [
            "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Salvador", "Recife",
            "Fortaleza", "Brasília", "Curitiba", "Porto Alegre", "Manaus",
            "Belém", "Goiânia", "Guarulhos", "Campinas", "São Luís"
        ]
        
        self.vehicle_models = [
            "Mercedes-Benz Actros", "Volvo FH", "Scania R", "DAF XF", "Iveco Stralis",
            "MAN TGX", "Renault T", "Ford Cargo", "Chevrolet Silverado", "Fiat Ducato",
            "Hyundai HD", "Isuzu NPR", "Mitsubishi Fuso", "Hino 300", "Nissan Diesel"
        ]
        
        self.claim_types = [
            "colisão", "roubo", "incêndio", "danos naturais", "acidente de trânsito",
            "avaria mecânica", "danos por chuva", "colisão com objeto fixo"
        ]
        
    def generate_all_data(self):
        """Gera todos os dados de demonstração"""
        return {
            "drivers": self.generate_drivers(500),
            "vehicles": self.generate_vehicles(200),
            "claims": self.generate_claims(1000),
            "routes": self.generate_routes(300),
            "weather_data": self.generate_weather_data(100),
            "traffic_data": self.generate_traffic_data(100)
        }
    
    def generate_drivers(self, count):
        """Gera dados de motoristas"""
        drivers = []
        names = [
            "João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa", "Carlos Ferreira",
            "Lucia Rodrigues", "Roberto Almeida", "Fernanda Lima", "Marcos Pereira", "Juliana Gomes",
            "Ricardo Martins", "Patricia Souza", "Andre Barbosa", "Camila Ribeiro", "Felipe Carvalho",
            "Daniela Cardoso", "Thiago Melo", "Vanessa Castro", "Rafael Dias", "Amanda Moreira",
            "Lucas Santos", "Beatriz Lima", "Gabriel Costa", "Isabela Silva", "Matheus Oliveira"
        ]
        
        for i in range(count):
            driver = {
                "id": f"DRIVER{i+1:03d}",
                "name": random.choice(names),
                "age": random.randint(25, 65),
                "experience_years": random.randint(1, 30),
                "license_type": random.choice(["B", "C", "D", "E"]),
                "region": random.choice(self.cities),
                "claims_history": random.randint(0, 8),
                "violations_count": random.randint(0, 5),
                "last_training": (datetime.now() - timedelta(days=random.randint(30, 365))).isoformat(),
                "phone": f"+55 11 9{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
                "email": f"driver{i+1}@sompo.com.br",
                "status": random.choice(["active", "inactive", "suspended"])
            }
            drivers.append(driver)
        
        return drivers
    
    def generate_vehicles(self, count):
        """Gera dados de veículos"""
        vehicles = []
        
        for i in range(count):
            vehicle = {
                "id": f"VEHICLE{i+1:03d}",
                "plate": f"{random.choice(['ABC', 'DEF', 'GHI', 'JKL'])}{random.randint(1000, 9999)}",
                "model": random.choice(self.vehicle_models),
                "year": random.randint(2010, 2023),
                "capacity": random.randint(1000, 5000),
                "fuel_type": random.choice(["diesel", "gasolina", "etanol", "híbrido"]),
                "region": random.choice(self.cities),
                "status": random.choice(["active", "maintenance", "inactive"]),
                "maintenance_score": round(random.uniform(0.3, 1.0), 3),
                "claims_history": random.randint(0, 6),
                "last_maintenance": (datetime.now() - timedelta(days=random.randint(1, 365))).isoformat(),
                "insurance_value": round(random.uniform(50000, 200000), 2),
                "current_location": {
                    "lat": random.uniform(-25, -5),
                    "lon": random.uniform(-50, -35)
                }
            }
            vehicles.append(vehicle)
        
        return vehicles
    
    def generate_claims(self, count):
        """Gera dados de sinistros"""
        claims = []
        
        for i in range(count):
            # Data aleatória nos últimos 2 anos
            days_ago = random.randint(1, 730)
            claim_date = datetime.now() - timedelta(days=days_ago)
            
            claim = {
                "id": f"CLAIM{i+1:04d}",
                "date": claim_date.isoformat(),
                "vehicle_id": f"VEHICLE{random.randint(1, 200):03d}",
                "driver_id": f"DRIVER{random.randint(1, 500):03d}",
                "type": random.choice(self.claim_types),
                "severity": random.choice(["leve", "médio", "grave"]),
                "cost": round(random.uniform(1000, 50000), 2),
                "location": {
                    "city": random.choice(self.cities),
                    "lat": random.uniform(-25, -5),
                    "lon": random.uniform(-50, -35)
                },
                "status": random.choice(["aberto", "em análise", "fechado", "pago"]),
                "description": self.generate_claim_description(),
                "weather_condition": random.choice(["ensolarado", "chuvoso", "nublado", "tempestade"]),
                "traffic_condition": random.choice(["baixo", "médio", "alto"]),
                "road_condition": random.choice(["boa", "regular", "ruim"])
            }
            claims.append(claim)
        
        return claims
    
    def generate_routes(self, count):
        """Gera dados de rotas"""
        routes = []
        
        for i in range(count):
            origin = random.choice(self.cities)
            destination = random.choice([city for city in self.cities if city != origin])
            
            route = {
                "id": f"ROUTE{i+1:03d}",
                "origin": origin,
                "destination": destination,
                "distance": random.randint(50, 800),
                "estimated_time": random.randint(1, 12),
                "risk_score": round(random.uniform(0.1, 0.9), 3),
                "waypoints": self.generate_waypoints(origin, destination),
                "preferred_hours": self.generate_preferred_hours(),
                "restrictions": self.generate_restrictions(),
                "last_used": (datetime.now() - timedelta(days=random.randint(1, 90))).isoformat(),
                "usage_count": random.randint(1, 50)
            }
            routes.append(route)
        
        return routes
    
    def generate_weather_data(self, count):
        """Gera dados meteorológicos"""
        weather_data = []
        
        for i in range(count):
            weather = {
                "id": f"WEATHER{i+1:03d}",
                "city": random.choice(self.cities),
                "date": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
                "temperature": random.randint(10, 35),
                "humidity": random.randint(30, 90),
                "precipitation": round(random.uniform(0, 50), 1),
                "wind_speed": round(random.uniform(0, 30), 1),
                "visibility": random.randint(1, 20),
                "condition": random.choice(["ensolarado", "nublado", "chuvoso", "tempestade", "neblina"]),
                "risk_level": random.choice(["baixo", "médio", "alto"])
            }
            weather_data.append(weather)
        
        return weather_data
    
    def generate_traffic_data(self, count):
        """Gera dados de tráfego"""
        traffic_data = []
        
        for i in range(count):
            traffic = {
                "id": f"TRAFFIC{i+1:03d}",
                "city": random.choice(self.cities),
                "date": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
                "hour": random.randint(0, 23),
                "condition": random.choice(["baixo", "médio", "alto", "congestionado"]),
                "average_speed": random.randint(20, 80),
                "incidents_count": random.randint(0, 10),
                "risk_level": random.choice(["baixo", "médio", "alto"]),
                "affected_routes": random.randint(1, 5)
            }
            traffic_data.append(traffic)
        
        return traffic_data
    
    def generate_claim_description(self):
        """Gera descrição de sinistro"""
        descriptions = [
            "Colisão traseira em semáforo",
            "Roubo de carga em parada para descanso",
            "Incêndio no motor durante viagem",
            "Danos por chuva forte na estrada",
            "Colisão lateral em cruzamento",
            "Avaria mecânica em rodovia",
            "Danos por queda de árvore",
            "Colisão com objeto fixo na pista"
        ]
        return random.choice(descriptions)
    
    def generate_waypoints(self, origin, destination):
        """Gera waypoints para uma rota"""
        waypoints = [origin]
        
        # Adiciona 1-3 waypoints intermediários
        num_waypoints = random.randint(1, 3)
        available_cities = [city for city in self.cities if city not in [origin, destination]]
        
        for _ in range(num_waypoints):
            if available_cities:
                waypoint = random.choice(available_cities)
                waypoints.append(waypoint)
                available_cities.remove(waypoint)
        
        waypoints.append(destination)
        return waypoints
    
    def generate_preferred_hours(self):
        """Gera horários preferidos para viagem"""
        return {
            "start_time": f"{random.randint(6, 10)}:00",
            "end_time": f"{random.randint(16, 20)}:00",
            "avoid_night": random.choice([True, False]),
            "avoid_peak_hours": random.choice([True, False])
        }
    
    def generate_restrictions(self):
        """Gera restrições de rota"""
        restrictions = []
        
        if random.choice([True, False]):
            restrictions.append("evitar_centro_cidade")
        if random.choice([True, False]):
            restrictions.append("evitar_rodovias_estaduais")
        if random.choice([True, False]):
            restrictions.append("preferir_estradas_principais")
        
        return restrictions
    
    def save_data_to_file(self, data, filename):
        """Salva dados em arquivo JSON"""
        try:
            with open(f"data/{filename}.json", "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Dados salvos em data/{filename}.json")
        except Exception as e:
            print(f"Erro ao salvar dados: {e}")
    
    def load_data_from_file(self, filename):
        """Carrega dados de arquivo JSON"""
        try:
            with open(f"data/{filename}.json", "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Erro ao carregar dados: {e}")
            return None
