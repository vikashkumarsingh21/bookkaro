import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import {
  updateCrmStageSchema,
  requestChangesSchema,
  resolveDisputeSchema,
  crmQuerySchema,
  auditLogsQuerySchema,
} from './admin.validation';

export class AdminController {
  /**
   * GET /api/v1/admin/scorecard
   */
  async getScorecard(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getScorecard();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/crm
   */
  async getCrm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = crmQuerySchema.parse(req.query);
      const result = await adminService.getCrmLeads(params);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/crm/:id
   */
  async updateCrm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input = updateCrmStageSchema.parse(req.body);
      const result = await adminService.updateCrmLead(req.user!.id, id, input);

      res.status(200).json({
        success: true,
        message: 'CRM lead stage and notes updated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/verifications/:id/approve
   */
  async approveVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await adminService.approveVerification(req.user!.id, id);

      res.status(200).json({
        success: true,
        message: 'Partner verified & published live on BOOKKARO Patna directory.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/verifications/:id/request-changes
   */
  async requestChanges(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input = requestChangesSchema.parse(req.body);
      const result = await adminService.requestVerificationChanges(req.user!.id, id, input);

      res.status(200).json({
        success: true,
        message: 'Changes requested notification dispatched to partner.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/disputes
   */
  async getDisputes(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const disputes = await adminService.getDisputes();

      res.status(200).json({
        success: true,
        data: disputes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/disputes/:bookingId/resolve
   */
  async resolveDispute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.params;
      const input = resolveDisputeSchema.parse(req.body);
      const result = await adminService.resolveDispute(req.user!.id, bookingId, input);

      res.status(200).json({
        success: true,
        message: `Dispute resolved as ${input.resolution}.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/audit-logs
   */
  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = auditLogsQuerySchema.parse(req.query);
      const result = await adminService.getAuditLogs(params);

      if (params.format === 'csv' && 'csv' in result) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="bookkaro-audit-logs-${Date.now()}.csv"`);
        res.status(200).send(result.csv);
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
