import fs from 'fs';
import path from 'path';

const CLIENT_DIR = path.resolve('dist/client');
const ASSETS_DIR = path.join(CLIENT_DIR, 'assets');

console.log('--- Starting Deployment Repair Script ---');

try {
  // 1. Find the main JS and CSS bundles
  const files = fs.readdirSync(ASSETS_DIR);
  const mainJs = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
  const mainCss = files.find(f => f.startsWith('styles-') && f.endsWith('.css'));

  if (!mainJs) {
    throw new Error('Could not find main JS bundle (index-*.js)');
  }
  if (!mainCss) {
    console.warn('Warning: Could not find main CSS bundle (styles-*.css)');
  }

  console.log(`Main JS: ${mainJs}`);
  console.log(`Main CSS: ${mainCss || 'None'}`);

  // 2. Generate the production index.html
  const content = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/placeholder.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kerala Crafted Finds | Premium Artisanal Heritage</title>
    <meta name="description" content="Discover the finest hand-crafted treasures from Kerala. Authentic, premium, and artisanal." />
    ${mainCss ? `<link rel="stylesheet" crossorigin href="/assets/${mainCss}">` : ''}
    <style>
      body { margin: 0; font-family: sans-serif; background-color: #0c0a09; color: #fafafa; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" crossorigin src="/assets/${mainJs}"></script>
  </body>
</html>`;

  // 3. Save to dist/client/index.html and 404.html
  fs.writeFileSync(path.join(CLIENT_DIR, 'index.html'), content);
  fs.writeFileSync(path.join(CLIENT_DIR, '404.html'), content);

  console.log('Successfully generated index.html and 404.html in dist/client');
  console.log('--- Deployment Repair Complete ---');
} catch (error) {
  console.error('Repair script failed:', error.message);
  process.exit(1);
}
