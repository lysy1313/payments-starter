CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit_amount INTEGER NOT NULL CHECK (unit_amount > 0),
  currency TEXT NOT NULL CHECK (currency = 'USD'),
  active BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO products (id, name, unit_amount, currency)
VALUES ('one-time', 'Разовая покупка', 4500, 'USD');

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_amount INTEGER NOT NULL CHECK (unit_amount > 0),
  currency TEXT NOT NULL CHECK (currency = 'USD'),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO orders (id, product_id, quantity, unit_amount, currency ) VALUES ('order-demo-1', 'one-time', 2, 4500,'USD')

CREATE TABLE payment_attempts (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  provider TEXT NOT NULL CHECK (provider = 'stripe'),
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'pending', 'succeeded', 'failed', 'expired')),
  idempotency_key TEXT UNIQUE NOT NULL,
  provider_session_id	TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
