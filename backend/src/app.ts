import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { config } from './config';
import prisma from './config/db';
import { globalLimiter, authLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// Module Route Imports
import authRoutes from './modules/auth/auth.routes';
import discoveryRoutes from './modules/discovery/discovery.routes';
import bookingsRoutes from './modules/bookings/bookings.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import partnerRoutes from './modules/partner/partner.routes';
import partnerOnboardingRoutes from './modules/partner/onboarding.routes';
import billingRoutes from './modules/partner/billing.routes';
import adminRoutes from './modules/admin/admin.routes';

export const createApp = (): Application => {
  const app = express();

  // 1. Security HTTP Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: config.isProduction ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. Response Compression (Gzip/Brotli)
  app.use(compression());

  // 3. Strict Cross-Origin Resource Sharing (CORS)
  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 4. Request Body & Cookie Parsers
  // Webhook raw body parser mounted BEFORE express.json() for HMAC SHA-256 verification
  app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // 5. Global API Rate Limiter
  app.use('/api', globalLimiter);

  // 6. Comprehensive Health Check Endpoint
  app.get('/api/v1/health', async (_req: Request, res: Response) => {
    let dbStatus = 'disconnected';
    let dbLatencyMs = -1;

    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'unreachable';
    }

    const isHealthy = dbStatus === 'connected';

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'BOOKKARO Patna API',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
    });
  });

  // 7. Route Mounting
  // Stricter rate limiter specifically on authentication routes
  app.use('/api/v1/auth', authLimiter, authRoutes);
  app.use('/api/v1/discovery', discoveryRoutes);
  app.use('/api/v1/bookings', bookingsRoutes);
  app.use('/api/v1/payments', paymentsRoutes);
  app.use('/api/v1/partner/applications', partnerOnboardingRoutes);
  app.use('/api/v1/partner/billing', billingRoutes);
  app.use('/api/v1/partner', partnerRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // 8. Unhandled Route 404 Fallback
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Endpoint ${req.method} ${req.originalUrl} not found on BOOKKARO API`,
      code: 'ROUTE_NOT_FOUND',
    });
  });

  // 9. Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};

export default createApp;
