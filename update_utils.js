import fs from 'fs';

let code = fs.readFileSync('src/lib/utils.ts', 'utf8');

const oldGetPlanName = /export const getPlanName = \(amount: number\) => \{[\s\S]*?return 'Pack Élevage';\n\};/m;
const newGetPlanName = `export const getPlanName = (amount: number) => {
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

if (oldGetPlanName.test(code)) {
    code = code.replace(oldGetPlanName, newGetPlanName);
    fs.writeFileSync('src/lib/utils.ts', code);
    console.log("Updated utils.ts");
} else {
    console.log("Could not find getPlanName in utils.ts");
}
