import fs from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const outputRoot = process.env.STATIC_SITE_OUTPUT
  ? path.resolve(process.env.STATIC_SITE_OUTPUT)
  : path.join(projectRoot, 'static-site');
const clientRoot = path.join(projectRoot, 'dist', 'client');
const origin = process.env.STATIC_SITE_ORIGIN || 'http://localhost:3000';
const basePath = (process.env.GITHUB_PAGES_BASE ?? '').replace(/\/$/, '');
const baseSegment = basePath.replace(/^\/+|\/+$/g, '');
const escapedBaseSegment = baseSegment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const directionSections = {
  'social-benefits': ['payments', 'family', 'housing', 'credits', 'leave', 'health', 'education', 'veterans'],
  svo: ['directions', 'selection', 'support', 'documents', 'steps'],
  africa: ['roles', 'conditions', 'consultation'],
  territorial: ['tasks', 'experience', 'process'],
  bpls: ['specialties', 'training', 'application'],
};

const articleSource = await fs.readFile(path.join(projectRoot, 'app', 'data', 'articles.ts'), 'utf8');
const articleIds = [...articleSource.matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1]);
const generatedArticles = Object.entries(directionSections)
  .flatMap(([slug, sections]) => sections.map((section) => `${slug}-${section}`));
const routes = [
  '/', '/application',
  ...Object.keys(directionSections).map((slug) => `/${slug}`),
  ...[...new Set([...articleIds, ...generatedArticles])].map((id) => `/articles/${id}`),
];

function prefixRootPaths(content) {
  if (!basePath) return content.replaceAll(`${origin}/`, 'https://romar-m.github.io/');
  return content
    .replaceAll(`${origin}/`, `https://romar-m.github.io${basePath}/`)
    .replace(new RegExp(`(\\b(?:href|src|action)=["'])\\/(?!\\/|${escapedBaseSegment}(?:\\/|["']))`, 'g'), `$1${basePath}/`)
    .replace(new RegExp(`(["'])\\/(?=[A-Za-z0-9_.@-])(?!${escapedBaseSegment}(?:\\/|["']))`, 'g'), `$1${basePath}/`)
    .replaceAll(`${basePath}//`, `${basePath}/`);
}

const relativeOutput = path.relative(projectRoot, outputRoot);
if (!relativeOutput || relativeOutput.startsWith('..') || path.isAbsolute(relativeOutput)) {
  throw new Error('Export output must be a child directory of this project.');
}
await fs.rm(outputRoot, { recursive: true, force: true });
await fs.cp(clientRoot, outputRoot, { recursive: true });
await fs.writeFile(path.join(outputRoot, '.nojekyll'), '');

await Promise.all(routes.map(async (route) => {
  const response = await fetch(`${origin}${route}`);
  if (!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
  const html = prefixRootPaths(await response.text())
    .replace('</body>', `<script defer src="${basePath}/static-runtime.js"></script></body>`);
  const target = route === '/'
    ? path.join(outputRoot, 'index.html')
    : path.join(outputRoot, route.slice(1), 'index.html');
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, html);
}));

for (const cssPath of await findFiles(outputRoot, '.css')) {
  const css = await fs.readFile(cssPath, 'utf8');
  await fs.writeFile(cssPath, prefixRootPaths(css));
}

await fs.copyFile(path.join(outputRoot, 'index.html'), path.join(outputRoot, '404.html'));
console.log(`Exported ${routes.length} routes to ${outputRoot}`);

async function findFiles(directory, extension) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) return findFiles(item, extension);
    return entry.isFile() && item.endsWith(extension) ? [item] : [];
  }));
  return nested.flat();
}
