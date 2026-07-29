const AdminLog = require('../modules/logs/adminLog.model');
const User = require('../modules/users/user.model');

const getTargetType = (url) => {
  if (url.includes('/products')) return 'Product';
  if (url.includes('/categories')) return 'Category';
  if (url.includes('/templates')) return 'Mockup Template';
  if (url.includes('/inquiries')) return 'Inquiry';
  if (url.includes('/users')) return 'User';
  if (url.includes('/homepage')) return 'Homepage Banner';
  if (url.includes('/site-faq')) return 'Site FAQ';
  if (url.includes('/blog')) return 'Blog';
  if (url.includes('/about')) return 'About Page';
  if (url.includes('/contact')) return 'Contact Settings';
  return 'System';
};

const getAction = (method, url, reqAction) => {
  if (reqAction) return reqAction;
  if (url.includes('/role')) return 'ROLE_CHANGE';
  if (url.includes('/status')) return 'STATUS_CHANGE';
  if (url.includes('/login')) return 'LOGIN';
  if (method === 'POST') return 'CREATE';
  if (method === 'PUT' || method === 'PATCH') return 'UPDATE';
  if (method === 'DELETE') return 'DELETE';
  return 'UPDATE';
};

const generateDetails = (method, url, body, params, targetType, action) => {
  const targetId = params?.id || params?.slug || body?.id || body?.slug || '';
  const entityRef = targetId ? ` #${targetId}` : '';

  if (action === 'ROLE_CHANGE') {
    return `Updated role to '${body?.role || 'admin'}' for User${entityRef}`;
  }
  if (action === 'STATUS_CHANGE') {
    return `Changed status to '${body?.status}' for Inquiry${entityRef}`;
  }
  if (url.includes('/create-admin')) {
    return `Created or promoted administrator account (${body?.email || 'new admin'})`;
  }
  if (action === 'CREATE') {
    const itemName = body?.name || body?.title || body?.email || body?.question || '';
    return `Created new ${targetType.toLowerCase()}${itemName ? `: "${itemName}"` : ''}`;
  }
  if (action === 'UPDATE') {
    const itemName = body?.name || body?.title || body?.status || '';
    return `Updated ${targetType.toLowerCase()}${entityRef}${itemName ? ` ("${itemName}")` : ''}`;
  }
  if (action === 'DELETE') {
    return `Deleted ${targetType.toLowerCase()}${entityRef}`;
  }
  return `Performed ${action} on ${targetType}${entityRef}`;
};

const adminLogger = (req, res, next) => {
  const monitoredMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!monitoredMethods.includes(req.method)) {
    return next();
  }

  res.on('finish', async () => {
    if (res.statusCode < 200 || res.statusCode >= 400) {
      return;
    }

    try {
      const user = req.user;
      if (!user || user.role !== 'admin') {
        return;
      }

      const url = req.originalUrl || req.url || '';
      if (url.includes('/admin-logs')) return;

      const targetType = req.adminLogTargetType || getTargetType(url);
      const action = getAction(req.method, url, req.adminLogAction);
      const targetId = String(
        req.adminLogTargetId || req.params?.id || req.params?.slug || req.body?.id || req.body?.slug || ''
      );
      const details = req.adminLogDetails || generateDetails(req.method, url, req.body, req.params, targetType, action);

      let adminName = user.name || 'Administrator';
      let adminEmail = user.email || '';

      if (!adminEmail && user.id) {
        const dbUser = await User.findByPk(user.id, { attributes: ['name', 'email'] });
        if (dbUser) {
          adminName = dbUser.name || adminName;
          adminEmail = dbUser.email || adminEmail;
        }
      }

      const ipAddress = req.ip || req.connection?.remoteAddress || 'N/A';

      await AdminLog.create({
        admin_id: user.id || null,
        admin_name: adminName,
        admin_email: adminEmail || 'admin@zeprr.com',
        action,
        target_type: targetType,
        target_id: targetId || null,
        details,
        ip_address: ipAddress
      });
    } catch (err) {
      console.error('Error in adminLogger middleware:', err);
    }
  });

  next();
};

module.exports = adminLogger;
