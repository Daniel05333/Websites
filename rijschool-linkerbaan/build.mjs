// Genereert de statische site in ./public uit src/ en assets/.
import { mkdir, rm, writeFile, cp, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { pages } from './src/pages/pages.mjs';
import { site } from './src/data/site.mjs';

const OUT = 'public';
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await cp('assets', join(OUT, 'assets'), { recursive: true });

// Cache-busting: korte hash van CSS + JS.
const hash = createHash('sha1')
  .update(await readFile('assets/css/main.css'))
  .update(await readFile('assets/js/main.js'))
  .digest('hex')
  .slice(0, 8);

for (const page of pages) {
  const file = join(OUT, page.out);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, page.render().replaceAll('__V__', hash));
}

const today = new Date().toISOString().slice(0, 10);
const urls = pages.filter((p) => p.sitemap);
await writeFile(
  join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((p) => `  <url><loc>${site.url}${p.sitemap.path}</loc><lastmod>${today}</lastmod><priority>${p.sitemap.priority}</priority></url>`).join('\n')}
</urlset>
`
);
await writeFile(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

// Apache-hosting (bestaande site draait mogelijk op gedeelde hosting): 404 en caching.
await writeFile(
  join(OUT, '.htaccess'),
  `ErrorDocument 404 /404.html
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/webp "access plus 1 month"
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml application/xml
</IfModule>
`
);
console.log(`Gebouwd: ${pages.length} pagina's in ./${OUT} (assets v=${hash})`);
