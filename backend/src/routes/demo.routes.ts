import { Router } from 'express';
import { demoController } from '../controllers/demo.controller';

const router = Router();

router.get('/heatmap', demoController.getHeatmap);
router.get('/shipments', demoController.getShipments);
router.get('/dashboard', demoController.getDashboard);
router.get('/alerts', demoController.getAlerts);

export default router;
