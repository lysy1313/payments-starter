import { useState } from "react";
import Check from "lucide-react/dist/esm/icons/check.mjs";
import CircleAlert from "lucide-react/dist/esm/icons/circle-alert.mjs";
import Clock3 from "lucide-react/dist/esm/icons/clock-3.mjs";
import type { MethodId, PreviewState } from "../types";
import { formatMoney, methodLabel } from "../data/demo";
import { Dialog } from "./Dialog";

const states = {
  success: {
    title: "Оплата прошла",
    description: "Так будет выглядеть подтверждение успешной оплаты.",
    Icon: Check,
  },
  failure: {
    title: "Не удалось оплатить",
    description:
      "Так будет выглядеть ошибка. Пользователь сможет повторить попытку.",
    Icon: CircleAlert,
  },
  pending: {
    title: "Ожидаем подтверждение",
    description:
      "Так будет выглядеть ожидание результата от платёжной системы.",
    Icon: Clock3,
  },
};
export function PaymentPreview({
  amount,
  method,
  onClose,
  onHistory,
}: {
  amount: number;
  method: MethodId;
  onClose: () => void;
  onHistory: () => void;
}) {
  const [state, setState] = useState<PreviewState>("choose");
  return (
    <Dialog
      title={state === "choose" ? "Предпросмотр оплаты" : "Результат оплаты"}
      onClose={onClose}
    >
      {state === "choose" ? (
        <>
          <p className="muted dialog-copy">
            Платёжная система ещё не подключена. Выберите состояние, чтобы
            посмотреть готовый экран.
          </p>
          <div className="preview-summary">
            <span>{methodLabel(method)}</span>
            <strong>{formatMoney(amount)}</strong>
          </div>
          <div className="preview-options">
            <button
              className="button primary"
              onClick={() => setState("success")}
            >
              <Check size={18} />
              Показать успех
            </button>
            <button
              className="button secondary"
              onClick={() => setState("failure")}
            >
              <CircleAlert size={18} />
              Показать ошибку
            </button>
            <button
              className="button secondary"
              onClick={() => setState("pending")}
            >
              <Clock3 size={18} />
              Показать ожидание
            </button>
          </div>
        </>
      ) : (
        (() => {
          const { title, description, Icon } = states[state];
          return (
            <div className={`result-state result-${state}`}>
              <div className="result-icon">
                <Icon size={30} />
              </div>
              <h3>{title}</h3>
              <p className="muted">{description}</p>
              <strong className="result-amount">{formatMoney(amount)}</strong>
              <button
                className="button primary"
                onClick={
                  state === "success" ? onHistory : () => setState("choose")
                }
              >
                {state === "success"
                  ? "Посмотреть демоисторию"
                  : "Назад к предпросмотру"}
              </button>
            </div>
          );
        })()
      )}
      <p className="demo-note">
        Это демонстрация экрана. Платёж и заказ не создаются.
      </p>
    </Dialog>
  );
}
