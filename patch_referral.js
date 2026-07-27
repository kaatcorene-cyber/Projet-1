import fs from 'fs';
let content = fs.readFileSync('src/pages/Register.tsx', 'utf8');

const oldInput = `<input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal"
                placeholder="Si vous avez été invité"
              />`;

const newInput = `<input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                readOnly={true}
                className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 font-semibold cursor-not-allowed placeholder:text-slate-400 placeholder:font-normal"
                placeholder="Rempli automatiquement via le lien"
              />`;

content = content.replace(oldInput, newInput);
fs.writeFileSync('src/pages/Register.tsx', content);
