import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
    getPositions,
    getCandidatesByPosition,
    getInterviewSteps,
} from '../positionService';

describe('positionService', () => {
    let mock;
    beforeEach(() => {
        mock = new MockAdapter(axios);
    });
    afterEach(() => {
        mock.restore();
    });

    describe('getPositions', () => {
        it('returns positions on 200', async () => {
            const data = [{ id: 1, title: 'Dev', status: 'open' }];
            mock.onGet('http://localhost:3010/positions').reply(200, data);
            const result = await getPositions();
            expect(result).toEqual(data);
        });

        it('throws on error', async () => {
            mock.onGet('http://localhost:3010/positions').reply(500, { error: 'boom' });
            await expect(getPositions()).rejects.toThrow(/boom/);
        });
    });

    describe('getCandidatesByPosition', () => {
        it('calls the correct endpoint and returns data', async () => {
            const data = [{ candidateId: 1, applicationId: 10, fullName: 'A' }];
            mock.onGet('http://localhost:3010/positions/5/candidates').reply(200, data);
            const result = await getCandidatesByPosition(5);
            expect(result).toEqual(data);
        });

        it('throws on 404', async () => {
            mock.onGet('http://localhost:3010/positions/999/candidates')
                .reply(404, { error: 'Position not found' });
            await expect(getCandidatesByPosition(999)).rejects.toThrow(/Position not found/);
        });
    });

    describe('getInterviewSteps', () => {
        it('returns steps array', async () => {
            const data = [{ id: 1, name: 'Screening', orderIndex: 1 }];
            mock.onGet('http://localhost:3010/positions/5/interviewSteps').reply(200, data);
            const result = await getInterviewSteps(5);
            expect(result).toEqual(data);
        });

        it('throws on error', async () => {
            mock.onGet('http://localhost:3010/positions/5/interviewSteps').reply(500);
            await expect(getInterviewSteps(5)).rejects.toThrow();
        });
    });
});
