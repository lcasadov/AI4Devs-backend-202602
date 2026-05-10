import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import KanbanBoard from '../KanbanBoard';

jest.mock('../../../services/positionService', () => ({
    getInterviewSteps: jest.fn(),
    getCandidatesByPosition: jest.fn(),
}));

jest.mock('../../../services/applicationService', () => ({
    moveStage: jest.fn(),
}));

const positionService = require('../../../services/positionService');

const renderBoard = (positionId: string) =>
    render(
        <MemoryRouter initialEntries={[`/positions/${positionId}/kanban`]}>
            <Routes>
                <Route path="/positions/:id/kanban" element={<KanbanBoard />} />
            </Routes>
        </MemoryRouter>,
    );

describe('KanbanBoard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows spinner while loading then renders columns in order (No Asignado first)', async () => {
        positionService.getInterviewSteps.mockResolvedValue([
            { id: 1, name: 'Screening', orderIndex: 1 },
            { id: 2, name: 'Technical', orderIndex: 2 },
        ]);
        positionService.getCandidatesByPosition.mockResolvedValue([
            {
                candidateId: 1,
                applicationId: 10,
                fullName: 'A',
                currentInterviewStep: null,
                currentInterviewStepId: null,
                averageScore: null,
                lastEducation: null,
                lastWorkExperience: null,
            },
            {
                candidateId: 2,
                applicationId: 20,
                fullName: 'B',
                currentInterviewStep: 'Technical',
                currentInterviewStepId: 2,
                averageScore: 4,
                lastEducation: null,
                lastWorkExperience: null,
            },
        ]);

        renderBoard('42');

        expect(screen.getByText(/Cargando tablero/)).toBeInTheDocument();

        await waitFor(() => expect(screen.getByText('No Asignado')).toBeInTheDocument());
        expect(screen.getByText('Screening')).toBeInTheDocument();
        expect(screen.getByText('Technical')).toBeInTheDocument();
        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('shows error when loading fails', async () => {
        positionService.getInterviewSteps.mockRejectedValue(new Error('boom'));
        positionService.getCandidatesByPosition.mockResolvedValue([]);

        renderBoard('42');

        await waitFor(() => expect(screen.getByText(/boom/)).toBeInTheDocument());
    });

    it('shows error when position id is not numeric', async () => {
        renderBoard('abc');
        await waitFor(() => expect(screen.getByText(/Invalid position id/)).toBeInTheDocument());
    });
});
