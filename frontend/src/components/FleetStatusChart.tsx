import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axios from 'axios';

interface FleetStatusData {
  status_distribution: {
    active: number;
    maintenance: number;
    inactive: number;
  };
  risk_distribution: {
    BAIXO: number;
    MÉDIO: number;
    ALTO: number;
  };
  total_vehicles: number;
  last_updated: string;
}

const FleetStatusChart: React.FC = () => {
  const [statusData, setStatusData] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFleetStatus();
  }, []);

  const fetchFleetStatus = async () => {
    try {
      const response = await axios.get<FleetStatusData>('/api/dashboard/fleet-status');
      
      // Dados de status
      const statusChartData = Object.entries(response.data.status_distribution).map(([key, value]) => ({
        name: key === 'active' ? 'Ativo' : key === 'maintenance' ? 'Manutenção' : 'Inativo',
        value,
        color: key === 'active' ? '#10b981' : key === 'maintenance' ? '#f59e0b' : '#6b7280'
      }));
      
      // Dados de risco
      const riskChartData = Object.entries(response.data.risk_distribution).map(([key, value]) => ({
        name: key,
        value,
        color: key === 'BAIXO' ? '#10b981' : key === 'MÉDIO' ? '#f59e0b' : '#ef4444'
      }));
      
      setStatusData(statusChartData);
      setRiskData(riskChartData);
    } catch (error) {
      console.error('Erro ao buscar status da frota:', error);
      // Dados simulados para demonstração
      setStatusData(generateMockStatusData());
      setRiskData(generateMockRiskData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockStatusData = () => [
    { name: 'Ativo', value: 150, color: '#10b981' },
    { name: 'Manutenção', value: 30, color: '#f59e0b' },
    { name: 'Inativo', value: 20, color: '#6b7280' }
  ];

  const generateMockRiskData = () => [
    { name: 'BAIXO', value: 120, color: '#10b981' },
    { name: 'MÉDIO', value: 50, color: '#f59e0b' },
    { name: 'ALTO', value: 30, color: '#ef4444' }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-blue-600">
            {`${payload[0].value} veículos`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-gray-600">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status da Frota */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Status da Frota</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribuição de Risco */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Distribuição de Risco</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-green-600">
            {statusData.find(d => d.name === 'Ativo')?.value || 0}
          </p>
          <p className="text-xs text-gray-600">Ativos</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-orange-600">
            {statusData.find(d => d.name === 'Manutenção')?.value || 0}
          </p>
          <p className="text-xs text-gray-600">Manutenção</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-600">
            {riskData.find(d => d.name === 'ALTO')?.value || 0}
          </p>
          <p className="text-xs text-gray-600">Alto Risco</p>
        </div>
      </div>
    </div>
  );
};

export default FleetStatusChart;
