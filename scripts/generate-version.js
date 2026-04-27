const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
  const version = { commitHash, buildDate: new Date().toISOString() };
  fs.writeFileSync(
    path.join(__dirname, '..', 'public', 'version.json'),
    JSON.stringify(version, null, 2)
  );
  console.log('✅ version.json gerado:', commitHash.substring(0, 7));
} catch {
  const version = { commitHash: `build-${Date.now()}`, buildDate: new Date().toISOString() };
  fs.writeFileSync(
    path.join(__dirname, '..', 'public', 'version.json'),
    JSON.stringify(version, null, 2)
  );
  console.log('✅ version.json gerado com hash de fallback');
}
