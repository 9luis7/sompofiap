import React, { useState, useEffect } from 'react';
import { 
  TruckIcon, 
  ExclamationTriangleIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import OverviewCards from '../components/OverviewCards';
import RiskAlerts from '../components/RiskAlerts';
import ClaimsTrendChart from '../components/ClaimsTrendChart';
import FleetStatusChart from '../components/FleetStatusChart';

interface DashboardData {
  total_fleet: number;
  active_vehicles: number;
  high_risk_vehicles: number;
  monthly_claims: number;
  claims_reduction_percentage: number;
  system_status: string;
  last_updated: string;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/dashboard/overview');
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-gray-600">Carregando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Título da Página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Visão geral do sistema de redução de sinistros da Sompo
        </p>
      </div>

      {/* Cards de Visão Geral */}
      {dashboardData && (
        <OverviewCards data={dashboardData} />
      )}

      {/* Gráficos e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Tendência de Sinistros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Tendência de Sinistros
            </h3>
            <ChartBarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <ClaimsTrendChart />
        </div>

        {/* Status da Frota */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Status da Frota
            </h3>
            <TruckIcon className="h-6 w-6 text-green-600" />
          </div>
          <FleetStatusChart />
        </div>
      </div>

      {/* Alertas de Risco */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Alertas de Risco
            </h3>
            <ShieldCheckIcon className="h-6 w-6 text-orange-600" />
          </div>
          <RiskAlerts />
        </div>
      </div>

      {/* Métricas de Performance */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Métricas de Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingDownIcon className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {dashboardData?.claims_reduction_percentage}%
              </p>
              <p className="text-sm text-gray-600">Redução de Sinistros</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TruckIcon className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {dashboardData?.active_vehicles}
              </p>
              <p className="text-sm text-gray-600">Veículos Ativos</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <ShieldCheckIcon className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {dashboardData?.high_risk_vehicles}
              </p>
              <p className="text-sm text-gray-600">Veículos em Risco</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
