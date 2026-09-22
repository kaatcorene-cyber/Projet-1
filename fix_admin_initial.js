import fs from 'fs';

let admin = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

admin = admin.replace(
  /    \}\n    fetchData\(false\);\n\n    \/\/ Polling for live admin updates/m,
  `    }
    fetchData(true);

    // Polling for live admin updates`
);

fs.writeFileSync('src/pages/Admin.tsx', admin);
console.log('Fixed initial load');
