const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Make vite executable
  const vitePath = path.join(__dirname, 'node_modules/.bin/vite');
  if (fs.existsSync(vitePath)) {
    fs.chmodSync(vitePath, '755');
  }
  
  // Run build
  console.log('Running vite build...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
