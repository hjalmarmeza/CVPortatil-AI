const fs = require('fs');
const file = '/Users/hjalmarmeza/Antigravity/CVPortatil-AI/src/data/baseCV.ts';
let code = fs.readFileSync(file, 'utf8');

// The file currently has:
//     {
//       title: "IA Ministerial & Narrativa",
//       skills: ["Motion Comic Autónomo", "Narrativa Profética IA", "Dirección Cinematográfica", "Despliegue Cloud Forge"]
//     }
//   ],
//     },
//     {
//       title: "Control Remoto e Interfaces Asíncronas",
// ...

// We want to replace everything from the end of domainAreas up to the end of the portfolio array with:
//   portfolio: []

code = code.replace(/(\s*\}\s*\]\s*,)[\s\S]*?(?=\s*\]\s*;\s*$)/, '$1\n  portfolio: []');

fs.writeFileSync(file, code);
