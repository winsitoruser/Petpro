import { Router } from 'express';
import authRoutes from './auth.routes';
import vendorRoutes from './vendor.routes';
import productRoutes from './product.routes';
import promotionRoutes from './promotion.routes';
import analyticsRoutes from './analytics.routes';
import reviewRoutes from './review.routes';
import notificationRoutes from './notification.routes';
import healthRoutes from './health.routes';
import { authenticate } from '../middleware/auth';

const router = Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.status(200).json({ message: 'PetPro API is running' });
});

// Auth routes - public
router.use('/auth', authRoutes);

// Protected routes - require authentication
router.use('/vendors', authenticate, vendorRoutes);
router.use('/products', authenticate, productRoutes);
router.use('/promotions', authenticate, promotionRoutes);
router.use('/analytics', authenticate, analyticsRoutes);
router.use('/reviews', authenticate, reviewRoutes);
router.use('/notifications', authenticate, notificationRoutes);

// Health check routes - no authentication required
router.use('/health', healthRoutes);

export default router;
