import { Request, Response } from 'express';
import { getCandidatesByPosition } from '../../application/services/positionService';

export const listCandidatesByPosition = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    try {
        const candidates = await getCandidatesByPosition(id);
        return res.status(200).json(candidates);
    } catch (error: unknown) {
        if (error instanceof Error && error.message === 'Position not found') {
            return res.status(404).json({ error: 'Position not found' });
        }
        console.error('Error listing candidates by position:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
