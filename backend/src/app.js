const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security and middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// General baseline rate limit for all API traffic (defense-in-depth on top of the
// stricter per-route limiters already applied to auth/inquiry/mockup endpoints).
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', generalApiLimiter);

const seoInjector = require('./middleware/seoInjector');
app.use(seoInjector);

// Automatic Admin Activity Logger
const adminLogger = require('./middleware/adminLogger');
app.use('/api', adminLogger);

// Static files (local uploads fallback)
// Filenames here are always unique per upload (Date.now()-<random>.ext), so a
// given URL's content never changes - safe to let browsers cache them for a
// long time instead of re-fetching on every repeat visit.
app.use('/uploads', express.static('uploads', {
  maxAge: '365d',
  immutable: true,
  setHeaders: (res, path) => {
    res.setHeader('Content-Disposition', 'attachment');
  }
}));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});
app.use('/api/categories', require('./modules/categories/category.routes'));
app.use('/api/products', require('./modules/products/product.routes'));
app.use('/api/content', require('./modules/content/pageContent.routes'));
app.use('/api/upload', require('./modules/upload/upload.routes'));
app.use('/api/inquiries', require('./modules/inquiries/inquiry.routes'));
app.use('/api/stats', require('./modules/stats/stats.routes'));
app.use('/api/homepage', require('./modules/homepage/homepage.routes'));
app.use('/api/hero-banners', require('./modules/homepage/heroBanner.routes'));
app.use('/api/home-scrollers', require('./modules/homepage/homeScroller.routes'));
app.use('/api/blog-posts', require('./modules/content/blogPost.routes'));
app.use('/api/about', require('./modules/about/about.routes'));
app.use('/api/users', require('./modules/users/user.routes'));
app.use('/api/admin-logs', require('./modules/logs/adminLog.routes'));
app.use('/api/site-faqs', require('./modules/content/siteFaq.routes'));
app.use('/api/templates', require('./modules/templates/template.routes'));
app.use('/api/mockups', require('./modules/mockups/mockup.routes'));
app.use('/', require('./modules/seo/sitemap.routes'));

// Serve built React frontend in production (for cPanel monolithic deployment)
const path = require('path');
const fs = require('fs');
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  // Vite fingerprints these filenames (e.g. index-abc123.js), so they're safe
  // to cache for a long time - a rebuild produces new filenames rather than
  // overwriting these. index.html itself is handled by seoInjector above and
  // never reaches this static handler.
  app.use(express.static(frontendDist, { maxAge: '365d', immutable: true }));
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

module.exports = app;
