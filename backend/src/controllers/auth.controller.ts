import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { logInfo, logError } from '../utils/logger';
import { AppError } from '../middleware/error.middleware';

// Interfaces
interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'operator' | 'client';
}

// Controller de autenticação
export const authController = {
  // Login de usuário
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados de entrada inválidos', 400, errors.array());
      }

      const { username, password }: LoginRequest = req.body;

      // Usar AuthService para fazer login
      const { user, token, refreshToken } = await AuthService.login(username, password);

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role
          },
          token,
          refreshToken
        }
      });

    } catch (error) {
      logError('Erro no login', error as Error);
      next(error);
    }
  },

  // Registro de novo usuário
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados de entrada inválidos', 400, errors.array());
      }

      const { username, email, password, fullName, role }: RegisterRequest = req.body;

      // Usar AuthService para registrar
      const user = await AuthService.register({
        username,
        email,
        password,
        fullName,
        role,
      });

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role
          }
        }
      });

    } catch (error) {
      logError('Erro no registro', error as Error);
      next(error);
    }
  },

  // Refresh token
  refreshToken: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token é obrigatório', 400);
      }

      // Usar AuthService para renovar token
      const tokens = await AuthService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Token renovado com sucesso',
        data: {
          token: tokens.token,
          refreshToken: tokens.refreshToken
        }
      });

    } catch (error) {
      logError('Erro ao renovar token', error as Error);
      next(error);
    }
  },

  // Logout
  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      // Usar AuthService para fazer logout
      await AuthService.logout(req.user.userId);

      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      logError('Erro no logout', error as Error);
      next(error);
    }
  },

  // Obter perfil do usuário
  getProfile: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      // Usar AuthService para obter perfil
      const user = await AuthService.getProfile(req.user.userId);

      res.json({
        success: true,
        message: 'Perfil obtido com sucesso',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            is_active: user.is_active,
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        }
      });
    } catch (error) {
      logError('Erro ao obter perfil', error as Error);
      next(error);
    }
  }
};
