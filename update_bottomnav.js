import fs from 'fs';

let content = fs.readFileSync('src/components/BottomNav.tsx', 'utf8');

// Update imports
content = content.replace("import { Home, Briefcase, Users, LayoutList } from 'lucide-react';", "import { LayoutDashboard, TrendingUp, Network, Clock } from 'lucide-react';");

// Update objects
content = content.replace("{ icon: Home, label: 'Accueil', path: '/dashboard' }", "{ icon: LayoutDashboard, label: 'Accueil', path: '/dashboard' }");
content = content.replace("{ icon: Briefcase, label: 'Investir', path: '/invest' }", "{ icon: TrendingUp, label: 'Investir', path: '/invest' }");
content = content.replace("{ icon: Users, label: 'Équipe', path: '/team' }", "{ icon: Network, label: 'Équipe', path: '/team' }");
content = content.replace("{ icon: LayoutList, label: 'Historique', path: '/history' }", "{ icon: Clock, label: 'Historique', path: '/history' }");

fs.writeFileSync('src/components/BottomNav.tsx', content);
