const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../config/config');

const prisma = new PrismaClient();

const authController = {
  // Login user
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { username }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username,
          email: user.email 
        },
        config.jwtSecret,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get current user profile
  getProfile: async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
