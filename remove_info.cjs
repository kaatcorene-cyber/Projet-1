const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const target = `      {/* Info Section */}
      <div id="info" className="mt-12 mb-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Info className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">À Propos de ElevFinAi</h2>
            <p className="text-slate-500 text-xs mt-1">L'innovation au service de l'élevage</p>
          </div>
        </div>

        <div className="w-full h-40 rounded-2xl overflow-hidden mb-6 relative">
          <img src="https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&q=80&w=800" alt="Élevage" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-4">
            <p className="text-white font-bold text-sm">Valoriser et soutenir les activités d’élevage en Côte d’Ivoire 🇨🇮</p>
          </div>
        </div>

        <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
          ElevFinAi est une entreprise dynamique dédiée à la révolution du secteur de l'élevage. Nous mettons en relation les investisseurs avec des opportunités réelles dans le domaine agropastoral. Notre objectif est de garantir un rendement sûr tout en participant activement au développement de l'agriculture locale.
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Rentabilité Assurée</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Nous sélectionnons avec soin les projets les plus rentables pour maximiser vos gains quotidiens de manière stable.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Sécurité & Transparence</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Vos investissements sont protégés et utilisés concrètement pour l'achat, l'entretien et la vente du bétail.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Développement Durable</h4>
              <p className="text-slate-500 text-xs leading-relaxed">En investissant, vous soutenez les éleveurs locaux et favorisez un développement agropastoral moderne et responsable.</p>
            </div>
          </div>
        </div>
      </div>`;

content = content.replace(target, '');
fs.writeFileSync('src/pages/Home.tsx', content);
