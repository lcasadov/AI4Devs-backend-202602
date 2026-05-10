import { PrismaClient } from '@prisma/client';
import { getCandidatesByPosition } from '../../application/services/positionService';

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
    position: { findUnique: jest.Mock };
    application: {
        findUnique: jest.Mock;
        findFirst: jest.Mock;
        findMany: jest.Mock;
        update: jest.Mock;
    };
};

describe('positionService.getCandidatesByPosition', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('throws Error("Position not found") when prisma.position.findUnique returns null', async () => {
        prisma.position.findUnique.mockResolvedValueOnce(null);

        await expect(getCandidatesByPosition(999)).rejects.toThrow('Position not found');
        expect(prisma.position.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 999 } }),
        );
    });

    it('returns an empty array when the position has no applications', async () => {
        prisma.position.findUnique.mockResolvedValueOnce({ id: 1, applications: [] });

        const result = await getCandidatesByPosition(1);

        expect(result).toEqual([]);
    });

    it('builds fullName concatenating firstName + " " + lastName', async () => {
        prisma.position.findUnique.mockResolvedValueOnce({
            id: 1,
            applications: [
                {
                    candidateId: 10,
                    candidate: { firstName: 'Ada', lastName: 'Lovelace' },
                    interviewStep: { name: 'Phone Screen' },
                    interviews: [],
                },
            ],
        });

        const result = await getCandidatesByPosition(1);

        expect(result).toHaveLength(1);
        expect(result[0].fullName).toBe('Ada Lovelace');
    });

    it('computes averageScore as the mean of non-null scores (ignores null scores)', async () => {
        prisma.position.findUnique.mockResolvedValueOnce({
            id: 1,
            applications: [
                {
                    candidateId: 10,
                    candidate: { firstName: 'Ada', lastName: 'Lovelace' },
                    interviewStep: { name: 'Tech' },
                    interviews: [{ score: 4 }, { score: null }, { score: 8 }],
                },
            ],
        });

        const result = await getCandidatesByPosition(1);

        expect(result[0].averageScore).toBe(6);
    });

    it('returns averageScore null when all scores are null or there are no interviews', async () => {
        prisma.position.findUnique.mockResolvedValueOnce({
            id: 1,
            applications: [
                {
                    candidateId: 10,
                    candidate: { firstName: 'A', lastName: 'B' },
                    interviewStep: { name: 'Tech' },
                    interviews: [{ score: null }, { score: null }],
                },
                {
                    candidateId: 11,
                    candidate: { firstName: 'C', lastName: 'D' },
                    interviewStep: { name: 'Tech' },
                    interviews: [],
                },
            ],
        });

        const result = await getCandidatesByPosition(1);

        expect(result[0].averageScore).toBeNull();
        expect(result[1].averageScore).toBeNull();
    });

    it('returns currentInterviewStep null when application.interviewStep is null', async () => {
        prisma.position.findUnique.mockResolvedValueOnce({
            id: 1,
            applications: [
                {
                    candidateId: 10,
                    candidate: { firstName: 'A', lastName: 'B' },
                    interviewStep: null,
                    interviews: [],
                },
            ],
        });

        const result = await getCandidatesByPosition(1);

        expect(result[0].currentInterviewStep).toBeNull();
    });
});
