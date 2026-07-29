import fs from 'fs';
const lines = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8').split('\n');
// Find the last </button>
let idx = lines.length - 1;
while(idx > 0 && !lines[idx].includes('</button>')) {
  idx--;
}
const fixed = lines.slice(0, idx + 1).join('\n') + '\n        </div>\n      </div>\n    </div>\n  );\n}';
fs.writeFileSync('src/pages/Dashboard.tsx', fixed);
