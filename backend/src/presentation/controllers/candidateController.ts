import { Request, Response } from 'express';
import { addCandidate, findCandidateById } from '../../application/services/candidateService';
import { moveStage } from '../../application/services/applicationService';

export const addCandidateController = async (req: Request, res: Response) => {
    try {
        const candidateData = req.body;
        const candidate = await addCandidate(candidateData);
        res.status(201).json({ message: 'Candidate added successfully', data: candidate });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ message: 'Error adding candidate', error: error.message });
        } else {
            res.status(400).json({ message: 'Error adding candidate', error: 'Unknown error' });
        }
    }
};

export const getCandidateById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const candidate = await findCandidateById(id);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateStage = async (req: Request, res: Response) => {
    const candidateId = parseInt(req.params.id, 10);
    if (isNaN(candidateId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    const { applicationId, newInterviewStepId } = req.body ?? {};
    if (
        typeof applicationId !== 'number' ||
        !Number.isInteger(applicationId) ||
        typeof newInterviewStepId !== 'number' ||
        !Number.isInteger(newInterviewStepId)
    ) {
        return res.status(400).json({
            error: 'Body must include numeric applicationId and newInterviewStepId',
        });
    }

    try {
        const result = await moveStage(candidateId, applicationId, newInterviewStepId);
        return res.status(200).json(result);
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message === 'Application not found') {
                return res.status(404).json({ error: 'Application not found' });
            }
            if (error.message === 'Invalid step for this position') {
                return res.status(400).json({ error: 'Invalid step for this position' });
            }
        }
        console.error('Error updating stage:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export { addCandidate };