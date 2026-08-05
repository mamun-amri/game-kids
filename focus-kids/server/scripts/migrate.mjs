#!/usr/bin/env node
/** Applies schema.sql + seed.sql to the local cluster. */
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const PGBIN = process.env.PGBIN || '/usr/lib/postgresql/16/bin';
const psql = path.join(PGBIN, 'psql');

const schema = path.join(projectRoot, 'db', 'schema.sql');
const seed = path.join(projectRoot, 'db', 'seed.sql');

execSync(`${psql} -h 127.0.0.1 -p 5433 -U focuskids -d focuskids -q -f ${schema}`, { stdio: 'inherit' });
execSync(`${psql} -h 127.0.0.1 -p 5433 -U focuskids -d focuskids -q -f ${seed}`, { stdio: 'inherit' });
console.log('Schema + seed applied.');
