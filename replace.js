const fs = require('fs');
let content = fs.readFileSync('d:/navigators/app/admin/page.tsx', 'utf8');

content = content.replace(/min-h-screen bg-gradient-to-b from-navyDark via-\[#1a1a4e\] to-\[#2d1b4e\]/g, 'min-h-screen bg-gray-50');
content = content.replace(/bg-navyBlue/g, 'bg-white');
content = content.replace(/bg-navyDark/g, 'bg-gray-50');
content = content.replace(/bg-slate-900/g, 'bg-white');
content = content.replace(/border-slate-800/g, 'border-gray-200');
content = content.replace(/border-slate-700/g, 'border-gray-300');
content = content.replace(/text-white/g, 'text-brand-ink');
content = content.replace(/text-slate-400/g, 'text-brand-muted');
content = content.replace(/text-slate-300/g, 'text-gray-600');
content = content.replace(/text-slate-200/g, 'text-gray-800');
content = content.replace(/text-primaryCyan/g, 'text-brand-blue');
content = content.replace(/bg-primaryCyan/g, 'bg-brand-blue text-white');
content = content.replace(/bg-gradient-to-tr from-primaryCyan to-blue-600/g, 'bg-brand-blue');
content = content.replace(/bg-gradient-to-r from-primaryCyan to-blue-600/g, 'bg-brand-blue text-white');
content = content.replace(/text-navyDark/g, 'text-white');
content = content.replace(/hover:bg-slate-800\/50/g, 'hover:bg-gray-50');
content = content.replace(/divide-slate-800/g, 'divide-gray-200');
content = content.replace(/bg-slate-800/g, 'bg-gray-100');
content = content.replace(/text-slate-500/g, 'text-gray-400');
content = content.replace(/text-accentGold/g, 'text-brand-orange');

fs.writeFileSync('d:/navigators/app/admin/page.tsx', content);
