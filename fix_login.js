import fs from 'fs';

let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// Replace Phone Input
content = content.replace(
  /<input\s+type="tel"\s+value=\{phone\}\s+onChange=\{\(e\) => setPhone\(e.target.value\)\}\s+className="([^"]+)"\s+placeholder="Votre numéro"\s+required\s+\/>/m,
  `<input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\\D/g, '').slice(0, 10);
                      setPhone(val);
                    }}
                    maxLength={10}
                    className="$1"
                    placeholder="0102030405"
                    required
                  />`
);

fs.writeFileSync('src/pages/Login.tsx', content);
