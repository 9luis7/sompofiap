import { Router } from 'express';
import { catchAsync } from '../middleware/error.middleware';
import { vehicleController } from '../controllers/vehicle.controller';

const router = Router();

router.get('/', catchAsync(vehicleController.getAllVehicles));
router.get('/:id', catchAsync(vehicleController.getVehicleById));
router.post('/', catchAsync(vehicleController.createVehicle));
router.put('/:id', catchAsync(vehicleController.updateVehicle));

export default router;
