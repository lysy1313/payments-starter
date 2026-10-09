// Контракты уже созданных серверных эндпоинтов.
export type Product = {
  id: string;
  name: string;
  unit_amount: number;
  currency: "USD";
};

export type Order = {
  id: string;
  product_id: string;
  quantity: number;
  unit_amount: number;
  currency: "USD";
  status: "pending" | "paid" | "cancelled";
  created_at: string;
};

type PaymentAttempt = {
  id: string;
  order_id: string;
};

type Checkout = {
  attemptId: string;
  checkoutUrl: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, options);
  } catch (error) {
    if (options?.signal?.aborted) throw error;
    throw new Error("Не удалось связаться с сервером. Попробуйте ещё раз.");
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : "Не удалось выполнить запрос. Попробуйте ещё раз.";
    throw new Error(message);
  }
  if (body === null) throw new Error("Сервер вернул некорректный ответ.");
  return body as T;
}

export async function getProducts(signal?: AbortSignal): Promise<Product[]> {
  const result = await request<{ products: Product[] }>("/products", {
    signal,
  });
  return result.products;
}

export async function createOrder(
  productId: string,
  quantity: number,
): Promise<Order> {
  const result = await request<{ order: Order }>("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Цену и валюту сервер определяет самостоятельно.
    body: JSON.stringify({ productId, quantity }),
  });
  return result.order;
}

export async function createPaymentAttempt(
  orderId: string,
): Promise<PaymentAttempt> {
  const result = await request<{ attempt: PaymentAttempt }>(
    `/orders/${encodeURIComponent(orderId)}/payment-attempts`,
    { method: "POST" },
  );
  return result.attempt;
}

export function createCheckout(attemptId: string): Promise<Checkout> {
  return request<Checkout>(
    `/payment-attempts/${encodeURIComponent(attemptId)}/checkout`,
    { method: "POST" },
  );
}

export async function getOrder(
  orderId: string,
  signal?: AbortSignal,
): Promise<Order> {
  const result = await request<{ order: Order }>(
    `/orders/${encodeURIComponent(orderId)}`,
    { signal },
  );
  return result.order;
}
