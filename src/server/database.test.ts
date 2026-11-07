import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { SmiteDatabase } from './database';
import { CoreRunner } from './coreRunner';

test('SmiteDatabase: initializes SQLite tables and seeds default records', () => {
  const tmpDbPath = path.join(os.tmpdir(), `smite_test_${Date.now()}.db`);
  const db = new SmiteDatabase(tmpDbPath);

  const nodes = db.getNodes();
  assert.equal(nodes.length >= 4, true);

  const tunnels = db.getTunnels();
  assert.equal(tunnels.length >= 5, true);

  // Test inserting and reading back a new node
  db.insertNode({
    id: 'test-node-sqlite-1',
    name: 'IR-Isfahan-SQLite-Node',
    fingerprint: 'fp_sqlite_test_999',
    type: 'iran',
    status: 'online',
    ip: '185.10.20.30',
    port: 3080,
    country: 'Iran',
    registered_at: new Date().toISOString(),
    last_seen: new Date().toISOString(),
    cpu_usage: 10,
    memory_usage: 20,
    active_tunnels_count: 1,
    traffic_in: 1024,
    traffic_out: 2048,
    version: '0.1.2',
  });

  const fetched = db.getNodeById('test-node-sqlite-1');
  assert.equal(fetched?.name, 'IR-Isfahan-SQLite-Node');
  assert.equal(fetched?.ip, '185.10.20.30');

  // Test deleting node
  const deleted = db.deleteNode('test-node-sqlite-1');
  assert.equal(deleted, true);
  assert.equal(db.getNodeById('test-node-sqlite-1'), undefined);

  db.close();
  if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath);
});

test('CoreRunner: detects all 5 real downloaded binaries in /cores/', () => {
  const tmpDbPath = path.join(os.tmpdir(), `smite_cores_${Date.now()}.db`);
  const db = new SmiteDatabase(tmpDbPath);
  const runner = new CoreRunner(db);

  const binaries = runner.detectBinaries();
  assert.equal(binaries.backhaul.installed, true);
  assert.equal(binaries.rathole.installed, true);
  assert.equal(binaries.gost.installed, true);
  assert.equal(binaries.chisel.installed, true);
  assert.equal(binaries.frp.installed, true);

  assert.match(binaries.backhaul.version, /0\.7\.2/);
  assert.match(binaries.rathole.version, /0\.5\.0/);

  db.close();
  if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath);
});
