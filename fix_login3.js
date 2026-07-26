import fs from 'fs';

let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// I will just re-write the form block to be safe.
const newForm = `          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm text-center font-medium shadow-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Numéro de téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal"
                placeholder="Votre numéro"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors bg-white rounded-lg shadow-sm border border-slate-100"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-700 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-500 font-bold py-4 rounded-xl mt-6 transition-all shadow-lg shadow-blue-600/30 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2 group"
            >
              {loading ? 'Connexion en cours...' : (
                 <>Se connecter <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>`;

content = content.replace(/<form onSubmit={handleLogin} className="space-y-4">[\s\S]*?<\/form>/, newForm);
fs.writeFileSync('src/pages/Login.tsx', content);
