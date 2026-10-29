// Renders every asset and README.md from profile.config.json and data/stats.json
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { buildHero } from './lib/hero.mjs';
import { overviewCard, techStackCard, projectCard, contactBar } from './lib/sections.mjs';
import { metricsCard, demoStats } from './lib/telemetry.mjs';

const root = new URL('../', import.meta.url);
const cfg = JSON.parse(readFileSync(new URL('profile.config.json', root), 'utf8'));
const statsPath = new URL('data/stats.json', root);
const stats = existsSync(statsPath) ? JSON.parse(readFileSync(statsPath, 'utf8')) : demoStats();

mkdirSync(new URL('assets/', root), { recursive: true });
let bytes = 0;
const out = (name, svg) => {
  writeFileSync(new URL(`assets/${name}`, root), svg);
  bytes += svg.length;
};

// 1. Hero Banner
out('hero.svg', buildHero(cfg));

// 2. Capabilities Overview
out('overview.svg', overviewCard(cfg));

// 3. Technical Stack
out('stack.svg', techStackCard(cfg));

// 4. Featured Projects
cfg.projects.forEach((p) => {
  out(`project-${p.key}.svg`, projectCard(p, 490));
});

// 5. Engineering Metrics
out('metrics.svg', metricsCard(stats));

// 6. Contact / Footer Bar
out('contact.svg', contactBar(cfg));

// ---------- Clean, High-Impact Professional README.md ----------
const gh = `https://github.com/${cfg.username}`;

const projectGrid = `
<p align="center">
  <a href="${gh}/MediCare-Bridge"><img src="assets/project-medicare.svg" width="49%" alt="MediCare-Bridge"></a>
  <a href="${gh}/LaptopFinder"><img src="assets/project-laptopfinder.svg" width="49%" alt="LaptopFinder Engine"></a>
</p>
`;

const readme = `<!-- 
  Muhammad Affif — Backend Systems & Cloud Architecture Engineer
  Crafted with clean, high-performance SVG components.
-->

<div align="center">
  <img src="assets/hero.svg" width="100%" alt="${cfg.name} — ${cfg.role}">
</div>

<br>

<div align="center">
  <img src="assets/overview.svg" width="100%" alt="System Capabilities & Architecture Focus">
</div>

<br>

<div align="center">
  <img src="assets/stack.svg" width="100%" alt="Technical Stack & Environments">
</div>

<br>

<h3 align="left">Featured Engineering Initiatives</h3>

${projectGrid}

<br>

<div align="center">
  <img src="assets/metrics.svg" width="100%" alt="Engineering Metrics & Activity">
</div>

<br>

<div align="center">
  <a href="${cfg.links.website}"><img src="assets/contact.svg" width="100%" alt="Contact & Portfolio"></a>
</div>

<br>

<p align="center">
  <sub>🌐 Portfolio: <a href="https://nourivex.tech"><b>nourivex.tech</b></a> (migrating to <a href="https://nour.web.id"><b>nour.web.id</b></a> in December) · <a href="mailto:${cfg.links.email}"><b>${cfg.links.email}</b></a></sub><br>
  <sub>© ${new Date().getFullYear()} ${cfg.name} · Auto-synchronized via GitHub Actions.</sub>
</p>
`;

writeFileSync(new URL('README.md', root), readme);

console.log(`Assets rendered successfully: ${(bytes / 1024).toFixed(1)} KB total`);
