import fs from 'fs';

let content = fs.readFileSync('src/pages/Revenues.tsx', 'utf-8');

const regex = /<div className="bg-white\/10 rounded-\[24px\] p-5 border border-white\/20 shadow-sm flex flex-col gap-4">[\s\S]*?<div className="flex justify-between items-start">[\s\S]*?<div>[\s\S]*?<h3 className="text-xl font-black text-white leading-none">\{formatCurrency\(inv\.plan_amount\)\}<\/h3>[\s\S]*?<\/div>[\s\S]*?<div className="bg-white\/5 px-3 py-1\.5 rounded-xl border border-white\/20 flex items-center gap-1\.5 shadow-sm">[\s\S]*?<Clock className="w-4 h-4 text-blue-200\/60" \/>[\s\S]*?<span className="text-white\/90 font-bold text-xs">\{plan\?\.duration \|\| 30\} Jrs<\/span>[\s\S]*?<\/div>[\s\S]*?<\/div>/;

const replacement = `<div className="bg-white/10 rounded-[24px] p-5 border border-white/20 shadow-sm flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-inner border border-white/10">
          <img referrerPolicy="no-referrer" src={getPlanImage(inv.plan_amount)} alt="Plan" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start gap-2">
            <div>
              <span className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-1 block">Pack Actif</span>
              <h3 className="text-xl font-black text-white leading-none">{formatCurrency(inv.plan_amount)}</h3>
            </div>
            <div className="bg-white/5 px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-blue-200/60" />
              <span className="text-white/90 font-bold text-xs">{plan?.duration || 30} J</span>
            </div>
          </div>
        </div>
      </div>`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/pages/Revenues.tsx', content);
