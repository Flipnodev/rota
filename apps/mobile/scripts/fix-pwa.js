const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../dist/index.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found. Run "npx expo export --platform web" first.');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// iOS PWA meta tags
const pwaTags = `
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Rota" />
    <meta name="theme-color" content="#000000" />
    <meta name="mobile-web-app-capable" content="yes" />
    <link rel="apple-touch-icon" href="/assets/images/icon.png" />
    <link rel="manifest" href="/manifest.json" />
`;

// Fix viewport for iPhone 14+ (notch/dynamic island)
const viewportFix = `<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />`;

// CSS for PWA standalone mode
const fullScreenCSS = `
    <style>
      html, body, #root {
        height: 100dvh !important;
        background-color: #18181b !important;
      }
    </style>
    <script>
      // Fix iOS standalone mode height
      if (window.navigator.standalone) {
        document.documentElement.style.height = window.innerHeight + 'px';
        document.body.style.height = window.innerHeight + 'px';
        window.addEventListener('resize', function() {
          document.documentElement.style.height = window.innerHeight + 'px';
          document.body.style.height = window.innerHeight + 'px';
        });
      }
    </script>
`;

// Inject PWA tags
if (!html.includes('apple-mobile-web-app-capable')) {
  html = html.replace('<head>', '<head>' + pwaTags);
}

// Fix viewport
html = html.replace(
  /<meta name="viewport"[^>]*>/,
  viewportFix
);

// Add full screen CSS before </head> (use unique marker to avoid duplicate injection)
if (!html.includes('rota-pwa-styles')) {
  const cssWithMarker = fullScreenCSS.replace('<style>', '<style id="rota-pwa-styles">');
  html = html.replace('</head>', cssWithMarker + '</head>');
}

fs.writeFileSync(indexPath, html);
console.log('PWA fixes applied:');
console.log('  - iOS PWA meta tags');
console.log('  - Viewport fix for iPhone 14+');
console.log('  - Full screen CSS with safe areas');

// Create manifest.json for PWA
const manifestPath = path.join(__dirname, '../dist/manifest.json');
const manifest = {
  name: "Rota",
  short_name: "Rota",
  start_url: "/?standalone=true",
  scope: "/",
  display: "standalone",
  background_color: "#18181b",
  theme_color: "#18181b",
  orientation: "portrait",
  id: "com.rota.app",
  icons: [
    {
      src: "/assets/images/icon.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable"
    }
  ]
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('  - manifest.json created');
