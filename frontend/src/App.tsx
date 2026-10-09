import { useState } from "react";
import type { Page } from "./types";
import { Shell } from "./components/Shell";
import { PurchasePage } from "./pages/PurchasePage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import {
  CheckoutReturn,
  readCheckoutReturn,
} from "./components/CheckoutReturn";
import "./styles-checkout.css";

export function App() {
  const [page, setPage] = useState<Page>("purchase");
  const [autoRenew, setAutoRenew] = useState(true);
  const [checkoutReturn, setCheckoutReturn] = useState(readCheckoutReturn);

  function dismissCheckoutReturn() {
    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    url.searchParams.delete("orderId");
    url.searchParams.delete("session_id");
    window.history.replaceState(window.history.state, "", url);
    setCheckoutReturn(null);
  }

  return (
    <Shell page={page} onNavigate={setPage}>
      {checkoutReturn ? (
        <CheckoutReturn
          details={checkoutReturn}
          onClose={dismissCheckoutReturn}
        />
      ) : null}
      {page === "purchase" ? (
        <PurchasePage onHistory={() => setPage("payments")} />
      ) : null}
      {page === "payments" ? <PaymentsPage /> : null}
      {page === "subscription" ? (
        <SubscriptionPage
          autoRenew={autoRenew}
          onAutoRenewChange={setAutoRenew}
          onPurchase={() => setPage("purchase")}
        />
      ) : null}
    </Shell>
  );
}
