import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

if (!secretKey) {
  throw new Error("Не задана переменная STRIPE_SECRET_KEY");
}

if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("rk_test_")) {
  throw new Error("Для учебного проекта нужен тестовый серверный ключ Stripe");
}

export const stripe = new Stripe(secretKey);
