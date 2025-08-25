import numpy as np
import random
from datetime import datetime, timedelta
import json

class RouteOptimizer:
    def __init__(self):
        self.risk_zones = self._load_risk_zones()
        self.route_cache = {}
        
    def _load_risk_zones(self):
        """Carrega zonas de risco conhecidas"""
        return {
            "São Paulo": {
                "risk_level": 0.3,
                "high_risk_areas": ["Centro", "Vila Madalena", "Pinheiros"],
                "peak_hours": {"morning": "7-9", "evening": "17-19"}
            },
            "Rio de Janeiro": {
                "risk_level": 0.4,
                "high_risk_areas": ["Centro", "Copacabana", "Ipanema"],
                "peak_hours": {"morning": "7-9", "evening": "17-19"}
            },
            "Belo Horizonte": {
                "risk_level": 0.2,
                "high_risk_areas": ["Centro", "Savassi", "Pampulha"],
                "peak_hours": {"morning": "7-9", "evening": "17-19"}
            },
            "Salvador": {
                "risk_level": 0.35,
                "high_risk_areas": ["Centro", "Pelourinho", "Barra"],
                "peak_hours": {"morning": "7-9", "evening": "17-19"}
            },
            "Recife": {
                "risk_level": 0.25,
                "high_risk_areas": ["Centro", "Boa Viagem", "Olinda"],
                "peak_hours": {"morning": "7-9", "evening": "17-19"}
            }
        }
    
    def optimize_route(self, request_data):
        """Otimiza rota considerando múltiplos fatores"""
        origin = request_data.get('origin', 'São Paulo')
        destination = request_data.get('destination', 'Rio de Janeiro')
        preferences = request_data.get('preferences', {})
        
        # Gera múltiplas opções de rota
        route_options = self._generate_route_options(origin, destination)
        
        # Calcula scores para cada rota
        scored_routes = []
        for route in route_options:
            score = self._calculate_route_score(route, preferences)
            scored_routes.append((route, score))
        
        # Ordena por score (menor é melhor)
        scored_routes.sort(key=lambda x: x[1])
        
        # Retorna a melhor rota
        best_route = scored_routes[0][0]
        best_route['total_score'] = scored_routes[0][1]
        
        return best_route
    
    def _generate_route_options(self, origin, destination):
        """Gera diferentes opções de rota"""
        routes = []
        
        # Rota direta (mais rápida)
        direct_route = {
            "type": "direta",
            "waypoints": [origin, destination],
            "distance": self._calculate_distance(origin, destination),
            "estimated_time": self._calculate_time(origin, destination, "direta"),
            "risk_factors": self._get_route_risk_factors(origin, destination, "direta")
        }
        routes.append(direct_route)
        
        # Rota com desvio (mais segura)
        safe_route = {
            "type": "segura",
            "waypoints": self._get_safe_waypoints(origin, destination),
            "distance": self._calculate_safe_distance(origin, destination),
            "estimated_time": self._calculate_time(origin, destination, "segura"),
            "risk_factors": self._get_route_risk_factors(origin, destination, "segura")
        }
        routes.append(safe_route)
        
        # Rota balanceada
        balanced_route = {
            "type": "balanceada",
            "waypoints": self._get_balanced_waypoints(origin, destination),
            "distance": self._calculate_balanced_distance(origin, destination),
            "estimated_time": self._calculate_time(origin, destination, "balanceada"),
            "risk_factors": self._get_route_risk_factors(origin, destination, "balanceada")
        }
        routes.append(balanced_route)
        
        return routes
    
    def _calculate_route_score(self, route, preferences):
        """Calcula score da rota baseado em preferências"""
        # Pesos das preferências
        risk_weight = preferences.get('risk_aversion', 0.4)
        time_weight = preferences.get('time_importance', 0.3)
        distance_weight = preferences.get('distance_importance', 0.3)
        
        # Normalização dos valores
        max_distance = 1000  # km
        max_time = 24  # horas
        
        # Cálculo do risco total da rota
        total_risk = sum(route['risk_factors'].values())
        
        # Score normalizado (0-1, onde 0 é melhor)
        risk_score = total_risk
        time_score = route['estimated_time'] / max_time
        distance_score = route['distance'] / max_distance
        
        # Score ponderado
        total_score = (
            risk_weight * risk_score +
            time_weight * time_score +
            distance_weight * distance_score
        )
        
        return total_score
    
    def _calculate_distance(self, origin, destination):
        """Calcula distância entre origem e destino"""
        # Distâncias simuladas entre cidades principais
        distances = {
            ("São Paulo", "Rio de Janeiro"): 430,
            ("São Paulo", "Belo Horizonte"): 580,
            ("São Paulo", "Salvador"): 1960,
            ("São Paulo", "Recife"): 2640,
            ("Rio de Janeiro", "Belo Horizonte"): 440,
            ("Rio de Janeiro", "Salvador"): 1640,
            ("Rio de Janeiro", "Recife"): 2320,
            ("Belo Horizonte", "Salvador"): 1370,
            ("Belo Horizonte", "Recife"): 2050,
            ("Salvador", "Recife"): 850
        }
        
        # Busca distância direta ou reversa
        key = (origin, destination)
        if key in distances:
            return distances[key]
        
        key_reverse = (destination, origin)
        if key_reverse in distances:
            return distances[key_reverse]
        
        # Distância estimada baseada em hash
        return 200 + hash(origin + destination) % 800
    
    def _calculate_safe_distance(self, origin, destination):
        """Calcula distância da rota segura (com desvios)"""
        base_distance = self._calculate_distance(origin, destination)
        return base_distance * 1.3  # 30% a mais para evitar zonas de risco
    
    def _calculate_balanced_distance(self, origin, destination):
        """Calcula distância da rota balanceada"""
        base_distance = self._calculate_distance(origin, destination)
        return base_distance * 1.15  # 15% a mais
    
    def _calculate_time(self, origin, destination, route_type):
        """Calcula tempo estimado da viagem"""
        base_distance = self._calculate_distance(origin, destination)
        
        # Velocidade média baseada no tipo de rota
        speeds = {
            "direta": 60,  # km/h
            "segura": 55,  # km/h (mais cautelosa)
            "balanceada": 58  # km/h
        }
        
        speed = speeds.get(route_type, 60)
        time_hours = base_distance / speed
        
        # Adiciona tempo para paradas
        if route_type == "segura":
            time_hours += 0.5  # 30 min para paradas de segurança
        elif route_type == "balanceada":
            time_hours += 0.25  # 15 min para paradas
        
        return round(time_hours, 2)
    
    def _get_safe_waypoints(self, origin, destination):
        """Gera waypoints para rota segura"""
        # Cidades intermediárias seguras
        safe_cities = ["Campinas", "Sorocaba", "Santos", "Guarulhos"]
        
        if origin == "São Paulo" and destination == "Rio de Janeiro":
            return [origin, "Santos", "Paraty", destination]
        elif origin == "Rio de Janeiro" and destination == "São Paulo":
            return [origin, "Paraty", "Santos", destination]
        else:
            # Waypoints genéricos
            waypoint = random.choice(safe_cities)
            return [origin, waypoint, destination]
    
    def _get_balanced_waypoints(self, origin, destination):
        """Gera waypoints para rota balanceada"""
        if origin == "São Paulo" and destination == "Rio de Janeiro":
            return [origin, "Guaratinguetá", destination]
        elif origin == "Rio de Janeiro" and destination == "São Paulo":
            return [origin, "Guaratinguetá", destination]
        else:
            return [origin, destination]
    
    def _get_route_risk_factors(self, origin, destination, route_type):
        """Calcula fatores de risco da rota"""
        risk_factors = {}
        
        # Risco base das cidades
        origin_risk = self.risk_zones.get(origin, {}).get('risk_level', 0.2)
        dest_risk = self.risk_zones.get(destination, {}).get('risk_level', 0.2)
        
        # Risco base da rota
        base_risk = (origin_risk + dest_risk) / 2
        
        # Ajustes baseados no tipo de rota
        if route_type == "direta":
            risk_factors['traffic_risk'] = base_risk * 1.2
            risk_factors['weather_risk'] = base_risk * 0.8
            risk_factors['road_condition_risk'] = base_risk * 1.1
        elif route_type == "segura":
            risk_factors['traffic_risk'] = base_risk * 0.7
            risk_factors['weather_risk'] = base_risk * 0.6
            risk_factors['road_condition_risk'] = base_risk * 0.8
        else:  # balanceada
            risk_factors['traffic_risk'] = base_risk * 0.9
            risk_factors['weather_risk'] = base_risk * 0.7
            risk_factors['road_condition_risk'] = base_risk * 0.9
        
        # Risco de tempo (baseado no horário atual)
        current_hour = datetime.now().hour
        if 7 <= current_hour <= 9 or 17 <= current_hour <= 19:
            risk_factors['time_risk'] = base_risk * 1.3
        else:
            risk_factors['time_risk'] = base_risk * 0.8
        
        return risk_factors
    
    def get_route_recommendations(self, route_data):
        """Retorna recomendações para a rota otimizada"""
        recommendations = []
        
        total_risk = sum(route_data['risk_factors'].values())
        
        if total_risk > 0.6:
            recommendations.extend([
                "ALTO RISCO: Considere adiar a viagem",
                "Monitore condições meteorológicas constantemente",
                "Mantenha comunicação em tempo real",
                "Planeje paradas de segurança frequentes"
            ])
        elif total_risk > 0.4:
            recommendations.extend([
                "RISCO MÉDIO: Mantenha atenção redobrada",
                "Verifique condições de tráfego antes da partida",
                "Monitore condições climáticas",
                "Mantenha protocolos de segurança"
            ])
        else:
            recommendations.extend([
                "BAIXO RISCO: Rota considerada segura",
                "Mantenha protocolos padrão",
                "Monitore condições básicas"
            ])
        
        # Recomendações específicas baseadas no tipo de rota
        if route_data['type'] == 'segura':
            recommendations.append("Rota otimizada para segurança - tempo adicional previsto")
        elif route_data['type'] == 'balanceada':
            recommendations.append("Rota balanceada entre tempo e segurança")
        else:
            recommendations.append("Rota direta - prioridade para tempo")
        
        return recommendations
