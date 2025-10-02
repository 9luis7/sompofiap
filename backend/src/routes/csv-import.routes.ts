import { Router } from 'express';
import { body } from 'express-validator';
import { csvImportController } from '../controllers/csv-import.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Validações
const validateDataType = body('dataType')
  .notEmpty()
  .withMessage('Tipo de dados é obrigatório')
  .isIn(['shipments', 'vehicles', 'alerts', 'users'])
  .withMessage('Tipo de dados deve ser: shipments, vehicles, alerts ou users');

const validateImportOptions = [
  body('dataType').optional(),
  body('options.skipEmptyLines').optional().isBoolean(),
  body('options.skipLinesWithError').optional().isBoolean(),
  body('options.delimiter').optional().isString().isLength({ min: 1, max: 1 })
];

/**
 * @route GET /api/v1/csv-import/data-types
 * @desc Lista tipos de dados suportados para importação
 * @access Private (Admin/Operator)
 */
router.get('/data-types', csvImportController.getSupportedDataTypes);

/**
 * @route GET /api/v1/csv-import/template/:dataType
 * @desc Gera template CSV para um tipo de dados específico
 * @access Private (Admin/Operator)
 */
router.get('/template/:dataType', csvImportController.generateTemplate);

/**
 * @route POST /api/v1/csv-import/validate
 * @desc Valida estrutura de um arquivo CSV
 * @access Private (Admin/Operator)
 * @param {File} csvFile - Arquivo CSV para validação
 * @param {string} dataType - Tipo de dados (shipments, vehicles, alerts, users)
 */
router.post(
  '/validate',
  csvImportController.uploadCSV,
  validateDataType,
  csvImportController.validateCSV
);

/**
 * @route POST /api/v1/csv-import/import
 * @desc Importa dados de um arquivo CSV
 * @access Private (Admin only)
 * @param {File} csvFile - Arquivo CSV para importação
 * @param {string} dataType - Tipo de dados (shipments, vehicles, alerts, users)
 * @param {Object} options - Opções de importação
 */
router.post(
  '/import',
  csvImportController.uploadCSV,
  validateImportOptions,
  csvImportController.importCSV
);

export default router;
