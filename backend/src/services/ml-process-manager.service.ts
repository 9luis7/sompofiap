/**
 * ML Process Manager Service - Sompo
 * ===================================
 *
 * Gerencia o ciclo de vida dos processos Python das APIs de ML.
 * Inicia, monitora e encerra os servidores Flask automaticamente.
 *
 * Este serviço gerencia:
 * 1. API de Risco (ml_prediction_api.py) - porta 5000
 * 2. API de Classificação (classification_api.py) - porta 5001
 *
 * Autor: Sistema Sompo
 * Data: 2025-10-14
 */

import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import axios from 'axios';

class MLProcessManager {
  // API de Risco
  private mlProcess: ChildProcess | null = null;
  private isRiskApiRunning: boolean = false;
  private riskApiUrl: string = 'http://localhost:5000';
  
  // API de Classificação
  private classificationProcess: ChildProcess | null = null;
  private isClassificationApiRunning: boolean = false;
  private classificationApiUrl: string = 'http://localhost:5001';
  
  // Configurações
  private maxStartupTime: number = 30000; // 30 segundos
  private healthCheckInterval: number = 2000; // 2 segundos

  /**
   * Inicia todas as APIs de ML
   */
  async start(): Promise<void> {
    console.log('🤖 Iniciando APIs Python de ML...');
    console.log('');
    
    // Iniciar ambas as APIs em paralelo
    await Promise.all([
      this.startRiskApi(),
      this.startClassificationApi(),
    ]);
    
    console.log('');
    console.log('✅ Sistema de Ensemble ML totalmente operacional!');
  }

  /**
   * Inicia a API de Risco (porta 5000)
   */
  private async startRiskApi(): Promise<void> {
    console.log('📊 [1/2] Iniciando API de Risco...');

    if (this.mlProcess) {
      console.log('⚠️  API de Risco já está rodando');
      return;
    }

    const scriptPath = path.join(__dirname, '../../../scripts/ml_prediction_api.py');
    const projectRoot = path.join(__dirname, '../../..');

    this.mlProcess = spawn('python', [scriptPath], {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: false,
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
      },
    });

    this.mlProcess.stdout?.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`   [Risk API] ${output}`);
      }
    });

    this.mlProcess.stderr?.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('WARNING')) {
        console.error(`   [Risk API ERROR] ${output}`);
      }
    });

    this.mlProcess.on('exit', (code, signal) => {
      console.log(`🔴 API de Risco encerrada (code: ${code}, signal: ${signal})`);
      this.isRiskApiRunning = false;
      this.mlProcess = null;
    });

    this.mlProcess.on('error', (error) => {
      console.error('❌ Erro ao iniciar API de Risco:', error.message);
      this.isRiskApiRunning = false;
      this.mlProcess = null;
    });

    await this.waitForAPIReady('risk');
  }

  /**
   * Inicia a API de Classificação (porta 5001)
   */
  private async startClassificationApi(): Promise<void> {
    console.log('🎯 [2/2] Iniciando API de Classificação...');

    if (this.classificationProcess) {
      console.log('⚠️  API de Classificação já está rodando');
      return;
    }

    const scriptPath = path.join(__dirname, '../../../scripts/classification_api.py');
    const projectRoot = path.join(__dirname, '../../..');

    this.classificationProcess = spawn('python', [scriptPath], {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: false,
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
      },
    });

    this.classificationProcess.stdout?.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`   [Classification API] ${output}`);
      }
    });

    this.classificationProcess.stderr?.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('WARNING')) {
        console.error(`   [Classification API ERROR] ${output}`);
      }
    });

    this.classificationProcess.on('exit', (code, signal) => {
      console.log(`🔴 API de Classificação encerrada (code: ${code}, signal: ${signal})`);
      this.isClassificationApiRunning = false;
      this.classificationProcess = null;
    });

    this.classificationProcess.on('error', (error) => {
      console.error('❌ Erro ao iniciar API de Classificação:', error.message);
      this.isClassificationApiRunning = false;
      this.classificationProcess = null;
    });

    await this.waitForAPIReady('classification');
  }

  /**
   * Aguarda uma API ML ficar disponível
   */
  private async waitForAPIReady(apiType: 'risk' | 'classification'): Promise<void> {
    const startTime = Date.now();
    const apiUrl = apiType === 'risk' ? this.riskApiUrl : this.classificationApiUrl;
    const apiName = apiType === 'risk' ? 'Risk API' : 'Classification API';

    while (Date.now() - startTime < this.maxStartupTime) {
      try {
        const response = await axios.get(`${apiUrl}/health`, {
          timeout: 1000,
        });

        if (response.data.model_loaded === true || response.data.status === 'healthy') {
          if (apiType === 'risk') {
            this.isRiskApiRunning = true;
          } else {
            this.isClassificationApiRunning = true;
          }
          
          console.log(`   ✅ ${apiName} operacional!`);
          console.log(`   📡 URL: ${apiUrl}`);
          return;
        } else {
          throw new Error('Modelo não carregado');
        }
      } catch (error) {
        // API ainda não está pronta, aguardar
        await this.sleep(this.healthCheckInterval);
      }
    }

    // Timeout - aviso mas não mata o sistema
    console.warn(
      `   ⚠️  ${apiName} não ficou disponível em ${this.maxStartupTime / 1000}s. ` +
      'Sistema continuará com fallback.'
    );
  }

  /**
   * Para todos os processos Python
   */
  stop(): void {
    console.log('🛑 Encerrando processos ML...');
    
    // Parar API de Risco
    if (this.mlProcess) {
      console.log('   Encerrando Risk API...');
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', this.mlProcess.pid!.toString(), '/f', '/t']);
      } else {
        this.mlProcess.kill('SIGTERM');
      }
      this.mlProcess = null;
      this.isRiskApiRunning = false;
    }
    
    // Parar API de Classificação
    if (this.classificationProcess) {
      console.log('   Encerrando Classification API...');
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', this.classificationProcess.pid!.toString(), '/f', '/t']);
      } else {
        this.classificationProcess.kill('SIGTERM');
      }
      this.classificationProcess = null;
      this.isClassificationApiRunning = false;
    }
  }

  /**
   * Verifica se as APIs estão rodando
   */
  isMLRunning(): boolean {
    return this.isRiskApiRunning || this.isClassificationApiRunning;
  }
  
  isRiskApiActive(): boolean {
    return this.isRiskApiRunning;
  }
  
  isClassificationApiActive(): boolean {
    return this.isClassificationApiRunning;
  }

  /**
   * Obtém URLs das APIs
   */
  getAPIUrl(): string {
    return this.riskApiUrl;
  }
  
  getRiskApiUrl(): string {
    return this.riskApiUrl;
  }
  
  getClassificationApiUrl(): string {
    return this.classificationApiUrl;
  }

  /**
   * Helper: sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Registra handlers de shutdown gracioso
   */
  registerShutdownHandlers(): void {
    const shutdown = () => {
      console.log('');
      console.log('🔄 Shutdown gracioso iniciado...');
      this.stop();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('exit', () => this.stop());

    // Windows Ctrl+C
    if (process.platform === 'win32') {
      require('readline')
        .createInterface({
          input: process.stdin,
          output: process.stdout,
        })
        .on('SIGINT', shutdown);
    }
  }
}

// Export singleton
export default new MLProcessManager();

