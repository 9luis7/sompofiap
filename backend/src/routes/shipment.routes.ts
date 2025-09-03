import { Router } from 'express';
import { body } from 'express-validator';
import { catchAsync } from '../middleware/error.middleware';
import { shipmentController } from '../controllers/shipment.controller';

const router = Router();

// Validações
const createShipmentValidation = [
  body('shipmentNumber').notEmpty().withMessage('Número do envio é obrigatório'),
  body('vehicleId').isInt().withMessage('ID do veículo deve ser um número'),
  body('originAddress').notEmpty().withMessage('Endereço de origem é obrigatório'),
  body('destinationAddress').notEmpty().withMessage('Endereço de destino é obrigatório'),
  body('cargoType').notEmpty().withMessage('Tipo de carga é obrigatório'),
  body('cargoValue').isFloat({ min: 0 }).withMessage('Valor da carga deve ser positivo')
];

const updateShipmentValidation = [
  body('status').optional().isIn(['planned', 'in_transit', 'completed', 'cancelled', 'emergency']).withMessage('Status inválido'),
  body('cargoType').optional().notEmpty().withMessage('Tipo de carga não pode ser vazio'),
  body('cargoValue').optional().isFloat({ min: 0 }).withMessage('Valor da carga deve ser positivo')
];

// Rotas públicas (serão protegidas por middleware futuramente)
// router.use(authMiddleware); // TODO: Adicionar middleware de autenticação

// CRUD básico de shipments
router.get('/', catchAsync(shipmentController.getAllShipments));
router.get('/:id', catchAsync(shipmentController.getShipmentById));
router.post('/', createShipmentValidation, catchAsync(shipmentController.createShipment));
router.put('/:id', updateShipmentValidation, catchAsync(shipmentController.updateShipment));
router.delete('/:id', catchAsync(shipmentController.deleteShipment));

// Rotas específicas
router.get('/:id/route', catchAsync(shipmentController.getShipmentRoute));
router.post('/:id/start', catchAsync(shipmentController.startShipment));
router.post('/:id/complete', catchAsync(shipmentController.completeShipment));
router.post('/:id/emergency', catchAsync(shipmentController.emergencyStop));

export default router;
