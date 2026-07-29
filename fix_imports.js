import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Fix useAuthStore import
content = content.replace("import { Bell, Activity, ArrowRight, ShieldCheck, useAuthStore } from '../store/useAuthStore';", "import { useAuthStore } from '../store/useAuthStore';");

// Add Bell, Activity, etc to lucide-react imports
const lucideImportsRegex = /import \{\s*Camera,/m;
content = content.replace(lucideImportsRegex, "import { Bell, Activity, ArrowRight, Camera,");

// Wait, looking closely: ShieldCheck is already in lucide imports further down. 
// "import { Camera, LogOut, Download, PiggyBank, ArrowUpRight, ShieldCheck, Crown, User as UserIcon, Phone, MapPin, "
// Let's just do a clean replace for the first lines.

fs.writeFileSync('src/pages/Dashboard.tsx', content);
console.log('fixed');
