import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Grievance from '../models/Grievance';
import Appointment from '../models/Appointment';
import Department from '../models/Department';
import User from '../models/User';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { Permission, UserRole, GrievanceStatus, AppointmentStatus } from '../config/constants';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', requirePermission(Permission.VIEW_ANALYTICS), async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const { companyId, departmentId } = req.query;

    // Build base query based on user role
    const baseQuery: any = {};

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      if (companyId) baseQuery.companyId = companyId;
      if (departmentId) baseQuery.departmentId = departmentId;
    } else if (currentUser.role === UserRole.COMPANY_ADMIN) {
      baseQuery.companyId = currentUser.companyId;
      if (departmentId) baseQuery.departmentId = departmentId;
    } else if (currentUser.role === UserRole.DEPARTMENT_ADMIN) {
      baseQuery.departmentId = currentUser.departmentId;
    } else if (currentUser.role === UserRole.OPERATOR) {
      baseQuery.assignedTo = currentUser._id;
    }

    // Get grievance statistics
    const totalGrievances = await Grievance.countDocuments(baseQuery);
    const pendingGrievances = await Grievance.countDocuments({ ...baseQuery, status: GrievanceStatus.PENDING });
    const resolvedGrievances = await Grievance.countDocuments({ ...baseQuery, status: GrievanceStatus.RESOLVED });
    const inProgressGrievances = await Grievance.countDocuments({ ...baseQuery, status: GrievanceStatus.IN_PROGRESS });

    // Get appointment statistics
    const totalAppointments = await Appointment.countDocuments(baseQuery);
    const pendingAppointments = await Appointment.countDocuments({ ...baseQuery, status: AppointmentStatus.PENDING });
    const confirmedAppointments = await Appointment.countDocuments({ ...baseQuery, status: AppointmentStatus.CONFIRMED });
    const completedAppointments = await Appointment.countDocuments({ ...baseQuery, status: AppointmentStatus.COMPLETED });

    // Get department count (if applicable)
    let departmentCount = 0;
    if (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.COMPANY_ADMIN) {
      const deptQuery: any = {};
      if (currentUser.role === UserRole.COMPANY_ADMIN) {
        deptQuery.companyId = currentUser.companyId;
      } else if (companyId) {
        deptQuery.companyId = companyId;
      }
      departmentCount = await Department.countDocuments(deptQuery);
    }

    // Get user count (if applicable)
    let userCount = 0;
    if (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.COMPANY_ADMIN) {
      const userQuery: any = {};
      if (currentUser.role === UserRole.COMPANY_ADMIN) {
        userQuery.companyId = currentUser.companyId;
      } else if (companyId) {
        userQuery.companyId = companyId;
      }
      userCount = await User.countDocuments(userQuery);
    }

    res.json({
      success: true,
      data: {
        grievances: {
          total: totalGrievances,
          pending: pendingGrievances,
          inProgress: inProgressGrievances,
          resolved: resolvedGrievances
        },
        appointments: {
          total: totalAppointments,
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          completed: completedAppointments
        },
        departments: departmentCount,
        users: userCount
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/grievances/by-department
// @desc    Get grievance distribution by department
// @access  Private
router.get('/grievances/by-department', requirePermission(Permission.VIEW_ANALYTICS), async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const { companyId } = req.query;

    const matchQuery: any = {};

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      if (companyId) matchQuery.companyId = new mongoose.Types.ObjectId(companyId as string);
    } else if (currentUser.role === UserRole.COMPANY_ADMIN) {
      matchQuery.companyId = currentUser.companyId;
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    const distribution = await Grievance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$departmentId',
          count: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', GrievanceStatus.PENDING] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', GrievanceStatus.RESOLVED] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          departmentId: '$_id',
          departmentName: '$department.name',
          count: 1,
          pending: 1,
          resolved: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: distribution
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department distribution',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/grievances/by-status
// @desc    Get grievance distribution by status
// @access  Private
router.get('/grievances/by-status', requirePermission(Permission.VIEW_ANALYTICS), async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const { companyId, departmentId } = req.query;

    const matchQuery: any = {};

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      if (companyId) matchQuery.companyId = new mongoose.Types.ObjectId(companyId as string);
      if (departmentId) matchQuery.departmentId = new mongoose.Types.ObjectId(departmentId as string);
    } else if (currentUser.role === UserRole.COMPANY_ADMIN) {
      matchQuery.companyId = currentUser.companyId;
      if (departmentId) matchQuery.departmentId = new mongoose.Types.ObjectId(departmentId as string);
    } else if (currentUser.role === UserRole.DEPARTMENT_ADMIN) {
      matchQuery.departmentId = currentUser.departmentId;
    }

    const distribution = await Grievance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: distribution
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch status distribution',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/grievances/trends
// @desc    Get grievance trends over time
// @access  Private
router.get('/grievances/trends', requirePermission(Permission.VIEW_ANALYTICS), async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const { companyId, departmentId, days = 30 } = req.query;

    const matchQuery: any = {
      createdAt: {
        $gte: new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000)
      }
    };

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      if (companyId) matchQuery.companyId = new mongoose.Types.ObjectId(companyId as string);
      if (departmentId) matchQuery.departmentId = new mongoose.Types.ObjectId(departmentId as string);
    } else if (currentUser.role === UserRole.COMPANY_ADMIN) {
      matchQuery.companyId = currentUser.companyId;
      if (departmentId) matchQuery.departmentId = new mongoose.Types.ObjectId(departmentId as string);
    } else if (currentUser.role === UserRole.DEPARTMENT_ADMIN) {
      matchQuery.departmentId = currentUser.departmentId;
    }

    const trends = await Grievance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: trends
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grievance trends',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/appointments/by-date
// @desc    Get appointment distribution by date
// @access  Private
router.get('/appointments/by-date', requirePermission(Permission.VIEW_ANALYTICS), async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const { companyId, departmentId, days = 30 } = req.query;

    const matchQuery: any = {
      appointmentDate: {
        $gte: new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000)
      }
    };

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      if (companyId) matchQuery.companyId = new mongoose.Types.ObjectId(companyId as string);
      if (departmentId) matchQuery.departmentId = new mongoose.Types.ObjectId(departmentId as string);
    } else if (currentUser.role === UserRole.COMPANY_ADMIN) {
      matchQuery.companyId = currentUser.companyId;
      if (departmentId) matchQuery.departmentId = new mongoose.Types.ObjectId(departmentId as string);
    } else if (currentUser.role === UserRole.DEPARTMENT_ADMIN) {
      matchQuery.departmentId = currentUser.departmentId;
    }

    const distribution = await Appointment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' }
          },
          count: { $sum: 1 },
          confirmed: {
            $sum: { $cond: [{ $eq: ['$status', AppointmentStatus.CONFIRMED] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', AppointmentStatus.COMPLETED] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: distribution
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment distribution',
      error: error.message
    });
  }
});

export default router;
