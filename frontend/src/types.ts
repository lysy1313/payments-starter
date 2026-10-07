// Типы демонстрационного интерфейса. Это ещё не контракт серверного API.
export type Page = 'purchase' | 'payments' | 'subscription';
export type PlanId = 'one-time' | 'monthly';
export type MethodId = 'stripe' | 'paypal';
export type PreviewState = 'choose' | 'success' | 'failure' | 'pending';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type Plan = { id: PlanId; title: string; amountMinor: number; description: string; recurring: boolean };
export type DemoPayment = {
  id: string; date: string; title: string; amountMinor: number; method: MethodId; status: PaymentStatus;
};
