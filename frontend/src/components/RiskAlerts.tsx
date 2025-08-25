import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon,
  InformationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

interface Alert {
  type: string;
  severity: string;
  message: string;
  vehicle_id?: string;
  risk_score?: number;
  region?: string;
  location?: string;
  timestamp: string;
}

const RiskAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('/api/dashboard/risk-alerts');
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'ALTO':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'MÉDIO':
        return <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />;
      case 'BAIXO':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'ALTO':
        return 'border-l-red-500 bg-red-50';
      case 'MÉDIO':
        return 'border-l-orange-500 bg-orange-50';
      case 'BAIXO':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-gray-600">Carregando alertas...</span>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <InformationCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <p className="text-green-600 font-medium">Nenhum alerta ativo</p>
        <p className="text-gray-500 text-sm mt-1">Todos os sistemas estão funcionando normalmente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.slice(0, 5).map((alert, index) => (
        <div
          key={index}
          className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(alert.severity)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {getSeverityIcon(alert.severity)}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    alert.severity === 'ALTO' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'MÉDIO' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs text-gray-500">
                    {alert.type === 'high_risk_vehicle' ? 'Veículo' :
                     alert.type === 'weather_warning' ? 'Clima' :
                     alert.type === 'traffic_warning' ? 'Tráfego' : 'Sistema'}
                  </span>
                </div>
                
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {alert.message}
                </p>
                
                <div className="text-xs text-gray-600 space-y-1">
                  {alert.vehicle_id && (
                    <p>Veículo: {alert.vehicle_id}</p>
                  )}
                  {alert.risk_score && (
                    <p>Score de Risco: {(alert.risk_score * 100).toFixed(1)}%</p>
                  )}
                  {alert.region && (
                    <p>Região: {alert.region}</p>
                  )}
                  {alert.location && (
                    <p>Local: {alert.location}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center text-xs text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              {formatTimestamp(alert.timestamp)}
            </div>
          </div>
        </div>
      ))}
      
      {alerts.length > 5 && (
        <div className="text-center pt-4">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Ver mais {alerts.length - 5} alertas
          </button>
        </div>
      )}
    </div>
  );
};

export default RiskAlerts;
