import { useEffect, useState } from "react";
import { getOrder, type Order } from "../api/payments";

type CheckoutReturnDetails = {
  outcome: "success" | "cancelled";
  orderId: string | null;
};

export function readCheckoutReturn(): CheckoutReturnDetails | null {
  const params = new URLSearchParams(window.location.search);
  const outcome = params.get("checkout");
  if (outcome !== "success" && outcome !== "cancelled") return null;
  return { outcome, orderId: params.get("orderId") };
}

type OrderState =
  | { kind: "loading" }
  | { kind: "ready"; order: Order }
  | { kind: "error"; message: string };

export function CheckoutReturn({
  details,
  onClose,
}: {
  details: CheckoutReturnDetails;
  onClose: () => void;
}) {
  const [state, setState] = useState<OrderState>({ kind: "loading" });
  const [requestNumber, setRequestNumber] = useState(0);

  useEffect(() => {
    if (!details.orderId) {
      setState({
        kind: "error",
        message: "В ссылке возврата отсутствует номер заказа.",
      });
      return;
    }
    const controller = new AbortController();
    setState({ kind: "loading" });
    getOrder(details.orderId, controller.signal)
      .then((order) => {
        if (!controller.signal.aborted) setState({ kind: "ready", order });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          kind: "error",
          message:
            error instanceof Error
              ? error.message
              : "Не удалось проверить заказ.",
        });
      });
    return () => controller.abort();
  }, [details.orderId, requestNumber]);

  let title = "Проверяем статус заказа…";
  let description = "Получаем информацию о вашем заказе.";
  if (state.kind === "error") {
    title = "Не удалось проверить заказ";
    description = state.message;
  } else if (state.kind === "ready") {
    // Источник результата — серверный статус, а не параметр checkout в URL.
    if (state.order.status === "paid") {
      title = "Оплата подтверждена";
      description = "Ваш заказ оплачен.";
    } else if (state.order.status === "cancelled") {
      title = "Заказ отменён";
      description = "Этот заказ больше недоступен для оплаты.";
    } else if (details.outcome === "cancelled") {
      title = "Вы вернулись со страницы оплаты";
      description = "Заказ ожидает оплаты. Вы можете завершить её позже.";
    } else {
      title = "Ожидаем подтверждение оплаты";
      description =
        "Вы вернулись из Stripe. Подтверждение оплаты заказа ещё ожидается.";
    }
  }

  return (
    <section
      className="panel checkout-notice"
      aria-label="Результат возврата из Stripe"
      aria-busy={state.kind === "loading"}
    >
      <div role={state.kind === "error" ? "alert" : "status"}>
        <h2>{title}</h2>
        <p>{description}</p>
        {details.orderId ? (
          <p className="checkout-order-id">Заказ: {details.orderId}</p>
        ) : null}
      </div>
      <div className="checkout-notice-actions">
        {details.orderId &&
        (state.kind === "error" ||
          (state.kind === "ready" && state.order.status === "pending")) ? (
          <button
            type="button"
            className="button secondary"
            onClick={() => setRequestNumber((value) => value + 1)}
          >
            Проверить статус
          </button>
        ) : null}
        <button type="button" className="button secondary" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </section>
  );
}
