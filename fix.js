import fs from 'fs';
import path from 'path';

const files = [
  'src/pages/Profile.tsx',
  'src/pages/Register.tsx',
  'src/pages/Login.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-\[\#1f1f1f\]/g, 'bg-white');
  content = content.replace(/bg-\[\#161616\]/g, 'bg-white');
  fs.writeFileSync(file, content);
});
