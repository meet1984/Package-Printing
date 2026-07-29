const Inquiry = require('./inquiry.model');
const InquiryItem = require('./inquiryItem.model');
const Product = require('../products/product.model');
const PageContent = require('../content/pageContent.model');
const User = require('../users/user.model');
const sequelize = require('../../config/db');
const { sendMail } = require('../../utils/emailService');
const { generateQuoteConfirmationEmail, generateAdminInquiryEmail } = require('../../utils/emailTemplates');
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

    // Fetch product details for itemsHtml
    let itemsHtml = '<p>No specific products requested.</p>';
    if (parsedItems.length > 0) {
      const productIds = parsedItems.map(item => item.product_id).filter(Boolean);
      let products = [];
      if (productIds.length > 0) {
        products = await Product.findAll({ where: { id: productIds }, transaction: t });
      }
      const productMap = {};
      products.forEach(p => productMap[p.id] = p);

      itemsHtml = parsedItems.map(item => {
        const product = productMap[item.product_id];
        const productName = product ? product.name : (item.product_id ? `Product ID: ${item.product_id}` : 'General Inquiry');
        return `<li><strong>${escapeHtml(productName)}</strong> - Qty: ${escapeHtml(item.quantity)} - Variant: ${escapeHtml(item.variant_details || item.variant) || 'N/A'} - Notes: ${escapeHtml(item.notes) || 'N/A'}</li>`;
      }).join('');
    }

    // Commit transaction
    await t.commit();

    // Send email to all Admin users
    let adminEmails = [];
    try {
      const adminUsers = await User.findAll({
        where: { role: 'admin' },
        attributes: ['email']
      });
      adminEmails = adminUsers.map(u => u.email).filter(Boolean);
    } catch (dbErr) {
      console.error('Failed to fetch admin users for inquiry notification:', dbErr);
    }

    if (process.env.ADMIN_EMAIL && !adminEmails.includes(process.env.ADMIN_EMAIL)) {
      adminEmails.push(process.env.ADMIN_EMAIL);
    }

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

    if (adminEmails.length > 0) {
      const safeName = escapeHtml(name);
      const safeEmail = escapeHtml(email);
      const safePhone = escapeHtml(phone) || 'N/A';
      const safeCompany = escapeHtml(company) || 'N/A';
      const safeMessage = escapeHtml(message) || 'N/A';
      const safeDepartment = escapeHtml(department);
      
      const adminHtml = generateAdminInquiryEmail(
        {
          department: safeDepartment,
          name: safeName,
          email: safeEmail,
          phone: safePhone,
          company: safeCompany,
          message: safeMessage,
          attachment_url
        },
        itemsHtml,
        !!attachment_url,
        apiUrl
      );

      await Promise.allSettled(
        adminEmails.map(emailAddr =>
          sendMail({
            to: emailAddr,
            subject: `New ${safeDepartment.toUpperCase()} Request from ${safeName}`,
            html: adminHtml,
            attachments
          })
        )
      );
    }

    // Send confirmation email to Client
    const safeNameClient = escapeHtml(name);
    await sendMail({
      to: email,
      subject: `Quote Request Received - Zeprr Packaging`,
      html: generateQuoteConfirmationEmail(safeNameClient, !!attachment_url, itemsHtml),
      attachments
    });

    let whatsappNumber = process.env.WHATSAPP_NUMBER || '';
    try {
      const contactPage = await PageContent.findOne({ where: { page_key: 'contact_settings' } });
      if (contactPage && contactPage.content && contactPage.content.whatsapp) {
        whatsappNumber = contactPage.content.whatsapp;
      }
    } catch (e) {
      console.error('Error fetching whatsapp number from contact_settings:', e);
    }

    res.status(201).json({ 
      message: 'Quote requested successfully', 
      inquiryId: inquiry.id,
      whatsappNumber
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
