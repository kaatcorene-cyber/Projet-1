import fs from 'fs';

let content = fs.readFileSync('src/pages/Register.tsx', 'utf8');

// Replace Phone Input
content = content.replace(
  /<input\s+type="tel"\s+name="phone"\s+value=\{formData.phone\}\s+onChange=\{handleChange\}\s+className="([^"]+)"\s+placeholder="Votre numéro"\s+required\s+\/>/m,
  `<input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phone: val });
                    }}
                    maxLength={10}
                    className="$1"
                    placeholder="0102030405"
                    required
                  />`
);

// Replace Referral Code Input
content = content.replace(
  /<input\s+type="text"\s+name="referralCode"\s+value=\{formData.referralCode\}\s+onChange=\{handleChange\}\s+className="([^"]+)"\s+placeholder="Entrez le code d'invitation \(facultatif\)"\s+\/>/m,
  `<input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                readOnly={true}
                className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 font-semibold cursor-not-allowed placeholder:text-slate-400 placeholder:font-normal"
                placeholder="Rempli automatiquement via le lien"
              />`
);

fs.writeFileSync('src/pages/Register.tsx', content);
