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
    priceLabel: "₹799/mo",
    price: 799,
    pricePaise: 79900,        // ₹799 in paise
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
  {
    id: "team",
    name: "Team",
    priceLabel: "₹2,499/mo",
    price: 2499,
    pricePaise: 249900,       // ₹2,499 in paise
    maxDevices: 10,
    durationDays: 30,
    popular: false,
    features: [
      "10 devices",
      "Everything in Pro",
      "Shared workspaces",
      "Role-based access",
      "Advanced analytics",
    ],
  },
] as const;

export type Plan = (typeof PLANS)[number];
export type PlanId = Plan["id"];
