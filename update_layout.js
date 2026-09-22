import fs from 'fs';

let layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');

if (!layout.includes('FloatingSupport')) {
  layout = layout.replace("import { BottomNav } from './BottomNav';", "import { BottomNav } from './BottomNav';\nimport { FloatingSupport } from './FloatingSupport';");
  layout = layout.replace("<BottomNav />", "<FloatingSupport />\n      <BottomNav />");
  fs.writeFileSync('src/components/Layout.tsx', layout);
  console.log('Updated Layout');
}
