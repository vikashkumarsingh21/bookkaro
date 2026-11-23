import { Router } from 'express';
import { discoveryController } from './discovery.controller';

const router = Router();

router.get('/search', (req, res, next) => discoveryController.search(req, res, next));
router.get('/featured', (req, res, next) => discoveryController.getFeatured(req, res, next));
router.get('/providers/:id', (req, res, next) => discoveryController.getProviderById(req, res, next));

export default router;
