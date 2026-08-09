const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Remove showJoinModal state
code = code.replace(/const \[showJoinModal, setShowJoinModal\] = useState\(true\);\s*const closeJoinModal = \(\) => \{\s*setShowJoinModal\(false\);\s*\};\s*/, "");

// Remove the modal JSX
const modalRegex = /<AnimatePresence>[\s\S]*?\{showJoinModal && \([\s\S]*?<\/motion\.div>\s*\)\}\s*<\/AnimatePresence>/;
code = code.replace(modalRegex, "");

fs.writeFileSync('src/pages/Home.tsx', code);
