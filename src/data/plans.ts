export interface TransportPlan {
  id: string;
  name: string;
  amount: number;
  daily: number;
  total: number;
  duration: number;
  image: string;
  locked: boolean;
}

// Backward compatibility alias
export type CropPlan = TransportPlan;

export const DEFAULT_TRANSPORT_PLANS: TransportPlan[] = [
  {
    id: "plan-depart",
    name: "Rizières",
    amount: 5000,
    daily: 600,
    total: 48000,
    duration: 80,
    image: "https://images.unsplash.com/photo-1549194388-f61be84a6e9e?auto=format&fit=crop&w=900&q=80",
    locked: false
  },
  {
    id: "plan-croissance",
    name: "Maïs",
    amount: 15000,
    daily: 1800,
    total: 144000,
    duration: 80,
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80",
    locked: false
  },
  {
    id: "plan-evolution",
    name: "Banane plantain",
    amount: 25000,
    daily: 3000,
    total: 240000,
    duration: 80,
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=900&q=80",
    locked: false
  },
  {
    id: "plan-transport",
    name: "Plan Transport",
    amount: 40000,
    daily: 4800,
    total: 384000,
    duration: 80,
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=900&q=80",
    locked: false
  },
  {
    id: "plan-logistique",
    name: "Plan Logistique",
    amount: 90000,
    daily: 10800,
    total: 864000,
    duration: 80,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80",
    locked: false
  },
  {
    id: "plan-agricole",
    name: "Haricot",
    amount: 120000,
    daily: 14400,
    total: 1152000,
    duration: 80,
    image: "https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?auto=format&fit=crop&w=900&q=80",
    locked: false
  },
  {
    id: "plan-routier",
    name: "Plan Routier",
    amount: 200000,
    daily: 24000,
    total: 1920000,
    duration: 80,
    image: "https://images.unsplash.com/photo-1616432043562-3671ea2e5242?auto=format&fit=crop&w=900&q=80",
    locked: false
  },
  {
    id: "plan-expansion",
    name: "Plan Expansion",
    amount: 300000,
    daily: 36000,
    total: 2880000,
    duration: 80,
    image: "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?auto=format&fit=crop&w=900&q=80",
    locked: false
  },
  {
    id: "plan-national",
    name: "Plan National",
    amount: 450000,
    daily: 54000,
    total: 4320000,
    duration: 80,
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=900&q=80",
    locked: false
  },
  {
    id: "plan-premium",
    name: "Plan Premium",
    amount: 1000000,
    daily: 120000,
    total: 9600000,
    duration: 80,
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=80",
    locked: false
  }
];

// Compatibility export
export const DEFAULT_CROP_PLANS = DEFAULT_TRANSPORT_PLANS;
