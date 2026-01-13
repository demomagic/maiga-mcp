#!/usr/bin/env node
/**
 * Create a stub keytar module to avoid libsecret-1.so.0 dependency error
 * This script replaces keytar.js with a stub implementation that doesn't
 * require the native module, preventing build failures in environments without libsecret
 */

const fs = require('fs');
const path = require('path');

// Find keytar in node_modules (could be in @smithery/cli or nested)
function findKeytarPath() {
  const possiblePaths = [
    path.join(__dirname, '..', 'node_modules', 'keytar'),
    path.join(__dirname, '..', 'node_modules', '@smithery', 'cli', 'node_modules', 'keytar'),
  ];
  
  for (const keytarPath of possiblePaths) {
    if (fs.existsSync(keytarPath)) {
      return keytarPath;
    }
  }
  return null;
}

const keytarPath = findKeytarPath();

if (!keytarPath) {
  console.log('keytar not found in node_modules, skipping stub creation');
  process.exit(0);
}

const keytarLibPath = path.join(keytarPath, 'lib', 'keytar.js');

// Check if the file already exists and is our stub
if (fs.existsSync(keytarLibPath)) {
  const content = fs.readFileSync(keytarLibPath, 'utf8');
  if (content.includes('Stub keytar module')) {
    console.log('keytar stub already exists, skipping');
    process.exit(0);
  }
}

// Try to load keytar to see if it works
let needsStub = false;
try {
  require('keytar');
  console.log('keytar loaded successfully, no stub needed');
  process.exit(0);
} catch (error) {
  if (error.code === 'ERR_DLOPEN_FAILED' || 
      error.message.includes('libsecret') || 
      error.message.includes('libsecret-1.so.0') ||
      error.message.includes('cannot open shared object file')) {
    needsStub = true;
  } else {
    // Some other error - might be that keytar isn't installed yet
    // Create stub proactively to prevent future errors
    needsStub = true;
  }
}

if (needsStub) {
  console.log('Creating keytar stub to avoid libsecret dependency...');
  
  // Create stub directory if it doesn't exist
  const stubDir = path.dirname(keytarLibPath);
  if (!fs.existsSync(stubDir)) {
    fs.mkdirSync(stubDir, { recursive: true });
  }
  
  // Backup the original keytar.js file if it exists and isn't already a stub
  const backupPath = keytarLibPath + '.backup';
  if (fs.existsSync(keytarLibPath) && !fs.existsSync(backupPath)) {
    try {
      fs.copyFileSync(keytarLibPath, backupPath);
      console.log('Backed up original keytar.js file');
    } catch (e) {
      // Ignore backup errors
    }
  }
  
  // Create a stub keytar module that exports the same API
  // This replaces the original keytar.js which tries to load the native module
  const stubCode = `// Stub keytar module - created to avoid libsecret-1.so.0 dependency
// This is a no-op implementation for build environments without libsecret
// Original keytar is a native module that requires libsecret system library
// This stub is created by scripts/create-keytar-stub.cjs during postinstall

module.exports = {
  getPassword: async () => null,
  setPassword: async () => {},
  deletePassword: async () => false,
  findPassword: async () => null,
  findCredentials: async () => []
};
`;
  
  try {
    fs.writeFileSync(keytarLibPath, stubCode, 'utf8');
    console.log('keytar stub created successfully at:', keytarLibPath);
    process.exit(0);
  } catch (writeError) {
    console.warn('Failed to create keytar stub:', writeError.message);
    // Don't fail the build if we can't create the stub
    process.exit(0);
  }
}
