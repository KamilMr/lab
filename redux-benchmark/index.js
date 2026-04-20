import {spawnSync} from 'node:child_process';
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const scenariosDir = join(__dirname, 'scenarios');
const files = readdirSync(scenariosDir).filter(f => f.endsWith('.js')).sort();

for (const f of files) {
  spawnSync('node', [join(scenariosDir, f)], {stdio: 'inherit'});
}
