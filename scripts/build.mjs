// Renders every asset + README.md from profile.config.json (+ data/stats.json when present).
//   node scripts/build.mjs            → picks day/night from the configured timezone
//   NOURI_MODE=night node scripts/build.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { buildHero } from './lib/hero.mjs';
import { DOCK, dockButton, aboutCard, loadoutCard, nowRunning, questHeader, questCard, savePoint, contactButton, footer, secretCard } from './lib/sections.mjs';
import { statsCard, activityCard, achievementsCard, demoStats } from './lib/telemetry.mjs';

const root = new URL('../', import.meta.url);
const cfg = JSON.parse(readFileSync(new URL('profile.config.json', root), 'utf8'));
const statsPath = new URL('data/stats.json', root);
const stats = existsSync(statsPath) ? JSON.parse(readFileSync(statsPath, 'utf8')) : demoStats();

mkdirSync(new URL('assets/', root), { recursive: true });
let bytes = 0;
const out = (name, svg) => { writeFileSync(new URL(`assets/${name}`, root), svg); bytes += svg.length; };

// ---------- hero (day / night in the owner's timezone) ----------
const hour = +new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: cfg.timezone }).format(new Date());
const { from, to } = cfg.nightHours;
const isNight = process.env.NOURI_MODE ? process.env.NOURI_MODE === 'night' : from > to ? hour >= from || hour < to : hour >= from && hour < to;
const heroDay = buildHero(cfg, { mode: 'day', level: stats.level });
const heroNight = buildHero(cfg, { mode: 'night', level: stats.level });
out('hero-day.svg', heroDay);
out('hero-night.svg', heroNight);
out('hero.svg', isNight ? heroNight : heroDay);

// ---------- sections ----------
DOCK.forEach((d, i) => out(`dock-${d.key}.svg`, dockButton(d, i)));
out('about.svg', aboutCard(cfg));
out('loadout.svg', loadoutCard(cfg));
out('now-running.svg', nowRunning(cfg));
out('quest-header.svg', questHeader(cfg));
cfg.projects.forEach((p) => out(`quest-${p.key}.svg`, questCard(cfg, p)));
out('stats.svg', statsCard(stats));
out('activity.svg', activityCard(stats));
out('achievements.svg', achievementsCard(stats, cfg));
out('save-point.svg', savePoint(cfg, stats));
const CONTACTS = [
  { key: 'email', icon: 'contact', label: 'EMAIL', sub: 'say hello', href: (v) => `mailto:${v}` },
  { key: 'linkedin', icon: 'linkedin', label: 'LINKEDIN', sub: 'connect', href: (v) => v },
  { key: 'portfolio', icon: 'globe', label: 'PORTFOLIO', sub: 'visit the site', href: (v) => v },
].filter((c) => cfg.links[c.key]);
CONTACTS.forEach((c) => out(`btn-${c.key}.svg`, contactButton(c)));
out('footer.svg', footer());
out('secret.svg', secretCard());

// ---------- README ----------
const gh = `https://github.com/${cfg.username}`;
const host = cfg.username.toLowerCase();
const img = (src, alt, extra = '') => `<img src="assets/${src}" width="100%" alt="${alt.replace(/"/g, '&quot;')}"${extra}>`;
const pair = (a, b) => `<p align="center">\n${[a, b].filter(Boolean).map((p) => `  <a href="${gh}/${p.repo}"><img src="assets/quest-${p.key}.svg" width="49%" alt="${p.quest}: ${p.title} — ${p.summary}"></a>`).join('\n')}\n</p>`;
const projects = cfg.projects;
const rows = [];
for (let i = 0; i < projects.length; i += 2) rows.push(pair(projects[i], projects[i + 1]));

const readme = `<!--
        ╭──────────────╮
        │  ʕ•ᴥ•ʔ  ▍   │   oh, hi. you opened the source.
        ╰──────┬───────╯   nouri noticed.
               │
   ACHIEVEMENT UNLOCKED · SOURCE READER

   how the level works (no fake numbers):
     xp    = lifetime_contributions × 10 + stars × 50
     level = floor( sqrt(xp / 100) ) + 1
   refreshed daily by .github/workflows/nourivex.yml

   this file is generated — edit profile.config.json, then run: node scripts/build.mjs
-->

<a name="top"></a>

<div align="center">
  ${img('hero.svg', `${cfg.name} — ${cfg.role} · ${cfg.focus}. ${cfg.tagline}`, ' title="Nouri: psst… there&#39;s a terminal at the very bottom."')}
</div>

<p align="center">
${DOCK.map((d) => `  <a href="#${d.key}"><img src="assets/dock-${d.key}.svg" width="18.6%" alt="${d.label}"></a>`).join('\n')}
</p>

<p align="center">
  <b>${cfg.role}</b> from ${cfg.about.base?.split(' ·')[0] || 'Indonesia'} — ${cfg.tagline}<br>
  <sub>${cfg.about.main} · ${cfg.focus} · ${cfg.about.status}</sub>
</p>

<a name="about"></a>

${img('about.svg', `About — ${cfg.about.bio}`)}

<a name="loadout"></a>

${img('loadout.svg', `Tech stack: ${cfg.stack.flatMap((s) => s.items).join(', ')}`)}

${img('now-running.svg', `Now building: ${cfg.currentQuest.title} — ${cfg.currentQuest.phase}`)}

<a name="quests"></a>

${img('quest-header.svg', 'Quest log — featured projects')}

${rows.join('\n\n')}

<a name="stats"></a>

${img('stats.svg', 'GitHub stats — level, contributions, streak and languages')}

${img('activity.svg', 'Contribution terrain for the last 26 weeks')}

${img('achievements.svg', 'Achievements unlocked from real GitHub data')}

<a name="contact"></a>

${img('save-point.svg', 'Save point — contact')}

<p align="center">
${CONTACTS.map((c) => `  <a href="${c.href(cfg.links[c.key])}"><img src="assets/btn-${c.key}.svg" width="${CONTACTS.length > 2 ? 32 : 49}%" alt="${c.label} — ${c.sub}"></a>`).join('\n')}
</p>

<a href="SECRET.md"><img src="assets/footer.svg" width="100%" alt="End of transmission" title="…is someone peeking?"></a>

<details>
<summary><code>$ open terminal</code></summary>

\`\`\`console
nouri@${host}:~$ whoami
${cfg.name} — ${cfg.role} · ${cfg.focus}

nouri@${host}:~$ cat nouri.txt
N.O.U.R.I  =  Node Observability & Uptime Runtime Interface
role     :  companion process. keeps builds green, guards the p99.
uptime   :  online by day · hibernates after ${String(from).padStart(2, '0')}:00 ${cfg.tzLabel}
traits   :  allergic to merge conflicts, unindexed queries, and TODO: fix later

nouri@${host}:~$ ls -la ./stack/
drwxr-xr-x  go/          node.js/     postgres/    docker/
drwxr-xr-x  redis/        prisma/      typescript/  linux/
drwxr-xr-x  python/       flutter/     fedora/      github/

nouri@${host}:~$ cat ./quest_log.txt
[ QUEST 01 ] MediCare-Bridge ............. IN PROGRESS
[ QUEST 02 ] LaptopFinder Engine ......... IN PROGRESS
[ NEXT    ] ??? .......................... LOCKED

nouri@${host}:~$ sudo hire ${host}
[sudo] password for recruiter: ********
checking clearance..................... ✓
validating stack alignment............. ✓
confirming timezone compatibility...... ✓ (UTC+7 — responsive during business hours)
✓ ACCESS GRANTED — head back up and hit the SAVE POINT

nouri@${host}:~$ exit
nouri: safe travels. drop by at night — the amber LED means i'm on standby, not gone.
\`\`\`

<kbd>↑</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>B</kbd> <kbd>A</kbd>
<sub>&nbsp; cheat accepted: +30 lives. unfortunately, bugs respawn too.</sub>

</details>

<p align="right"><a href="#top"><sub>▲ back to boot screen</sub></a></p>
`;
writeFileSync(new URL('README.md', root), readme);

// ---------- SECRET.md (the peeking Nouri links here) ----------
writeFileSync(new URL('SECRET.md', root), `<div align="center">

<img src="assets/secret.svg" width="100%" alt="404 — quest not found. Achievement unlocked: Curious Cat.">

</div>

### \`nouri_profile.txt\`

| | |
|---|---|
| **name** | N.O.U.R.I — Node Observability & Uptime Runtime Interface |
| **named after** | Nourivex — and the polar bear that guards late-night deploys |
| **job** | companion process for [${cfg.name}](${gh}) · keeps builds green |
| **likes** | clean diffs, green checks, a p99 under budget |
| **dislikes** | merge conflicts, unindexed queries, \`TODO: fix later\` |
| **sleeps** | ${String(from).padStart(2, '0')}:00 – ${String(to).padStart(2, '0')}:00 ${cfg.tzLabel} (the boot screen really changes — check back at night) |

> you clicked the thing in the corner. that's exactly the kind of curiosity ${cfg.name} looks for in a teammate.
> now go back and press the save point button. ✦

<p align="right"><a href="${gh}"><sub>◂ back to the profile</sub></a></p>
`);

console.log(`hero: ${isNight ? 'night' : 'day'} (${hour}:00 ${cfg.timezone}) · stats: ${stats.demo ? 'DEMO' : 'live'} LV ${stats.level}`);
console.log(`assets: ${(bytes / 1024).toFixed(0)} KB total`);
