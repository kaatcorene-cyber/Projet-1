import fs from 'fs';
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

content = content.replace(/const \[pseudo, setPseudo\] = useState\(''\);/, "const [phone, setPhone] = useState('');");
content = content.replace(/onChange={\(e\) => setPseudo\(e\.target\.value\)}/, "onChange={(e) => setPhone(e.target.value)}");
content = content.replace(/<label className="text-\[11px\] font-bold text-slate-500 ml-1 uppercase tracking-widest">Pseudo \/ Identifiant<\/label>/, '<label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Numéro de téléphone</label>');
content = content.replace(/placeholder="Votre phone"/, 'placeholder="Votre numéro"');

// And check if there is any 'pseudo' left in the login function.
content = content.replace(/\.eq\('phone', pseudo\)/, ".eq('phone', phone)"); // Just in case it was pseudo

fs.writeFileSync('src/pages/Login.tsx', content);
