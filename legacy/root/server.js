const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Dados em memória para simular banco de dados
let mockDatabase = {
    alerts: [
        {
            id: 1,
            message: "Desvio de rota detectado",
            severity: "high",
            shipment_number: "SHP-001",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            description: "Veículo desviou mais de 5km da rota planejada",
            is_acknowledged: false,
            coordinates: [-23.5505, -46.6333]
        },
        {
            id: 2,
            message: "Temperatura acima do limite",
            severity: "critical",
            shipment_number: "SHP-002",
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            description: "Temperatura da carga atingiu 35°C",
            is_acknowledged: true,
            coordinates: [-15.7801, -47.9292]
        },
        {
            id: 3,
            message: "Parada não autorizada",
            severity: "medium",
            shipment_number: "SHP-003",
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            description: "Veículo parado por mais de 15 minutos",
            is_acknowledged: false,
            coordinates: [-12.9716, -38.5011]
        },
        {
            id: 4,
            message: "Velocidade excessiva",
            severity: "high",
            shipment_number: "SHP-004",
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            description: "Velocidade acima de 120 km/h detectada",
            is_acknowledged: false,
            coordinates: [-3.1190, -60.0217]
        },
        {
            id: 5,
            message: "Combustível baixo",
            severity: "low",
            shipment_number: "SHP-005",
            timestamp: new Date().toISOString(),
            description: "Nível de combustível abaixo de 20%",
            is_acknowledged: false,
            coordinates: [-30.0346, -51.2177]
        }
    ],
    shipments: [
        {
            id: 1,
            shipment_number: "SHP-001",
            origin: "São Paulo, SP",
            destination: "Rio de Janeiro, RJ",
            status: "in_transit",
            progress: 65,
            current_risk: "medium",
            driver: "João Silva",
            estimated_arrival: "2024-01-15T18:00:00Z",
            cargo_value: 125000.00,
            cargo_type: "Eletrônicos Premium"
        },
        {
            id: 2,
            shipment_number: "SHP-002",
            origin: "Brasília, DF",
            destination: "Salvador, BA",
            status: "in_transit",
            progress: 45,
            current_risk: "high",
            driver: "Maria Santos",
            estimated_arrival: "2024-01-16T10:00:00Z",
            cargo_value: 89000.00,
            cargo_type: "Medicamentos Controlados"
        },
        {
            id: 3,
            shipment_number: "SHP-003",
            origin: "Manaus, AM",
            destination: "Porto Alegre, RS",
            status: "in_transit",
            progress: 80,
            current_risk: "low",
            driver: "Carlos Oliveira",
            estimated_arrival: "2024-01-14T22:00:00Z",
            cargo_value: 78000.00,
            cargo_type: "Roupas e Acessórios"
        },
        {
            id: 4,
            shipment_number: "SHP-004",
            origin: "Curitiba, PR",
            destination: "Fortaleza, CE",
            status: "in_transit",
            progress: 25,
            current_risk: "high",
            driver: "Ana Costa",
            estimated_arrival: "2024-01-17T14:00:00Z",
            cargo_value: 45000.00,
            cargo_type: "Alimentos Não Perecíveis"
        }
    ],
    users: [
        {
            id: 1,
            username: "admin",
            full_name: "Administrador",
            email: "admin@sompo.com",
            role: "admin",
            status: "active"
        },
        {
            id: 2,
            username: "joao.silva",
            full_name: "João Silva",
            email: "joao.silva@sompo.com",
            role: "operator",
            status: "active"
        },
        {
            id: 3,
            username: "maria.santos",
            full_name: "Maria Santos",
            email: "maria.santos@sompo.com",
            role: "operator",
            status: "active"
        }
    ],
    vehicles: [
        {
            id: 1,
            plate: "ABC-1234",
            model: "Mercedes-Benz Actros",
            driver: "João Silva",
            status: "active",
            fuel_level: 85,
            current_location: [-23.5505, -46.6333] // São Paulo
        },
        {
            id: 2,
            plate: "DEF-5678",
            model: "Volvo FH",
            driver: "Maria Santos",
            status: "active",
            fuel_level: 60,
            current_location: [-19.9167, -43.9345] // Belo Horizonte
        },
        {
            id: 3,
            plate: "GHI-9012",
            model: "Scania R",
            driver: "Carlos Oliveira",
            status: "active",
            fuel_level: 75,
            current_location: [-25.4289, -49.2671] // Curitiba
        },
        {
            id: 4,
            plate: "JKL-3456",
            model: "Iveco Stralis",
            driver: "Ana Costa",
            status: "active",
            fuel_level: 45,
            current_location: [-12.9714, -38.5011] // Salvador
        }
    ],
    riskZones: [
        {
            id: 1,
            name: "Zona de Alto Risco - São Paulo",
            description: "Área com histórico de roubos de carga",
            risk_level: "high",
            coordinates: [-23.5505, -46.6333],
            radius: 5000 // 5km
        },
        {
            id: 2,
            name: "Zona de Risco - Rio de Janeiro",
            description: "Região com tráfego intenso e atrasos frequentes",
            risk_level: "medium",
            coordinates: [-22.9068, -43.1729],
            radius: 3000 // 3km
        },
        {
            id: 3,
            name: "Zona Crítica - Brasília",
            description: "Área com restrições de circulação",
            risk_level: "critical",
            coordinates: [-15.7801, -47.9292],
            radius: 2000 // 2km
        },
        {
            id: 4,
            name: "Zona de Risco - Manaus",
            description: "Região com dificuldades de acesso",
            risk_level: "medium",
            coordinates: [-3.1190, -60.0217],
            radius: 4000 // 4km
        }
    ]
};

// Função para calcular estatísticas em tempo real
function calculateDashboardStats() {
    const activeShipments = mockDatabase.shipments.filter(s => s.progress > 0 && s.progress < 100).length;
    const totalAlerts = mockDatabase.alerts.length;
    const highRiskZones = 3; // Simulado
    const fleetUtilization = Math.round((activeShipments / 15) * 100); // 15 veículos total
    
    return {
        'active-shipments': activeShipments,
        'total-alerts': totalAlerts,
        'high-risk-zones': highRiskZones,
        'fleet-utilization': fleetUtilization,
        'low-risk-shipments': mockDatabase.shipments.filter(s => s.current_risk === 'low').length,
        'medium-risk-shipments': mockDatabase.shipments.filter(s => s.current_risk === 'medium').length,
        'high-risk-shipments': mockDatabase.shipments.filter(s => s.current_risk === 'high').length,
        'active-vehicles': 12,
        'total-vehicles': 15,
        'avg-delivery-time': 180,
        'success-rate': 94,
        'total-distance': 2500000,
        'avg-fuel-level': 78
    };
}

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Autenticação
app.post('/api/v1/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    const validCredentials = {
        'admin': 'admin123',
        'admin.sompo': 'password123',
        'joao.silva': 'password123',
        'cliente.techcom': 'password123'
    };

    if (validCredentials[username] && validCredentials[username] === password) {
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                token: 'mock-jwt-token-' + Date.now(),
                refreshToken: 'mock-refresh-token-' + Date.now(),
                user: {
                    id: username === 'admin' ? 1 : username === 'admin.sompo' ? 1 : username === 'joao.silva' ? 2 : 3,
                    username: username,
                    role: username === 'admin' || username === 'admin.sompo' ? 'admin' : username === 'joao.silva' ? 'operator' : 'client',
                    full_name: username === 'admin' ? 'Administrador' : 
                               username === 'admin.sompo' ? 'Administrador Sompo' : 'João Silva'
                }
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Credenciais inválidas'
        });
    }
});

// Dashboard
app.get('/api/v1/monitoring/dashboard', (req, res) => {
    res.json({
        success: true,
        data: {
            summary: calculateDashboardStats(),
            recentAlerts: mockDatabase.alerts.slice(-5),
            activeShipments: mockDatabase.shipments.slice(0, 4)
        }
    });
});

// Alertas
app.get('/api/v1/alerts', (req, res) => {
    const { page = 1, limit = 10, severity, acknowledged } = req.query;
    let filteredAlerts = [...mockDatabase.alerts];

    // Filtrar por severidade
    if (severity) {
        filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }

    // Filtrar por reconhecimento
    if (acknowledged !== undefined) {
        const isAcknowledged = acknowledged === 'true';
        filteredAlerts = filteredAlerts.filter(alert => alert.is_acknowledged === isAcknowledged);
    }

    // Ordenar por timestamp (mais recentes primeiro)
    filteredAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);

    res.json({
        success: true,
        data: {
            alerts: paginatedAlerts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: filteredAlerts.length,
                pages: Math.ceil(filteredAlerts.length / limit)
            }
        }
    });
});

app.get('/api/v1/alerts/:id', (req, res) => {
    const { id } = req.params;
    const alertId = parseInt(id, 10);
    const alert = mockDatabase.alerts.find(a => a.id === alertId);

    if (alert) {
        res.json({
            success: true,
            data: { alert }
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Alerta não encontrado'
        });
    }
});

app.put('/api/v1/alerts/:id/acknowledge', (req, res) => {
    const { id } = req.params;
    const alertId = parseInt(id, 10);

    const alertIndex = mockDatabase.alerts.findIndex(alert => alert.id === alertId);
    if (alertIndex !== -1) {
        mockDatabase.alerts[alertIndex].is_acknowledged = true;
        res.json({
            success: true,
            message: 'Alerta reconhecido com sucesso',
            data: {
                alert: {
                    ...mockDatabase.alerts[alertIndex],
                    acknowledged_by: 1,
                    acknowledged_at: new Date().toISOString()
                }
            }
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Alerta não encontrado'
        });
    }
});

app.put('/api/v1/alerts/:id/classify', (req, res) => {
    const { id } = req.params;
    const { classification, notes } = req.body;
    const alertId = parseInt(id, 10);

    const alertIndex = mockDatabase.alerts.findIndex(alert => alert.id === alertId);
    if (alertIndex !== -1) {
        mockDatabase.alerts[alertIndex].classification = classification;
        mockDatabase.alerts[alertIndex].classification_notes = notes;
        mockDatabase.alerts[alertIndex].classified_at = new Date().toISOString();
        mockDatabase.alerts[alertIndex].classified_by = 1;

        res.json({
            success: true,
            message: 'Alerta classificado com sucesso',
            data: {
                alert: mockDatabase.alerts[alertIndex]
            }
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Alerta não encontrado'
        });
    }
});

app.put('/api/v1/alerts/:id/escalate', (req, res) => {
    const { id } = req.params;
    const alertId = parseInt(id, 10);

    const alertIndex = mockDatabase.alerts.findIndex(alert => alert.id === alertId);
    if (alertIndex !== -1) {
        mockDatabase.alerts[alertIndex].escalated = true;
        mockDatabase.alerts[alertIndex].escalated_at = new Date().toISOString();
        mockDatabase.alerts[alertIndex].escalated_by = 1;

        res.json({
            success: true,
            message: 'Alerta escalado com sucesso',
            data: {
                alert: mockDatabase.alerts[alertIndex]
            }
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Alerta não encontrado'
        });
    }
});

// Cargas
app.get('/api/v1/shipments', (req, res) => {
    res.json({
        success: true,
        data: {
            shipments: mockDatabase.shipments
        }
    });
});

app.get('/api/v1/shipments/:id', (req, res) => {
    const { id } = req.params;
    const shipmentId = parseInt(id, 10);
    const shipment = mockDatabase.shipments.find(s => s.id === shipmentId);

    if (shipment) {
        res.json({
            success: true,
            data: { shipment }
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Carga não encontrada'
        });
    }
});

app.post('/api/v1/shipments', (req, res) => {
    const newShipment = {
        id: mockDatabase.shipments.length + 1,
        ...req.body,
        created_at: new Date().toISOString()
    };
    
    mockDatabase.shipments.push(newShipment);
    
    res.status(201).json({
        success: true,
        message: 'Carga criada com sucesso',
        data: { shipment: newShipment }
    });
});

app.put('/api/v1/shipments/:id', (req, res) => {
    const { id } = req.params;
    const shipmentId = parseInt(id, 10);
    const shipmentIndex = mockDatabase.shipments.findIndex(s => s.id === shipmentId);

    if (shipmentIndex !== -1) {
        mockDatabase.shipments[shipmentIndex] = {
            ...mockDatabase.shipments[shipmentIndex],
            ...req.body,
            updated_at: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'Carga atualizada com sucesso',
            data: { shipment: mockDatabase.shipments[shipmentIndex] }
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Carga não encontrada'
        });
    }
});

// Usuários
app.get('/api/v1/users', (req, res) => {
    res.json({
        success: true,
        data: {
            users: mockDatabase.users
        }
    });
});

app.get('/api/v1/users/:id', (req, res) => {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    const user = mockDatabase.users.find(u => u.id === userId);

    if (user) {
        res.json({
            success: true,
            data: { user }
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Usuário não encontrado'
        });
    }
});

app.post('/api/v1/users', (req, res) => {
    const newUser = {
        id: mockDatabase.users.length + 1,
        ...req.body,
        created_at: new Date().toISOString()
    };
    
    mockDatabase.users.push(newUser);
    
    res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: { user: newUser }
    });
});

app.put('/api/v1/users/:id', (req, res) => {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    const userIndex = mockDatabase.users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        mockDatabase.users[userIndex] = {
            ...mockDatabase.users[userIndex],
            ...req.body,
            updated_at: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'Usuário atualizado com sucesso',
            data: { user: mockDatabase.users[userIndex] }
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Usuário não encontrado'
        });
    }
});

// Zonas de Risco
app.get('/api/v1/risks/zones', (req, res) => {
    res.json({
        success: true,
        data: { 
            zones: mockDatabase.riskZones 
        }
    });
});

// Veículos
app.get('/api/v1/vehicles', (req, res) => {
    res.json({
        success: true,
        data: { 
            vehicles: mockDatabase.vehicles 
        }
    });
});

// Rota catch-all para servir o frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Inicializar servidor
app.listen(PORT, () => {
    console.log(`🚀 Sistema de Monitoramento Sompo - Iniciado!`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
    console.log(`📊 API: http://localhost:${PORT}/api/v1`);
    console.log(`📋 Credenciais de Demo:`);
    console.log(`   👑 Admin: admin / admin123`);
    console.log(`   🚛 Operador: joao.silva / password123`);
    console.log(`   👤 Cliente: cliente.techcom / password123`);
    console.log(`🎯 Sistema pronto para demonstração!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Recebido SIGTERM, encerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Recebido SIGINT, encerrando servidor...');
    process.exit(0);
});
