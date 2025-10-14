import { Router } from 'express';
import { demoController } from '../controllers/demo.controller';

const router = Router();

// Rotas de demonstração
router.get('/heatmap', demoController.getHeatmap);
router.get('/shipments', demoController.getShipments);
router.get('/dashboard', demoController.getDashboard);
router.get('/alerts', demoController.getAlerts);

// Aliases para compatibilidade com frontend
router.get('/', demoController.getShipments); // GET /shipments
router.get('/active', demoController.getAlerts); // GET /alerts/active
router.get('/zones', (req, res) => {
  // GET /risk/zones
  res.json({
    success: true,
    data: {
      zones: [],
      total: 0,
    },
  });
});

export default router;
