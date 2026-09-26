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
    id: "plan-orlen-1",
    name: "Station Urbaine ORLEN",
    amount: 5000,
    daily: 600,
    total: 48000,
    duration: 80,
    image: "/icon.svg",
    locked: false
  },
  {
    id: "plan-orlen-2",
    name: "Station Express ORLEN",
    amount: 15000,
    daily: 1800,
    total: 144000,
    duration: 80,
    image: "/icon.svg",
    locked: false
  },
  {
    id: "plan-orlen-3",
    name: "Station Relais ORLEN",
    amount: 25000,
    daily: 3000,
    total: 240000,
    duration: 80,
    image: "/icon.svg",
    locked: false
  },
  {
    id: "plan-orlen-4",
    name: "Station Autoroute ORLEN",
    amount: 40000,
    daily: 4800,
    total: 384000,
    duration: 80,
    image: "/icon.svg",
    locked: false
  },
  {
    id: "plan-orlen-5",
    name: "Station Hub Logistique ORLEN",
    amount: 90000,
    daily: 10800,
    total: 864000,
    duration: 80,
    image: "/icon.svg",
    locked: false
  },
  {
    id: "plan-orlen-6",
    name: "Centre Distribution Carburants ORLEN",
    amount: 120000,
    daily: 14400,
    total: 1152000,
    duration: 80,
    image: "/icon.svg",
    locked: false
  },
  {
    id: "plan-orlen-7",
    name: "Dépôt Pétrolier Régional ORLEN",
    amount: 200000,
    daily: 24000,
    total: 1920000,
    duration: 80,
    image: "/icon.svg",
    locked: false
  },
  {
    id: "plan-orlen-8",
    name: "Terminal Énergétique & Citernes ORLEN",
    amount: 300000,
    daily: 36000,
    total: 2880000,
    duration: 80,
    image: "/icon.svg",
    locked: false
  },
  {
    id: "plan-orlen-9",
    name: "Réseau National Stations ORLEN",
    amount: 450000,
    daily: 54000,
    total: 4320000,
    duration: 80,
    image: "/icon.svg",
    locked: false
  },
  {
    id: "plan-orlen-10",
    name: "Complexe Énergie & Raffinage ORLEN",
    amount: 1000000,
    daily: 120000,
    total: 9600000,
    duration: 80,
    image: "/icon.svg",
    locked: false
  }
];

// Compatibility export
export const DEFAULT_CROP_PLANS = DEFAULT_TRANSPORT_PLANS;
