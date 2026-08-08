const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
if (!css.includes('marquee-y')) {
  css += `
@keyframes marquee-y {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}
.animate-marquee-y {
  animation: marquee-y 20s linear infinite;
}
.animate-marquee-y:hover {
  animation-play-state: paused;
}
`;
  fs.writeFileSync('src/index.css', css);
}
