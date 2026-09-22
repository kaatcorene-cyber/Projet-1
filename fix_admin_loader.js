import fs from 'fs';

let admin = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

admin = admin.replace(
  /      <div className="flex overflow-x-auto gap-2 pb-2 mb-2 scrollbar-hide">/,
  `      {isInitializing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
             <p className="text-slate-500 font-medium">Chargement des données...</p>
          </div>
        </div>
      )}

      <div className="flex overflow-x-auto gap-2 pb-2 mb-2 scrollbar-hide">`
);

fs.writeFileSync('src/pages/Admin.tsx', admin);
console.log('Fixed admin loader');
