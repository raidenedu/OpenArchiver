import { Request, Response } from 'express';
import { IngestionService } from '../../services/IngestionService';
import { UserService } from '../../services/UserService';
import { logger } from '../../config/logger';

export class RetentionController {
	private userService = new UserService();

	/**
	 * Enforce retention for a single ingestion source.
	 * DELETE /api/v1/retention/:id
	 */
	public enforceForSource = async (req: Request, res: Response): Promise<Response> => {
		try {
			const { id } = req.params;
			const userId = req.user?.sub;
			if (!userId) {
				return res.status(401).json({ message: req.t('errors.unauthorized') });
			}
			const actor = await this.userService.findById(userId);
			if (!actor) {
				return res.status(401).json({ message: req.t('errors.unauthorized') });
			}

			const result = await IngestionService.enforceRetention(
				id,
				{ id: actor.id },
				req.ip || 'unknown'
			);

			return res.status(200).json({
				ok: true,
				sourceId: id,
				deletedCount: result.deletedCount,
			});
		} catch (error) {
			logger.error({ err: error }, 'Enforce retention for source error');
			if (error instanceof Error && error.message === 'Ingestion source not found') {
				return res.status(404).json({ message: req.t('ingestion.notFound') });
			}
			if (error instanceof Error) {
				return res.status(400).json({ message: error.message });
			}
			return res.status(500).json({ message: req.t('errors.internalServerError') });
		}
	};

	/**
	 * Enforce retention for all sources that have a retention policy.
	 * POST /api/v1/retention/enforce-all
	 */
	public enforceForAllSources = async (req: Request, res: Response): Promise<Response> => {
		try {
			const userId = req.user?.sub;
			if (!userId) {
				return res.status(401).json({ message: req.t('errors.unauthorized') });
			}
			const actor = await this.userService.findById(userId);
			if (!actor) {
				return res.status(401).json({ message: req.t('errors.unauthorized') });
			}

			const result = await IngestionService.enforceRetentionForAllSources(
				{ id: actor.id },
				req.ip || 'unknown'
			);

			return res.status(200).json({
				ok: true,
				totalDeleted: result.totalDeleted,
				sourcesProcessed: result.sourcesProcessed,
				errors: result.errors,
			});
		} catch (error) {
			logger.error({ err: error }, 'Enforce retention for all sources error');
			if (error instanceof Error) {
				return res.status(400).json({ message: error.message });
			}
			return res.status(500).json({ message: req.t('errors.internalServerError') });
		}
	};
}
