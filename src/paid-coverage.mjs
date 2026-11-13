// Adapted from Cortevia's subscription coverage check for this public sample.
export async function paidCoverage(db, subscription, date, {
  requireInvoice = false,
  environment = null,
} = {}) {
  const eligibleStatuses = ['active', 'past_due', 'canceled'];
  if (!subscription || !eligibleStatuses.includes(subscription.status)
      || !subscription.paid_through || subscription.paid_through < date) {
    return false;
  }

  const order = db.prepare(
    'SELECT id, environment FROM payment_orders WHERE subscription_id = ? AND shop_id = ?',
  ).get(subscription.id, subscription.shop_id);
  if (!order) {
    return environment !== 'production' && !requireInvoice && subscription.status !== 'canceled';
  }
  if (environment && order.environment !== environment) {
    return false;
  }

  const invoice = db.prepare(`
    SELECT 1 FROM payment_invoices
    WHERE order_id = ? AND state = 'paid' AND period_start <= ? AND period_end >= ?
    LIMIT 1
  `).get(order.id, date, date);
  return Boolean(invoice);
}
