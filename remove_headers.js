import fs from 'fs';

// --- Login.tsx ---
let loginCode = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const loginRegex = /<div className="text-center mb-8">[\s\S]*?<div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-yellow-500\/20 rotate-12">[\s\S]*?<\/div>[\s\S]*?<h1 className="text-4xl font-black text-white tracking-tight mb-2">Bon retour<\/h1>[\s\S]*?<p className="text-yellow-400 font-medium">Connectez-vous à votre espace<\/p>[\s\S]*?<\/div>/m;

const loginReplacement = `<div className="text-center mb-8 mt-4">
           <p className="text-yellow-400 font-bold text-lg">Connectez-vous à votre espace</p>
        </div>`;

loginCode = loginCode.replace(loginRegex, loginReplacement);
fs.writeFileSync('src/pages/Login.tsx', loginCode);

// --- Register.tsx ---
let registerCode = fs.readFileSync('src/pages/Register.tsx', 'utf8');

const registerRegex = /<div className="text-center mb-8">[\s\S]*?<div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl shadow-yellow-500\/20 rotate-12">[\s\S]*?<\/div>[\s\S]*?<h1 className="text-3xl font-black text-white tracking-tight mb-2">Rejoignez-nous<\/h1>[\s\S]*?<p className="text-yellow-400 font-medium">Créez votre compte en quelques secondes<\/p>[\s\S]*?<\/div>/m;

const registerReplacement = `<div className="text-center mb-8 mt-4">
           <p className="text-yellow-400 font-bold text-lg">Créez votre compte en quelques secondes</p>
        </div>`;

registerCode = registerCode.replace(registerRegex, registerReplacement);
fs.writeFileSync('src/pages/Register.tsx', registerCode);
