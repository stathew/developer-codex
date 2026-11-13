#!/usr/bin/env node
// Runs the content indexer in watch mode alongside `ng serve`. Extra args are forwarded to ng serve.
import { spawn } from 'node:child_process';

const opts = { stdio: 'inherit', shell: true };
const children = [
  spawn('node scripts/build-content.mjs --watch', opts),
  spawn(`npx ng serve ${process.argv.slice(2).join(' ')}`, opts),
];

const stop = () => children.forEach((c) => c.kill());
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
children.forEach((c) => c.on('exit', (code) => { stop(); process.exitCode = code ?? 0; }));
