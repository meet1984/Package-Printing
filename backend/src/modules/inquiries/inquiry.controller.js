const Inquiry = require('./inquiry.model');
const InquiryItem = require('./inquiryItem.model');
const Product = require('../products/product.model');
const sequelize = require('../../config/db');
const { sendMail } = require('../../utils/emailService');

const Joi = require('joi');

exports.createInquiry = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().allow('', null),
      company: Joi.string().allow('', null),
      message: Joi.string().allow('', null),
      department: Joi.string().valid('general', 'bulk', 'support', 'partnership', 'careers').default('general'),
      items: Joi.any() // Can be JSON string from FormData or array
    });

    const { error, value } = schema.validate(req.body, { allowUnknown: true });
    
    if (error) {
      await t.rollback();
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, phone, company, message, department } = value;
    
    // Parse items if they come as string from FormData
    let parsedItems = [];
    if (value.items) {
      if (typeof value.items === 'string') {
        try { parsedItems = JSON.parse(value.items); } catch (e) {}
      } else if (Array.isArray(value.items)) {
        parsedItems = value.items;
      }
    }

    let attachment_url = null;
    if (req.file) {
      attachment_url = `/uploads/${req.file.filename}`;
    }

    // 1. Create Inquiry
    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      company,
      message,
      department,
      attachment_url,
      status: 'pending'
    }, { transaction: t });

    // 2. Create Inquiry Items (if any)
    if (parsedItems.length > 0) {
      const inquiryItemsData = parsedItems.map(item => ({
        inquiry_id: inquiry.id,
        product_id: item.product_id || null,
        quantity: item.quantity || 1,
        variant_details: item.variant_details || item.variant || null,
        notes: item.notes || null
      }));
      await InquiryItem.bulkCreate(inquiryItemsData, { transaction: t });
    }

    // Commit transaction
    await t.commit();

    // Send email to Admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      let itemsHtml = parsedItems.length > 0 ? parsedItems.map(item => `<li>Product ID: ${item.product_id} - Qty: ${item.quantity} - Variant: ${item.variant_details || item.variant || 'N/A'} - Notes: ${item.notes || 'N/A'}</li>`).join('') : '<p>No specific products requested.</p>';
      
      let attachHtml = attachment_url ? `<p><strong>Attachment:</strong> <a href="${process.env.VITE_API_URL ? process.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${attachment_url}">View File</a></p>` : '';

      await sendMail({
        to: adminEmail,
        subject: `New ${department.toUpperCase()} Request from ${name}`,
        html: `
          <h3>New Request (${department})</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Company:</strong> ${company || 'N/A'}</p>
          <p><strong>Message:</strong> ${message || 'N/A'}</p>
          ${attachHtml}
          <h4>Requested Items:</h4>
          <ul>${itemsHtml}</ul>
        `
      });
    }

    // Send confirmation email to Client
    await sendMail({
      to: email,
      subject: `Quote Request Received - P&P Packaging`,
      html: `
        <h3>Thank you for your quote request, ${name}!</h3>
        <p>We have received your request and our team will get back to you within 24 hours.</p>
        <p>If you have any urgent questions, feel free to reply to this email or contact us directly.</p>
      `
    });

    res.status(201).json({ 
      message: 'Quote requested successfully', 
      inquiryId: inquiry.id,
      whatsappNumber: process.env.WHATSAPP_NUMBER || ''
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// Admin Routes (To be protected in Phase 3)
exports.getAllInquiries = async (req, res, next) => {
  try {
    const { department } = req.query;
    let whereClause = {};
    if (department && department !== 'all') {
      whereClause.department = department;
    }

    const inquiries = await Inquiry.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      include: [{
        model: InquiryItem,
        as: 'items',
        include: [{ model: Product, attributes: ['name', 'slug'] }]
      }]
    });
    res.json(inquiries);
  } catch (error) {
    next(error);
  }
};

exports.updateInquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findByPk(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    await inquiry.update({ status });
    res.json(inquiry);
  } catch (error) {
    next(error);
  }
};
