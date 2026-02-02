import { Router } from 'express';
import { RetentionController } from '../controllers/retention.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requirePermission } from '../middleware/requirePermission';
import { AuthService } from '../../services/AuthService';

export const createRetentionRouter = (
	retentionController: RetentionController,
	authService: AuthService
): Router => {
	const router = Router();

	// Secure all routes in this module
	router.use(requireAuth(authService));

	// Enforce retention for all sources
	router.post(
		'/enforce-all',
		requirePermission('delete', 'archive'),
		retentionController.enforceForAllSources
	);

	// Enforce retention for a specific source
	router.post(
		'/:id/enforce',
		requirePermission('delete', 'archive'),
		retentionController.enforceForSource
	);

	return router;
};
