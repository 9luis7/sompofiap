import { Server as SocketIOServer } from 'socket.io';
import { logInfo, logError } from '../utils/logger';

export const setupSocketIO = (io: SocketIOServer): void => {
  // Middleware de autenticação para Socket.IO
  io.use((socket, next) => {
    // TODO: Implementar autenticação via JWT
    // const token = socket.handshake.auth.token;
    // if (!token) return next(new Error('Authentication error'));
    next();
  });

  io.on('connection', (socket) => {
    logInfo('Novo cliente conectado via Socket.IO', { socketId: socket.id });

    // Entrar em sala específica do shipment
    socket.on('join-shipment', (shipmentId: string) => {
      socket.join(`shipment-${shipmentId}`);
      logInfo('Cliente entrou na sala do shipment', { socketId: socket.id, shipmentId });
    });

    // Sair da sala do shipment
    socket.on('leave-shipment', (shipmentId: string) => {
      socket.leave(`shipment-${shipmentId}`);
      logInfo('Cliente saiu da sala do shipment', { socketId: socket.id, shipmentId });
    });

    // Entrar em sala de alertas
    socket.on('join-alerts', () => {
      socket.join('alerts');
      logInfo('Cliente entrou na sala de alertas', { socketId: socket.id });
    });

    // Solicitar dados em tempo real
    socket.on('request-real-time-data', (shipmentId: string) => {
      // TODO: Implementar envio de dados em tempo real
      socket.emit('real-time-data', {
        shipmentId,
        location: { lat: -23.5505, lng: -46.6333 },
        speed: 60,
        status: 'moving'
      });
    });

    // Ping/Pong para manter conexão ativa
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Desconexão
    socket.on('disconnect', (reason) => {
      logInfo('Cliente desconectado', { socketId: socket.id, reason });
    });

    // Tratamento de erros
    socket.on('error', (error) => {
      logError('Erro no Socket.IO', error);
    });
  });
};

// Funções utilitárias para emitir eventos
export const socketUtils = {
  // Emitir atualização de localização
  emitLocationUpdate: (io: SocketIOServer, shipmentId: string, location: any) => {
    io.to(`shipment-${shipmentId}`).emit('location-update', {
      shipmentId,
      location,
      timestamp: new Date().toISOString()
    });
  },

  // Emitir alerta
  emitAlert: (io: SocketIOServer, alert: any) => {
    io.to('alerts').emit('new-alert', {
      ...alert,
      timestamp: new Date().toISOString()
    });

    // Também emitir para o shipment específico se aplicável
    if (alert.shipmentId) {
      io.to(`shipment-${alert.shipmentId}`).emit('shipment-alert', alert);
    }
  },

  // Emitir atualização de status do shipment
  emitShipmentUpdate: (io: SocketIOServer, shipmentId: string, status: any) => {
    io.to(`shipment-${shipmentId}`).emit('shipment-update', {
      shipmentId,
      status,
      timestamp: new Date().toISOString()
    });
  },

  // Emitir dados de sensores
  emitSensorData: (io: SocketIOServer, shipmentId: string, sensorData: any) => {
    io.to(`shipment-${shipmentId}`).emit('sensor-data', {
      shipmentId,
      sensorData,
      timestamp: new Date().toISOString()
    });
  }
};
