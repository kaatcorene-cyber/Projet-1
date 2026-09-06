import fs from 'fs';
let content = fs.readFileSync('src/pages/History.tsx', 'utf-8');

content = content.replace(
  '<div className="px-5 pt-12 pb-32 min-h-[100dvh] bg-white max-w-lg mx-auto font-sans relative text-slate-900 z-20">',
  `<div className="min-h-[100dvh] bg-white font-sans relative text-slate-900 z-20">
      <div className="px-5 pt-12 pb-32 max-w-lg mx-auto">`
);

content = content.replace(
  '    </div>\n  );\n}',
  '      </div>\n    </div>\n  );\n}'
);

fs.writeFileSync('src/pages/History.tsx', content);
