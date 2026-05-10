import { Router } from 'express';
import { listCandidatesByPosition } from '../presentation/controllers/positionController';

const router = Router();

router.get('/:id/candidates', listCandidatesByPosition);

export default router;
