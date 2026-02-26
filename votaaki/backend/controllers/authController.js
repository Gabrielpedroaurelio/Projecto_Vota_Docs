/**
 * Authentication Controller - VotaAki
 * 
 * Manages user registration and login, including password encryption
 * with bcrypt and JWT token generation.
 */

import db from '../db/config.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Capture Login Activity
 */
const logLogin = async (id_user, req) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const browser = req.headers['user-agent'] || 'unknown';
    const device = 'Generic Device'; // Simplified, could be parsed from user-agent

    await db.execute(
      'INSERT INTO LoginLog (id_user, ip_address, device_info, browser_info) VALUES (?, ?, ?, ?)',
      [id_user, ip, device, browser]
    );
  } catch (error) {
    console.error('Failed to log login:', error);
  }
};

/**
 * User Registration
 */
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const [existingUser] = await db.execute('SELECT * FROM User WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Sorry, this email is already registered.' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user into database
    const [result] = await db.execute(
      'INSERT INTO User (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, password_hash]
    );

    res.status(201).json({ message: 'Account created successfully!', userId: result.insertId });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

/**
 * User Login
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const [users] = await db.execute('SELECT * FROM User WHERE email = ?', [email]);
    const user = users[0];

    // Check if user exists
    if (!user) {
      return res.status(400).json({ message: 'Usuario Não Encontrado' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Senha Errada' });
    }

    // Check account status
    if (user.status !== 'active') {
      return res.status(403).json({ message: `Your account is currently ${user.status}.` });
    }

    // Update last login
    await db.execute('UPDATE User SET last_login = NOW() WHERE id_user = ?', [user.id_user]);

    // Log Activity
    await logLogin(user.id_user, req);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id_user, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Return essential data
    res.json({
      token,
      user: {
        id: user.id_user,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        image: user.path_thumb
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal error processing login.' });
  }
};

/**
 * User Logout
 */
export const logout = async (req, res) => {
  const id_user = req.user.id;
  try {
    // Mark the latest active session as closed
    await db.execute(
      'UPDATE LoginLog SET logout_time = NOW() WHERE id_user = ? AND logout_time IS NULL ORDER BY login_time DESC LIMIT 1',
      [id_user]
    );
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ message: 'Error during logout.' });
  }
};
