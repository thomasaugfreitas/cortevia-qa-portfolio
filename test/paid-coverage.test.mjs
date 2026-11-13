import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { paidCoverage } from '../src/paid-coverage.mjs';

const visitDate = '2026-11-10';
const subscription = {
  id: 'example-subscription',
  shop_id: 'example-shop',
  status: 'active',
  paid_through: '2026-11-30',
};

function createFixture(t, { environment = 'production', state = 'paid' } = {}) {
  const db = new DatabaseSync(':memory:');
  t.after(() => db.close());
  db.exec(`
    CREATE TABLE payment_orders (id TEXT PRIMARY KEY, subscription_id TEXT, shop_id TEXT, environment TEXT);
    CREATE TABLE payment_invoices (order_id TEXT, state TEXT, period_start TEXT, period_end TEXT);
  `);
  db.prepare('INSERT INTO payment_orders VALUES (?, ?, ?, ?)').run(
    'example-order', subscription.id, subscription.shop_id, environment,
  );
  if (state) {
    db.prepare('INSERT INTO payment_invoices VALUES (?, ?, ?, ?)').run(
      'example-order', state, '2026-11-01', '2026-11-30',
    );
  }
  return db;
}

test('A production order without a paid invoice grants no coverage', async t => {
  const db = createFixture(t, { state: null });
  assert.equal(await paidCoverage(db, subscription, visitDate, { environment: 'production' }), false);
});

test('A paid invoice grants coverage for the matching period', async t => {
  const db = createFixture(t);
  assert.equal(await paidCoverage(db, subscription, visitDate, { environment: 'production' }), true);
});

test('A refunded invoice grants no coverage', async t => {
  const db = createFixture(t, { state: 'refunded' });
  assert.equal(await paidCoverage(db, subscription, visitDate, { environment: 'production' }), false);
});

test('A Sandbox payment cannot grant production coverage', async t => {
  const db = createFixture(t, { environment: 'sandbox' });
  assert.equal(await paidCoverage(db, subscription, visitDate, { environment: 'production' }), false);
});

test('Coverage ends after the paid period', async t => {
  const db = createFixture(t);
  assert.equal(await paidCoverage(db, subscription, '2026-11-30', { environment: 'production' }), true);
  assert.equal(await paidCoverage(db, subscription, '2026-12-01', { environment: 'production' }), false);
});
