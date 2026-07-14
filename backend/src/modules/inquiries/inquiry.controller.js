const Inquiry = require('./inquiry.model');
const InquiryItem = require('./inquiryItem.model');
const Product = require('../products/product.model');
const sequelize = require('../../config/db');
const { sendMail } = require('../../utils/emailService');

const escapeHtml = (unsafe) => {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

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
    const apiUrl = process.env.VITE_API_URL ? process.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    
    let attachments = [];
    let attachHtml = '';
    let clientAttachHtml = '';

    if (req.file) {
      attachments.push({
        filename: req.file.filename,
        path: req.file.path,
        cid: 'designImage'
      });
      
      attachHtml = `
        <p><strong>Design Attachment:</strong> <a href="${apiUrl}${attachment_url}">View Full File</a></p>
        <img src="cid:designImage" style="max-width: 100%; max-height: 500px; border-radius: 8px; border: 1px solid #ddd;" alt="Attached Design" />
      `;
      
      clientAttachHtml = `
        <h4>Your Attached Design:</h4>
        <img src="cid:designImage" style="max-width: 100%; max-height: 500px; border-radius: 8px; border: 1px solid #ddd;" alt="Attached Design" />
      `;
    }

    if (adminEmail) {
      const safeName = escapeHtml(name);
      const safeEmail = escapeHtml(email);
      const safePhone = escapeHtml(phone) || 'N/A';
      const safeCompany = escapeHtml(company) || 'N/A';
      const safeMessage = escapeHtml(message) || 'N/A';
      const safeDepartment = escapeHtml(department);

      let itemsHtml = parsedItems.length > 0 ? parsedItems.map(item => `<li>Product ID: ${escapeHtml(item.product_id)} - Qty: ${escapeHtml(item.quantity)} - Variant: ${escapeHtml(item.variant_details || item.variant) || 'N/A'} - Notes: ${escapeHtml(item.notes) || 'N/A'}</li>`).join('') : '<p>No specific products requested.</p>';
      
      await sendMail({
        to: adminEmail,
        subject: `New ${safeDepartment.toUpperCase()} Request from ${safeName}`,
        html: `
          <h3>New Request (${safeDepartment})</h3>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Phone:</strong> ${safePhone}</p>
          <p><strong>Company:</strong> ${safeCompany}</p>
          <p><strong>Message:</strong> ${safeMessage}</p>
          ${attachHtml}
          <h4>Requested Items:</h4>
          <ul>${itemsHtml}</ul>
        `,
        attachments
      });
    }

    // Send confirmation email to Client
    const safeNameClient = escapeHtml(name);
    await sendMail({
      to: email,
      subject: `Quote Request Received - P&P Packaging`,
      html: `
        <h3>Thank you for your quote request, ${safeNameClient}!</h3>
        <p>We have received your request and our team will get back to you within 24 hours.</p>
        <p>If you have any urgent questions, feel free to reply to this email or contact us directly.</p>
        ${clientAttachHtml}
      `,
      attachments
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

// Admin Routes (protected via protect + admin middleware in inquiry.routes.js)
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
