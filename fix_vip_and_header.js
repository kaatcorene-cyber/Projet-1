import fs from 'fs';

let dashboard = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// 1. Remove the 🍀 icon from front of Olam Agri
const titleRegex = /<div className="flex items-center gap-3">\s*<div className="w-10 h-10 rounded-full border-2 border-white\/20 shadow-sm bg-white flex items-center justify-center text-xl pb-0.5">🍀<\/div>\s*<h1 className="text-white text-xl font-black tracking-wide">Olam Agri 🍀<\/h1>\s*<\/div>/;

const newTitle = `<div className="flex items-center gap-3">
             <h1 className="text-white text-2xl font-black tracking-wide">Olam Agri 🍀</h1>
           </div>`;

dashboard = dashboard.replace(titleRegex, newTitle);

// 2. Add VIP logic and display it next to ID
// First, add the getVipLevel function before the return statement of Dashboard
const vipFunction = `
  const getVipLevel = (investments?: any[]) => {
    if (!investments || investments.length === 0) return 'VIP0';
    const maxInvest = Math.max(...investments.map(i => Number(i.amount) || 0));
    if (maxInvest >= 500000) return 'VIP5';
    if (maxInvest >= 200000) return 'VIP4';
    if (maxInvest >= 90000) return 'VIP3';
    if (maxInvest >= 40000) return 'VIP2';
    if (maxInvest >= 5000) return 'VIP1';
    return 'VIP0';
  };

  return (`;

dashboard = dashboard.replace(/return \(/, vipFunction);

// Then replace the ID line to include VIP badge
const idRegex = /<h2 className="text-xl font-black text-slate-900 truncate mb-2">ID : \{generateUserId\(user\?\.id\)\}<\/h2>/;
const newId = `<div className="flex flex-wrap items-center gap-2 mb-2">
                   <h2 className="text-xl font-black text-slate-900 truncate">ID : {generateUserId(user?.id)}</h2>
                   <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
                     <Crown className="w-3 h-3" />
                     {getVipLevel(user?.investments)}
                   </div>
                 </div>`;

dashboard = dashboard.replace(idRegex, newId);

// Ensure Crown is imported if not already. It should be, but let's check.
if (!dashboard.includes('Crown')) {
    dashboard = dashboard.replace('Activity,', 'Activity, Crown,');
}

// Write the changes
fs.writeFileSync('src/pages/Dashboard.tsx', dashboard);
console.log('Fixed VIP and Header');
