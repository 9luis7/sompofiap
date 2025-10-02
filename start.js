#!/usr/bin/env node

/**
 * 🚀 Sompo Monitoring System - Script Universal de Inicialização
 * 
 * Este script substitui todos os outros scripts de inicialização:
 * - start.bat, start.ps1, start.sh
 * - start-complete.bat, start-unified.bat, etc.
 * - start-clean.bat, start-cmd-only.bat, etc.
 * 
 * Funcionalidades:
 * - Detecção automática do sistema operacional
 * - Verificação e instalação de dependências
 * - Compilação do backend se necessário
 * - Inicialização de backend + frontend
 * - Abertura automática do navegador
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Cores para output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function logStep(step, total, message) {
    log(`[${step}/${total}] ${message}`, 'cyan');
}

// Detectar sistema operacional
const platform = os.platform();
const isWindows = platform === 'win32';
const isMac = platform === 'darwin';
const isLinux = platform === 'linux';

// Configurações do sistema
const config = {
    backend: {
        port: 3001,
        path: 'backend',
        devCommand: isWindows ? 'npm run dev' : 'npm run dev'
    },
    frontend: {
        port: 3000,
        path: '.',
        devCommand: 'npm run frontend'
    },
    urls: {
        backend: `http://localhost:3001`,
        frontend: `http://localhost:3000`
    }
};

// Função para executar comando
function executeCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, options.shell ? [] : command.split(' '), {
            shell: options.shell || true,
            stdio: options.silent ? 'pipe' : 'inherit',
            cwd: options.cwd || process.cwd()
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });

        child.on('error', reject);
    });
}

// Função para verificar se comando existe
function commandExists(command) {
    try {
        if (isWindows) {
            execSync(`where ${command}`, { stdio: 'ignore' });
        } else {
            execSync(`which ${command}`, { stdio: 'ignore' });
        }
        return true;
    } catch {
        return false;
    }
}

// Função para verificar versão
function getVersion(command) {
    try {
        return execSync(`${command} --version`, { encoding: 'utf8' }).trim();
    } catch {
        return null;
    }
}

// Função para liberar porta
function killPort(port) {
    try {
        if (isWindows) {
            execSync(`netstat -ano | findstr ":${port}"`, { stdio: 'pipe' });
            // Implementar kill para Windows se necessário
        } else {
            execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'pipe' });
        }
    } catch {
        // Porta não está em uso ou erro ao liberar
    }
}

// Função para abrir URL no navegador
function openBrowser(url) {
    const command = isWindows ? 'start' : isMac ? 'open' : 'xdg-open';
    try {
        spawn(command, [url], { detached: true, stdio: 'ignore' });
    } catch (error) {
        logWarning(`Não foi possível abrir o navegador automaticamente: ${error.message}`);
    }
}

// Função principal
async function main() {
    console.clear();
    
    log('='.repeat(50), 'cyan');
    log('🚀 SOMPO MONITORING SYSTEM - INICIALIZAÇÃO', 'bold');
    log('='.repeat(50), 'cyan');
    log('');
    log(`Sistema: ${platform} ${os.arch()}`, 'blue');
    log(`Node.js: ${process.version}`, 'blue');
    log('');

    try {
        // Passo 1: Verificar Node.js
        logStep(1, 6, 'Verificando Node.js...');
        if (!commandExists('node')) {
            throw new Error('Node.js não encontrado! Instale em: https://nodejs.org/');
        }
        const nodeVersion = getVersion('node');
        logSuccess(`Node.js encontrado: ${nodeVersion}`);

        // Passo 2: Verificar npm
        logStep(2, 6, 'Verificando npm...');
        if (!commandExists('npm')) {
            throw new Error('npm não encontrado!');
        }
        const npmVersion = getVersion('npm');
        logSuccess(`npm encontrado: ${npmVersion}`);

        // Passo 3: Instalar dependências principais
        logStep(3, 6, 'Verificando dependências principais...');
        if (!fs.existsSync('node_modules')) {
            logWarning('Instalando dependências principais...');
            await executeCommand('npm install');
            logSuccess('Dependências principais instaladas!');
        } else {
            logSuccess('Dependências principais já instaladas');
        }

        // Passo 4: Instalar dependências do backend
        logStep(4, 6, 'Verificando dependências do backend...');
        if (!fs.existsSync(path.join('backend', 'node_modules'))) {
            logWarning('Instalando dependências do backend...');
            await executeCommand('npm install', { cwd: 'backend' });
            logSuccess('Dependências do backend instaladas!');
        } else {
            logSuccess('Dependências do backend já instaladas');
        }

        // Passo 5: Compilar backend
        logStep(5, 6, 'Compilando backend...');
        if (!fs.existsSync(path.join('backend', 'dist'))) {
            logWarning('Compilando TypeScript...');
            await executeCommand('npm run build', { cwd: 'backend' });
            logSuccess('Backend compilado com sucesso!');
        } else {
            logSuccess('Backend já compilado');
        }

        // Passo 6: Liberar portas
        logStep(6, 6, 'Liberando portas...');
        killPort(config.backend.port);
        killPort(config.frontend.port);
        logSuccess('Portas liberadas');

        // Iniciar sistema
        log('');
        log('='.repeat(50), 'cyan');
        log('🚀 INICIANDO SISTEMA COMPLETO', 'bold');
        log('='.repeat(50), 'cyan');
        log('');
        logSuccess(`Backend: ${config.urls.backend}`);
        logSuccess(`Frontend: ${config.urls.frontend}`);
        log('');
        logInfo('Credenciais de Demo:');
        log('   Usuário: admin.sompo', 'yellow');
        log('   Senha: password123', 'yellow');
        log('');
        logWarning('Aguardando servidores iniciarem...');
        log('');

        // Abrir navegador após delay
        setTimeout(() => {
            logInfo('Abrindo navegador...');
            openBrowser(config.urls.frontend);
        }, 8000);

        // Verificar se concurrently está disponível
        let useConcurrently = true;
        try {
            execSync('npx concurrently --version', { stdio: 'pipe' });
        } catch {
            useConcurrently = false;
            logWarning('concurrently não encontrado, usando método alternativo...');
        }

        if (useConcurrently) {
            // Usar concurrently para executar ambos os servidores
            log('🎯 Iniciando Backend + Frontend (mesmo terminal)...');
            await executeCommand(
                `npx concurrently --kill-others "cd backend && npm run dev" "npm run frontend"`,
                { shell: true }
            );
        } else {
            // Método alternativo: iniciar backend em background e frontend em foreground
            log('🎯 Iniciando Backend em background...');
            const backendProcess = spawn('npm', ['run', 'dev'], {
                cwd: 'backend',
                stdio: 'pipe',
                detached: true
            });

            // Aguardar backend iniciar
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            log('🎯 Iniciando Frontend...');
            await executeCommand('npm run frontend');
        }

    } catch (error) {
        logError(`Erro: ${error.message}`);
        log('');
        logInfo('Para resolver problemas:');
        log('1. Verifique se Node.js está instalado', 'yellow');
        log('2. Verifique sua conexão com a internet', 'yellow');
        log('3. Execute como administrador (Windows)', 'yellow');
        log('4. Verifique se as portas 3000 e 3001 estão livres', 'yellow');
        log('');
        process.exit(1);
    }
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
    main().catch(error => {
        logError(`Erro fatal: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { main };