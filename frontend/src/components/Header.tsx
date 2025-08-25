import React from 'react';
import { BellIcon, CogIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const currentTime = new Date().toLocaleString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Sompo IA - Sistema de Redução de Sinistros
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Status do Sistema */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Sistema Online</span>
            </div>
            
            {/* Data e Hora */}
            <div className="text-sm text-gray-600">
              {currentTime}
            </div>
            
            {/* Notificações */}
            <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md">
              <BellIcon className="h-6 w-6" />
              <span className="sr-only">Notificações</span>
            </button>
            
            {/* Configurações */}
            <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md">
              <CogIcon className="h-6 w-6" />
              <span className="sr-only">Configurações</span>
            </button>
            
            {/* Avatar do Usuário */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">U</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">Usuário Admin</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
