#!/usr/bin/env node
/** Applies schema.sql + seed.sql to the local cluster. */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

function findPgBin() {
  if (process.env.PGBIN) {
    return process.env.PGBIN;
  }
  try {
    const initdbPath = execSync('which initdb', { encoding: 'utf8' }).trim();
    return path.dirname(initdbPath);
  } catch (e) {
    const commonPaths = [
      '/opt/homebrew/opt/postgresql@16/bin',
      '/usr/local/bin',
      '/usr/lib/postgresql/16/bin',
      '/usr/lib/postgresql/15/bin',
      '/usr/lib/postgresql/14/bin',
    ];
    for (const p of commonPaths) {
      if (existsSync(path.join(p, 'initdb'))) {
        return p;
      }
    }
  }
  throw new Error('Could not find PostgreSQL binaries. Install PostgreSQL 14+ or set PGBIN.');
}

const PGBIN = findPgBin();
const psql = path.join(PGBIN, 'psql');

const schema = path.join(projectRoot, 'db', 'schema.sql');
const seed = path.join(projectRoot, 'db', 'seed.sql');

execSync(`${psql} -h 127.0.0.1 -p 5433 -U focuskids -d focuskids -q -f ${schema}`, { stdio: 'inherit' });
execSync(`${psql} -h 127.0.0.1 -p 5433 -U focuskids -d focuskids -q -f ${seed}`, { stdio: 'inherit' });
console.log('Schema + seed applied.');
