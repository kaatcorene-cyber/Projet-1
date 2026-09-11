export interface CropPlan {
  id: string;
  name: string;
  amount: number;
  daily: number;
  total: number;
  duration: number;
  image: string;
  locked: boolean;
}

export const DEFAULT_CROP_PLANS: CropPlan[] = [
  { 
    id: 'coton', 
    name: 'Coton', 
    amount: 3000, 
    daily: 210, 
    total: 12600, 
    duration: 60, 
    image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600&auto=format&fit=crop&q=80', 
    locked: false 
  },
  { 
    id: 'hevea', 
    name: 'Hévéa', 
    amount: 5000, 
    daily: 350, 
    total: 21000, 
    duration: 60, 
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80', 
    locked: false 
  },
  { 
    id: 'palmier', 
    name: 'Palmier à huile', 
    amount: 15000, 
    daily: 1050, 
    total: 63000, 
    duration: 60, 
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80', 
    locked: false 
  },
  { 
    id: 'anacarde', 
    name: 'Anacarde (noix de cajou)', 
    amount: 40000, 
    daily: 2800, 
    total: 168000, 
    duration: 60, 
    image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=600&auto=format&fit=crop&q=80', 
    locked: false 
  },
  { 
    id: 'cafe', 
    name: 'Café', 
    amount: 90000, 
    daily: 6300, 
    total: 378000, 
    duration: 60, 
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', 
    locked: false 
  },
  { 
    id: 'manioc', 
    name: 'Manioc', 
    amount: 200000, 
    daily: 14000, 
    total: 840000, 
    duration: 60, 
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80', 
    locked: false 
  },
  { 
    id: 'igname', 
    name: 'Igname', 
    amount: 500000, 
    daily: 35000, 
    total: 2100000, 
    duration: 60, 
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80', 
    locked: true 
  },
  { 
    id: 'riz', 
    name: 'Riz', 
    amount: 800000, 
    daily: 56000, 
    total: 3360000, 
    duration: 60, 
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&auto=format&fit=crop&q=80', 
    locked: true 
  },
  { 
    id: 'cacao', 
    name: 'Cacao', 
    amount: 1000000, 
    daily: 70000, 
    total: 4200000, 
    duration: 60, 
    image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?w=600&auto=format&fit=crop&q=80', 
    locked: true 
  }
];
