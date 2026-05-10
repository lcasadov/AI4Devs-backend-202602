import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MoveStageResult {
    applicationId: number;
    currentInterviewStep: number;
}

export const moveStage = async (
    candidateId: number,
    applicationId: number,
    newInterviewStepId: number,
): Promise<MoveStageResult> => {
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
            position: {
                include: {
                    interviewFlow: {
                        include: {
                            interviewSteps: { select: { id: true } },
                        },
                    },
                },
            },
        },
    });

    if (!application || application.candidateId !== candidateId) {
        throw new Error('Application not found');
    }

    const validStepIds = application.position.interviewFlow.interviewSteps.map((step) => step.id);
    if (!validStepIds.includes(newInterviewStepId)) {
        throw new Error('Invalid step for this position');
    }

    if (application.currentInterviewStep === newInterviewStepId) {
        return { applicationId, currentInterviewStep: newInterviewStepId };
    }

    const updated = await prisma.application.update({
        where: { id: applicationId },
        data: { currentInterviewStep: newInterviewStepId },
        select: { id: true, currentInterviewStep: true },
    });

    return { applicationId: updated.id, currentInterviewStep: updated.currentInterviewStep ?? newInterviewStepId };
};
