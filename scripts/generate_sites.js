// Node script to generate branded pages from templates/master.html and configs/sites.json
// Usage: node scripts/generate_sites.js
const fs = require('fs');
const path = require('path');

const tplPath = path.join(__dirname, '..', 'templates', 'master.html');
const cfgPath = path.join(__dirname, '..', 'configs', 'sites.json');
const outDir = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(tplPath)) {
  console.error('Template not found:', tplPath);
  process.exit(1);
}
if (!fs.existsSync(cfgPath)) {
  console.error('Config not found:', cfgPath);
  process.exit(1);
}

const tpl = fs.readFileSync(tplPath, 'utf8');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

cfg.sites.forEach(site => {
  let out = tpl;
  // Replace every placeholder of form %%KEY%%
  Object.keys(site).forEach(k => {
    const re = new RegExp('%%' + k + '%%', 'g');
    out = out.replace(re, site[k]);
  });
  // Clean any unreplaced placeholders to safe defaults
  out = out.replace(/%%[A-Z0-9_]+%%/g, '');
  const filename = site.slug + '.html';
  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, out, 'utf8');
  console.log('Generated:', outPath);
});

console.log('All done. Generated', cfg.sites.length, 'sites into', outDir);