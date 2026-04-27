import fs from 'fs';
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// add message state
const statePattern = /const \[loading, setLoading\] = useState\(false\);/;
if (content.match(statePattern)) {
   content = content.replace(statePattern, "const [loading, setLoading] = useState(false);\n  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);\n");
}

let replacedAlerts = content.replace(/alert\((.*)\)/g, "setMessage({ type: 'error', text: $1 })");

// fix the success one manually
replacedAlerts = replacedAlerts.replace("setMessage({ type: 'error', text: 'Paramètres enregistrés !' })", "setMessage({ type: 'success', text: 'Paramètres enregistrés !' })");

// add message display under the header
const headerPattern = /<h1 className="text-2xl font-bold text-gray-900 truncate">Administration<\/h1>\s*<\/header>/;

if (replacedAlerts.match(headerPattern)) {
    replacedAlerts = replacedAlerts.replace(headerPattern, `<h1 className="text-2xl font-bold text-gray-900 truncate">Administration</h1>\n      </header>\n\n      {message && (\n        <div className={\`p-4 rounded-xl text-sm font-medium \${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}\`}>\n          {message.text}\n        </div>\n      )}`);
}

fs.writeFileSync('src/pages/Admin.tsx', replacedAlerts);
console.log("Replaced alerts with message state");
