#!/usr/bin/env node
// Node script to generate branded pages from templates/master.html and configs/sites.json
// Usage:
//  node scripts/generate_sites.js            -> generates all sites
//  node scripts/generate_sites.js --slug=jm3 -> generates only the jm3 site
//  node scripts/generate_sites.js -s jm3     -> same as above

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

function getArg(nameShort, nameLong) {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === nameShort || a === nameLong) return args[i + 1] || null;
    if (a.startsWith(nameLong + '=')) return a.split('=')[1];
    if (a.startsWith(nameShort + '=')) return a.split('=')[1];
  }
  return null;
}

const slug = getArg('-s', '--slug');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function generateSite(site) {
  let out = tpl;
  // Replace keys present in the site object
  Object.keys(site).forEach(k => {
    const re = new RegExp('%%' + k + '%%', 'g');
    out = out.replace(re, site[k]);
  });
  // Remove any remaining placeholders so generated file is clean
  out = out.replace(/%%[A-Z0-9_]+%%/g, '');

  const filename = site.slug + '.html';
  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, out, 'utf8');
  console.log('Generated:', outPath);
}

if (slug) {
  const site = cfg.sites.find(s => s.slug === slug);
  if (!site) {
    console.error('No site with slug:', slug);
    process.exit(1);
  }
  generateSite(site);
} else {
  cfg.sites.forEach(site => generateSite(site));
  console.log('All done. Generated', cfg.sites.length, 'sites into', outDir);
}});

console.log('All done. Generated', cfg.sites.length, 'sites into', outDir);
