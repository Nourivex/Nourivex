// Pulls real numbers from the GitHub GraphQL API → data/stats.json.
//   GITHUB_TOKEN=... node scripts/stats.mjs
// Uses only public data unless the token is a PAT with access to private contributions.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { levelFromXp } from './lib/telemetry.mjs';

const root = new URL('../', import.meta.url);
const cfg = JSON.parse(readFileSync(new URL('profile.config.json', root), 'utf8'));
const login = process.env.GH_LOGIN || cfg.username;
const token = process.env.GH_STATS_TOKEN || process.env.GITHUB_TOKEN;
if (!token) throw new Error('Set GITHUB_TOKEN (or GH_STATS_TOKEN) to fetch stats.');
if (!login || login === 'YOUR_GITHUB_USERNAME') throw new Error('Set "username" in profile.config.json.');

async function gql(query, variables) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'lumen-profile' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const base = await gql(`query($login:String!){ user(login:$login){
  createdAt
  contributionsCollection{ contributionYears
    totalCommitContributions totalPullRequestContributions totalIssueContributions totalPullRequestReviewContributions
    contributionCalendar{ totalContributions weeks{ firstDay contributionDays{ date contributionCount } } } }
  repositories(ownerAffiliations:OWNER, isFork:false, privacy:PUBLIC, first:100, orderBy:{field:PUSHED_AT, direction:DESC}){
    totalCount nodes{ stargazerCount languages(first:10, orderBy:{field:SIZE, direction:DESC}){ edges{ size node{ name color } } } } }
} }`, { login });

const u = base.user;
const cc = u.contributionsCollection;

// lifetime contributions = sum over every contribution year
let allTime = 0;
for (const year of cc.contributionYears) {
  const d = await gql(`query($login:String!,$from:DateTime!,$to:DateTime!){ user(login:$login){ contributionsCollection(from:$from,to:$to){ contributionCalendar{ totalContributions } } } }`,
    { login, from: `${year}-01-01T00:00:00Z`, to: `${year}-12-31T23:59:59Z` });
  allTime += d.user.contributionsCollection.contributionCalendar.totalContributions;
}

// streaks from the rolling-year calendar
const days = cc.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
let longest = 0, run = 0;
for (const d of days) { run = d.contributionCount ? run + 1 : 0; longest = Math.max(longest, run); }
let current = 0;
for (let i = days.length - 1; i >= 0; i--) {
  if (days[i].contributionCount) current++;
  else if (i === days.length - 1) continue; // today may still be empty
  else break;
}

// languages weighted by bytes across owned public repos
const langMap = new Map();
let stars = 0;
for (const r of u.repositories.nodes) {
  stars += r.stargazerCount;
  for (const e of r.languages.edges) {
    // notebooks are Python whose size is inflated by stored outputs — count them as Python
    const node = e.node.name === 'Jupyter Notebook' ? { name: 'Python', color: '#3572A5' } : e.node;
    const cur = langMap.get(node.name) || { name: node.name, color: node.color, size: 0 };
    cur.size += e.size;
    langMap.set(node.name, cur);
  }
}
const totalBytes = [...langMap.values()].reduce((a, l) => a + l.size, 0) || 1;
const languages = [...langMap.values()].sort((a, b) => b.size - a.size).map((l) => ({ name: l.name, color: l.color, pct: l.size / totalBytes }));

const weeks = cc.contributionCalendar.weeks.map((w) => ({ start: w.firstDay, count: w.contributionDays.reduce((a, d) => a + d.contributionCount, 0) }));

const created = new Date(u.createdAt);
const months = Math.max(0, Math.floor((Date.now() - created) / (30.44 * 864e5)));
const xp = allTime * 10 + stars * 50; // see README source for the formula

const stats = {
  demo: false,
  generatedAt: new Date().toISOString(),
  login,
  playtime: `${Math.floor(months / 12)}y ${months % 12}m`,
  totals: {
    contributionsAllTime: allTime,
    contributionsYear: cc.contributionCalendar.totalContributions,
    commitsYear: cc.totalCommitContributions,
    prsYear: cc.totalPullRequestContributions,
    issuesYear: cc.totalIssueContributions,
    reviewsYear: cc.totalPullRequestReviewContributions,
    repos: u.repositories.totalCount,
    stars,
  },
  languages,
  streak: { current, longest },
  weeks,
  xp,
  level: levelFromXp(xp),
};

mkdirSync(new URL('data/', root), { recursive: true });
writeFileSync(new URL('data/stats.json', root), JSON.stringify(stats, null, 2) + '\n');
console.log(`stats: LV ${stats.level} · ${allTime} lifetime contributions · ${stars} stars`);
