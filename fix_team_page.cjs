const fs = require('fs');
let content = fs.readFileSync('src/pages/Team.tsx', 'utf8');

// Remove BONUS_LEVELS
content = content.replace(/const BONUS_LEVELS = \[[\s\S]*?\];\n\n/g, '');

// Revert imports
content = content.replace(/import \{ Users, User, Copy, CheckCircle2, UserPlus, Gift, ChevronLeft, Link as LinkIcon, Loader2, Trophy, ArrowRight \} from 'lucide-react';\nimport \{ motion, AnimatePresence \} from 'framer-motion';\nimport \{ useNavigate \} from 'react-router-dom';\nimport toast from 'react-hot-toast';/g, 
`import { Users, User, Copy, CheckCircle2, UserPlus, Gift, ChevronLeft, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';`);

// Revert useAuthStore
content = content.replace(/const \{ user, setUser \} = useAuthStore\(\);/g, 'const { user } = useAuthStore();');

// Remove state variables
content = content.replace(/const \[activeL1Count, setActiveL1Count\] = useState\(0\);\n  const \[claimedBonuses, setClaimedBonuses\] = useState<number\[\]>\(\[\]\);\n  const \[loadingBonus, setLoadingBonus\] = useState<number \| null>\(null\);\n\n/g, '');

// Remove claimBonus function
content = content.replace(/const claimBonus = async \([\s\S]*?\}\n  \};\n\n/g, '');

// Remove activeL1Count calculation in fetchTeam
content = content.replace(/const l1Ids = l1\.map\(u => u\.id\);\n      if \(l1Ids\.length > 0\) \{[\s\S]*?setClaimedBonuses\(claimed\);\n\n/g, '');

// Revert commissions query
content = content.replace(/\.in\('type', \['referral_bonus', 'team_bonus'\]\);/g, `.eq('type', 'referral_bonus');`);

// Remove bonus UI block
content = content.replace(/<div className="mb-8">\n        <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">\n          <Trophy className="w-5 h-5 text-emerald-500" \/>[\s\S]*?Bonus d'invitation\n        <\/h2>\n        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">[\s\S]*?<\/div>\n      <\/div>\n\n/g, '');

fs.writeFileSync('src/pages/Team.tsx', content);
