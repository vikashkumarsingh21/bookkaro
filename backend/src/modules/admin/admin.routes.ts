import { Router } from 'express';
import { adminController } from './admin.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// ALL admin routes strictly require authentication and ADMIN role
router.use(requireAuth, requireRole(Role.ADMIN));

router.get('/scorecard', (req, res, next) => adminController.getScorecard(req, res, next));
router.get('/crm', (req, res, next) => adminController.getCrm(req, res, next));
router.patch('/crm/:id', (req, res, next) => adminController.updateCrm(req, res, next));
router.post('/verifications/:id/approve', (req, res, next) => adminController.approveVerification(req, res, next));
router.post('/verifications/:id/request-changes', (req, res, next) => adminController.requestChanges(req, res, next));
router.get('/disputes', (req, res, next) => adminController.getDisputes(req, res, next));
router.post('/disputes/:bookingId/resolve', (req, res, next) => adminController.resolveDispute(req, res, next));
router.get('/audit-logs', (req, res, next) => adminController.getAuditLogs(req, res, next));

export default router;
