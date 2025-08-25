import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import random
from datetime import datetime, timedelta
import json

class RiskPredictionModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = [
            'driver_age', 'driver_experience', 'driver_claims_history',
            'vehicle_age', 'vehicle_type', 'vehicle_maintenance_score',
            'route_distance', 'route_complexity', 'weather_condition',
            'time_of_day', 'day_of_week', 'traffic_condition'
        ]
        
    def generate_training_data(self, n_samples=1000):
        """Gera dados de treinamento sintéticos"""
        np.random.seed(42)
        
        data = []
        for i in range(n_samples):
            # Dados do motorista
            driver_age = np.random.normal(45, 10)
            driver_experience = np.random.normal(15, 8)
            driver_claims_history = np.random.poisson(2)
            
            # Dados do veículo
            vehicle_age = np.random.normal(8, 4)
            vehicle_type = np.random.choice([1, 2, 3])  # 1=pequeno, 2=médio, 3=grande
            vehicle_maintenance_score = np.random.uniform(0.3, 1.0)
            
            # Dados da rota
            route_distance = np.random.uniform(50, 500)
            route_complexity = np.random.uniform(0.1, 1.0)
            
            # Condições externas
            weather_condition = np.random.choice([1, 2, 3, 4])  # 1=ótimo, 2=bom, 3=ruim, 4=péssimo
            time_of_day = np.random.uniform(0, 24)
            day_of_week = np.random.randint(0, 7)
            traffic_condition = np.random.choice([1, 2, 3])  # 1=baixo, 2=médio, 3=alto
            
            # Cálculo do risco baseado em regras de negócio
            risk_factors = []
            
            # Fatores do motorista
            if driver_age < 25 or driver_age > 65:
                risk_factors.append(0.3)
            if driver_experience < 5:
                risk_factors.append(0.4)
            if driver_claims_history > 3:
                risk_factors.append(0.5)
            
            # Fatores do veículo
            if vehicle_age > 10:
                risk_factors.append(0.2)
            if vehicle_maintenance_score < 0.5:
                risk_factors.append(0.3)
            
            # Fatores da rota
            if route_complexity > 0.8:
                risk_factors.append(0.2)
            if route_distance > 300:
                risk_factors.append(0.1)
            
            # Fatores externos
            if weather_condition >= 3:
                risk_factors.append(0.4)
            if time_of_day < 6 or time_of_day > 22:
                risk_factors.append(0.3)
            if traffic_condition == 3:
                risk_factors.append(0.2)
            
            # Cálculo do risco final
            base_risk = 0.1
            total_risk = base_risk + sum(risk_factors)
            total_risk = min(total_risk, 1.0)
            
            # Determinação se houve sinistro (target)
            had_accident = 1 if total_risk > 0.6 or np.random.random() < total_risk * 0.8 else 0
            
            data.append([
                driver_age, driver_experience, driver_claims_history,
                vehicle_age, vehicle_type, vehicle_maintenance_score,
                route_distance, route_complexity, weather_condition,
                time_of_day, day_of_week, traffic_condition,
                had_accident
            ])
        
        return pd.DataFrame(data, columns=self.feature_names + ['had_accident'])
    
    def train_model(self):
        """Treina o modelo de predição de riscos"""
        print("Gerando dados de treinamento...")
        data = self.generate_training_data(2000)
        
        # Separação dos dados
        X = data.drop('had_accident', axis=1)
        y = data['had_accident']
        
        # Divisão treino/teste
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Normalização dos dados
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Treinamento do modelo
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        print("Treinando modelo...")
        self.model.fit(X_train_scaled, y_train)
        
        # Avaliação do modelo
        train_score = self.model.score(X_train_scaled, y_train)
        test_score = self.model.score(X_test_scaled, y_test)
        
        print(f"Acurácia no treino: {train_score:.3f}")
        print(f"Acurácia no teste: {test_score:.3f}")
        
        self.is_trained = True
        
        # Salvar modelo
        self.save_model()
        
        return {
            "train_accuracy": train_score,
            "test_accuracy": test_score,
            "model_trained": True
        }
    
    def predict_risk(self, trip_data):
        """Prediz o risco de uma viagem específica"""
        if not self.is_trained:
            self.train_model()
        
        # Extração e normalização dos dados da viagem
        features = self.extract_features(trip_data)
        features_scaled = self.scaler.transform([features])
        
        # Predição da probabilidade de sinistro
        risk_probability = self.model.predict_proba(features_scaled)[0][1]
        
        return round(risk_probability, 3)
    
    def extract_features(self, trip_data):
        """Extrai features dos dados da viagem"""
        # Dados do motorista (simulados baseados no ID)
        driver_id = trip_data.get('driver_id', 'DRIVER001')
        driver_age = 30 + hash(driver_id) % 40  # 30-70 anos
        driver_experience = 5 + hash(driver_id) % 20  # 5-25 anos
        driver_claims_history = hash(driver_id) % 5  # 0-4 sinistros
        
        # Dados do veículo (simulados baseados no ID)
        vehicle_id = trip_data.get('vehicle_id', 'VEHICLE001')
        vehicle_age = hash(vehicle_id) % 15  # 0-15 anos
        vehicle_type = 1 + hash(vehicle_id) % 3  # 1-3 tipos
        vehicle_maintenance_score = 0.5 + (hash(vehicle_id) % 50) / 100  # 0.5-1.0
        
        # Dados da rota
        origin = trip_data.get('origin', 'São Paulo')
        destination = trip_data.get('destination', 'Rio de Janeiro')
        route_distance = 100 + hash(origin + destination) % 400  # 100-500 km
        route_complexity = 0.3 + (hash(origin + destination) % 70) / 100  # 0.3-1.0
        
        # Condições externas (simuladas)
        date_str = trip_data.get('date', datetime.now().isoformat())
        date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        
        time_of_day = date_obj.hour + date_obj.minute / 60
        day_of_week = date_obj.weekday()
        
        # Condições baseadas no horário e dia
        weather_condition = 1 + (hash(date_str) % 4)  # 1-4 condições
        traffic_condition = 1 + (hash(date_str) % 3)  # 1-3 condições
        
        return [
            driver_age, driver_experience, driver_claims_history,
            vehicle_age, vehicle_type, vehicle_maintenance_score,
            route_distance, route_complexity, weather_condition,
            time_of_day, day_of_week, traffic_condition
        ]
    
    def get_recommendations(self, risk_score):
        """Retorna recomendações baseadas no score de risco"""
        recommendations = []
        
        if risk_score > 0.7:
            recommendations.extend([
                "ALTO RISCO: Considere adiar a viagem",
                "Verifique condições meteorológicas",
                "Monitore o motorista em tempo real",
                "Considere rota alternativa"
            ])
        elif risk_score > 0.4:
            recommendations.extend([
                "RISCO MÉDIO: Mantenha atenção redobrada",
                "Verifique checklist do veículo",
                "Monitore condições de tráfego",
                "Mantenha comunicação constante"
            ])
        else:
            recommendations.extend([
                "BAIXO RISCO: Viagem considerada segura",
                "Mantenha protocolos padrão",
                "Monitore condições básicas"
            ])
        
        return recommendations
    
    def save_model(self):
        """Salva o modelo treinado"""
        try:
            joblib.dump(self.model, 'ml_models/risk_prediction_model.pkl')
            joblib.dump(self.scaler, 'ml_models/risk_prediction_scaler.pkl')
            print("Modelo salvo com sucesso!")
        except Exception as e:
            print(f"Erro ao salvar modelo: {e}")
    
    def load_model(self):
        """Carrega modelo salvo"""
        try:
            self.model = joblib.load('ml_models/risk_prediction_model.pkl')
            self.scaler = joblib.load('ml_models/risk_prediction_scaler.pkl')
            self.is_trained = True
            print("Modelo carregado com sucesso!")
        except Exception as e:
            print(f"Erro ao carregar modelo: {e}")
            self.train_model()
