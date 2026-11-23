import { Request, Response, NextFunction } from 'express';
import { billingService } from './billing.service';
import { ledgerQuerySchema, upgradeSubscriptionSchema } from './billing.validation';

export class BillingController {
  /**
   * GET /api/v1/partner/billing/summary
   */
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await billingService.getBillingSummary(req.user!.id);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/partner/billing/ledger
   */
  async getLedger(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = ledgerQuerySchema.parse(req.query);
      const result = await billingService.getLedgerEntries(req.user!.id, params);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/partner/billing/ledger/export
   */
  async exportLedger(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { filename, csv } = await billingService.exportLedgerCsv(req.user!.id);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/partner/billing/subscription/upgrade
   */
  async upgradeSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { targetTier } = upgradeSubscriptionSchema.parse(req.body);
      const result = await billingService.upgradeSubscription(req.user!.id, targetTier);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const billingController = new BillingController();
