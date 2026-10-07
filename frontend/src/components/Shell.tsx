import type { ReactNode } from "react";
import type { Page } from "../types";
import { AmbientDetails, FooterContour } from "./CyberpunkDetails";

const navigation: { id: Page; label: string }[] = [
  { id: "purchase", label: "Покупка" },
  { id: "payments", label: "Мои платежи" },
  { id: "subscription", label: "Подписка" },
];
export function Shell({
  page,
  onNavigate,
  children,
}: {
  page: Page;
  onNavigate: (page: Page) => void;
  children: ReactNode;
}) {
  return (
    <div className="app-shell">
      <AmbientDetails />
      <a className="skip-link" href="#main-content">
        К содержимому
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <button
            className="wordmark"
            onClick={() => onNavigate("purchase")}
            aria-label="Payment Lab: покупка"
          >
            Payment Lab
          </button>
          <nav className="navigation" aria-label="Основная навигация">
            {navigation.map((item) => (
              <button
                key={item.id}
                className={page === item.id ? "nav-item active" : "nav-item"}
                aria-current={page === item.id ? "page" : undefined}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <span className="demo-label">Демо</span>
        </div>
      </header>
      <main id="main-content" className="container main-content">
        {children}
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <FooterContour />
          <span className="footer-brand">Payment Lab</span>
          <span>Учебный проект · Без реальных платежей</span>
        </div>
      </footer>
    </div>
  );
}
