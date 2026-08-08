const fs = require('fs');

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Remove the old image block
  content = content.replace(/<div className="mb-6 flex justify-center">\s*<img src="https:\/\/i\.imgur\.com\/pjehTuR\.jpg"[\s\S]*?<\/div>\n/g, '');
  
  // Replace the container classes to allow full width header
  content = content.replace('className="min-h-screen bg-slate-50 flex flex-col justify-center px-6 py-12 font-sans relative overflow-hidden"', 
                            'className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden"');

  const headerHTML = `
      <div className="w-full h-64 md:h-72 relative z-10 shadow-sm rounded-b-[40px] overflow-hidden mb-8">
        <img src="https://i.imgur.com/pjehTuR.jpg" alt="Logo" className="w-full h-full object-cover" />
      </div>
      
      <div className="px-6 flex-1 flex flex-col pb-12">
`;

  // Inject header HTML before motion.div
  content = content.replace(/<motion\.div\s+initial=\{\{ opacity: 0, y: 15 \}\}/, headerHTML + '        <motion.div\n          initial={{ opacity: 0, y: 15 }}');

  // Add closing divs at the end
  content = content.replace('</motion.div>\n    </div>', '</motion.div>\n      </div>\n    </div>');

  fs.writeFileSync(file, content);
}

patchFile('src/pages/Register.tsx');
patchFile('src/pages/Login.tsx');
