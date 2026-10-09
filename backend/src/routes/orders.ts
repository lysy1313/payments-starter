import { Router } from "express";
import { randomUUID } from "node:crypto";
import { sql } from "../db/client.js";
import { stripe } from "../stripe/client.js";

const frontendUrl = process.env.FRONTEND_URL;

if (!frontendUrl) {
  throw new Error("Не задана переменная FRONTEND_URL");
}

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

ordersRouter.post("/payment-attempts/:id/checkout", async (req, res) => {
  const attemptId = req.params.id;

  const rows = await sql`
    SELECT
      a.id AS attempt_id,
      a.order_id,
      a.status AS attempt_status,
      a.idempotency_key,
      a.provider_session_id,
      o.status AS order_status,
      o.quantity,
      o.unit_amount,
      o.currency
    FROM payment_attempts AS a
    JOIN orders AS o ON o.id = a.order_id
    WHERE a.id = ${attemptId};
  `;

  const data = rows[0];

  if (!data) {
    res.status(404).json({ error: "Попытка оплаты не найдена" });
    return;
  }

  if (data.order_status !== "pending") {
    res.status(409).json({ error: "Заказ недоступен для оплаты" });
    return;
  }

  if (data.provider_session_id) {
    const existingSession = await stripe.checkout.sessions.retrieve(
      data.provider_session_id,
    );

    if (existingSession.status !== "open" || !existingSession.url) {
      res.status(409).json({
        error: "Эта платёжная сессия больше недоступна для оплаты",
      });
      return;
    }

    res.json({
      attemptId: data.attempt_id,
      checkoutUrl: existingSession.url,
    });
    return;
  }

  if (data.attempt_status !== "created") {
    res.status(409).json({ error: "Попытка недоступна для запуска оплаты" });
    return;
  }

  const encodedOrderId = encodeURIComponent(data.order_id);

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: data.currency.toLowerCase(),
            unit_amount: data.unit_amount,
            product_data: {
              name: "Разовая покупка",
            },
          },
          quantity: data.quantity,
        },
      ],
      client_reference_id: data.order_id,
      metadata: {
        orderId: data.order_id,
        attemptId: data.attempt_id,
      },
      success_url:
        `${frontendUrl}/?checkout=success&orderId=${encodedOrderId}` +
        "&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: `${frontendUrl}/?checkout=cancelled&orderId=${encodedOrderId}`,
    },
    {
      idempotencyKey: data.idempotency_key,
    },
  );

  if (!session.url) {
    throw new Error("Stripe не вернул ссылку на страницу оплаты");
  }

  await sql`
    UPDATE payment_attempts
    SET
      provider_session_id = ${session.id},
      status = 'pending'
    WHERE id = ${data.attempt_id}
      AND status = 'created';
  `;

  res.status(201).json({
    attemptId: data.attempt_id,
    checkoutUrl: session.url,
  });
});
