import React from 'react';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import KanbanColumn from '../KanbanColumn';
import { CandidateCardData } from '../CandidateCard';

const makeCandidate = (id: number, name: string): CandidateCardData => ({
    candidateId: id,
    applicationId: id * 10,
    fullName: name,
    currentInterviewStep: 'X',
    currentInterviewStepId: 1,
    averageScore: null,
    lastEducation: null,
    lastWorkExperience: null,
});

const renderInDnd = (ui: React.ReactElement) =>
    render(<DndContext>{ui}</DndContext>);

describe('KanbanColumn', () => {
    it('renders title and candidate count', () => {
        const candidates = [makeCandidate(1, 'A'), makeCandidate(2, 'B')];
        renderInDnd(<KanbanColumn stepId={1} stepName="Technical" candidates={candidates} />);
        expect(screen.getByText('Technical')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('shows empty state when there are no candidates', () => {
        renderInDnd(<KanbanColumn stepId={null} stepName="No Asignado" candidates={[]} />);
        expect(screen.getByText('No Asignado')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText(/Sin candidatos/)).toBeInTheDocument();
    });
});
