import fs from 'fs';

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// remove confirmDeleteId state
content = content.replace(/const \[confirmDeleteId, setConfirmDeleteId\] = useState<string \| null>\(null\);/, '');
// fix handleDeleteUser to avoid clearing setConfirmDeleteId
content = content.replace(/setConfirmDeleteId\(null\);\s*/, '');

// replace inline confirm delete UI
const inlineConfirmStart = `) : confirmDeleteId === u.id ? (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 text-xs font-medium">
                    <button onClick={() => handleDeleteUser(u.id)} disabled={loading} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 cursor-pointer transition-colors">Oui, Supprimer</button>
                    <button onClick={() => setConfirmDeleteId(null)} disabled={loading} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 cursor-pointer transition-colors">Annuler</button>
                  </div>`;
content = content.replace(inlineConfirmStart, "");

// Modify the original delete button to just call handleDeleteUser
content = content.replace(/onClick=\{\(\) => setConfirmDeleteId\(u\.id\)\}/, "onClick={() => handleDeleteUser(u.id)}");

fs.writeFileSync('src/pages/Admin.tsx', content);
