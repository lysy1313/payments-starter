import type { PaymentStatus } from "../types";
export const statusLabels: Record<PaymentStatus, string> = {
  paid: "Оплачен",
  pending: "В обработке",
  failed: "Ошибка",
  refunded: "Возврат",
};
export function Status({ status }: { status: PaymentStatus }) {
  return (
    <span className={`status status-${status}`}>
      <span className="status-dot" aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}
