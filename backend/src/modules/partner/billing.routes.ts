import { Router } from 'express';
import { billingController } from './billing.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Strictly guard ALL partner commercial billing routes for PARTNER_OWNER only (block PARTNER_STAFF with 403 Forbidden)
router.use(requireAuth, requireRole(Role.PARTNER_OWNER));

router.get('/summary', (req, res, next) => billingController.getSummary(req, res, next));
router.get('/ledger', (req, res, next) => billingController.getLedger(req, res, next));
router.get('/ledger/export', (req, res, next) => billingController.exportLedger(req, res, next));
router.post('/subscription/upgrade', (req, res, next) => billingController.upgradeSubscription(req, res, next));

export default router;
