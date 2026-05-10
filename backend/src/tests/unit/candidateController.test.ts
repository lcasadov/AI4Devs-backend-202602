import express from 'express';
import request from 'supertest';

jest.mock('../../application/services/applicationService', () => ({
    moveStage: jest.fn(),
}));

jest.mock('../../application/services/candidateService', () => ({
    addCandidate: jest.fn(),
    findCandidateById: jest.fn(),
}));

import { updateStage } from '../../presentation/controllers/candidateController';
import { moveStage } from '../../application/services/applicationService';

const mockedMoveStage = moveStage as jest.MockedFunction<typeof moveStage>;

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.put('/candidates/:id/stage', updateStage);
    return app;
};

describe('candidateController.updateStage (PUT /candidates/:id/stage)', () => {
    beforeEach(() => {
        mockedMoveStage.mockReset();
    });

    it('returns 400 when candidateId path param is not numeric', async () => {
        const res = await request(buildApp())
            .put('/candidates/abc/stage')
            .send({ applicationId: 1, newInterviewStepId: 2 });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Invalid ID format' });
        expect(mockedMoveStage).not.toHaveBeenCalled();
    });

    it('returns 404 when service throws Error("Application not found")', async () => {
        mockedMoveStage.mockRejectedValueOnce(new Error('Application not found'));

        const res = await request(buildApp())
            .put('/candidates/1/stage')
            .send({ applicationId: 100, newInterviewStepId: 2 });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Application not found' });
        expect(mockedMoveStage).toHaveBeenCalledWith(1, 100, 2);
    });

    it('returns 400 when service throws Error("Invalid step for this position")', async () => {
        mockedMoveStage.mockRejectedValueOnce(new Error('Invalid step for this position'));

        const res = await request(buildApp())
            .put('/candidates/1/stage')
            .send({ applicationId: 100, newInterviewStepId: 99 });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Invalid step for this position' });
    });

    it('returns 200 with the move result on the happy path', async () => {
        mockedMoveStage.mockResolvedValueOnce({ applicationId: 100, currentInterviewStep: 3 });

        const res = await request(buildApp())
            .put('/candidates/1/stage')
            .send({ applicationId: 100, newInterviewStepId: 3 });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ applicationId: 100, currentInterviewStep: 3 });
        expect(mockedMoveStage).toHaveBeenCalledWith(1, 100, 3);
    });
});
