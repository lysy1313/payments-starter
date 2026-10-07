import { useState } from 'react';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right.mjs';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card.mjs';
import Minus from 'lucide-react/dist/esm/icons/minus.mjs';
import Plus from 'lucide-react/dist/esm/icons/plus.mjs';
import { formatMoney, formatShortMoney, plans } from '../data/demo';
import type { MethodId, PlanId } from '../types';
import { PaymentPreview } from '../components/PaymentPreview';

export function PurchasePage({ onHistory }: { onHistory: () => void }) {
  const [planId, setPlanId] = useState<PlanId>('one-time');
  const [method, setMethod] = useState<MethodId>('stripe');
  const [quantity, setQuantity] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const plan = plans.find(item => item.id === planId)!;
  const amount = plan.amountMinor * (plan.recurring ? 1 : quantity);
  return <>
    <div className="page-heading"><h1>Покупка доступа</h1><p>Выберите формат и способ оплаты.</p></div>
    <div className="purchase-layout">
      <div className="purchase-options">
        <section className="panel"><h2 id="plans-heading">Формат доступа</h2>
          <div className="plan-grid" role="radiogroup" aria-labelledby="plans-heading">
            {plans.map(item => <label className={`plan-option ${planId === item.id ? 'selected' : ''}`} key={item.id}>
              <input type="radio" name="plan" value={item.id} checked={planId === item.id} onChange={() => setPlanId(item.id)} />
              <span className="plan-title">{item.title}</span>
              <span className="plan-price">{formatShortMoney(item.amountMinor)}{item.recurring ? <span> / месяц</span> : null}</span>
              <span className="plan-description">{item.description}</span>
            </label>)}
          </div>
        </section>
        <section className="panel payment-panel"><h2 id="methods-heading">Способ оплаты</h2>
          <div className="method-grid" role="radiogroup" aria-labelledby="methods-heading">
            <label className={`method-option ${method === 'stripe' ? 'selected' : ''}`}>
              <input type="radio" name="method" value="stripe" checked={method === 'stripe'} onChange={() => setMethod('stripe')} />
              <CreditCard size={34} strokeWidth={1.8} /><span>Карта · Stripe</span>
            </label>
            <label className={`method-option ${method === 'paypal' ? 'selected' : ''}`}>
              <input type="radio" name="method" value="paypal" checked={method === 'paypal'} onChange={() => setMethod('paypal')} />
              <span className="paypal-wordmark"><span>Pay</span>Pal</span>
            </label>
          </div>
          <p className="method-note">Сейчас это только интерфейс. Деньги не списываются.</p>
        </section>
      </div>
      <aside className="panel order-summary" aria-label="Ваш заказ">
        <h2>Ваш заказ</h2><h3>{plan.title}</h3>
        <div className="quantity-row"><span>{plan.recurring ? 'Период' : 'Количество'}</span>
          {plan.recurring ? <span className="period-value">1 месяц</span> : <div className="quantity-control">
            <button aria-label="Уменьшить количество" onClick={() => setQuantity(value => value - 1)} disabled={quantity === 1}><Minus size={18} /></button>
            <output aria-label="Количество">{quantity}</output>
            <button aria-label="Увеличить количество" onClick={() => setQuantity(value => value + 1)} disabled={quantity === 10}><Plus size={18} /></button>
          </div>}
        </div>
        <div className="summary-row"><span>Стоимость</span><strong>{formatMoney(amount)}</strong></div>
        <div className="summary-total"><span>Итого</span><strong>{formatMoney(amount)}</strong></div>
        <button className="button primary checkout-button" onClick={() => setShowPreview(true)}>Перейти к оплате<ArrowRight size={21} /></button>
        <p className="summary-note">Демонстрация интерфейса</p>
      </aside>
    </div>
    {showPreview ? <PaymentPreview amount={amount} method={method} onClose={() => setShowPreview(false)} onHistory={onHistory} /> : null}
  </>;
}
