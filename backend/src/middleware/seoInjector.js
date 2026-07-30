const fs = require('fs');
const path = require('path');
const Product = require('../modules/products/product.model');
const PageContent = require('../modules/content/pageContent.model');

const indexPath = path.resolve(__dirname, '../../../frontend/dist/index.html');

// index.html only changes on a frontend rebuild/deploy (which restarts this
// process), so read it from disk once and keep it in memory instead of doing
// a fs.readFile on every single page request.
let cachedHtml = null;
function getIndexHtml() {
  return new Promise((resolve) => {
    if (cachedHtml !== null) {
      return resolve(cachedHtml);
    }
    fs.readFile(indexPath, 'utf8', (err, htmlData) => {
      if (err) {
        // If frontend is not built, don't cache the failure - keep retrying
        // (useful during dev, before the first `vite build`).
        return resolve(null);
      }
      cachedHtml = htmlData;
      resolve(cachedHtml);
    });
  });
}

// Per-product SEO metadata rarely changes request-to-request, so cache it
// briefly instead of hitting the DB on every crawl/page-load of the same
// product URL. Short TTL keeps edits from Admin visible quickly.
const SEO_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const productSeoCache = new Map(); // slug -> { title, description, expiresAt }

async function getProductSeo(slug) {
  const cached = productSeoCache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }

  const product = await Product.findOne({ where: { slug, is_active: true } });
  const entry = product
    ? {
        title: product.meta_title || `${product.name} | Zeprr`,
        description: product.meta_description || product.description?.substring(0, 160) || null
      }
    : null;

  productSeoCache.set(slug, { ...entry, expiresAt: Date.now() + SEO_CACHE_TTL_MS });
  return entry;
}

// This middleware reads the built React index.html and injects SEO tags for crawlers
const seoInjector = async (req, res, next) => {
  // Only intercept GET requests that aren't for API or static assets
  if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.match(/\.(js|css|png|jpg|jpeg|gif|webp|ico|svg|woff2?|ttf)$/)) {
    return next();
  }

  const htmlData = await getIndexHtml();
  if (htmlData === null) {
    // If frontend is not built, just continue (useful during dev)
    return next();
  }

  let title = 'Zeprr | Custom Printing & Packaging';
  let description = 'Premium custom printing and packaging solutions for your brand.';

  try {
    if (req.path.startsWith('/products/')) {
      const slug = req.path.split('/')[2];
      if (slug) {
        const seo = await getProductSeo(slug);
        if (seo) {
          title = seo.title;
          description = seo.description || description;
        }
      }
    } else if (req.path === '/about') {
      title = 'About Us | Zeprr';
      description = 'Learn more about Zeprr - your partner in custom printing and packaging.';
    }
  } catch (e) {
    console.error('SEO Injector error:', e);
  }

  // Replace the default tags in index.html
  let injectedHtml = htmlData;
  injectedHtml = injectedHtml.replace(
    /<title>.*<\/title>/i,
    `<title>${title}</title>`
  );

  // Inject description meta tag if not present
  if (injectedHtml.includes('<meta name="description"')) {
    injectedHtml = injectedHtml.replace(
      /<meta name="description"[^>]*>/i,
      `<meta name="description" content="${description}" />`
    );
  } else {
    injectedHtml = injectedHtml.replace(
      '</head>',
      `  <meta name="description" content="${description}" />\n  </head>`
    );
  }

  res.send(injectedHtml);
};

module.exports = seoInjector;
