import { Router } from 'express';
import { catchAsync } from '../middleware/error.middleware';
import { riskController } from '../controllers/risk.controller';

const router = Router();

router.get('/zones', catchAsync(riskController.getRiskZones));
router.get('/zones/:id', catchAsync(riskController.getRiskZoneById));
router.post('/zones', catchAsync(riskController.createRiskZone));

export default router;
