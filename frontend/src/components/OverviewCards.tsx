import React from 'react';
import { 
  TruckIcon, 
  ExclamationTriangleIcon, 
  ChartBarIcon, 
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

interface DashboardData {
  total_fleet: number;
  active_vehicles: number;
  high_risk_vehicles: number;
  monthly_claims: number;
  claims_reduction_percentage: number;
  system_status: string;
  last_updated: string;
}

interface OverviewCardsProps {
  data: DashboardData;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ data }) => {
  const cards = [
    {
      title: 'Total da Frota',
      value: data.total_fleet,
      icon: TruckIcon,
      color: 'blue',
      change: '+2.5%',
      changeType: 'increase'
    },
    {
      title: 'Veículos Ativos',
      value: data.active_vehicles,
      icon: ShieldCheckIcon,
      color: 'green',
      change: '+1.2%',
      changeType: 'increase'
    },
    {
      title: 'Veículos em Risco',
      value: data.high_risk_vehicles,
      icon: ExclamationTriangleIcon,
      color: 'orange',
      change: '-5.3%',
      changeType: 'decrease'
    },
    {
      title: 'Sinistros do Mês',
      value: data.monthly_claims,
      icon: ChartBarIcon,
      color: 'red',
      change: `${data.claims_reduction_percentage}%`,
      changeType: 'decrease'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        text: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'text-green-600',
        text: 'text-green-600'
      },
      orange: {
        bg: 'bg-orange-50',
        icon: 'text-orange-600',
        text: 'text-orange-600'
      },
      red: {
        bg: 'bg-red-50',
        icon: 'text-red-600',
        text: 'text-red-600'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const colors = getColorClasses(card.color);
        const IconComponent = card.icon;
        
        return (
          <div 
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-full ${colors.bg}`}>
                <IconComponent className={`h-6 w-6 ${colors.icon}`} />
              </div>
            </div>
            
            <div className="mt-4 flex items-center">
              <span 
                className={`text-sm font-medium ${
                  card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {card.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                vs mês anterior
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OverviewCards;
