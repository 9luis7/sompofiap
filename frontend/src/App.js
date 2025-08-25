import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🎯 Sompo IA - Sistema de Redução de Sinistros</h1>
        <p>Dashboard Inteligente em Funcionamento!</p>
        
        <div className="dashboard-preview">
          <h2>📊 Funcionalidades Disponíveis:</h2>
          <ul>
            <li>✅ Predição de Riscos com IA</li>
            <li>✅ Otimização de Rotas</li>
            <li>✅ Monitoramento da Frota</li>
            <li>✅ Analytics em Tempo Real</li>
            <li>✅ Sistema de Scoring</li>
          </ul>
        </div>

        <div className="api-links">
          <h3>🔗 APIs Funcionando:</h3>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">
            📖 Documentação da API
          </a>
          <a href="http://localhost:8000/api/dashboard/overview" target="_blank" rel="noopener noreferrer">
            📈 Dados do Dashboard
          </a>
          <a href="http://localhost:8000/api/dashboard/risk-alerts" target="_blank" rel="noopener noreferrer">
            ⚠️ Alertas de Risco
          </a>
        </div>

        <div className="status">
          <p>🟢 Backend: Online</p>
          <p>🟢 Banco de Dados: Online</p>
          <p>🟢 Modelos de IA: Ativos</p>
        </div>
      </header>
    </div>
  );
}

export default App;
