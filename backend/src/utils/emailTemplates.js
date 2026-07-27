// Brand Colors and Styles
const BRAND_COLOR = '#B34A1E';
const BG_COLOR = '#F9FAFB';
const TEXT_MAIN = '#111827';
const TEXT_MUTED = '#6B7280';
const BORDER_COLOR = '#E5E7EB';

const baseLayout = (content, title = 'Zeprr') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BG_COLOR}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; line-height: 1.5; color: ${TEXT_MAIN};">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: ${BG_COLOR}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid ${BORDER_COLOR}; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; border-bottom: 1px solid ${BORDER_COLOR}; background-color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: ${TEXT_MAIN};">ZEPRR</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: ${BG_COLOR}; border-top: 1px solid ${BORDER_COLOR}; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: ${TEXT_MUTED};">
                Zeprr Packaging — Premium custom printing.
              </p>
              <p style="margin: 0; font-size: 12px; color: ${TEXT_MUTED};">
                &copy; ${new Date().getFullYear()} Zeprr. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

exports.generateOtpEmail = (otp) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: ${TEXT_MAIN}; text-align: center;">Verify your email address</h2>
    <p style="margin: 0 0 30px 0; font-size: 16px; color: ${TEXT_MUTED}; text-align: center;">
      Use the verification code below to complete your sign-in process.
    </p>
    <div style="background-color: ${BG_COLOR}; border: 1px solid ${BORDER_COLOR}; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
      <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: ${BRAND_COLOR};">${otp}</span>
    </div>
    <p style="margin: 0; font-size: 14px; color: ${TEXT_MUTED}; text-align: center;">
      This code will expire in 10 minutes. If you didn't request this code, you can safely ignore this email.
    </p>
  `;
  return baseLayout(content, 'Verify your email - Zeprr');
};

exports.generateAdminOtpEmail = (otp) => {
  const content = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="display: inline-block; background-color: #FEF2F2; color: #DC2626; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Admin Security Alert</span>
    </div>
    <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: ${TEXT_MAIN}; text-align: center;">Admin Login Attempt</h2>
    <p style="margin: 0 0 30px 0; font-size: 16px; color: ${TEXT_MUTED}; text-align: center;">
      An attempt was made to access the Zeprr admin panel. Use the code below to authorize this login.
    </p>
    <div style="background-color: ${BG_COLOR}; border: 1px solid ${BORDER_COLOR}; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
      <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: ${TEXT_MAIN};">${otp}</span>
    </div>
    <p style="margin: 0; font-size: 14px; color: ${TEXT_MUTED}; text-align: center;">
      This code will expire in 10 minutes. If you did not initiate this login, please change your password immediately.
    </p>
  `;
  return baseLayout(content, 'Admin Login Code - Zeprr');
};

exports.generateQuoteConfirmationEmail = (name, hasAttachment, itemsHtml = '') => {
  const attachmentSection = hasAttachment ? `
    <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid ${BORDER_COLOR};">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Your Provided Reference:</h3>
      <img src="cid:designImage" alt="Attached Design" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid ${BORDER_COLOR};" />
    </div>
  ` : '';

  const itemsSection = itemsHtml ? `
    <div style="background-color: ${BG_COLOR}; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Requested Products / Cart Items</h3>
      <ul style="margin: 0; padding-left: 20px; color: ${TEXT_MUTED}; font-size: 14px; line-height: 1.6;">
        ${itemsHtml}
      </ul>
    </div>
  ` : '';

  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: ${TEXT_MAIN};">Quote Request Received</h2>
    <p style="margin: 0 0 15px 0; font-size: 16px; color: ${TEXT_MUTED};">
      Hi ${name},
    </p>
    <p style="margin: 0 0 25px 0; font-size: 16px; color: ${TEXT_MUTED};">
      Thank you for reaching out to Zeprr. We have successfully received your quote request and our packaging experts are already reviewing your details.
    </p>
    <div style="background-color: ${BG_COLOR}; border-left: 4px solid ${BRAND_COLOR}; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
      <p style="margin: 0; font-size: 15px; font-weight: 500; color: ${TEXT_MAIN};">
        We typically respond within 1 business day.
      </p>
    </div>
    ${itemsSection}
    <p style="margin: 0; font-size: 16px; color: ${TEXT_MUTED};">
      If you have any urgent questions or additional files to share, simply reply directly to this email.
    </p>
    ${attachmentSection}
  `;
  return baseLayout(content, 'Quote Request Received - Zeprr');
};

exports.generateAdminInquiryEmail = (data, itemsHtml, hasAttachment, apiUrl) => {
  const attachmentSection = hasAttachment ? `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid ${BORDER_COLOR}; font-weight: 600; width: 120px; vertical-align: top;">Attachment:</td>
      <td style="padding: 12px 0; border-bottom: 1px solid ${BORDER_COLOR};">
        <a href="${apiUrl}${data.attachment_url}" style="color: ${BRAND_COLOR}; font-weight: 500; text-decoration: none;">Download Full File</a>
        <div style="margin-top: 15px;">
          <img src="cid:designImage" alt="Attached Design" style="max-width: 100%; max-height: 400px; border-radius: 8px; border: 1px solid ${BORDER_COLOR};" />
        </div>
      </td>
    </tr>
  ` : '';

  const content = `
    <div style="margin-bottom: 25px;">
      <span style="display: inline-block; background-color: #EFF6FF; color: #2563EB; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">New Inquiry</span>
    </div>
    <h2 style="margin: 0 0 25px 0; font-size: 22px; font-weight: 600; color: ${TEXT_MAIN};">
      Department: ${data.department}
    </h2>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px; color: ${TEXT_MAIN}; margin-bottom: 30px;">
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BORDER_COLOR}; border-top: 1px solid ${BORDER_COLOR}; font-weight: 600; width: 120px;">Name:</td>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BORDER_COLOR}; border-top: 1px solid ${BORDER_COLOR};">${data.name}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BORDER_COLOR}; font-weight: 600; width: 120px;">Email:</td>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BORDER_COLOR};">
          <a href="mailto:${data.email}" style="color: ${BRAND_COLOR}; text-decoration: none;">${data.email}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BORDER_COLOR}; font-weight: 600; width: 120px;">Phone:</td>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BORDER_COLOR};">${data.phone}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BORDER_COLOR}; font-weight: 600; width: 120px;">Company:</td>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BORDER_COLOR};">${data.company}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BORDER_COLOR}; font-weight: 600; width: 120px; vertical-align: top;">Message:</td>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BORDER_COLOR}; line-height: 1.6; color: ${TEXT_MUTED};">${data.message}</td>
      </tr>
      ${attachmentSection}
    </table>

    <div style="background-color: ${BG_COLOR}; border-radius: 8px; padding: 20px;">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Requested Products / Cart Items</h3>
      <ul style="margin: 0; padding-left: 20px; color: ${TEXT_MUTED}; font-size: 14px; line-height: 1.6;">
        ${itemsHtml}
      </ul>
    </div>
  `;
  return baseLayout(content, `New ${data.department} Request - Zeprr Admin`);
};
