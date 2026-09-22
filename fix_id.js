import fs from 'fs';

let utils = fs.readFileSync('src/lib/utils.ts', 'utf8');
utils += `
export function generateUserId(uuid: string | undefined) {
  if (!uuid) return '000000';
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash).toString().substring(0, 6).padStart(6, '0');
}
`;
fs.writeFileSync('src/lib/utils.ts', utils);

let dash = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
dash = dash.replace(/const generateUserId = \([\s\S]*?\}\;\n/m, '');
dash = dash.replace(/import \{ formatCurrency \} from '\.\.\/lib\/utils';/, "import { formatCurrency, generateUserId } from '../lib/utils';");
fs.writeFileSync('src/pages/Dashboard.tsx', dash);

let admin = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
admin = admin.replace(/import \{ formatCurrency \} from '\.\.\/lib\/utils';/, "import { formatCurrency, generateUserId } from '../lib/utils';");

// Replace all instances of `OLA-${u.id.substring(0,6).toUpperCase()}` and similar with `generateUserId(...)`
admin = admin.replace(/OLA-\$\{u\.id\.substring\(0,6\)\.toUpperCase\(\)\}/g, "${generateUserId(u.id)}");
admin = admin.replace(/OLA-\$\{t\.users\?\.id\?\.substring\(0,6\)\.toUpperCase\(\)\}/g, "${generateUserId(t.users?.id)}");
admin = admin.replace(/OLA-\{tx\.users\?\.id\?\.substring\(0,6\)\.toUpperCase\(\)\}/g, "{generateUserId(tx.users?.id)}");
admin = admin.replace(/OLA-\{u\.id\.substring\(0,6\)\.toUpperCase\(\)\}/g, "{generateUserId(u.id)}");

fs.writeFileSync('src/pages/Admin.tsx', admin);

console.log('Fixed IDs');
