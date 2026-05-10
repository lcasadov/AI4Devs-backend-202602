import express from 'express';
import request from 'supertest';

jest.mock('../../application/services/positionService', () => ({
    getCandidatesByPosition: jest.fn(),
}));

import { listCandidatesByPosition } from '../../presentation/controllers/positionController';
import { getCandidatesByPosition } from '../../application/services/positionService';

const mockedGetCandidates = getCandidatesByPosition as jest.MockedFunction<
    typeof getCandidatesByPosition
>;

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.get('/positions/:id/candidates', listCandidatesByPosition);
    return app;
};

describe('positionController.listCandidatesByPosition', () => {
    beforeEach(() => {
        mockedGetCandidates.mockReset();
    });

    it('returns 400 when id is not numeric', async () => {
        const res = await request(buildApp()).get('/positions/abc/candidates');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Invalid ID format' });
        expect(mockedGetCandidates).not.toHaveBeenCalled();
    });

    it('returns 404 when service throws Error("Position not found")', async () => {
        mockedGetCandidates.mockRejectedValueOnce(new Error('Position not found'));

        const res = await request(buildApp()).get('/positions/42/candidates');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Position not found' });
        expect(mockedGetCandidates).toHaveBeenCalledWith(42);
    });

    it('returns 500 when service throws an unexpected error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockedGetCandidates.mockRejectedValueOnce(new Error('database connection lost'));

        const res = await request(buildApp()).get('/positions/42/candidates');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Internal Server Error' });
        consoleSpy.mockRestore();
    });

    it('returns 200 with candidates list on the happy path', async () => {
        const candidates = [
            {
                candidateId: 1,
                fullName: 'Ada Lovelace',
                currentInterviewStep: 'Tech Interview',
                averageScore: 7.5,
            },
        ];
        mockedGetCandidates.mockResolvedValueOnce(candidates);

        const res = await request(buildApp()).get('/positions/42/candidates');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(candidates);
        expect(mockedGetCandidates).toHaveBeenCalledWith(42);
    });
});
