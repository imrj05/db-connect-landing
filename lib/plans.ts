export type PlanSeed = {
  description: string | null;
  durationDays: number;
  features: string[];
  id: string;
  isActive: boolean;
  isPopular: boolean;
  maxDevices: number;
  name: string;
  price: number;
  pricePaise: number;
  sortOrder: number;
};

export type ApplicationPlan = {
  description: string | null;
  durationDays: number;
  features: string[];
  id: string;
  isActive: boolean;
  isPopular: boolean;
  maxDevices: number;
  name: string;
  price: number;
  priceLabel: string;
  pricePaise: number;
  sortOrder: number;
};

export type PlanId = string;

export const DEFAULT_PLAN_SEEDS: readonly PlanSeed[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For individual developers getting started with DBConnect.",
    price: 0,
    pricePaise: 0,
    maxDevices: 1,
    durationDays: 0,
    isPopular: false,
    isActive: true,
    sortOrder: 10,
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
    description: "For power users who need more devices and faster support.",
    price: 299,
    pricePaise: 29900,
    maxDevices: 3,
    durationDays: 30,
    isPopular: true,
    isActive: true,
    sortOrder: 20,
    features: [
      "3 devices",
      "Everything in Starter",
      "Query history & saved queries",
      "Export CSV / JSON",
      "Priority support",
    ],
  },
] as const;

export function formatPlanPriceLabel(plan: {
  durationDays: number;
  price: number;
}) {
  if (plan.price === 0) {
    return "Free";
  }

  if (plan.durationDays === 30) {
    return `₹${plan.price}/mo`;
  }

  if (plan.durationDays === 365) {
    return `₹${plan.price}/yr`;
  }

  return `₹${plan.price}`;
}

export function toApplicationPlan(plan: PlanSeed): ApplicationPlan {
  return {
    ...plan,
    priceLabel: formatPlanPriceLabel(plan),
  };
}

export const DEFAULT_PLANS: readonly ApplicationPlan[] = DEFAULT_PLAN_SEEDS.map(toApplicationPlan);
