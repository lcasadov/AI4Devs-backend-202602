import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CandidateKanbanDTO {
    candidateId: number;
    fullName: string;
    currentInterviewStep: string | null;
    averageScore: number | null;
    lastEducation: { title: string; institution: string } | null;
    lastWorkExperience: { position: string; company: string } | null;
}

export interface InterviewStepDTO {
    id: number;
    name: string;
    orderIndex: number;
}

export interface PositionListItemDTO {
    id: number;
    title: string;
    status: string;
}

export const getCandidatesByPosition = async (positionId: number): Promise<CandidateKanbanDTO[]> => {
    const position = await prisma.position.findUnique({
        where: { id: positionId },
        include: {
            applications: {
                include: {
                    candidate: {
                        select: {
                            firstName: true,
                            lastName: true,
                            educations: {
                                orderBy: { startDate: 'desc' },
                                take: 1,
                                select: { title: true, institution: true },
                            },
                            workExperiences: {
                                orderBy: { startDate: 'desc' },
                                take: 1,
                                select: { position: true, company: true },
                            },
                        },
                    },
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

        const educations = application.candidate.educations ?? [];
        const lastEducation = educations.length > 0
            ? { title: educations[0].title, institution: educations[0].institution }
            : null;

        const workExperiences = application.candidate.workExperiences ?? [];
        const lastWorkExperience = workExperiences.length > 0
            ? { position: workExperiences[0].position, company: workExperiences[0].company }
            : null;

        return {
            candidateId: application.candidateId,
            fullName: `${application.candidate.firstName} ${application.candidate.lastName}`,
            currentInterviewStep: application.interviewStep?.name ?? null,
            averageScore,
            lastEducation,
            lastWorkExperience,
        };
    });
};

export const getInterviewSteps = async (positionId: number): Promise<InterviewStepDTO[]> => {
    const position = await prisma.position.findUnique({
        where: { id: positionId },
        select: { id: true, interviewFlowId: true },
    });

    if (!position) {
        throw new Error('Position not found');
    }

    return prisma.interviewStep.findMany({
        where: { interviewFlowId: position.interviewFlowId },
        orderBy: { orderIndex: 'asc' },
        select: { id: true, name: true, orderIndex: true },
    });
};

export const getAllPositions = async (): Promise<PositionListItemDTO[]> => {
    return prisma.position.findMany({
        select: { id: true, title: true, status: true },
    });
};
