const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security and middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

const seoInjector = require('./middleware/seoInjector');
app.use(seoInjector);

// Static files (local uploads fallback)
app.use('/uploads', express.static('uploads'));

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
app.use('/api/blog-posts', require('./modules/content/blogPost.routes'));
app.use('/api/about', require('./modules/about/about.routes'));
app.use('/api/users', require('./modules/users/user.routes'));
app.use('/api/site-faqs', require('./modules/content/siteFaq.routes'));
app.use('/', require('./modules/seo/sitemap.routes'));

// Error handling middleware
app.use(errorHandler);

module.exports = app;
