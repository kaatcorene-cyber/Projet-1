const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

if (!code.includes('let isProcessingYields = false;')) {
    code = code.replace(
        "export function Layout() {",
        "let isProcessingYields = false;\n\nexport function Layout() {"
    );
    
    code = code.replace(
        "const processDailyYields = async (userId: string) => {\n    try {",
        "const processDailyYields = async (userId: string) => {\n    if (isProcessingYields) return;\n    isProcessingYields = true;\n    try {"
    );
    
    code = code.replace(
        "refreshUser();\n      }",
        "refreshUser();\n      }\n    } catch (e) {\n      console.error(e);\n    } finally {\n      isProcessingYields = false;\n    }\n  };\n\n  // Remove old catch block to avoid syntax error"
    );
    
    // Actually, it's safer to just regex replace the exact try/catch.
}
