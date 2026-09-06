import fs from 'fs';

let content = fs.readFileSync('src/pages/History.tsx', 'utf-8');

// Update imports
content = content.replace(
  "import { ArrowDown, ArrowUp, Clock, Plus, TrendingUp, Gift, CreditCard, ChevronLeft } from 'lucide-react';",
  "import { Wallet, Banknote, Coins, Briefcase, Users, Sparkles, CreditCard, Clock, ChevronLeft } from 'lucide-react';"
);

// Update getIcon
const getIconFunc = `  const getIcon = (type: string) => {
    switch(type) {
      case 'deposit': return <Wallet className="w-5 h-5" />;
      case 'withdrawal': return <Banknote className="w-5 h-5" />;
      case 'daily_gain': return <Coins className="w-5 h-5" />;
      case 'investment': return <Briefcase className="w-5 h-5" />;
      case 'referral_bonus': return <Users className="w-5 h-5" />;
      case 'signup_bonus': return <Sparkles className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };`;
content = content.replace(/const getIcon = \(type: string\) => \{[\s\S]*?\n  \};/, getIconFunc);

// Update getIconColor
const getIconColorFunc = `  const getIconColor = (type: string) => {
    switch(type) {
      case 'deposit': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/10';
      case 'withdrawal': return 'bg-red-500/20 text-red-400 border-red-500/10';
      case 'daily_gain': return 'bg-brand-500/20 text-brand-400 border-brand-500/10';
      case 'investment': return 'bg-purple-500/20 text-purple-400 border-purple-500/10';
      case 'referral_bonus': return 'bg-amber-500/20 text-amber-400 border-amber-500/10';
      case 'signup_bonus': return 'bg-pink-500/20 text-pink-400 border-pink-500/10';
      default: return 'bg-white/10 text-white border-white/5';
    }
  };`;
content = content.replace(/const getIconColor = \(type: string\) => \{[\s\S]*?\n  \};/, getIconColorFunc);

fs.writeFileSync('src/pages/History.tsx', content);
