import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { moveStage } from '../applicationService';

describe('applicationService', () => {
    let mock;
    beforeEach(() => {
        mock = new MockAdapter(axios);
    });
    afterEach(() => {
        mock.restore();
    });

    it('PUTs the correct payload', async () => {
        let captured;
        mock.onPut('http://localhost:3010/candidates/7/stage').reply((config) => {
            captured = JSON.parse(config.data);
            return [200, { applicationId: 100, currentInterviewStep: 'Technical' }];
        });
        const result = await moveStage(7, 100, 5);
        expect(captured).toEqual({ applicationId: 100, newInterviewStepId: 5 });
        expect(result).toEqual({ applicationId: 100, currentInterviewStep: 'Technical' });
    });

    it('throws on 400', async () => {
        mock.onPut('http://localhost:3010/candidates/7/stage')
            .reply(400, { error: 'Invalid step for this position' });
        await expect(moveStage(7, 100, 99)).rejects.toThrow(/Invalid step/);
    });
});
