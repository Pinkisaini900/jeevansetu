import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'server', '.env');
if (fs.existsSync(target)) {
  console.log('server/.env already exists - leaving it untouched.');
} else {
  fs.copyFileSync(path.join(root, '.env.example'), target);
  console.log('Created server/.env from .env.example');
}
