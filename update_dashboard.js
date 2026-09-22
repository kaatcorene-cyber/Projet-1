import fs from 'fs';

let dash = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// 1. Replace "Mon Profil" with "Olam Agri" and Logo
dash = dash.replace(
  '<h1 className="text-white text-xl font-black tracking-wide">Mon Profil</h1>',
  `<div className="flex items-center gap-3">
     <img src="/app_icon_orange.jpg" alt="Logo" className="w-10 h-10 rounded-full border-2 border-white/20 shadow-sm object-cover" />
     <h1 className="text-white text-xl font-black tracking-wide">Olam Agri</h1>
   </div>`
);

// 2. Rewrite Profile Card (ID format + Phone/Country at bottom)
const profileCardRegex = /\{\/\* Profile Card \*\/\}\s*<div className="bg-white rounded-\[28px\] p-5 shadow-xl shadow-orange-900\/5 mb-6 relative overflow-hidden border border-slate-100">[\s\S]*?\{\/\* Balance Card \*\/\}/;

const newProfileCard = `{/* Profile Card */}
        <div className="bg-white rounded-[28px] p-5 shadow-xl shadow-orange-900/5 mb-6 relative overflow-hidden border border-slate-100">
           <div className="flex items-center gap-5 mb-5">
              <div className="relative shrink-0">
                 <div className="w-20 h-20 bg-slate-50 rounded-full p-1 shadow-inner border border-slate-100">
                     <img src={avatar} alt="Profile" className="w-full h-full object-cover rounded-full" onError={(e) => { e.currentTarget.src = "/avatar_orange.jpg?v=2"; }} />
                 </div>
                 <label className="absolute -bottom-1 -right-1 bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-orange-700 transition-colors border-2 border-white">
                   <Camera className="w-4 h-4" />
                   <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                 </label>
                 {user?.role === 'vip' && (
                   <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-500 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                     <Crown className="w-3.5 h-3.5 text-white" />
                   </div>
                 )}
              </div>
              <div className="flex-1 min-w-0">
                 <h2 className="text-xl font-black text-slate-900 truncate mb-2">ID : {generateUserId(user?.id)}</h2>
                 <div className="inline-flex items-center justify-center bg-green-50 text-green-600 border border-green-200/60 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                   Actif
                 </div>
              </div>
           </div>
           
           <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                 <Phone className="w-4 h-4 text-orange-500" /> {user?.phone}
              </div>
              <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                 <MapPin className="w-4 h-4 text-orange-500" /> {user?.country || 'Non spécifié'}
              </div>
           </div>
        </div>

        {/* Balance Card */}`;

dash = dash.replace(profileCardRegex, newProfileCard);

// 3. Remove "Total retiré" from Balance Card
const balanceInnerRegex = /<div className="flex justify-between items-end">[\s\S]*?<\/div>\s*<\/div>\s*<div className="flex gap-3">/;

const newBalanceInner = `<div className="flex justify-between items-end mb-2">
                 <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Solde Principal</p>
                    <h2 className="text-4xl font-black tracking-tight">{formatCurrency(balance)}</h2>
                 </div>
              </div>
              
              <div className="flex gap-3 mt-4">`;

dash = dash.replace(balanceInnerRegex, newBalanceInner);

fs.writeFileSync('src/pages/Dashboard.tsx', dash);
console.log('Updated profile');
