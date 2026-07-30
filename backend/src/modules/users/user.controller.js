const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./user.model');
const bcrypt = require('bcryptjs');
const { sendMail } = require('../../utils/emailService');
const { generateOtpEmail, generateAdminOtpEmail } = require('../../utils/emailTemplates');
const { JWT_SECRET } = require('../../config/env');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
};

// Constant-time OTP comparison to avoid leaking match-length via response timing
const isOtpValid = (storedOtp, suppliedOtp) => {
  if (typeof storedOtp !== 'string' || typeof suppliedOtp !== 'string') return false;
  const a = Buffer.from(storedOtp);
  const b = Buffer.from(suppliedOtp);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

// ─── Public Routes ───────────────────────────────────────

// Minimum password strength requirement (length only, to avoid being overly restrictive)
const MIN_PASSWORD_LENGTH = 8;
const isPasswordStrongEnough = (password) =>
  typeof password === 'string' && password.length >= MIN_PASSWORD_LENGTH;

// Register & Send OTP
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    if (!isPasswordStrongEnough(password)) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` });
    }

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
      subject: 'Verify your email - Zeprr',
      html: generateOtpEmail(otp),
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
    if (!isOtpValid(user.otp, otp)) {
      user.otp_attempts += 1;
      if (user.otp_attempts >= 5) {
        user.otp = null;
        user.otp_expires_at = null;
        await user.save();
        return res.status(400).json({ message: 'Too many invalid attempts. Please request a new OTP.' });
      }
      await user.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (new Date() > user.otp_expires_at) return res.status(400).json({ message: 'OTP expired' });

    user.is_verified = true;
    user.otp = null;
    user.otp_expires_at = null;
    user.otp_attempts = 0;
    user.last_login = new Date();
    await user.save();

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: user.role === 'admin' ? '1d' : '7d' });
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };
    
    if (user.role !== 'admin') {
      cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    }
    
    res.cookie('token', token, cookieOptions);

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
        user.otp_attempts = 0;
        await user.save();

        await sendMail({
          to: user.email,
          subject: 'Admin Login Code - Zeprr',
          html: generateAdminOtpEmail(newOtp),
        });

        return res.json({ message: 'OTP sent to email', requireOTP: true });
      } else {
        if (!isOtpValid(user.otp, otp)) {
          user.otp_attempts += 1;
          if (user.otp_attempts >= 5) {
            user.otp = null;
            user.otp_expires_at = null;
            await user.save();
            return res.status(400).json({ message: 'Too many invalid attempts. Please log in again to receive a new code.' });
          }
          await user.save();
          return res.status(400).json({ message: 'Invalid OTP' });
        }
        if (new Date() > user.otp_expires_at) return res.status(400).json({ message: 'OTP expired' });
        
        user.otp = null;
        user.otp_expires_at = null;
        user.otp_attempts = 0;
      }
    }

    user.last_login = new Date();
    await user.save();

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: user.role === 'admin' ? '1d' : '7d' });
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };
    
    if (user.role !== 'admin') {
      cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    }
    
    res.cookie('token', token, cookieOptions);

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

// Get current user (using token manually instead of protect middleware)
exports.getMe = async (req, res, next) => {
  try {
    let token;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(200).json({ user: null });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(200).json({ user: null });
    }

    const user = await User.findByPk(decoded.id, { attributes: ['id', 'name', 'email', 'role', 'last_login'] });
    if (!user) {
      return res.status(200).json({ user: null });
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

// ─── Admin Routes ────────────────────────────────────────

// Strip sensitive fields (password hash, OTP, OTP metadata) before sending a user back to the client
const sanitizeUser = (user) => {
  const plain = user.toJSON ? user.toJSON() : user;
  const { password, otp, otp_expires_at, otp_attempts, ...safe } = plain;
  return safe;
};

// Get all users
const getSuperAdminEmail = () => (process.env.ADMIN_EMAIL || '').toLowerCase();

const verifySuperAdmin = async (userId) => {
  const caller = await User.findByPk(userId);
  const superEmail = getSuperAdminEmail();
  return caller && caller.email.toLowerCase() === superEmail;
};

exports.adminGetUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'is_verified', 'last_login', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    const totalCount = await User.count();
    const superAdminEmail = getSuperAdminEmail();
    res.json({ users, totalCount, superAdminEmail });
  } catch (error) {
    next(error);
  }
};

// Create a new admin user or promote an existing user (Super Admin only)
exports.adminCreateAdmin = async (req, res, next) => {
  try {
    const isSuperAdmin = await verifySuperAdmin(req.user.id);
    if (!isSuperAdmin) {
      return res.status(403).json({ 
        message: 'Only the Super Admin configured in .env can create or promote administrator accounts.' 
      });
    }

    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (!isPasswordStrongEnough(password)) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` });
    }

    let user = await User.findOne({ where: { email } });
    if (user) {
      if (user.role === 'admin') {
        return res.status(400).json({ message: 'An admin account with this email already exists' });
      }
      user.role = 'admin';
      user.is_verified = true;
      if (name) user.name = name;
      user.password = password;
      await user.save();
      return res.json({ message: 'Existing user promoted to Admin successfully', user: sanitizeUser(user) });
    }

    user = await User.create({
      name: name || 'Admin User',
      email,
      password,
      role: 'admin',
      is_verified: true
    });

    res.status(201).json({ message: 'New admin created successfully', user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

// Update user role (Super Admin only)
exports.adminUpdateRole = async (req, res, next) => {
  try {
    const isSuperAdmin = await verifySuperAdmin(req.user.id);
    if (!isSuperAdmin) {
      return res.status(403).json({ 
        message: 'Only the Super Admin configured in .env can change administrator roles.' 
      });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'customer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    if (req.user && parseInt(req.user.id) === parseInt(id)) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.email.toLowerCase() === getSuperAdminEmail()) {
      return res.status(400).json({ message: 'The Super Admin account cannot be demoted.' });
    }

    user.role = role;
    await user.save();

    res.json({ message: `User role updated to ${role}`, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

// Delete user
exports.adminDeleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user && parseInt(req.user.id) === parseInt(id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.email.toLowerCase() === getSuperAdminEmail()) {
      return res.status(400).json({ message: 'The Super Admin account cannot be deleted.' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
