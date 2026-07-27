import fs from 'fs';

let content = fs.readFileSync('src/pages/Register.tsx', 'utf8');

// Replace the image
content = content.replace('https://i.imgur.com/u0FLYYs.png', 'https://i.imgur.com/K9gVSeO.jpeg');
content = content.replace('https://i.imgur.com/K9gVSeO.jpeg', 'https://i.imgur.com/K9gVSeO.jpg'); // The user provided imgur link might need .jpg

// Remove captcha block
const captchaStart = content.indexOf('<div className="space-y-1.5">\n              <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest flex justify-between">\n                <span>Vérification</span>');
if (captchaStart !== -1) {
  const captchaEnd = content.indexOf('</div>\n            </div>', captchaStart) + '</div>\n            </div>'.length;
  content = content.substring(0, captchaStart) + content.substring(captchaEnd);
}

// Remove (Optionnel) from Referral Code
content = content.replace('<span className="text-slate-400 font-normal">(Optionnel)</span>', '');
// But it leaves empty span, better to replace the whole label
content = content.replace(/<label className="text-\[11px\] font-bold text-slate-500 ml-1 uppercase tracking-widest flex justify-between">\s*<span>Code d'invitation<\/span>\s*<\/label>/, '<label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest flex justify-between">\n                <span>Code d\'invitation</span>\n              </label>');
content = content.replace(/<label className="text-\[11px\] font-bold text-slate-500 ml-1 uppercase tracking-widest flex justify-between">\s*<span>Code d'invitation<\/span>\s*<span className="text-slate-400 font-normal">\(Optionnel\)<\/span>\s*<\/label>/, '<label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">\n                Code d\'invitation\n              </label>');

// Remove userCaptcha from form validation logic
content = content.replace(/if \(!formData\.phone \|\| !formData\.password \|\| !userCaptcha\)/g, 'if (!formData.phone || !formData.password)');
content = content.replace(/if \(userCaptcha !== captchaValue\) \{[\s\S]*?return;\n    \}/g, '');

// Update Country Selection
// User wants to only have Bénin, Togo, Burkina Faso, Niger available.
// In the select, we should map over them.
// Currently the phone number is just an input. Let's see if there is already a country selector.
// From previous check, formData has country: "Côte d'Ivoire".
// Let's replace the phone number block with a combined country + phone block.

const phoneBlockRegex = /<div className="space-y-1\.5">\s*<label className="text-\[11px\] font-bold text-slate-500 ml-1 uppercase tracking-widest">Numéro de téléphone<\/label>\s*<input\s*type="tel"\s*name="phone"\s*value=\{formData\.phone\}\s*onChange=\{handleChange\}\s*className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2\.5 text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal"\s*placeholder="Votre numéro"\s*required\s*\/>\s*<\/div>/;

const newPhoneBlock = `
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Numéro de téléphone</label>
              <div className="flex gap-2">
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-1/3 bg-slate-50 border-2 border-slate-100 rounded-xl px-2 py-2.5 text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-semibold"
                >
                  <option value="Bénin">Bénin (+229)</option>
                  <option value="Togo">Togo (+228)</option>
                  <option value="Burkina">Burkina Faso (+226)</option>
                  <option value="Niger">Niger (+227)</option>
                </select>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-2/3 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal"
                  placeholder="Votre numéro"
                  required
                />
              </div>
            </div>`;

content = content.replace(phoneBlockRegex, newPhoneBlock);

fs.writeFileSync('src/pages/Register.tsx', content);
