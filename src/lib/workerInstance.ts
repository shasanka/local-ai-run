import { Worker } from 'node:worker_threads';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const worker = new Worker(path.resolve(__dirname, '../Utils/worker.ts'), {
    execArgv: ['--experimental-strip-types']
});