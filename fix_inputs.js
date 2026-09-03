import fs from 'fs';

// 1. Fix Register.tsx
let regContent = fs.readFileSync('src/pages/Register.tsx', 'utf8');

regContent = regContent.replace(
  /<input\s+type="tel"\s+name="phone"\s+value=\{formData\.phone\}\s+onChange=\{handleChange\}\s+className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-14 pr-4 py\.2\.5 text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-bold placeholder:text-slate-400 placeholder:font-normal"\s+placeholder="Votre numéro"\s+required\s+\/>/m,
  `<input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phone: val });
                    }}
                    maxLength={10}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-14 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-bold placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="0102030405"
                    required
                  />`
);

// We need to use regex properly because we have py.2.5 typo in string replace above, let's just do a clean string replace or generic regex.
