import { useState } from "react";
import type { Page } from "./types";
import { Shell } from "./components/Shell";
import { PurchasePage } from "./pages/PurchasePage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { SubscriptionPage } from "./pages/SubscriptionPage";

export function App() {
  const [page, setPage] = useState<Page>("purchase");
  const [autoRenew, setAutoRenew] = useState(true);
  return (
    <Shell page={page} onNavigate={setPage}>
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
