#!/usr/bin/env node
/**
 * Create a stub keytar module to avoid libsecret-1.so.0 dependency error
 * This script creates a fake keytar module that exports empty functions
 * to prevent build failures when keytar cannot load due to missing libsecret
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
const keytarIndexPath = path.join(keytarPath, 'lib', 'keytar.node');
const keytarPackageJson = path.join(keytarPath, 'package.json');

// Check if keytar can be loaded
try {
  require('keytar');
  console.log('keytar loaded successfully, no stub needed');
  process.exit(0);
} catch (error) {
  if (error.code === 'ERR_DLOPEN_FAILED' || 
      error.message.includes('libsecret') || 
      error.message.includes('libsecret-1.so.0') ||
      error.message.includes('cannot open shared object file')) {
    console.log('keytar failed to load due to missing libsecret, creating stub...');
    
    // Create stub directory if it doesn't exist
    const stubDir = path.dirname(keytarLibPath);
    if (!fs.existsSync(stubDir)) {
      fs.mkdirSync(stubDir, { recursive: true });
    }
    
    // Backup the original .node file if it exists (native module)
    if (fs.existsSync(keytarIndexPath)) {
      try {
        const backupPath = keytarIndexPath + '.backup';
        if (!fs.existsSync(backupPath)) {
          fs.renameSync(keytarIndexPath, backupPath);
          console.log('Backed up original keytar.node file');
        }
      } catch (e) {
        // Ignore backup errors
      }
    }
    
    // Create a stub keytar module that exports the same API
    const stubCode = `// Stub keytar module - created to avoid libsecret-1.so.0 dependency
// This is a no-op implementation for build environments without libsecret
// Original keytar is a native module that requires libsecret system library

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
  } else {
    // Some other error, don't interfere
    console.log('keytar error (not libsecret related):', error.message);
    process.exit(0);
  }
}
