import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CandidateKanbanDTO {
    candidateId: number;
    fullName: string;
    currentInterviewStep: string | null;
    averageScore: number | null;
}

export const getCandidatesByPosition = async (positionId: number): Promise<CandidateKanbanDTO[]> => {
    const position = await prisma.position.findUnique({
        where: { id: positionId },
        include: {
            applications: {
                include: {
                    candidate: { select: { firstName: true, lastName: true } },
                    interviewStep: { select: { name: true } },
                    interviews: { select: { score: true } },
                },
            },
        },
    });

    if (!position) {
        throw new Error('Position not found');
    }

    return position.applications.map((application) => {
        const scores = application.interviews
            .map((interview) => interview.score)
            .filter((score): score is number => score !== null && score !== undefined);

        const averageScore = scores.length > 0
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length
            : null;

        return {
            candidateId: application.candidateId,
            fullName: `${application.candidate.firstName} ${application.candidate.lastName}`,
            currentInterviewStep: application.interviewStep?.name ?? null,
            averageScore,
        };
    });
};
