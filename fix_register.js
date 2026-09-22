import fs from 'fs';
let code = fs.readFileSync('src/pages/Register.tsx', 'utf8');

const regex = /return \([\s\S]*?\);\n\}/m;

const replacement = `return (
    <div className="min-h-[100dvh] flex items-center justify-center font-sans relative overflow-hidden bg-slate-900 py-10">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1000&auto=format&fit=crop" 
          alt="Background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto relative z-10 px-6 py-6"
      >
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl shadow-emerald-500/20 rotate-12">
             <div className="w-8 h-8 bg-white rounded-lg -rotate-12 shadow-inner"></div>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight mb-2">Rejoignez-nous</h1>
           <p className="text-emerald-400 font-medium">Créez votre compte en quelques secondes</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-200 text-sm font-medium text-center"
              >
                {error}
              </motion.div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-2">Téléphone</label>
              <div className="relative flex items-center">
                <span className="absolute left-5 text-emerald-500 font-bold text-base">+225</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\\D/g, '').slice(0, 10);
                    setFormData({ ...formData, phone: val });
                  }}
                  maxLength={10}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-16 pr-5 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold placeholder:text-slate-500 text-base"
                  placeholder="01 02 03 04 05"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-2">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-5 pr-14 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold placeholder:text-slate-500 text-base"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-2">Code d'invitation</label>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                readOnly={true}
                className="w-full bg-slate-900/30 border border-white/5 rounded-2xl px-5 py-4 text-slate-400 font-semibold cursor-not-allowed text-base"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black py-4 rounded-2xl mt-6 transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {loading ? 'Création...' : (
                <>Créer mon compte <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
          
          <p className="text-center text-slate-400 text-sm mt-8 font-medium">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/Register.tsx', code);
