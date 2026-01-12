import express, { Request, Response } from 'express';
import User from '../models/User';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { logUserAction } from '../utils/auditLogger';
import { AuditAction, Permission, UserRole } from '../config/constants';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/users
// @desc    Get all users (scoped by role)
// @access  Private
router.get('/', requirePermission(Permission.READ_USER), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, role, companyId, departmentId } = req.query;
    const currentUser = req.user!;

    const query: any = {};

    // Scope based on user role
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      // SuperAdmin can see all users, optionally filter by company
      if (companyId) query.companyId = companyId;
      if (departmentId) query.departmentId = departmentId;
    } else if (currentUser.role === UserRole.COMPANY_ADMIN) {
      // CompanyAdmin can only see users in their company
      query.companyId = currentUser.companyId;
      if (departmentId) query.departmentId = departmentId;
    } else if (currentUser.role === UserRole.DEPARTMENT_ADMIN) {
      // DepartmentAdmin can only see users in their department
      query.departmentId = currentUser.departmentId;
    } else {
      // Other roles cannot list users
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .populate('companyId', 'name companyId')
      .populate('departmentId', 'name departmentId')
      .select('-password')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// @route   POST /api/users
// @desc    Create new user
// @access  Private
router.post('/', requirePermission(Permission.CREATE_USER), async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const { firstName, lastName, email, password, phone, role, companyId, departmentId } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !role) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
      return;
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Scope validation
    if (currentUser.role === UserRole.COMPANY_ADMIN) {
      // CompanyAdmin can only create users in their company
      if (companyId !== currentUser.companyId?.toString()) {
        res.status(403).json({
          success: false,
          message: 'You can only create users for your own company'
        });
        return;
      }
    } else if (currentUser.role === UserRole.DEPARTMENT_ADMIN) {
      // DepartmentAdmin can only create users in their department
      if (departmentId !== currentUser.departmentId?.toString()) {
        res.status(403).json({
          success: false,
          message: 'You can only create users for your own department'
        });
        return;
      }
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      companyId,
      departmentId
    });

    await logUserAction(
      req,
      AuditAction.CREATE,
      'User',
      user._id.toString(),
      { userName: user.getFullName(), email: user.email }
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user._id,
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', requirePermission(Permission.READ_USER), async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const user = await User.findById(req.params.id)
      .populate('companyId', 'name companyId')
      .populate('departmentId', 'name departmentId')
      .select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check access
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      if (currentUser.role === UserRole.COMPANY_ADMIN && user.companyId?._id.toString() !== currentUser.companyId?.toString()) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }
      if (currentUser.role === UserRole.DEPARTMENT_ADMIN && user.departmentId?._id.toString() !== currentUser.departmentId?.toString()) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', requirePermission(Permission.UPDATE_USER), async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const existingUser = await User.findById(req.params.id);

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check access
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      if (currentUser.role === UserRole.COMPANY_ADMIN && existingUser.companyId?.toString() !== currentUser.companyId?.toString()) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }
      if (currentUser.role === UserRole.DEPARTMENT_ADMIN && existingUser.departmentId?.toString() !== currentUser.departmentId?.toString()) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }
    }

    // Don't allow password update through this route
    delete req.body.password;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    await logUserAction(
      req,
      AuditAction.UPDATE,
      'User',
      user!._id.toString(),
      { updates: req.body }
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Soft delete user
// @access  Private
router.delete('/:id', requirePermission(Permission.DELETE_USER), async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const existingUser = await User.findById(req.params.id);

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check access
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      if (currentUser.role === UserRole.COMPANY_ADMIN && existingUser.companyId?.toString() !== currentUser.companyId?.toString()) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }
      if (currentUser.role === UserRole.DEPARTMENT_ADMIN && existingUser.departmentId?.toString() !== currentUser.departmentId?.toString()) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: currentUser._id,
        isActive: false
      },
      { new: true }
    );

    await logUserAction(
      req,
      AuditAction.DELETE,
      'User',
      user!._id.toString()
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id/activate
// @desc    Activate/deactivate user
// @access  Private
router.put('/:id/activate', requirePermission(Permission.UPDATE_USER), async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    await logUserAction(
      req,
      AuditAction.UPDATE,
      'User',
      user._id.toString(),
      { action: isActive ? 'activated' : 'deactivated' }
    );

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
});

export default router;
