import { useState } from "react";
import Search from "lucide-react/dist/esm/icons/search.mjs";
import {
  demoPayments,
  formatDate,
  formatMoney,
  methodLabel,
} from "../data/demo";
import type { DemoPayment, PaymentStatus } from "../types";
import { Dialog } from "../components/Dialog";
import { Status, statusLabels } from "../components/Status";

export function PaymentsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const [selected, setSelected] = useState<DemoPayment | null>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const visiblePayments = demoPayments.filter(
    (payment) =>
      (status === "all" || payment.status === status) &&
      `${payment.id} ${payment.title} ${methodLabel(payment.method)}`
        .toLowerCase()
        .includes(normalizedQuery),
  );
  return (
    <>
      <div className="page-heading">
        <h1>Мои платежи</h1>
        <p>История покупок и продлений подписки.</p>
      </div>
      <section className="panel history-panel">
        <div className="history-toolbar">
          <label className="search-field">
            <Search size={19} />
            <input
              type="search"
              aria-label="Поиск платежей"
              placeholder="Название или номер платежа"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="filter-field">
            <span className="sr-only">Статус платежа</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as PaymentStatus | "all")
              }
            >
              <option value="all">Все статусы</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="table-note">Все строки ниже — демонстрационные данные.</p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Платёж</th>
                <th>Дата</th>
                <th>Способ оплаты</th>
                <th>Статус</th>
                <th className="amount-cell">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {visiblePayments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <button
                      className="payment-detail-button"
                      onClick={() => setSelected(payment)}
                    >
                      <strong>{payment.title}</strong>
                      <span>{payment.id}</span>
                    </button>
                  </td>
                  <td>{formatDate(payment.date)}</td>
                  <td>{methodLabel(payment.method)}</td>
                  <td>
                    <Status status={payment.status} />
                  </td>
                  <td className="amount-cell">
                    {formatMoney(payment.amountMinor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visiblePayments.length === 0 ? (
          <div className="empty-state">
            <Search size={28} />
            <h2>Платежи не найдены</h2>
            <p>Измените поиск или выберите другой статус.</p>
            <button
              className="button secondary"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              Сбросить фильтры
            </button>
          </div>
        ) : null}
        <div className="table-footer">
          Показано: {visiblePayments.length} из {demoPayments.length}
        </div>
      </section>
      {selected ? (
        <Dialog title="Детали платежа" onClose={() => setSelected(null)}>
          <dl className="detail-list">
            <div>
              <dt>Номер</dt>
              <dd>{selected.id}</dd>
            </div>
            <div>
              <dt>Покупка</dt>
              <dd>{selected.title}</dd>
            </div>
            <div>
              <dt>Дата</dt>
              <dd>{formatDate(selected.date)}</dd>
            </div>
            <div>
              <dt>Способ оплаты</dt>
              <dd>{methodLabel(selected.method)}</dd>
            </div>
            <div>
              <dt>Сумма</dt>
              <dd>{formatMoney(selected.amountMinor)}</dd>
            </div>
            <div>
              <dt>Статус</dt>
              <dd>
                <Status status={selected.status} />
              </dd>
            </div>
          </dl>
          <p className="demo-note">
            Демонстрационная запись. Реальной транзакции нет.
          </p>
        </Dialog>
      ) : null}
    </>
  );
}
