import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RiskPrediction from './pages/RiskPrediction';
import RouteOptimization from './pages/RouteOptimization';
import FleetMonitoring from './pages/FleetMonitoring';
import Analytics from './pages/Analytics';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/risk-prediction" element={<RiskPrediction />} />
              <Route path="/route-optimization" element={<RouteOptimization />} />
              <Route path="/fleet-monitoring" element={<FleetMonitoring />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
