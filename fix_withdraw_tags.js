import fs from 'fs';
let file = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

file = file.replace(/           <\/div>\n          <\/div>\n          <\/form>\n        <\/div>\n      \)}/m, `           </div>\n          </form>\n        </div>\n      )}`);

fs.writeFileSync('src/pages/Withdraw.tsx', file);
