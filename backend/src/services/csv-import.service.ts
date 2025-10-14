import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { logInfo, logError } from '../utils/logger';

export interface CSVRow {
  [key: string]: string;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  importedRows: number;
  errors: string[];
  warnings: string[];
}

export class CSVImportService {
  private static instance: CSVImportService;

  public static getInstance(): CSVImportService {
    if (!CSVImportService.instance) {
      CSVImportService.instance = new CSVImportService();
    }
    return CSVImportService.instance;
  }

  /**
   * Importa dados de um arquivo CSV
   */
  async importCSV(filePath: string, options: {
    skipEmptyLines?: boolean;
    skipLinesWithError?: boolean;
    delimiter?: string;
  } = {}): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalRows: 0,
      importedRows: 0,
      errors: [],
      warnings: []
    };

    try {
      if (!fs.existsSync(filePath)) {
        result.errors.push(`Arquivo não encontrado: ${filePath}`);
        return result;
      }

      const rows: CSVRow[] = await this.parseCSVFile(filePath, options);
      result.totalRows = rows.length;

      // TODO: Implementar validação e importação específica por tipo
      // Por enquanto, apenas log das linhas processadas
      rows.forEach((row, index) => {
        logInfo(`Processando linha ${index + 1}`, row);
        result.importedRows++;
      });

      result.success = result.errors.length === 0;
      logInfo('Importação CSV concluída', result);

    } catch (error) {
      logError('Erro na importação CSV', error as Error);
      result.errors.push(`Erro na importação: ${(error as Error).message}`);
    }

    return result;
  }

  /**
   * Faz o parse de um arquivo CSV
   */
  private async parseCSVFile(filePath: string, options: any): Promise<CSVRow[]> {
    return new Promise((resolve, reject) => {
      const rows: CSVRow[] = [];
      const headers: string[] = [];

      const parser = parse({
        delimiter: options.delimiter || ',',
        skip_empty_lines: options.skipEmptyLines !== false,
        columns: true, // Usa primeira linha como cabeçalho
        trim: true,
        skip_records_with_error: options.skipLinesWithError !== false
      });

      parser.on('readable', () => {
        let record: CSVRow;
        while ((record = parser.read()) !== null) {
          rows.push(record);
        }
      });

      parser.on('error', (error) => {
        reject(error);
      });

      parser.on('end', () => {
        resolve(rows);
      });

      // Criar stream do arquivo
      const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
      fileStream.pipe(parser);
    });
  }

  /**
   * Valida estrutura do CSV baseado no tipo de dados
   */
  validateCSVStructure(filePath: string, dataType: 'shipments' | 'vehicles' | 'alerts' | 'users'): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Ler apenas a primeira linha para validar cabeçalhos
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const firstLine = fileContent.split('\n')[0];
      const headers = firstLine.split(',').map(h => h.trim().toLowerCase());

      // Definir cabeçalhos esperados por tipo
      const expectedHeaders = this.getExpectedHeaders(dataType);
      const missingHeaders = expectedHeaders.filter(expected => 
        !headers.includes(expected.toLowerCase())
      );

      if (missingHeaders.length > 0) {
        errors.push(`Cabeçalhos obrigatórios ausentes: ${missingHeaders.join(', ')}`);
      }

      // Verificar cabeçalhos extras
      const extraHeaders = headers.filter(header => 
        !expectedHeaders.some(expected => expected.toLowerCase() === header)
      );

      if (extraHeaders.length > 0) {
        warnings.push(`Cabeçalhos extras encontrados: ${extraHeaders.join(', ')}`);
      }

    } catch (error) {
      errors.push(`Erro ao validar arquivo: ${(error as Error).message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Retorna cabeçalhos esperados para cada tipo de dados
   */
  private getExpectedHeaders(dataType: string): string[] {
    switch (dataType) {
      case 'shipments':
        return [
          'shipment_number',
          'vehicle_id',
          'status',
          'origin_address',
          'destination_address',
          'cargo_type',
          'cargo_value',
          'planned_departure',
          'planned_arrival',
          'customer_name'
        ];
      
      case 'vehicles':
        return [
          'license_plate',
          'vehicle_type',
          'capacity_kg',
          'owner_company',
          'iot_device_id',
          'is_active',
          'status',
          'driver_name'
        ];
      
      case 'alerts':
        return [
          'alert_type',
          'severity',
          'message',
          'shipment_id',
          'vehicle_plate',
          'location',
          'timestamp'
        ];
      
      case 'users':
        return [
          'username',
          'email',
          'full_name',
          'role',
          'is_active',
          'department',
          'phone'
        ];
      
      default:
        return [];
    }
  }

  /**
   * Processa dados específicos por tipo
   */
  async processDataByType(rows: CSVRow[], dataType: string): Promise<{
    success: boolean;
    processed: number;
    errors: string[];
  }> {
    const result = {
      success: false,
      processed: 0,
      errors: [] as string[]
    };

    try {
      switch (dataType) {
        case 'shipments':
          result.processed = await this.processShipments(rows);
          break;
        case 'vehicles':
          result.processed = await this.processVehicles(rows);
          break;
        case 'alerts':
          result.processed = await this.processAlerts(rows);
          break;
        case 'users':
          result.processed = await this.processUsers(rows);
          break;
        default:
          result.errors.push(`Tipo de dados não suportado: ${dataType}`);
          return result;
      }

      result.success = result.errors.length === 0;
    } catch (error) {
      result.errors.push(`Erro no processamento: ${(error as Error).message}`);
    }

    return result;
  }

  /**
   * Processa dados de shipments
   */
  private async processShipments(rows: CSVRow[]): Promise<number> {
    let processed = 0;
    
    for (const row of rows) {
      try {
        // TODO: Implementar validação e salvamento no banco
        const shipmentData = {
          shipmentNumber: row.shipment_number,
          vehicleId: parseInt(row.vehicle_id) || 0,
          status: row.status || 'planned',
          originAddress: row.origin_address,
          destinationAddress: row.destination_address,
          cargoType: row.cargo_type,
          cargoValue: parseFloat(row.cargo_value) || 0,
          plannedDeparture: row.planned_departure,
          plannedArrival: row.planned_arrival,
          customerName: row.customer_name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // TODO: Salvar no banco de dados
        logInfo('Shipment processado', shipmentData);
        processed++;
      } catch (error) {
        logError(`Erro ao processar shipment linha ${processed + 1}`, error as Error);
      }
    }

    return processed;
  }

  /**
   * Processa dados de vehicles
   */
  private async processVehicles(rows: CSVRow[]): Promise<number> {
    let processed = 0;
    
    for (const row of rows) {
      try {
        // TODO: Implementar validação e salvamento no banco
        const vehicleData = {
          licensePlate: row.license_plate,
          vehicleType: row.vehicle_type,
          capacityKg: parseInt(row.capacity_kg) || 0,
          ownerCompany: row.owner_company,
          iotDeviceId: row.iot_device_id,
          isActive: row.is_active?.toLowerCase() === 'true',
          status: row.status || 'available',
          driverName: row.driver_name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // TODO: Salvar no banco de dados
        logInfo('Vehicle processado', vehicleData);
        processed++;
      } catch (error) {
        logError(`Erro ao processar vehicle linha ${processed + 1}`, error as Error);
      }
    }

    return processed;
  }

  /**
   * Processa dados de alerts
   */
  private async processAlerts(rows: CSVRow[]): Promise<number> {
    let processed = 0;
    
    for (const row of rows) {
      try {
        // TODO: Implementar validação e salvamento no banco
        const alertData = {
          alertType: row.alert_type,
          severity: row.severity,
          message: row.message,
          shipmentId: parseInt(row.shipment_id) || null,
          vehiclePlate: row.vehicle_plate,
          location: row.location,
          timestamp: row.timestamp || new Date().toISOString(),
          isAcknowledged: false,
          createdAt: new Date().toISOString()
        };

        // TODO: Salvar no banco de dados
        logInfo('Alert processado', alertData);
        processed++;
      } catch (error) {
        logError(`Erro ao processar alert linha ${processed + 1}`, error as Error);
      }
    }

    return processed;
  }

  /**
   * Processa dados de users
   */
  private async processUsers(rows: CSVRow[]): Promise<number> {
    let processed = 0;
    
    for (const row of rows) {
      try {
        // TODO: Implementar validação e salvamento no banco
        const userData = {
          username: row.username,
          email: row.email,
          fullName: row.full_name,
          role: row.role || 'operator',
          isActive: row.is_active?.toLowerCase() !== 'false',
          department: row.department,
          phone: row.phone,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // TODO: Salvar no banco de dados
        logInfo('User processado', userData);
        processed++;
      } catch (error) {
        logError(`Erro ao processar user linha ${processed + 1}`, error as Error);
      }
    }

    return processed;
  }
}

export default CSVImportService;
