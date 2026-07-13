const SiteFaq = require('./siteFaq.model');

// Public route to get all active FAQs
exports.getActiveFaqs = async (req, res, next) => {
  try {
    const faqs = await SiteFaq.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(faqs);
  } catch (error) {
    next(error);
  }
};

// Admin route to get all FAQs
exports.getAllFaqs = async (req, res, next) => {
  try {
    const faqs = await SiteFaq.findAll({
      order: [['sort_order', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(faqs);
  } catch (error) {
    next(error);
  }
};

// Admin route to create a new FAQ
exports.createFaq = async (req, res, next) => {
  try {
    const { question, answer, sort_order, is_active } = req.body;
    const faq = await SiteFaq.create({ question, answer, sort_order, is_active });
    res.status(201).json(faq);
  } catch (error) {
    next(error);
  }
};

// Admin route to update an FAQ
exports.updateFaq = async (req, res, next) => {
  try {
    const { question, answer, sort_order, is_active } = req.body;
    const faq = await SiteFaq.findByPk(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    await faq.update({ question, answer, sort_order, is_active });
    res.json(faq);
  } catch (error) {
    next(error);
  }
};

// Admin route to delete an FAQ
exports.deleteFaq = async (req, res, next) => {
  try {
    const faq = await SiteFaq.findByPk(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    await faq.destroy();
    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    next(error);
  }
};
