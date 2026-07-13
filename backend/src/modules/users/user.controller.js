const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./user.model');
const bcrypt = require('bcryptjs');
const { sendMail } = require('../../utils/emailService');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
};

// ─── Public Routes ───────────────────────────────────────

// Register & Send OTP
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    let user = await User.findOne({ where: { email } });
    if (user && user.is_verified) {
      return res.status(400).json({ message: 'Email already registered and verified' });
    }

    const otp = generateOTP();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (user) {
      // User exists but unverified, update password and OTP
      if (name) user.name = name;
      user.password = password;
      user.otp = otp;
      user.otp_expires_at = otp_expires_at;
      await user.save();
    } else {
      user = await User.create({ name, email, password, otp, otp_expires_at });
    }

    // Send email
    await sendMail({
      to: email,
      subject: 'Verify your email - P&P',
      html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
    });

    res.json({ message: 'OTP sent to email', email });

  } catch (error) {
    next(error);
  }
};

// Verify OTP
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.is_verified) return res.status(400).json({ message: 'User already verified' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > user.otp_expires_at) return res.status(400).json({ message: 'OTP expired' });

    user.is_verified = true;
    user.otp = null;
    user.otp_expires_at = null;
    user.last_login = new Date();
    await user.save();

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ message: 'Email verified successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.is_verified) return res.status(403).json({ message: 'Please verify your email first', unverified: true });

    const isValid = await user.isValidPassword(password);
    if (!isValid) return res.status(401).json({ message: 'Invalid email or password' });

    if (user.role === 'admin') {
      const { otp } = req.body;
      if (!otp) {
        const newOtp = generateOTP();
        user.otp = newOtp;
        user.otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendMail({
          to: user.email,
          subject: 'Admin Login Code - P&P',
          html: `<p>Your admin login code is: <strong>${newOtp}</strong></p><p>This code expires in 10 minutes.</p>`,
        });

        return res.json({ message: 'OTP sent to email', requireOTP: true });
      } else {
        if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
        if (new Date() > user.otp_expires_at) return res.status(400).json({ message: 'OTP expired' });
        
        user.otp = null;
        user.otp_expires_at = null;
      }
    }

    user.last_login = new Date();
    await user.save();

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

// Get current user (using token)
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'name', 'email', 'role', 'last_login'] });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// ─── Admin Routes ────────────────────────────────────────

// Get all users
exports.adminGetUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'is_verified', 'last_login', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    const totalCount = await User.count();
    res.json({ users, totalCount });
  } catch (error) {
    next(error);
  }
};
