#!/usr/bin/env node
/**
 * Manages the local PostgreSQL 16 cluster used by Focus Kids.
 * Runs on port 5433 with user `focuskids` (trust auth) so no sudo / passwords are needed.
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const pgData = path.join(projectRoot, 'pgdata');
const logFile = path.join(pgData, 'postgres.log');
const PORT = 5433;

const PGBIN = process.env.PGBIN || '/usr/lib/postgresql/16/bin';
const pgctl = path.join(PGBIN, 'pg_ctl');
const initdb = path.join(PGBIN, 'initdb');
const psql = path.join(PGBIN, 'psql');
const createdb = path.join(PGBIN, 'createdb');
const pgIsReady = path.join(PGBIN, 'pg_isready');

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  try {
    return execSync(cmd, { stdio: 'inherit', shell: true, ...opts });
  } catch (e) {
    if (opts.ignoreError) return '';
    process.exit(1);
  }
}

const PGO = `-p ${PORT} -c listen_addresses=127.0.0.1 -c unix_socket_directories=${pgData}`;

const cmd = process.argv[2] || 'start';

switch (cmd) {
  case 'init':
    if (existsSync(path.join(pgData, 'PG_VERSION'))) {
      console.log('Cluster already initialized.');
    } else {
      mkdirSync(pgData, { recursive: true });
      run(`${initdb} -D ${pgData} -U focuskids --auth=trust -E UTF8 --locale=C`);
    }
    run(`"${pgctl}" -D ${pgData} -l ${logFile} -o "${PGO}" start`, { ignoreError: true });
    run(`${psql} -h 127.0.0.1 -p ${PORT} -U focuskids -lqt | cut -d\\| -f1 | grep -qw focuskids || ${createdb} -h 127.0.0.1 -p ${PORT} -U focuskids focuskids`, { shell: true });
    console.log('Database cluster ready on port', PORT);
    break;
  case 'start':
    run(`"${pgctl}" -D ${pgData} -l ${logFile} -o "${PGO}" start`, { ignoreError: true });
    break;
  case 'stop':
    run(`"${pgctl}" -D ${pgData} stop`, { ignoreError: true });
    break;
  case 'status':
    run(`${pgIsReady} -h 127.0.0.1 -p ${PORT}`);
    break;
  default:
    console.log('Usage: db-cluster.mjs [init|start|stop|status]');
}
