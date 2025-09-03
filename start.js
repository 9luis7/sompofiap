#!/usr/bin/env node

/**
 * 🚀 Sompo Monitoring System - Universal Setup Script
 * Detecta automaticamente o sistema operacional e executa o script apropriado
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
    bold: '\x1b[1m'
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
    log(`📱 ${message}`, 'cyan');
}

function logStatus(step, message) {
    log(`[${step}/5] ${message}`, 'blue');
}

// Detectar sistema operacional
function detectOS() {
    const platform = os.platform();
    const arch = os.arch();
    
    log('🔍 Detectando sistema operacional...', 'cyan');
    
    if (platform === 'win32') {
        if (process.env.POWERSHELL_PATH || process.env.PSModulePath) {
            log('Windows detectado - Usando PowerShell', 'green');
            return 'powershell';
        } else {
            log('Windows detectado - Usando CMD', 'green');
            return 'cmd';
        }
    } else if (platform === 'darwin') {
        log('macOS detectado', 'green');
        return 'macos';
    } else if (platform === 'linux') {
        log('Linux detectado', 'green');
        return 'linux';
    } else {
        logWarning(`Sistema não suportado: ${platform}`);
        return 'unknown';
    }
}

// Verificar dependências
function checkDependencies() {
    logStatus(1, 'Verificando Node.js...');
    try {
        const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
        logSuccess(`Node.js encontrado: ${nodeVersion}`);
    } catch (error) {
        logError('Node.js não encontrado!');
        log('Por favor, instale o Node.js em: https://nodejs.org/', 'yellow');
        process.exit(1);
    }

    logStatus(2, 'Verificando Python...');
    try {
        let pythonCmd = 'python';
        let pythonVersion;
        
        try {
            pythonVersion = execSync('python3 --version', { encoding: 'utf8' }).trim();
            pythonCmd = 'python3';
        } catch {
            pythonVersion = execSync('python --version', { encoding: 'utf8' }).trim();
        }
        
        logSuccess(`Python encontrado: ${pythonVersion}`);
        return pythonCmd;
    } catch (error) {
        logError('Python não encontrado!');
        log('Por favor, instale o Python em: https://python.org/', 'yellow');
        process.exit(1);
    }
}

// Instalar dependências
function installDependencies(pythonCmd) {
    logStatus(3, 'Instalando dependências Node.js...');
    if (!fs.existsSync('node_modules')) {
        log('📦 Instalando dependências...', 'yellow');
        try {
            execSync('npm install', { stdio: 'inherit' });
            logSuccess('Dependências Node.js instaladas');
        } catch (error) {
            logError('Erro ao instalar dependências Node.js');
            process.exit(1);
        }
    } else {
        logSuccess('Dependências Node.js já instaladas');
    }

    logStatus(4, 'Instalando dependências Python...');
    log('📦 Instalando ferramentas de qualidade Python...', 'yellow');
    try {
        execSync(`${pythonCmd} -m pip install flake8 black isort`, { stdio: 'inherit' });
        logSuccess('Dependências Python instaladas');
    } catch (error) {
        logError('Erro ao instalar dependências Python');
        process.exit(1);
    }
}

// Verificar qualidade do código
function checkCodeQuality() {
    logStatus(5, 'Verificando qualidade do código...');
    log('🔍 Executando linters...', 'yellow');
    
    try {
        execSync('npm run quality', { stdio: 'inherit' });
        logSuccess('Código verificado com sucesso');
    } catch (error) {
        logWarning('Alguns problemas de qualidade encontrados');
        log('Executando correções automáticas...', 'yellow');
        
        try {
            execSync('npm run lint', { stdio: 'inherit' });
            execSync('npm run format', { stdio: 'inherit' });
        } catch (fixError) {
            logWarning('Não foi possível corrigir automaticamente');
        }
    }
}

// Executar script apropriado para o sistema
function runSystemScript(system) {
    const scripts = {
        'powershell': 'start.ps1',
        'cmd': 'start.bat',
        'macos': 'start.sh',
        'linux': 'start.sh'
    };
    
    const script = scripts[system];
    if (!script) {
        logError('Sistema não suportado');
        process.exit(1);
    }
    
    if (!fs.existsSync(script)) {
        logError(`Script ${script} não encontrado`);
        process.exit(1);
    }
    
    log('🚀 Executando script do sistema...', 'cyan');
    
    try {
        if (system === 'powershell') {
            execSync(`powershell -ExecutionPolicy Bypass -File "${script}"`, { stdio: 'inherit' });
        } else if (system === 'cmd') {
            execSync(`"${script}"`, { stdio: 'inherit' });
        } else {
            // Unix-like systems
            execSync(`chmod +x "${script}" && ./"${script}"`, { stdio: 'inherit' });
        }
    } catch (error) {
        logError(`Erro ao executar ${script}`);
        log('Execute manualmente:', 'yellow');
        log('Terminal 1: npm run backend', 'yellow');
        log('Terminal 2: npm run frontend', 'yellow');
    }
}

// Função principal
function main() {
    log('', 'reset');
    log('========================================', 'cyan');
    log('  🚀 SOMPO MONITORING SYSTEM', 'yellow');
    log('========================================', 'cyan');
    log('', 'reset');
    log('Iniciando configuração automática...', 'green');
    log('', 'reset');
    
    try {
        const system = detectOS();
        const pythonCmd = checkDependencies();
        installDependencies(pythonCmd);
        checkCodeQuality();
        
        log('', 'reset');
        log('========================================', 'cyan');
        log('   🎉 CONFIGURAÇÃO CONCLUÍDA!', 'green');
        log('========================================', 'cyan');
        log('', 'reset');
        log('Executando script do sistema...', 'green');
        log('', 'reset');
        
        runSystemScript(system);
        
    } catch (error) {
        logError('Erro durante a configuração:');
        log(error.message, 'red');
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = { main, detectOS, checkDependencies, installDependencies, checkCodeQuality };
