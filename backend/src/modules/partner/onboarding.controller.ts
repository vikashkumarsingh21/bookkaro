import { Request, Response, NextFunction } from 'express';
import { partnerOnboardingService } from './onboarding.service';
import { createApplicationSchema } from './onboarding.validation';

export class PartnerOnboardingController {
  /**
   * POST /api/v1/partner/applications (Public)
   */
  async createApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = createApplicationSchema.parse(req.body);
      const result = await partnerOnboardingService.createApplication(validatedInput);

      res.status(201).json({
        success: true,
        message: 'Partner onboarding application submitted successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/partner/applications/track/:code (Public)
   */
  async trackApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      const result = await partnerOnboardingService.trackApplication(code);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const partnerOnboardingController = new PartnerOnboardingController();
