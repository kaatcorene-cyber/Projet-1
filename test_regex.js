import fs from 'fs';
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const oldImgBlock = /<img referrerPolicy="no-referrer" src=\{plan\.image \|\| "https:\/\/images\.unsplash\.com\/photo-1500595046743-cd271d694d30\?auto=format&fit=crop&q=80&w=800"\} alt="Plan" className="w-full h-full object-cover opacity-90" \/>/g;
const newImgBlock = `<img referrerPolicy="no-referrer" src={plan.image || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800"} alt="Plan" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                   <div className="absolute inset-0 bg-yellow-500/10 flex items-center justify-center">
                     <Server className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                   </div>`;

if(oldImgBlock.test(code)) {
    console.log("Match found for image");
    code = code.replace(oldImgBlock, newImgBlock);
    fs.writeFileSync('src/pages/Home.tsx', code);
} else {
    console.log("No match found for image. Regex might be wrong.");
}

