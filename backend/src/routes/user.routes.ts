import { Router } from 'express';
import { catchAsync } from '../middleware/error.middleware';
import { userController } from '../controllers/user.controller';

const router = Router();

router.get('/', catchAsync(userController.getAllUsers));
router.get('/:id', catchAsync(userController.getUserById));
router.put('/:id', catchAsync(userController.updateUser));

export default router;
