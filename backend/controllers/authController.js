const User = require('../models/User'); // Path aapke project ke hisab se set karein
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTER CONTROLLER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, companyName } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'candidate',
      companyName: role === 'recruiter' ? companyName : ''
    });

    await user.save();

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // 👈 Crucial for Role Navigation
        companyName: user.companyName
      }
    });
  } catch (error) {
    console.error('Error in Register:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// 2. LOGIN CONTROLLER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Email or Password.' });
    }

    // Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Email or Password.' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // 👈 Crucial for Role Navigation
        companyName: user.companyName
      }
    });
  } catch (error) {
    console.error('Error in Login:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};