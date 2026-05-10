import { PrismaClient } from '@prisma/client';
import { moveStage } from '../../application/services/applicationService';

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        position: { findUnique: jest.fn() },
        application: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

const prisma = new PrismaClient() as unknown as {
    application: {
        findUnique: jest.Mock;
        findFirst: jest.Mock;
        findMany: jest.Mock;
        update: jest.Mock;
    };
};

const buildApplication = (overrides: Partial<{ id: number; candidateId: number; currentInterviewStep: number; stepIds: number[] }> = {}) => {
    const id = overrides.id ?? 100;
    const candidateId = overrides.candidateId ?? 1;
    const currentInterviewStep = overrides.currentInterviewStep ?? 1;
    const stepIds = overrides.stepIds ?? [1, 2, 3];
    return {
        id,
        candidateId,
        currentInterviewStep,
        position: {
            interviewFlow: {
                interviewSteps: stepIds.map((stepId) => ({ id: stepId })),
            },
        },
    };
};

describe('applicationService.moveStage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('throws "Application not found" when no application matches the candidate (NotFound case)', async () => {
        prisma.application.findUnique.mockResolvedValueOnce(null);

        await expect(moveStage(1, 100, 5)).rejects.toThrow('Application not found');
        expect(prisma.application.update).not.toHaveBeenCalled();
    });

    it('throws "Invalid step for this position" when newInterviewStepId is not in valid step ids (BadRequest case)', async () => {
        prisma.application.findUnique.mockResolvedValueOnce(
            buildApplication({ currentInterviewStep: 1, stepIds: [1, 2, 3] }),
        );

        await expect(moveStage(1, 100, 99)).rejects.toThrow('Invalid step for this position');
        expect(prisma.application.update).not.toHaveBeenCalled();
    });

    it('returns current state without calling update when application is already in the requested step (idempotent)', async () => {
        prisma.application.findUnique.mockResolvedValueOnce(
            buildApplication({ currentInterviewStep: 2, stepIds: [1, 2, 3] }),
        );

        const result = await moveStage(1, 100, 2);

        expect(result).toEqual({ applicationId: 100, currentInterviewStep: 2 });
        expect(prisma.application.update).not.toHaveBeenCalled();
    });

    it('calls prisma.application.update and returns its result on the happy path', async () => {
        prisma.application.findUnique.mockResolvedValueOnce(
            buildApplication({ id: 100, candidateId: 1, currentInterviewStep: 1, stepIds: [1, 2, 3] }),
        );
        prisma.application.update.mockResolvedValueOnce({ id: 100, currentInterviewStep: 3 });

        const result = await moveStage(1, 100, 3);

        expect(prisma.application.update).toHaveBeenCalledWith({
            where: { id: 100 },
            data: { currentInterviewStep: 3 },
            select: { id: true, currentInterviewStep: true },
        });
        expect(result).toEqual({ applicationId: 100, currentInterviewStep: 3 });
    });
});
