import { Router } from 'express';
import { highwayLookupController } from '../controllers/highway-lookup.controller';

const router = Router();

// Rotas para lookup de rodovias
router.get('/by-uf/:uf', highwayLookupController.getHighwaysByUF);
router.get('/validate', highwayLookupController.validateKilometer);
router.get('/search', highwayLookupController.searchHighways);
router.get('/dropdown/:uf', highwayLookupController.getDropdownOptions);
router.get('/statistics', highwayLookupController.getStatistics);
router.get('/ufs', highwayLookupController.getAvailableUFs);

export default router;
