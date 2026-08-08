const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const target = `        {showJoinModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col items-center text-center shadow-2xl relative"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📢</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-3">Rejoignez-nous !</h2>
              <p className="text-slate-600 text-sm font-medium mb-6 leading-relaxed">
                🤗 Bienvenue, cher membre sur ElevFinAi ! ElevFinAi est une plateforme dédiée au secteur de l’élevage en Côte d’Ivoire 🇨🇮, visant à valoriser et soutenir les activités d’élevage à travers des solutions modernes et accessibles. Merci pour votre confiance et bienvenue dans l’aventure ! 🐄 🐐 🐑 🐖 🐔
              </p>
              <div className="w-full flex flex-col gap-3">
                <a 
                  href="https://t.me/+w9yTyaXn7AxjMzc0" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={closeJoinModal}
                  className="w-full py-3.5 bg-blue-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
                >
                  Rejoindre le groupe
                </a>
                <button 
                  onClick={closeJoinModal}
                  className="w-full py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 active:scale-95 transition-transform"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}`;

const replacement = `        {showJoinModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden max-w-sm w-full flex flex-col shadow-2xl relative"
            >
              <div className="w-full h-40 relative">
                <img src="https://i.imgur.com/VD6ze7O.png" alt="Join us" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
              </div>
              <div className="p-6 flex flex-col items-center text-center pt-2">
                <h2 className="text-2xl font-black text-slate-900 mb-4">Rejoignez-nous !</h2>
                <p className="text-slate-700 text-[15px] font-serif italic mb-8 leading-relaxed">
                  "🤗 Bienvenue, cher membre sur ElevFinAi ! ElevFinAi est une plateforme dédiée au secteur de l’élevage en Côte d’Ivoire 🇨🇮, visant à valoriser et soutenir les activités d’élevage à travers des solutions modernes et accessibles. Merci pour votre confiance et bienvenue dans l’aventure ! 🐄 🐐 🐑 🐖 🐔"
                </p>
                <div className="w-full flex flex-col gap-3">
                  <a 
                    href="https://t.me/+w9yTyaXn7AxjMzc0" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={closeJoinModal}
                    className="w-full py-3.5 bg-[#0088cc] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0088cc]/20 active:scale-95 transition-transform"
                  >
                    Rejoindre le groupe
                  </a>
                  <button 
                    onClick={closeJoinModal}
                    className="w-full py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 active:scale-95 transition-transform"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/Home.tsx', content);
