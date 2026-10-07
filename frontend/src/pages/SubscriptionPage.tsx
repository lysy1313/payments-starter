import { useState } from 'react';
import Check from 'lucide-react/dist/esm/icons/check.mjs';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card.mjs';
import { Dialog } from '../components/Dialog';

export function SubscriptionPage({ autoRenew, onAutoRenewChange, onPurchase }: { autoRenew: boolean; onAutoRenewChange: (value: boolean) => void; onPurchase: () => void }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  return <>
    <div className="page-heading"><h1>Моя подписка</h1><p>План, способ оплаты и автоматическое продление.</p></div>
    <div className="subscription-layout">
      <section className="panel subscription-plan">
        <div className="section-heading"><h2>Доступ к библиотеке</h2><span className="subscription-status"><Check size={16} />Активна · демо</span></div>
        <div className="subscription-price">$12<span> / месяц</span></div>
        <p className="muted">Материалы и обновления по подписке.</p>
        <dl className="detail-list"><div><dt>Текущий период</dt><dd>1–31 октября 2026</dd></div><div><dt>Продление</dt><dd>{autoRenew ? 'Включено' : 'Отключено'}</dd></div></dl>
        <div className={`renewal-message ${autoRenew ? '' : 'renewal-paused'}`} role="status">
          {autoRenew ? 'Автопродление включено. Это пример состояния интерфейса.' : 'Автопродление отключено. Доступ в демопримере остаётся до конца периода.'}
        </div>
        <div className="subscription-actions">
          <button className="button secondary" onClick={onPurchase}>Выбрать другой формат</button>
          <button className={autoRenew ? 'button text-button' : 'button primary'} onClick={() => autoRenew ? setShowConfirmation(true) : onAutoRenewChange(true)}>{autoRenew ? 'Отключить автопродление' : 'Включить автопродление'}</button>
        </div>
      </section>
      <aside className="panel subscription-method"><h2>Способ оплаты</h2>
        <div className="saved-method"><CreditCard size={30} strokeWidth={1.8} /><div><strong>Карта · Stripe</strong><p>Демонстрационный способ оплаты</p></div></div>
        <p className="muted">Сохранённые платёжные методы подключим на одном из следующих этапов обучения.</p>
        <div className="demo-note">Изменения на этой странице локальные. Биллинг и списания не выполняются.</div>
      </aside>
    </div>
    {showConfirmation ? <Dialog title="Отключить автопродление?" onClose={() => setShowConfirmation(false)}>
      <p className="muted dialog-copy">В будущем здесь будет подтверждение отмены продления. Сейчас изменится только состояние интерфейса.</p>
      <div className="dialog-actions"><button className="button secondary" onClick={() => setShowConfirmation(false)}>Оставить включённым</button><button className="button primary" onClick={() => { onAutoRenewChange(false); setShowConfirmation(false); }}>Отключить в демо</button></div>
    </Dialog> : null}
  </>;
}
