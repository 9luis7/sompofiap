import { Request, Response, NextFunction } from 'express';
import { logError } from '../utils/logger';

// Interface para erro personalizado
export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  details?: any;
}

// Classe de erro personalizado
export class AppError extends Error implements CustomError {
  public statusCode: number;
  public isOperational: boolean;
  public details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Tratamento de erros assíncronos
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// Middleware principal de tratamento de erros
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  logError('Erro na aplicação', err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Erro de validação do Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = (err as any).errors.map((e: any) => ({
      field: e.path,
      message: e.message
    }));

    res.status(400).json({
      success: false,
      error: 'Erro de validação',
      details: errors
    });
    return;
  }

  // Erro de chave única do Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    res.status(409).json({
      success: false,
      error: 'Dados duplicados',
      message: 'Já existe um registro com esses dados'
    });
    return;
  }

  // Erro de chave estrangeira do Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    res.status(400).json({
      success: false,
      error: 'Erro de relacionamento',
      message: 'Dados relacionados não encontrados'
    });
    return;
  }

  // Erro de sintaxe SQL
  if (err.name === 'SequelizeSyntaxError') {
    res.status(400).json({
      success: false,
      error: 'Erro de sintaxe SQL',
      message: 'Consulta SQL inválida'
    });
    return;
  }

  // Erro de timeout do banco
  if (err.name === 'SequelizeTimeoutError') {
    res.status(504).json({
      success: false,
      error: 'Timeout do banco de dados',
      message: 'A operação demorou muito para ser executada'
    });
    return;
  }

  // Erro de conexão com banco
  if (err.name === 'SequelizeConnectionError') {
    res.status(503).json({
      success: false,
      error: 'Erro de conexão',
      message: 'Não foi possível conectar ao banco de dados'
    });
    return;
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Token inválido',
      message: 'Token de autenticação inválido'
    });
    return;
  }

  // Erro de JWT expirado
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Token expirado',
      message: 'Token de autenticação expirado'
    });
    return;
  }

  // Erro personalizado da aplicação
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message,
      ...(err.details && { details: err.details })
    });
    return;
  }

  // Erro desconhecido (não operacional)
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
  });
};

// Tratamento de erros 404
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Rota ${req.originalUrl} não encontrada`, 404);
  next(error);
};

// Tratamento de erros de validação
export const validationErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error: any) => error.message);
    const error = new AppError('Erro de validação', 400, errors);
    next(error);
  } else {
    next(err);
  }
};
