import { Router } from 'express';
import { body } from 'express-validator';
import { catchAsync } from '../middleware/error.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { authController } from '../controllers/auth.controller';

const router = Router();

// Validações
const loginValidation = [
  body('username').notEmpty().withMessage('Username é obrigatório'),
  body('password').notEmpty().withMessage('Password é obrigatório')
];

const registerValidation = [
  body('username').isLength({ min: 3 }).withMessage('Username deve ter pelo menos 3 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Password deve ter pelo menos 6 caracteres'),
  body('fullName').notEmpty().withMessage('Nome completo é obrigatório'),
  body('role').isIn(['admin', 'operator', 'client']).withMessage('Role inválido')
];

// Rotas públicas
router.post('/login', loginValidation, catchAsync(authController.login));
router.post('/register', registerValidation, catchAsync(authController.register));
router.post('/refresh-token', catchAsync(authController.refreshToken));

// Rotas protegidas
router.post('/logout', authenticateToken, catchAsync(authController.logout));
router.get('/profile', authenticateToken, catchAsync(authController.getProfile));

// Validação para atualização de perfil
const profileValidation = [
  body('fullName').optional().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').optional().isEmail().withMessage('Email inválido')
];

// router.put('/profile', authenticateToken, profileValidation, catchAsync(authController.updateProfile));

export default router;
