import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Replace "Preuves" tab with "Coffre"
code = code.replace("{ id: 'proofs', label: 'Preuves', icon: ImageIcon },", "{ id: 'vault', label: 'Coffre', icon: Key },");
code = code.replace("import { Users, CreditCard, Download, Upload, Settings, RefreshCw, Trash2, Edit2, Search, ArrowUpRight, ArrowDownRight, Package, Image as ImageIcon } from 'lucide-react';", "import { Users, CreditCard, Download, Upload, Settings, RefreshCw, Trash2, Edit2, Search, ArrowUpRight, ArrowDownRight, Package, Key } from 'lucide-react';");

fs.writeFileSync('src/pages/Admin.tsx', code);
