import { onCLS, onINP, onLCP, type Metric } from "web-vitals";

function report(metric: Metric) {
  const payload = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
  };
  // Always available for operators in the browser console.
  if (import.meta.env.DEV || import.meta.env.PROD) {
    console.info("[web-vitals]", payload);
  }
  const endpoint = import.meta.env["VITE_VITALS_ENDPOINT"] as string | undefined;
  if (!endpoint || typeof navigator === "undefined" || !navigator.sendBeacon) return;
  try {
    navigator.sendBeacon(endpoint, JSON.stringify(payload));
  } catch {
    // Beacon failures must never affect the product.
  }
}

/** Report LCP, INP and CLS once the app has mounted. */
export function reportWebVitals() {
  onLCP(report);
  onINP(report);
  onCLS(report);
}
