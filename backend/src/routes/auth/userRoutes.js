// src/routes/user.routes.js
import express from 'express';
import passport from 'passport';
import { prisma } from '../../config/prisma.js';
import { getProfile, updateFcmToken } from "../../controllers/auth/userController.js";
import { protect  } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Apply JWT authentication to all user routes
router.use(passport.authenticate('jwt', { session: false }));

// FCM Token Update
router.post('/fcm-token', protect, updateFcmToken);

// Get current user profile (Must be above /:id to avoid shadowing)
router.get('/me', protect, getProfile);

// Get all users (Admin only)
router.get('/', async (req, res) => {
  try {
    // Check if user has admin role
    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only view their own profile unless they're admin
    if (req.user.id !== id && !['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;
    
    // Users can only update their own profile unless they're admin
    if (req.user.id !== id && !['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(image && { image })
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        isActive: true
      }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

export default router;