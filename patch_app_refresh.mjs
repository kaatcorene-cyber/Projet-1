import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace("import { supabase } from './lib/supabase';", "import { supabase } from './lib/supabase';\nimport { useAppStore } from './store/useAppStore';");

content = content.replace(
  /await supabase\.from\('settings'\)\.upsert\(\{ key: 'investment_plans', value: JSON\.stringify\(newPlans\) \}\);/g,
  "await supabase.from('settings').upsert({ key: 'investment_plans', value: JSON.stringify(newPlans) });\n             useAppStore.getState().fetchConfig();"
);

fs.writeFileSync('src/App.tsx', content);
