import { Router } from 'express';
import { partnerOnboardingController } from './onboarding.controller';

const router = Router();

// Public routes for vendor lead submission and tracking
router.post('/', (req, res, next) => partnerOnboardingController.createApplication(req, res, next));
router.get('/track/:code', (req, res, next) => partnerOnboardingController.trackApplication(req, res, next));

export default router;
