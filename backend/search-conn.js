
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');

function searchFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            searchFiles(fullPath);
        } else if (file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (line.includes('connection') && !line.includes('mysqlClient') && !line.includes('testMysqlConnection') && !line.includes('//')) {
                    console.log(`${fullPath}:${index + 1}: ${line.trim()}`);
                }
            });
        }
    }
}

console.log('--- Searching for "connection" (excluding comments and config) ---');
searchFiles(srcDir);
