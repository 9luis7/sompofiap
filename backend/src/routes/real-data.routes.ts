import { Router } from 'express';
import { realDataController } from '../controllers/real-data.controller';

const router = Router();

// Rotas de dados reais
router.get('/heatmap', realDataController.getHeatmap);
router.get('/summary', realDataController.getSummary);
router.get('/dashboard', realDataController.getDashboard);
router.get('/by-highway', realDataController.getByHighway);
router.get('/by-region', realDataController.getByRegion);
router.get('/timeline', realDataController.getTimeline);
router.get('/top-risks', realDataController.getTopRisks);
router.get('/reload', realDataController.reload);

export default router;
