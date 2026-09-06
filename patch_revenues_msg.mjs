import fs from 'fs';

let content = fs.readFileSync('src/pages/Revenues.tsx', 'utf-8');

const oldHeader = `      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={\`p-4 rounded-xl mb-6 flex items-center gap-3 border \${message.type === 'success' ? 'bg-brand-50 text-brand-600 border-brand-200' : 'bg-red-50 text-red-600 border-red-200'}\`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-semibold">{message.text}</p>
        </motion.div>
      )}

      <div className="max-w-md mx-auto space-y-4 mb-12">`;

const newHeader = `      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={\`p-4 rounded-xl mb-6 flex items-center gap-3 border \${message.type === 'success' ? 'bg-brand-50 text-brand-600 border-brand-200' : 'bg-red-50 text-red-600 border-red-200'}\`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-semibold">{message.text}</p>
        </motion.div>
      )}

      <div className="max-w-md mx-auto mb-6 text-center">
         <p className="text-blue-200/80 text-sm font-medium bg-white/5 inline-block px-4 py-2 rounded-full border border-white/10 shadow-sm">
           Sélectionnez un pack pour générer des revenus passifs 🚀
         </p>
      </div>

      <div className="max-w-md mx-auto space-y-4 mb-12">`;

content = content.replace(oldHeader, newHeader);
fs.writeFileSync('src/pages/Revenues.tsx', content);
