const Product = require('../products/product.model');
const Category = require('../categories/category.model');

exports.getSitemap = async (req, res, next) => {
  try {
    const products = await Product.findAll({ where: { is_active: true } });
    const categories = await Category.findAll();

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

    for (const cat of categories) {
      xml += `  <url>
    <loc>${baseUrl}/products?category=${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    }

    for (const prod of products) {
      xml += `  <url>
    <loc>${baseUrl}/products/${prod.slug}</loc>
    <lastmod>${prod.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    next(error);
  }
};
