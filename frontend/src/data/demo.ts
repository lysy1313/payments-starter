import type { DemoPayment, Plan } from "../types";

// Статичные примеры для вёрстки. Не загружаются с сервера.
export const plans: Plan[] = [
  {
    id: "one-time",
    title: "Разовая покупка",
    amountMinor: 4500,
    description: "Курс и материалы навсегда",
    recurring: false,
  },
  {
    id: "monthly",
    title: "Подписка",
    amountMinor: 1200,
    description: "Доступ к библиотеке материалов",
    recurring: true,
  },
];
export const demoPayments: DemoPayment[] = [
  {
    id: "DEMO-104",
    date: "2026-10-01",
    title: "Подписка",
    amountMinor: 1200,
    method: "stripe",
    status: "paid",
  },
  {
    id: "DEMO-103",
    date: "2026-09-28",
    title: "Разовая покупка",
    amountMinor: 4500,
    method: "paypal",
    status: "paid",
  },
  {
    id: "DEMO-102",
    date: "2026-09-28",
    title: "Разовая покупка",
    amountMinor: 4500,
    method: "stripe",
    status: "failed",
  },
  {
    id: "DEMO-101",
    date: "2026-09-15",
    title: "Разовая покупка",
    amountMinor: 4500,
    method: "stripe",
    status: "refunded",
  },
  {
    id: "DEMO-100",
    date: "2026-09-12",
    title: "Подписка",
    amountMinor: 1200,
    method: "paypal",
    status: "pending",
  },
];
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const shortMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const date = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
export function formatMoney(amountMinor: number) {
  return money.format(amountMinor / 100);
}
export function formatShortMoney(amountMinor: number) {
  return shortMoney.format(amountMinor / 100);
}
export function formatDate(value: string) {
  return date.format(new Date(`${value}T12:00:00Z`));
}
export function methodLabel(method: "stripe" | "paypal") {
  return method === "stripe" ? "Карта · Stripe" : "PayPal";
}
