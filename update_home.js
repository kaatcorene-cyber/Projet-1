import fs from 'fs';
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');
code = code.replace("import { ChevronRight, ArrowDownToLine, Users, Gift, Clock, LogOut, CheckCircle2, X, Share, PlusSquare, Apple, Image as ImageIcon, Smartphone, AlertCircle, Loader2 } from 'lucide-react';", "import { ChevronRight, ArrowDownToLine, Users, Gift, Clock, LogOut, CheckCircle2, X, Share, PlusSquare, Apple, Key, Smartphone, AlertCircle, Loader2 } from 'lucide-react';");
code = code.replace("{ icon: ImageIcon, label: 'Preuves', path: '/preuves', color: 'bg-purple-500' },", "{ icon: Key, label: 'Coffre', path: '/coffre', color: 'bg-purple-500' },");
fs.writeFileSync('src/pages/Home.tsx', code);
