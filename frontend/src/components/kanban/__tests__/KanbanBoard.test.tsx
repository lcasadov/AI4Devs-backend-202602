import React from 'react';
import { render, screen, waitFor, within, act, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

let capturedOnDragEnd: ((event: any) => void | Promise<void>) | null = null;

jest.mock('@dnd-kit/core', () => ({
    DndContext: ({ children, onDragEnd }: any) => {
        capturedOnDragEnd = onDragEnd;
        return <>{children}</>;
    },
    useDraggable: () => ({
        attributes: {},
        listeners: {},
        setNodeRef: () => {},
        transform: null,
        isDragging: false,
    }),
    useDroppable: () => ({
        isOver: false,
        setNodeRef: () => {},
    }),
    closestCorners: () => null,
}));

jest.mock('../../../services/positionService', () => ({
    getInterviewSteps: jest.fn(),
    getCandidatesByPosition: jest.fn(),
}));

jest.mock('../../../services/applicationService', () => ({
    moveStage: jest.fn(),
}));

import KanbanBoard from '../KanbanBoard';
const positionService = require('../../../services/positionService');
const applicationService = require('../../../services/applicationService');

const renderBoard = (positionId: string) =>
    render(
        <MemoryRouter initialEntries={[`/positions/${positionId}/kanban`]}>
            <Routes>
                <Route path="/positions/:id/kanban" element={<KanbanBoard />} />
            </Routes>
        </MemoryRouter>,
    );

const ana = {
    candidateId: 1,
    applicationId: 10,
    fullName: 'Ana',
    currentInterviewStep: null,
    currentInterviewStepId: null,
    averageScore: null,
    lastEducation: null,
    lastWorkExperience: null,
};

const bruno = {
    candidateId: 2,
    applicationId: 20,
    fullName: 'Bruno',
    currentInterviewStep: 'Screening',
    currentInterviewStepId: 1,
    averageScore: 3,
    lastEducation: null,
    lastWorkExperience: null,
};

const setupBoard = async () => {
    positionService.getInterviewSteps.mockResolvedValue([
        { id: 1, name: 'Screening', orderIndex: 1 },
        { id: 2, name: 'Technical', orderIndex: 2 },
    ]);
    positionService.getCandidatesByPosition.mockResolvedValue([ana, bruno]);
    renderBoard('42');
    await waitFor(() => expect(screen.getByText('Ana')).toBeInTheDocument());
};

const dragEvent = (opts: {
    applicationId?: number;
    candidateId?: number;
    targetStepId?: number | null;
    over?: null | { data: { current: any } };
}) => ({
    active: {
        data: {
            current: {
                applicationId: opts.applicationId,
                candidateId: opts.candidateId,
            },
        },
    },
    over:
        opts.over !== undefined
            ? opts.over
            : { data: { current: { stepId: opts.targetStepId } } },
});

const fireDrag = async (event: any) => {
    await act(async () => {
        await capturedOnDragEnd!(event);
    });
};

const columnOf = (headerText: string) => {
    const header = screen.getByText(headerText);
    const card = header.closest('.card');
    if (!card) throw new Error(`column with header ${headerText} not found`);
    return card as HTMLElement;
};

describe('KanbanBoard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedOnDragEnd = null;
    });

    describe('loading and error states', () => {
        it('shows spinner while loading then renders columns in order (No Asignado first)', async () => {
            await setupBoard();
            expect(screen.getByText('No Asignado')).toBeInTheDocument();
            expect(screen.getByText('Screening')).toBeInTheDocument();
            expect(screen.getByText('Technical')).toBeInTheDocument();
            expect(screen.getByText('Bruno')).toBeInTheDocument();
        });

        it('shows error when loading fails', async () => {
            positionService.getInterviewSteps.mockRejectedValue(new Error('boom'));
            positionService.getCandidatesByPosition.mockResolvedValue([]);
            renderBoard('42');
            await waitFor(() => expect(screen.getByText(/boom/)).toBeInTheDocument());
        });

        it('shows fallback message when loading fails with non-Error', async () => {
            positionService.getInterviewSteps.mockRejectedValue('not an error');
            positionService.getCandidatesByPosition.mockResolvedValue([]);
            renderBoard('42');
            await waitFor(() =>
                expect(screen.getByText(/Error loading kanban data/)).toBeInTheDocument(),
            );
        });

        it('shows error when position id is not numeric', async () => {
            renderBoard('abc');
            await waitFor(() =>
                expect(screen.getByText(/Invalid position id/)).toBeInTheDocument(),
            );
        });
    });

    describe('drag handler', () => {
        it('moves candidate from "No Asignado" to a step on success', async () => {
            applicationService.moveStage.mockResolvedValue({});
            await setupBoard();

            expect(within(columnOf('No Asignado')).getByText('Ana')).toBeInTheDocument();

            await fireDrag(dragEvent({ applicationId: 10, candidateId: 1, targetStepId: 2 }));

            expect(applicationService.moveStage).toHaveBeenCalledWith(1, 10, 2);
            await waitFor(() =>
                expect(within(columnOf('Technical')).getByText('Ana')).toBeInTheDocument(),
            );
            expect(within(columnOf('No Asignado')).queryByText('Ana')).not.toBeInTheDocument();
        });

        it('moves candidate from a step back to "No Asignado" (passes 0 to moveStage)', async () => {
            applicationService.moveStage.mockResolvedValue({});
            await setupBoard();

            expect(within(columnOf('Screening')).getByText('Bruno')).toBeInTheDocument();

            await fireDrag(dragEvent({ applicationId: 20, candidateId: 2, targetStepId: null }));

            expect(applicationService.moveStage).toHaveBeenCalledWith(2, 20, 0);
            await waitFor(() =>
                expect(within(columnOf('No Asignado')).getByText('Bruno')).toBeInTheDocument(),
            );
        });

        it('does not call moveStage when dropped on the same column', async () => {
            applicationService.moveStage.mockResolvedValue({});
            await setupBoard();

            await fireDrag(dragEvent({ applicationId: 20, candidateId: 2, targetStepId: 1 }));

            expect(applicationService.moveStage).not.toHaveBeenCalled();
        });

        it('does not call moveStage when there is no drop target', async () => {
            applicationService.moveStage.mockResolvedValue({});
            await setupBoard();

            await fireDrag(dragEvent({ applicationId: 10, candidateId: 1, over: null }));

            expect(applicationService.moveStage).not.toHaveBeenCalled();
        });

        it('does not call moveStage when active payload is missing applicationId', async () => {
            applicationService.moveStage.mockResolvedValue({});
            await setupBoard();

            await fireDrag(dragEvent({ candidateId: 1, targetStepId: 2 }));

            expect(applicationService.moveStage).not.toHaveBeenCalled();
        });

        it('does not call moveStage when over payload has no stepId', async () => {
            applicationService.moveStage.mockResolvedValue({});
            await setupBoard();

            await fireDrag(
                dragEvent({
                    applicationId: 10,
                    candidateId: 1,
                    over: { data: { current: {} } },
                }),
            );

            expect(applicationService.moveStage).not.toHaveBeenCalled();
        });

        it('does not call moveStage when applicationId does not match any candidate in state', async () => {
            applicationService.moveStage.mockResolvedValue({});
            await setupBoard();

            await fireDrag(dragEvent({ applicationId: 999, candidateId: 999, targetStepId: 2 }));

            expect(applicationService.moveStage).not.toHaveBeenCalled();
        });

        it('shows actionError and keeps candidate in place when moveStage fails', async () => {
            applicationService.moveStage.mockRejectedValue(new Error('server down'));
            await setupBoard();

            await fireDrag(dragEvent({ applicationId: 10, candidateId: 1, targetStepId: 2 }));

            await waitFor(() =>
                expect(screen.getByText(/server down/)).toBeInTheDocument(),
            );
            expect(within(columnOf('No Asignado')).getByText('Ana')).toBeInTheDocument();
            expect(within(columnOf('Technical')).queryByText('Ana')).not.toBeInTheDocument();
        });

        it('shows generic actionError message when moveStage rejects with non-Error', async () => {
            applicationService.moveStage.mockRejectedValue('opaque');
            await setupBoard();

            await fireDrag(dragEvent({ applicationId: 10, candidateId: 1, targetStepId: 2 }));

            await waitFor(() =>
                expect(screen.getByText(/Error moving candidate/)).toBeInTheDocument(),
            );
        });

        it('dismisses the actionError alert when the close button is clicked', async () => {
            applicationService.moveStage.mockRejectedValue(new Error('server down'));
            await setupBoard();

            await fireDrag(dragEvent({ applicationId: 10, candidateId: 1, targetStepId: 2 }));
            await waitFor(() =>
                expect(screen.getByText(/server down/)).toBeInTheDocument(),
            );

            const closeButton = screen.getByRole('button', { name: /close/i });
            fireEvent.click(closeButton);

            await waitFor(() =>
                expect(screen.queryByText(/server down/)).not.toBeInTheDocument(),
            );
        });

        it('falls back to null step name when target step id is unknown', async () => {
            applicationService.moveStage.mockResolvedValue({});
            await setupBoard();

            await fireDrag(dragEvent({ applicationId: 10, candidateId: 1, targetStepId: 999 }));

            expect(applicationService.moveStage).toHaveBeenCalledWith(1, 10, 999);
            await waitFor(() =>
                expect(applicationService.moveStage).toHaveBeenCalled(),
            );
        });
    });
});
