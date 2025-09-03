import { Router } from 'express';
import { catchAsync } from '../middleware/error.middleware';
import { alertController } from '../controllers/alert.controller';

const router = Router();

// router.use(authMiddleware); // TODO: Adicionar middleware de autenticação

router.get('/', catchAsync(alertController.getAllAlerts));
router.get('/:id', catchAsync(alertController.getAlertById));
router.put('/:id/acknowledge', catchAsync(alertController.acknowledgeAlert));

export default router;
