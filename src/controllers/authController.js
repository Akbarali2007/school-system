
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');
const School = require('../models/School.model');
const generateToken = require('../utils/generateToken');
const sendVerificationEmail = require('../utils/sendVerificationEmail');

const hashCode = (code) =>
  crypto.createHash('sha256').update(code).digest('hex');

const createVerificationCode = () =>
  crypto.randomInt(100000, 1000000).toString();

// Register a student in an existing active school.
const register = async (req, res, next) => {
  try {
    const { name, email, password, schoolId } = req.body;

    if (
      typeof name !== 'string' || !name.trim() ||
      typeof email !== 'string' || !email.trim() ||
      typeof password !== 'string' || !password ||
      typeof schoolId !== 'string' || !schoolId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and schoolId are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!mongoose.isValidObjectId(schoolId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid school ID.',
      });
    }

    const school = await School.findOne({
      _id: schoolId,
      isActive: true,
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Active school not found.',
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const code = createVerificationCode();

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'student',
      school: school._id,
      schoolId: school._id,
      isEmailVerified: false,
      emailVerificationCodeHash: hashCode(code),
      emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
      emailVerificationLastSentAt: new Date(),
    });

    try {
      await sendVerificationEmail(user.email, code);
    } catch (emailError) {
      console.error('Verification email delivery failed.');

      return res.status(503).json({
        success: false,
        accountCreated: true,
        message:
          'Account created, but verification email could not be sent. Check email configuration and request a new code.',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Signup successful. Check your email for the verification code.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: false,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    next(error);
  }
};

// Verify the email using the six-digit code.
const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (
      typeof email !== 'string' ||
      !/^\S+@\S+\.\S+$/.test(email.trim()) ||
      typeof code !== 'string' ||
      !/^\d{6}$/.test(code)
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid email and six-digit verification code are required.',
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select(
      '+emailVerificationCodeHash +emailVerificationExpires'
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code.',
      });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified. You can log in.',
      });
    }

    if (
      !user.emailVerificationCodeHash ||
      !user.emailVerificationExpires ||
      user.emailVerificationExpires.getTime() < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Request a new code.',
      });
    }

    const storedHash = Buffer.from(user.emailVerificationCodeHash, 'hex');
    const submittedHash = Buffer.from(hashCode(code), 'hex');

    if (
      storedHash.length !== submittedHash.length ||
      !crypto.timingSafeEqual(storedHash, submittedHash)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code.',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationCodeHash = undefined;
    user.emailVerificationExpires = undefined;
    user.emailVerificationLastSentAt = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

// Send a new verification code.
const resendVerificationCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (
      typeof email !== 'string' ||
      !/^\S+@\S+\.\S+$/.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select(
      '+emailVerificationCodeHash +emailVerificationExpires +emailVerificationLastSentAt'
    );

    const genericMessage =
      'If an unverified account exists for this email, a new code will be sent.';

    if (!user || user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    if (
      user.emailVerificationLastSentAt &&
      Date.now() - user.emailVerificationLastSentAt.getTime() < 60 * 1000
    ) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 60 seconds before requesting another code.',
      });
    }

    const code = createVerificationCode();

    user.emailVerificationCodeHash = hashCode(code);
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.emailVerificationLastSentAt = new Date();
    await user.save();

    try {
      await sendVerificationEmail(user.email, code);
    } catch (emailError) {
      console.error('Verification email delivery failed.');

      return res.status(503).json({
        success: false,
        message: 'Could not send the verification email. Please try again later.',
      });
    }

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    next(error);
  }
};

// Log in an existing user.
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' || !email.trim() ||
      typeof password !== 'string' || !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.isEmailVerified === false) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
        requiresEmailVerification: true,
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account is deactivated.',
      });
    }

    if (user.role !== 'superadmin') {
      if (!user.school) {
        return res.status(401).json({
          success: false,
          message: 'Your account is not assigned to a school.',
        });
      }

      const school = await School.findById(user.school).select('isActive');

      if (!school || !school.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Your school is inactive or no longer available.',
        });
      }
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        school: user.school,
        schoolId: user.schoolId || user.school,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get the logged-in user's profile.
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('school', 'name isActive');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerificationCode,
};
