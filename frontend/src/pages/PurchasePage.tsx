import { useEffect, useRef, useState } from "react";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right.mjs";
import CreditCard from "lucide-react/dist/esm/icons/credit-card.mjs";
import Minus from "lucide-react/dist/esm/icons/minus.mjs";
import Plus from "lucide-react/dist/esm/icons/plus.mjs";
import { formatMoney, formatShortMoney, plans } from "../data/demo";
import type { MethodId, PlanId } from "../types";
import { PaymentPreview } from "../components/PaymentPreview";
import {
  createCheckout,
  createOrder,
  createPaymentAttempt,
  getProducts,
  type Product,
} from "../api/payments";

type CheckoutDraft = { quantity: number; orderId?: string; attemptId?: string };

export function PurchasePage({ onHistory }: { onHistory: () => void }) {
  const [planId, setPlanId] = useState<PlanId>("one-time");
  const [method, setMethod] = useState<MethodId>("stripe");
  const [quantity, setQuantity] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [productRequest, setProductRequest] = useState(0);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const checkoutInProgress = useRef(false);
  const checkoutDraft = useRef<CheckoutDraft | null>(null);

  useEffect(() => {
    // Снимаем блокировку, если браузер восстановил страницу кнопкой «Назад».
    const handlePageShow = () => {
      checkoutInProgress.current = false;
      setIsCheckingOut(false);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingProduct(true);
    setProductError(null);
    getProducts(controller.signal)
      .then((products) => {
        if (controller.signal.aborted) return;
        const item = products.find((item) => item.id === "one-time");
        if (!item) throw new Error("Разовая покупка сейчас недоступна.");
        setProduct(item);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setProduct(null);
        setProductError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить товар.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingProduct(false);
      });
    return () => controller.abort();
  }, [productRequest]);

  const plan = plans.find((item) => item.id === planId)!;
  const stripeCheckout = planId === "one-time" && method === "stripe";
  const amount =
    planId === "one-time"
      ? product
        ? product.unit_amount * quantity
        : null
      : plan.amountMinor;
  const amountLabel =
    amount === null
      ? loadingProduct
        ? "Загрузка…"
        : "Недоступно"
      : formatMoney(amount);
  const previewAmount = plan.amountMinor * (plan.recurring ? 1 : quantity);

  async function handleCheckout() {
    if (checkoutInProgress.current) return;
    if (!stripeCheckout) {
      setShowPreview(true);
      return;
    }
    if (!product || loadingProduct) return;

    checkoutInProgress.current = true;
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      // При повторном нажатии после ошибки используем уже полученные ID.
      if (
        !checkoutDraft.current ||
        checkoutDraft.current.quantity !== quantity
      ) {
        checkoutDraft.current = { quantity };
      }
      const draft = checkoutDraft.current;
      if (!draft.orderId) {
        const order = await createOrder(product.id, quantity);
        draft.orderId = order.id;
      }
      if (!draft.attemptId) {
        const attempt = await createPaymentAttempt(draft.orderId);
        draft.attemptId = attempt.id;
      }
      const checkout = await createCheckout(draft.attemptId);
      if (!checkout.checkoutUrl)
        throw new Error("Не удалось получить ссылку для оплаты.");
      window.location.assign(checkout.checkoutUrl);
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Не удалось начать оплату.",
      );
      checkoutInProgress.current = false;
      setIsCheckingOut(false);
    }
  }

  return (
    <>
      <div className="page-heading">
        <h1>Покупка доступа</h1>
        <p>Выберите формат и способ оплаты.</p>
      </div>
      <div className="purchase-layout">
        <div className="purchase-options">
          <section className="panel">
            <h2 id="plans-heading">Формат доступа</h2>
            <div
              className="plan-grid"
              role="radiogroup"
              aria-labelledby="plans-heading"
            >
              {plans.map((item) => (
                <label
                  className={`plan-option ${planId === item.id ? "selected" : ""}`}
                  key={item.id}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={item.id}
                    checked={planId === item.id}
                    disabled={isCheckingOut}
                    onChange={() => {
                      setPlanId(item.id);
                      setCheckoutError(null);
                    }}
                  />
                  <span className="plan-title">
                    {item.id === "one-time" && product
                      ? product.name
                      : item.title}
                  </span>
                  <span
                    className={`plan-price ${item.id === "one-time" && !product ? "plan-price-placeholder" : ""}`}
                  >
                    {item.id === "one-time"
                      ? product
                        ? formatMoney(product.unit_amount)
                        : loadingProduct
                          ? "Загрузка…"
                          : "Недоступно"
                      : formatShortMoney(item.amountMinor)}
                    {item.recurring ? <span> / месяц · демо</span> : null}
                  </span>
                  <span className="plan-description">{item.description}</span>
                </label>
              ))}
            </div>
            {productError ? (
              <div
                className="checkout-message checkout-message-error"
                role="alert"
              >
                <p>{productError}</p>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setProductRequest((value) => value + 1)}
                >
                  Загрузить снова
                </button>
              </div>
            ) : null}
          </section>
          <section className="panel payment-panel">
            <h2 id="methods-heading">Способ оплаты</h2>
            <div
              className="method-grid"
              role="radiogroup"
              aria-labelledby="methods-heading"
            >
              <label
                className={`method-option ${method === "stripe" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="method"
                  value="stripe"
                  checked={method === "stripe"}
                  disabled={isCheckingOut}
                  onChange={() => {
                    setMethod("stripe");
                    setCheckoutError(null);
                  }}
                />
                <CreditCard size={34} strokeWidth={1.8} />
                <span>Карта · Stripe</span>
              </label>
              <label
                className={`method-option ${method === "paypal" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="method"
                  value="paypal"
                  checked={method === "paypal"}
                  disabled={isCheckingOut}
                  onChange={() => {
                    setMethod("paypal");
                    setCheckoutError(null);
                  }}
                />
                <span className="paypal-wordmark">
                  <span>Pay</span>Pal
                </span>
              </label>
            </div>
            <p className="method-note">
              {stripeCheckout
                ? "Тестовая оплата на странице Stripe. Реальные деньги не списываются."
                : "PayPal и подписка пока доступны только в демонстрационном предпросмотре."}
            </p>
          </section>
        </div>
        <aside className="panel order-summary" aria-label="Ваш заказ">
          <h2>Ваш заказ</h2>
          <h3>
            {planId === "one-time" && product ? product.name : plan.title}
          </h3>
          <div className="quantity-row">
            <span>{plan.recurring ? "Период" : "Количество"}</span>
            {plan.recurring ? (
              <span className="period-value">1 месяц</span>
            ) : (
              <div className="quantity-control">
                <button
                  aria-label="Уменьшить количество"
                  onClick={() => {
                    setQuantity((value) => value - 1);
                    setCheckoutError(null);
                  }}
                  disabled={quantity === 1 || isCheckingOut}
                >
                  <Minus size={18} />
                </button>
                <output aria-label="Количество">{quantity}</output>
                <button
                  aria-label="Увеличить количество"
                  onClick={() => {
                    setQuantity((value) => value + 1);
                    setCheckoutError(null);
                  }}
                  disabled={quantity === 10 || isCheckingOut}
                >
                  <Plus size={18} />
                </button>
              </div>
            )}
          </div>
          <div className="summary-row">
            <span>Стоимость{stripeCheckout ? "" : " · демо"}</span>
            <strong>
              {stripeCheckout ? amountLabel : formatMoney(previewAmount)}
            </strong>
          </div>
          <div className="summary-total">
            <span>Итого{stripeCheckout ? "" : " · демо"}</span>
            <strong>
              {stripeCheckout ? amountLabel : formatMoney(previewAmount)}
            </strong>
          </div>
          <button
            type="button"
            className="button primary checkout-button"
            onClick={() => void handleCheckout()}
            disabled={
              isCheckingOut || (stripeCheckout && (loadingProduct || !product))
            }
            aria-busy={isCheckingOut}
          >
            {isCheckingOut
              ? "Открываем Stripe…"
              : stripeCheckout
                ? "Перейти к оплате"
                : "Открыть предпросмотр"}
            <ArrowRight size={21} />
          </button>
          {checkoutError ? (
            <p className="checkout-message checkout-message-error" role="alert">
              {checkoutError}
            </p>
          ) : null}
          <p className="summary-note" role="status">
            {stripeCheckout
              ? isCheckingOut
                ? "Подготавливаем оплату. Подождите…"
                : "Разовая покупка · Stripe Sandbox"
              : "Демонстрация интерфейса"}
          </p>
        </aside>
      </div>
      {showPreview ? (
        <PaymentPreview
          amount={previewAmount}
          method={method}
          onClose={() => setShowPreview(false)}
          onHistory={onHistory}
        />
      ) : null}
    </>
  );
}
