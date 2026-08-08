const fs = require('fs');
let content = fs.readFileSync('src/pages/Proofs.tsx', 'utf8');

const target = `      <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 shadow-sm mb-8 flex items-start gap-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-emerald-900 font-bold text-sm mb-1">Paiements Garantis</h2>
          <p className="text-emerald-700 text-xs leading-relaxed">
            Tous les retraits sont traités de manière automatique et sécurisée vers vos comptes Mobile Money. Voici les derniers retraits effectués par nos membres.
          </p>
        </div>
      </div>`;

content = content.replace(target, '');
fs.writeFileSync('src/pages/Proofs.tsx', content);
