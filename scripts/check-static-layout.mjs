import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('docs');
const slugs = ['social-benefits', 'svo', 'africa', 'territorial', 'bpls'];
const articles = await fs.readdir(path.join(root, 'articles'));
const paths = [
  ...slugs.map((slug) => `${slug}/index.html`),
  ...articles.map((id) => `articles/${id}/index.html`),
];
let checkedLinks = 0;
for (const file of paths) {
  const html = await fs.readFile(path.join(root, file), 'utf8');
  const toc = html.match(/<aside class="page-toc"[\s\S]*?<\/aside>/)?.[0];
  assert.ok(toc, `${file}: missing section navigation`);
  assert.equal((toc.match(/aria-current="page"/g) ?? []).length, 1, `${file}: active item`);
  assert.ok(html.indexOf(toc) < html.indexOf('<article '), `${file}: reading order`);
  if (file.startsWith('articles/')) {
    assert.match(html, /class="page-body article-layout"/);
    const id = file.split('/')[1];
    assert.ok(toc.match(/<a\b[^>]*aria-current="page"[^>]*>/g)
      .some((tag) => tag.includes(`href="/articles/${id}"`)), `${file}: wrong selected article`);
  }
  for (const [, href] of toc.matchAll(/href="(\/[^"]*)"/g)) {
    const target = path.join(root, href, 'index.html');
    assert.ok((await fs.stat(target)).isFile(), `${file}: broken link ${href}`);
    checkedLinks++;
  }
}
assert.equal(await fs.readFile('public/globals.css', 'utf8'), await fs.readFile('docs/globals.css', 'utf8'));
assert.equal(await fs.readFile('public/globals.css', 'utf8'), await fs.readFile('app/globals.css', 'utf8'));
console.log(`Verified ${paths.length} pages and ${checkedLinks} navigation links; stylesheets match.`);
