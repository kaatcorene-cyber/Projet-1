import fs from 'fs';

// --- Dashboard.tsx ---
let dash = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

dash = dash.replace(
  "localStorage.getItem(`avatar_${user?.id}`) || 'https://i.imgur.com/2QzGpuQ.png'",
  "localStorage.getItem(`avatar_${user?.id}`) || '/logo.svg'"
);

const getTgLinkStr = `
const getTgLink = (url: string | undefined | null) => {
  if (!url || url === '#') return '#';
  if (url.startsWith('https://t.me/')) {
    const path = url.replace('https://t.me/', '');
    if (path.startsWith('+')) {
      return \`tg://join?invite=\${path.substring(1)}\`;
    }
    return \`tg://resolve?domain=\${path}\`;
  }
  return url;
};
`;

if (!dash.includes('getTgLink')) {
  dash = dash.replace(
    "export function Dashboard() {",
    getTgLinkStr + "\nexport function Dashboard() {"
  );
}

dash = dash.replace(
  /<a href=\{supportLink\} target="_blank"/,
  '<a href={getTgLink(supportLink)} target="_blank"'
);
dash = dash.replace(
  /<a href=\{groupLink\} target="_blank"/,
  '<a href={getTgLink(groupLink)} target="_blank"'
);

fs.writeFileSync('src/pages/Dashboard.tsx', dash);

// --- Register.tsx ---
let reg = fs.readFileSync('src/pages/Register.tsx', 'utf8');

const newRefCode = `
      const generateRef = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let res = '';
        for (let i = 0; i < 6; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
        return res;
      };
      
      let finalCode = generateRef();
      let codeUnique = false;
      
      while(!codeUnique) {
          const { data: existingRef } = await supabase.from('users').select('id').eq('referral_code', finalCode).maybeSingle();
          if (existingRef) {
              finalCode = generateRef();
          } else {
              codeUnique = true;
          }
      }
`;

const oldRefCodeMatch = /let myReferralCode = 'USER' \+ Math\.floor\(Math\.random\(\) \* 1000000\);[\s\S]*?codeUnique = true;\s*\}\s*\}/;

reg = reg.replace(oldRefCodeMatch, newRefCode);
// It also mentions "ça doit pas être un rien, tu mélanges juste les lettres et aussi ça doit être en minuscule"
// We already did this with generateRef().
fs.writeFileSync('src/pages/Register.tsx', reg);

