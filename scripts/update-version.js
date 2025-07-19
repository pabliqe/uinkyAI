import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Calculate new version
const getNewVersion = () => {
  // Start with base version
  const baseVersion = '1.0.';
  
  // Use current date components to create a unique build number
  const date = new Date();
  const buildNumber = date.getDate(); // Use day of month as patch version
  
  return `${baseVersion}${buildNumber}`;
};

// Path to version file
const versionFilePath = path.join(__dirname, '../src/config/version.ts');

// Create version file content
const versionFileContent = `// Auto-generated version file - ${new Date().toISOString()}
export const APP_VERSION = '${getNewVersion()}';
`;

// Write the file
fs.writeFileSync(versionFilePath, versionFileContent);

console.log(`✅ Version updated to ${getNewVersion()}`);