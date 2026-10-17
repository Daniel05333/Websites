// Genereert de statische site in ./public uit src/ en assets/.
import { mkdir, rm, writeFile, cp, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { build } from 'esbuild';
import { pages } from './src/pages/pages.mjs';
import { site } from './src/data/site.mjs';

const OUT = 'public';
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await cp('assets', join(OUT, 'assets'), { recursive: true });

// 3D-hero: alleen de gebruikte delen van three.js, als los ES-module dat pas na het laden wordt opgehaald.
const engine = await build({
  entryPoints: ['src/engine/engine.js'],
  bundle: true,
  format: 'esm',
  minify: true,
  target: 'es2020',
  legalComments: 'eof',
  outfile: join(OUT, 'assets/js/engine.js'),
  metafile: true,
});
const engineBytes = Object.values(engine.metafile.outputs)[0].bytes;

// Client: beweging, canvassen en interactie (incl. Lenis), als één module.
const client = await build({
  entryPoints: ['src/client/main.js'],
  bundle: true,
  format: 'esm',
  minify: true,
  target: 'es2020',
  legalComments: 'eof',
  outfile: join(OUT, 'assets/js/main.js'),
  metafile: true,
});
const clientBytes = Object.values(client.metafile.outputs)[0].bytes;

// Cache-busting: korte hash van CSS + JS + engine.
const hash = createHash('sha1')
  .update(await readFile('assets/css/main.css'))
  .update(await readFile(join(OUT, 'assets/js/main.js')))
  .update(await readFile(join(OUT, 'assets/js/engine.js')))
  .digest('hex')
  .slice(0, 8);

for (const page of pages) {
  const file = join(OUT, page.out);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, page.render().replaceAll('__V__', hash));
}

const today = new Date().toISOString().slice(0, 10);
await writeFile(
  join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .filter((p) => p.sitemap)
  .map((p) => `  <url><loc>${site.url}${p.sitemap.path}</loc><lastmod>${today}</lastmod><priority>${p.sitemap.priority}</priority></url>`)
  .join('\n')}
</urlset>
`
);
await writeFile(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

// Oude WordPress-URL's (www.nexdmedia.com/...) die nog in Google staan → nieuwe pagina's (301).
// Exacte patronen (RedirectMatch), zodat een korte URL niet ook de langere eronder opvangt.
const redirects = [
  ['website-laten-maken', '/website-laten-maken.html'],
  ['website-laten-maken/standaard-website', '/standaard-website.html'],
  ['website-laten-maken/maatwerk-website', '/maatwerk-website.html'],
  ['wordpress-webdesign', '/wordpress-webdesign.html'],
  ['website-optimalisatie-een-alternatief', '/website-laten-optimaliseren/'],
];
await writeFile(
  join(OUT, '.htaccess'),
  `ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  # www → zonder www, altijd https
  RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]
  RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]
  RewriteCond %{HTTPS} off
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

${redirects.map(([from, to]) => `RedirectMatch 301 ^/${from}/?$ ${to}`).join('\n')}

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType text/javascript "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript image/svg+xml application/xml
</IfModule>
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
`
);
console.log(`Gebouwd: ${pages.length} pagina's in ./${OUT} (assets v=${hash}, engine.js ${(engineBytes / 1024).toFixed(0)} kB, main.js ${(clientBytes / 1024).toFixed(0)} kB)`);
