#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Smart Construction Monitoring System...\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Start backend server
log('📡 Starting Backend Server (Port 3000)...', 'blue');
const backend = spawn('npm', ['start'], {
  cwd: process.cwd(),
  stdio: 'pipe',
  shell: true
});

backend.stdout.on('data', (data) => {
  log(`[Backend] ${data.toString().trim()}`, 'green');
});

backend.stderr.on('data', (data) => {
  log(`[Backend Error] ${data.toString().trim()}`, 'red');
});

backend.on('close', (code) => {
  log(`[Backend] Process exited with code ${code}`, 'yellow');
});

// Wait a bit for backend to start, then start frontend
setTimeout(() => {
  log('🎨 Starting Frontend Server (Port 4028)...', 'magenta');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(process.cwd(), 'frontend', 'Smaretsite-frontend'),
    stdio: 'pipe',
    shell: true
  });

  frontend.stdout.on('data', (data) => {
    log(`[Frontend] ${data.toString().trim()}`, 'cyan');
  });

  frontend.stderr.on('data', (data) => {
    log(`[Frontend Error] ${data.toString().trim()}`, 'red');
  });

  frontend.on('close', (code) => {
    log(`[Frontend] Process exited with code ${code}`, 'yellow');
  });

  // Handle process termination
  process.on('SIGINT', () => {
    log('\n🛑 Shutting down servers...', 'yellow');
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log('\n🛑 Shutting down servers...', 'yellow');
    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');
    process.exit(0);
  });

}, 2000);

// Show startup info
setTimeout(() => {
  log('\n✅ System is starting up!', 'green');
  log('📊 Backend API: http://localhost:3000', 'blue');
  log('🎨 Frontend: http://localhost:4028', 'magenta');
  log('📚 API Documentation: http://localhost:3000/health', 'cyan');
  log('\n💡 Press Ctrl+C to stop all servers', 'yellow');
}, 3000); 