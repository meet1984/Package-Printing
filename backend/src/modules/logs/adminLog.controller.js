const { Op } = require('sequelize');
const AdminLog = require('./adminLog.model');
const User = require('../users/user.model');

exports.getAdminLogs = async (req, res, next) => {
  try {
    const { action, target_type, search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {};

    if (action && action !== 'all') {
      whereClause.action = action;
    }

    if (target_type && target_type !== 'all') {
      whereClause.target_type = target_type;
    }

    if (search && search.trim() !== '') {
      const q = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { admin_name: { [Op.like]: q } },
        { admin_email: { [Op.like]: q } },
        { details: { [Op.like]: q } },
        { target_id: { [Op.like]: q } }
      ];
    }

    const { count, rows } = await AdminLog.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Calculate stats
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayCount = await AdminLog.count({
      where: {
        createdAt: {
          [Op.gte]: startOfToday
        }
      }
    });

    // Unique admins count
    const uniqueAdmins = await AdminLog.findAll({
      attributes: ['admin_email'],
      group: ['admin_email']
    });

    const superAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();

    res.json({
      logs: rows,
      totalCount: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      todayCount,
      activeAdminsCount: uniqueAdmins.length,
      superAdminEmail
    });
  } catch (error) {
    next(error);
  }
};

exports.clearAdminLogs = async (req, res, next) => {
  try {
    const caller = await User.findByPk(req.user.id);
    const superEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();

    if (!caller || caller.email.toLowerCase() !== superEmail) {
      return res.status(403).json({ 
        message: 'Only the Super Admin (.env) can clear system activity logs.' 
      });
    }

    await AdminLog.destroy({
      where: {},
      truncate: true
    });

    res.json({ message: 'All activity logs have been cleared.' });
  } catch (error) {
    next(error);
  }
};
