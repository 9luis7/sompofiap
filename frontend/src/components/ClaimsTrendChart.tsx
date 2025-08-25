import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface TrendData {
  month: string;
  claims_count: number;
  date: string;
}

interface ClaimsTrendResponse {
  trend_data: TrendData[];
  total_claims: number;
  average_monthly_claims: number;
  last_updated: string;
}

const ClaimsTrendChart: React.FC = () => {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendData();
  }, []);

  const fetchTrendData = async () => {
    try {
      const response = await axios.get<ClaimsTrendResponse>('/api/analytics/claims-trend');
      setData(response.data.trend_data || []);
    } catch (error) {
      console.error('Erro ao buscar dados de tendência:', error);
      // Dados simulados para demonstração
      setData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (): TrendData[] => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    
    return months.map((month, index) => ({
      month,
      claims_count: Math.floor(Math.random() * 50) + 20,
      date: `2024-${String(index + 1).padStart(2, '0')}`
    }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Mês: ${label}`}</p>
          <p className="text-blue-600">
            {`Sinistros: ${payload[0].value}`}
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
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="claims_count" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Tendência de sinistros nos últimos 12 meses
        </p>
      </div>
    </div>
  );
};

export default ClaimsTrendChart;
