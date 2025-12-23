#!/usr/bin/env node

/**
 * Prepare packages for npm publishing
 * - Ensures publishConfig is set
 * - Warns about workspace dependencies
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const packages = [
  'packages/core',
  'packages/webcomponent',
  'packages/react',
  'packages/vue'
];

console.log('🔍 Checking packages for npm publishing...\n');

let hasIssues = false;

for (const pkg of packages) {
  const pkgPath = join(rootDir, pkg, 'package.json');
  let pkgJson;

  try {
    pkgJson = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  } catch (err) {
    console.error(`❌ Failed to read ${pkg}/package.json`);
    continue;
  }

  console.log(`📦 ${pkgJson.name}`);

  // Check if private
  if (pkgJson.private === true) {
    console.log(`   ⚠️  Package is marked as private - won't be published`);
    hasIssues = true;
  }

  // Check publishConfig
  if (!pkgJson.publishConfig) {
    console.log(`   ⚠️  Missing publishConfig, adding...`);
    pkgJson.publishConfig = { access: 'public' };
    writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n');
  } else if (pkgJson.publishConfig.access !== 'public') {
    console.log(`   ⚠️  publishConfig.access is not "public"`);
    hasIssues = true;
  }

  // Check for workspace dependencies
  const deps = { ...pkgJson.dependencies, ...pkgJson.peerDependencies };
  for (const [dep, version] of Object.entries(deps)) {
    if (version === '*') {
      console.log(`   ⚠️  Dependency "${dep}" uses "*" version - update to "^${pkgJson.version}" before publishing`);
      hasIssues = true;
    }
  }

  // Check required fields
  const requiredFields = ['name', 'version', 'description', 'license', 'repository'];
  for (const field of requiredFields) {
    if (!pkgJson[field]) {
      console.log(`   ❌ Missing required field: ${field}`);
      hasIssues = true;
    }
  }

  console.log(`   ✅ Ready for publishing\n`);
}

if (hasIssues) {
  console.log('⚠️  Some issues were found. Please review before publishing.\n');
  process.exit(1);
} else {
  console.log('✅ All packages are ready for publishing!\n');
}