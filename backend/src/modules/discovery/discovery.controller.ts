import { Request, Response, NextFunction } from 'express';
import { discoveryService } from './discovery.service';
import { searchQuerySchema } from './discovery.validation';

export class DiscoveryController {
  /**
   * GET /api/v1/discovery/search
   */
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = searchQuerySchema.parse(req.query);
      const result = await discoveryService.search(validatedQuery);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/discovery/providers/:id
   */
  async getProviderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const provider = await discoveryService.getProviderById(id);

      res.status(200).json({
        success: true,
        data: provider,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/discovery/featured
   */
  async getFeatured(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const featured = await discoveryService.getFeatured();

      res.status(200).json({
        success: true,
        data: featured,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const discoveryController = new DiscoveryController();
