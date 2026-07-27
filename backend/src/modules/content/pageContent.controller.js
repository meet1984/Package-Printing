const PageContent = require('./pageContent.model');

// Public route
exports.getPageContent = async (req, res, next) => {
  try {
    const page = await PageContent.findOne({
      where: { page_key: req.params.key },
    });
    
    if (!page) {
      if (req.params.key === 'contact_settings') {
        return res.json({
          content: {
            address: '123 Print Avenue, Industrial Estate\nNew Delhi, DL 110020\nIndia',
            hours: 'Mon-Fri, 9am - 6pm',
            email: 'support@pandp.com',
            whatsapp: process.env.WHATSAPP_NUMBER || '',
            supportName: 'Priya',
            supportRole: 'Support Team Lead',
            responseTime: 'We typically reply within 1 business hour.',
            socialLinks: [
              { platform: 'Instagram', url: 'https://instagram.com/pandp' },
              { platform: 'LinkedIn', url: 'https://linkedin.com/company/pandp' }
            ]
          }
        });
      }
      return res.json({ content: null });
    }

    if (req.params.key === 'contact_settings' && page && page.content) {
      const content = {
        ...page.content,
        whatsapp: page.content.whatsapp || process.env.WHATSAPP_NUMBER || '',
      };
      return res.json({ ...page.toJSON(), content });
    }

    res.json(page);
  } catch (error) {
    next(error);
  }
};

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Admin Routes (protected via protect + admin middleware in pageContent.routes.js)
exports.updatePageContent = async (req, res, next) => {
  try {
    let cleanContent = req.body.content;
    if (typeof cleanContent === 'string') {
      cleanContent = DOMPurify.sanitize(cleanContent);
    } else if (typeof cleanContent === 'object' && cleanContent !== null) {
      // If it's a JSON object, we sanitize string properties recursively or just stringify -> sanitize -> parse?
      // Since it's structured data (like headline, subtitle), we don't necessarily need DOMPurify unless there's raw HTML.
      // But for safety, let's sanitize string values in the top level.
      cleanContent = { ...cleanContent };
      for (const key in cleanContent) {
        if (typeof cleanContent[key] === 'string') {
          cleanContent[key] = DOMPurify.sanitize(cleanContent[key]);
        }
      }
    }

    const [page, created] = await PageContent.findOrCreate({
      where: { page_key: req.params.key },
      defaults: { content: cleanContent }
    });

    if (!created) {
      await page.update({ content: cleanContent });
    }
    
    res.json(page);
  } catch (error) {
    next(error);
  }
};
