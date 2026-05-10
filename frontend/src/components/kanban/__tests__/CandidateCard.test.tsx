import React from 'react';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import CandidateCard, { CandidateCardData } from '../CandidateCard';

const base: CandidateCardData = {
    candidateId: 1,
    applicationId: 10,
    fullName: 'Ana Pérez',
    currentInterviewStep: 'Technical',
    currentInterviewStepId: 5,
    averageScore: 4.5,
    lastEducation: { title: 'Máster', institution: 'UC3M' },
    lastWorkExperience: { position: 'Senior', company: 'ACME' },
};

const renderInDnd = (ui: React.ReactElement) =>
    render(<DndContext>{ui}</DndContext>);

describe('CandidateCard', () => {
    it('renders fullName, education, experience and score', () => {
        renderInDnd(<CandidateCard candidate={base} />);
        expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
        expect(screen.getByText(/Máster · UC3M/)).toBeInTheDocument();
        expect(screen.getByText(/Senior · ACME/)).toBeInTheDocument();
        expect(screen.getByText(/4\.5/)).toBeInTheDocument();
    });

    it('shows fallbacks when fields are null', () => {
        renderInDnd(
            <CandidateCard
                candidate={{ ...base, averageScore: null, lastEducation: null, lastWorkExperience: null }}
            />,
        );
        expect(screen.getByText(/Sin estudios/)).toBeInTheDocument();
        expect(screen.getByText(/Sin experiencia/)).toBeInTheDocument();
        expect(screen.getByText(/Sin puntuación/)).toBeInTheDocument();
    });

    it('exposes accessible label', () => {
        renderInDnd(<CandidateCard candidate={base} />);
        expect(screen.getByLabelText('Candidato Ana Pérez')).toBeInTheDocument();
    });
});
