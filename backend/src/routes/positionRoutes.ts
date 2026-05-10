import { Router } from 'express';
import {
    listCandidatesByPosition,
    listInterviewStepsByPosition,
    listAllPositions,
} from '../presentation/controllers/positionController';

const router = Router();

router.get('/', listAllPositions);
router.get('/:id/candidates', listCandidatesByPosition);
router.get('/:id/interviewSteps', listInterviewStepsByPosition);

export default router;
