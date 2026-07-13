const fs = require('fs');
const path = require('path');
const Product = require('../modules/products/product.model');
const PageContent = require('../modules/content/pageContent.model');

// This middleware reads the built React index.html and injects SEO tags for crawlers
const seoInjector = async (req, res, next) => {
  // Only intercept GET requests that aren't for API or static assets
  if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.match(/\.(js|css|png|jpg|jpeg|gif|webp|ico|svg|woff2?|ttf)$/)) {
    return next();
  }

  const indexPath = path.resolve(__dirname, '../../../frontend/dist/index.html');
  
  fs.readFile(indexPath, 'utf8', async (err, htmlData) => {
    if (err) {
      // If frontend is not built, just continue (useful during dev)
      return next();
    }

    let title = 'P&P | Custom Printing & Packaging';
    let description = 'Premium custom printing and packaging solutions for your brand.';

    try {
      if (req.path.startsWith('/products/')) {
        const slug = req.path.split('/')[2];
        if (slug) {
          const product = await Product.findOne({ where: { slug, is_active: true } });
          if (product) {
            title = product.meta_title || `${product.name} | P&P`;
            description = product.meta_description || product.description?.substring(0, 160) || description;
          }
        }
      } else if (req.path === '/about') {
        title = 'About Us | P&P';
        description = 'Learn more about P&P - your partner in custom printing and packaging.';
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
  });
};

module.exports = seoInjector;
