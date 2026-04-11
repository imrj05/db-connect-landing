export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    priceLabel: "Free",
    price: 0,
    pricePaise: 0,           // Razorpay amount in paise (₹0)
    maxDevices: 1,
    durationDays: 0,          // 0 = lifetime
    popular: false,
    features: [
      "1 device",
      "Core database features",
      "SQLite, PostgreSQL, MySQL",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "₹299/mo",
    price: 299,
    pricePaise: 29900,        // ₹299 in paise
    maxDevices: 3,
    durationDays: 30,
    popular: true,
    features: [
      "3 devices",
      "Everything in Starter",
      "Query history & saved queries",
      "Export CSV / JSON",
      "Priority support",
    ],
  },
] as const;
export type Plan = (typeof PLANS)[number];
export type PlanId = Plan["id"];
