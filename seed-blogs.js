const sequelize = require('./backend/src/config/db');
const BlogPost = require('./backend/src/modules/content/blogPost.model');

async function seedBlogs() {
  try {
    await sequelize.authenticate();
    
    await BlogPost.sync();

    const count = await BlogPost.count();
    if (count === 0) {
      await BlogPost.bulkCreate([
        {
          title: 'The Future of Sustainable Packaging',
          slug: 'future-sustainable-packaging',
          content: 'Sustainable packaging is evolving rapidly...',
          meta_description: 'Learn about the newest eco-friendly materials and design strategies for modern brands.',
          cover_image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&h=450&fit=crop',
          is_published: true,
          published_at: new Date()
        },
        {
          title: '5 Design Tips for Custom Boxes',
          slug: 'design-tips-custom-boxes',
          content: 'Here are five tips to make your custom boxes pop...',
          meta_description: 'Make your unboxing experience unforgettable with these 5 expert design tips.',
          cover_image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=450&fit=crop',
          is_published: true,
          published_at: new Date(Date.now() - 86400000 * 2)
        },
        {
          title: 'Why Low Minimums Matter for Startups',
          slug: 'low-minimums-startups',
          content: 'Startups often struggle with huge MOQ requirements...',
          meta_description: 'Discover how low minimum order quantities can help you test the market without breaking the bank.',
          cover_image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=450&fit=crop',
          is_published: true,
          published_at: new Date(Date.now() - 86400000 * 5)
        }
      ]);
      console.log('Seeded 3 mock blog posts.');
    } else {
      console.log('Blog posts already exist. Make sure is_published is true.');
      await BlogPost.update({ is_published: true }, { where: {} });
    }
  } catch (err) {
    console.error('Error seeding blogs:', err);
  } finally {
    process.exit(0);
  }
}

seedBlogs();
