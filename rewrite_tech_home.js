import fs from 'fs';

let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. Add new icons to import
code = code.replace(/import \{ CheckCircle2, /, "import { Server, Cpu, Database, Network, HardDrive, CheckCircle2, ");

// 2. Change BANNER_IMAGES
const oldBanners = /const BANNER_IMAGES = \[[^\]]+\];/m;
const newBanners = `const BANNER_IMAGES = [
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800", // Cyber / Servers
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800", // Motherboard/Chip
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800", // Planet/Tech
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800"  // AI Network
];`;
code = code.replace(oldBanners, newBanners);

// 3. Change getPlanName
const oldGetPlanName = /const getPlanName = \(amount: number\) => \{[\s\S]*?return 'Pack Élevage';\s*\};/m;
const newGetPlanName = `const getPlanName = (amount: number) => {
    const amt = Number(amount);
    if (amt === 3000) return 'Cloud Node Alpha';
    if (amt === 7000) return 'Cloud Node Beta';
    if (amt === 15000) return 'Serveur IA Standard';
    if (amt === 31000) return 'Serveur IA Premium';
    if (amt === 63000) return 'Cluster Data Pro';
    if (amt === 125000) return 'Cluster Data Max';
    if (amt === 249000) return 'Supercalculateur V1';
    if (amt === 497000) return 'Quantum Node V2';
    return 'Serveur Tech';
  };`;
code = code.replace(oldGetPlanName, newGetPlanName);

// 4. Update texts in Modal & Banner
code = code.replace(/<Leaf className="w-8 h-8 text-slate-900 -rotate-3" \/>/g, '<Cpu className="w-8 h-8 text-slate-900 -rotate-3" />');
code = code.replace(/Votre plateforme dédiée à l'investissement dans le secteur de l'élevage\. Découvrez nos opportunités et générez des revenus passifs\./g, "Votre plateforme dédiée à l'investissement dans le Cloud computing et l'Intelligence Artificielle. Financez des fermes de serveurs et générez des revenus passifs automatiques.");
code = code.replace(/Investissez dans l'élevage en Côte d'Ivoire\./g, "Investissez dans les technologies de demain.");

// 5. Change Plan Card fallback image
code = code.replace(/"https:\/\/images\.unsplash\.com\/photo-1500595046743-cd271d694d30\?auto=format&fit=crop&q=80&w=800"/g, '"https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800"');

// 6. Make Plan layout look more like a server node (Add a glowing Server icon if there's no image or just overlay it)
// We will replace the <img ... /> section inside the mapped plans
const oldImgBlock = /<img referrerPolicy="no-referrer" src=\{plan\.image \|\| "https:\/\/images\.unsplash\.com\/photo-1558494949-ef010cbdcc31\?auto=format&fit=crop&q=80&w=800"\} alt="Plan" className="w-full h-full object-cover opacity-90" \/>/g;
const newImgBlock = `<img referrerPolicy="no-referrer" src={plan.image || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800"} alt="Plan" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                   <div className="absolute inset-0 bg-yellow-500/10 flex items-center justify-center">
                     <Server className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                   </div>`;
code = code.replace(oldImgBlock, newImgBlock);

// 7. Update QuickLinks Vault image to a tech-looking vault or just remove the image so it uses an icon
const oldVaultImage = /image: 'https:\/\/images\.unsplash\.com\/photo-1582139329536-e7284fece509\?auto=format&fit=crop&q=80&w=400'/g;
const newVaultImage = `image: 'https://images.unsplash.com/photo-1614064641913-6b71f301682b?auto=format&fit=crop&q=80&w=400'`;
code = code.replace(oldVaultImage, newVaultImage);

fs.writeFileSync('src/pages/Home.tsx', code);
