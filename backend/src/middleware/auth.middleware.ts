import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { environment } from '../config/environment';
import { logError } from '../utils/logger';
import { AppError } from './error.middleware';

// Estender Request para incluir usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        role: string;
      };
    }
  }
}

export interface JWTPayload {
  userId: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Middleware para verificar token JWT
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Token de autenticação não fornecido', 401);
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, environment.jwt.secret) as JWTPayload;

    // Anexar informações do usuário à requisição
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logError('Erro na autenticação', error as Error);

    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Token inválido', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expirado', 401));
    } else {
      next(new AppError('Erro na autenticação', 401));
    }
  }
};

// Middleware para verificar roles específicas
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Autenticação necessária', 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError('Permissão insuficiente', 403));
      return;
    }

    next();
  };
};

// Middleware para verificar se usuário é admin
export const requireAdmin = requireRole('admin');

// Middleware para verificar se usuário é admin ou operador
export const requireAdminOrOperator = requireRole('admin', 'operator');

// Middleware opcional para autenticação (não retorna erro se não autenticado)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, environment.jwt.secret) as JWTPayload;
      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // Ignorar erros de autenticação opcional
    next();
  }
};

// Função para gerar tokens JWT
export const generateTokens = (payload: Omit<JWTPayload, 'iat' | 'exp'>) => {
  const token = jwt.sign(payload, environment.jwt.secret, {
    expiresIn: '24h',
  });

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    environment.jwt.refreshSecret,
    {
      expiresIn: '7d',
    }
  );

  return { token, refreshToken };
};

// Função para verificar refresh token
export const verifyRefreshToken = (refreshToken: string): { userId: number } => {
  try {
    const decoded = jwt.verify(refreshToken, environment.jwt.refreshSecret) as { userId: number };
    return decoded;
  } catch (error) {
    throw new AppError('Refresh token inválido', 401);
  }
};
