import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { validationResult } from 'express-validator';
import { logInfo, logError } from '../utils/logger';
import { AppError } from '../middleware/error.middleware';
import CSVImportService from '../services/csv-import.service';

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/csv');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}_${originalName}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos CSV são permitidos') as any, false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

export const csvImportController = {
  /**
   * Upload e validação de arquivo CSV
   */
  uploadCSV: upload.single('csvFile'),

  /**
   * Valida estrutura do arquivo CSV
   */
  validateCSV: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados de entrada inválidos', 400, errors.array());
      }

      const { dataType } = req.body;
      const file = req.file;

      if (!file) {
        throw new AppError('Arquivo CSV não fornecido', 400);
      }

      if (!dataType) {
        throw new AppError('Tipo de dados não especificado', 400);
      }

      const validTypes = ['shipments', 'vehicles', 'alerts', 'users'];
      if (!validTypes.includes(dataType)) {
        throw new AppError(`Tipo de dados inválido. Tipos permitidos: ${validTypes.join(', ')}`, 400);
      }

      const csvService = CSVImportService.getInstance();
      const validation = csvService.validateCSVStructure(file.path, dataType as any);

      // Limpar arquivo temporário após validação
      fs.unlinkSync(file.path);

      res.json({
        success: validation.valid,
        data: {
          validation,
          message: validation.valid 
            ? 'Estrutura do arquivo CSV é válida' 
            : 'Estrutura do arquivo CSV contém erros'
        }
      });

    } catch (error) {
      // Limpar arquivo temporário em caso de erro
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      logError('Erro na validação CSV', error as Error);
      next(error);
    }
  },

  /**
   * Importa dados do arquivo CSV
   */
  importCSV: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados de entrada inválidos', 400, errors.array());
      }

      const { dataType, options = {} } = req.body;
      const file = req.file;

      if (!file) {
        throw new AppError('Arquivo CSV não fornecido', 400);
      }

      if (!dataType) {
        throw new AppError('Tipo de dados não especificado', 400);
      }

      const validTypes = ['shipments', 'vehicles', 'alerts', 'users'];
      if (!validTypes.includes(dataType)) {
        throw new AppError(`Tipo de dados inválido. Tipos permitidos: ${validTypes.join(', ')}`, 400);
      }

      const csvService = CSVImportService.getInstance();
      
      // Validar estrutura primeiro
      const validation = csvService.validateCSVStructure(file.path, dataType as any);
      if (!validation.valid) {
        fs.unlinkSync(file.path);
        throw new AppError('Estrutura do arquivo inválida', 400, validation.errors);
      }

      // Importar dados
      const importResult = await csvService.importCSV(file.path, {
        skipEmptyLines: options.skipEmptyLines !== false,
        skipLinesWithError: options.skipLinesWithError !== false,
        delimiter: options.delimiter || ','
      });

      // Processar dados específicos por tipo
      if (importResult.success) {
        const processResult = await csvService.processDataByType(
          await csvService['parseCSVFile'](file.path, options), 
          dataType
        );
        
        importResult.importedRows = processResult.processed;
        importResult.errors.push(...processResult.errors);
      }

      // Limpar arquivo temporário
      fs.unlinkSync(file.path);

      logInfo('Importação CSV concluída', {
        dataType,
        totalRows: importResult.totalRows,
        importedRows: importResult.importedRows,
        errors: importResult.errors.length
      });

      res.json({
        success: importResult.success,
        data: {
          importResult,
          message: importResult.success 
            ? `Importação concluída com sucesso: ${importResult.importedRows}/${importResult.totalRows} registros importados`
            : `Importação concluída com erros: ${importResult.importedRows}/${importResult.totalRows} registros importados`
        }
      });

    } catch (error) {
      // Limpar arquivo temporário em caso de erro
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      logError('Erro na importação CSV', error as Error);
      next(error);
    }
  },

  /**
   * Lista tipos de dados suportados
   */
  getSupportedDataTypes: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dataTypes = [
        {
          type: 'shipments',
          name: 'Cargas',
          description: 'Dados de cargas e envios',
          requiredFields: [
            'shipment_number', 'vehicle_id', 'status', 'origin_address',
            'destination_address', 'cargo_type', 'cargo_value'
          ]
        },
        {
          type: 'vehicles',
          name: 'Veículos',
          description: 'Dados de veículos da frota',
          requiredFields: [
            'license_plate', 'vehicle_type', 'capacity_kg',
            'owner_company', 'is_active'
          ]
        },
        {
          type: 'alerts',
          name: 'Alertas',
          description: 'Dados de alertas e incidentes',
          requiredFields: [
            'alert_type', 'severity', 'message',
            'vehicle_plate', 'timestamp'
          ]
        },
        {
          type: 'users',
          name: 'Usuários',
          description: 'Dados de usuários do sistema',
          requiredFields: [
            'username', 'email', 'full_name', 'role'
          ]
        }
      ];

      res.json({
        success: true,
        data: { dataTypes }
      });

    } catch (error) {
      logError('Erro ao listar tipos de dados', error as Error);
      next(error);
    }
  },

  /**
   * Gera template CSV para um tipo de dados
   */
  generateTemplate: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { dataType } = req.params;

      const validTypes = ['shipments', 'vehicles', 'alerts', 'users'];
      if (!validTypes.includes(dataType)) {
        throw new AppError(`Tipo de dados inválido. Tipos permitidos: ${validTypes.join(', ')}`, 400);
      }

      const csvService = CSVImportService.getInstance();
      const headers = csvService['getExpectedHeaders'](dataType);

      // Gerar CSV template com cabeçalhos e linhas de exemplo
      let csvContent = headers.join(',') + '\n';
      
      // Adicionar linhas de exemplo baseadas no tipo
      switch (dataType) {
        case 'shipments':
          csvContent += 'SHP-2024-001,1,in_transit,São Paulo SP,Rio de Janeiro RJ,Eletrônicos,125000.00,2024-01-15 08:00:00,2024-01-15 18:00:00,TechCom Distribuidora\n';
          csvContent += 'SHP-2024-002,2,planned,Belo Horizonte MG,Salvador BA,Medicamentos,89000.00,2024-01-16 09:00:00,2024-01-16 20:00:00,FarmaBrasil\n';
          break;
        case 'vehicles':
          csvContent += 'ABC-1234,Bitrem,45000,Transportadora São Paulo Ltda,IOT-SP-001,true,in_transit,João Silva\n';
          csvContent += 'DEF-5678,Cavalo Mecânico,28000,Logística Nordeste S.A.,IOT-BA-002,true,loading,Maria Santos\n';
          break;
        case 'alerts':
          csvContent += 'high_risk_zone,high,Veículo entrou em zona de alto risco,1,ABC-1234,São Paulo SP,2024-01-15 14:30:00\n';
          csvContent += 'route_deviation,medium,Desvio de rota detectado,2,DEF-5678,Belo Horizonte MG,2024-01-15 15:45:00\n';
          break;
        case 'users':
          csvContent += 'admin.sompo,admin@sompo.com.br,Administrador Sompo,admin,true,Tecnologia,+55 11 99999-0001\n';
          csvContent += 'joao.silva,joao.silva@sompo.com.br,João Silva,operator,true,Centro de Controle,+55 11 99999-0002\n';
          break;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="template_${dataType}.csv"`);
      res.send(csvContent);

    } catch (error) {
      logError('Erro ao gerar template CSV', error as Error);
      next(error);
    }
  }
};
