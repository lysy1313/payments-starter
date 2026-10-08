import { Router } from "express";
import { randomUUID } from "node:crypto";
import { sql } from "../db/client.js";

export const ordersRouter = Router();

ordersRouter.post("/orders", async (req, res) => {
  const body = req.body;

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    res.status(400).json({ error: "Ожидался JSON-объект" });
    return;
  }

  if (
    typeof body.productId !== "string" ||
    body.productId.trim().length === 0 ||
    !Number.isInteger(body.quantity) ||
    body.quantity < 1 ||
    body.quantity > 100
  ) {
    res.status(400).json({ error: "Некорректные данные" });
    return;
  }

  const productId = body.productId.trim();
  const quantity = body.quantity;
  const orderId = randomUUID();

  const orders = await sql`
  INSERT INTO orders (
    id, product_id, quantity, unit_amount, currency
  )
  SELECT ${orderId}, id, ${quantity}, unit_amount, currency FROM products
  WHERE id = ${productId} AND active = true
  RETURNING id, product_id, quantity, unit_amount, currency, status, created_at
`;

  const order = orders[0];

  if (!order) {
    res.status(404).json({ error: "Товар не найден или недоступен" });
    return;
  }

  res.status(201).json({ order });
});

ordersRouter.get("/orders/:id", async (req, res) => {
  const orderId = req.params.id;

  const orders = await sql`
    SELECT id, product_id, quantity, unit_amount, currency, status, created_at FROM orders WHERE  id = ${orderId}
  `;

  const order = orders[0];

  if (!order) {
    res.status(404).json({ error: "Не найден заказ" });
    return;
  }

  res.status(200).json({ order });
});

ordersRouter.post("/orders/:id/payment-attempts", async (req, res) => {
  const orderId = req.params.id;
  const attemptId = randomUUID();
  const idempotencyKey = randomUUID();

  const attempts = await sql`
    INSERT INTO payment_attempts (
      id, order_id, provider, idempotency_key
    )
    SELECT
      ${attemptId}, id, 'stripe', ${idempotencyKey}
    FROM orders
    WHERE id = ${orderId}
      AND status = 'pending'
    RETURNING
      id, order_id, provider, status,
      idempotency_key, provider_session_id, created_at;
  `;

  const attempt = attempts[0];

  if (attempt) {
    res.status(201).json({ attempt });
    return;
  }

  const orders = await sql`
    SELECT id
    FROM orders
    WHERE id = ${orderId};
  `;

  const order = orders[0];

  if (!order) {
    res.status(404).json({ error: "Заказ не найден" });
    return;
  }

  res.status(409).json({ error: "Заказ недоступен для оплаты" });
});

ordersRouter.get("/orders/:id/payment-attempts", async (req, res) => {
  const orderId = req.params.id;

  const orders = await sql`
    SELECT id
    FROM orders
    WHERE id = ${orderId};
  `;

  const order = orders[0];

  if (!order) {
    res.status(404).json({ error: "Заказ не найден" });
    return;
  }

  const attempts = await sql`
    SELECT
      id,
      order_id,
      provider,
      status,
      provider_session_id,
      created_at
    FROM payment_attempts
    WHERE order_id = ${orderId}
    ORDER BY created_at DESC, id DESC;
  `;

  res.json({ attempts });
});
