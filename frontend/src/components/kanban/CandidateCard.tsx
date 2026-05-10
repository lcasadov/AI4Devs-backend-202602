import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card } from 'react-bootstrap';

export interface CandidateCardData {
    candidateId: number;
    applicationId: number;
    fullName: string;
    currentInterviewStep: string | null;
    averageScore: number | null;
    lastEducation: { title: string; institution: string } | null;
    lastWorkExperience: { position: string; company: string } | null;
}

interface CandidateCardProps {
    candidate: CandidateCardData;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
    const draggableId = `candidate-${candidate.applicationId}`;
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: draggableId,
        data: {
            candidateId: candidate.candidateId,
            applicationId: candidate.applicationId,
        },
    });

    const style: React.CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
    };

    const educationLabel = candidate.lastEducation
        ? `${candidate.lastEducation.title} · ${candidate.lastEducation.institution}`
        : 'Sin estudios';

    const experienceLabel = candidate.lastWorkExperience
        ? `${candidate.lastWorkExperience.position} · ${candidate.lastWorkExperience.company}`
        : 'Sin experiencia';

    const scoreLabel =
        typeof candidate.averageScore === 'number'
            ? candidate.averageScore.toFixed(1)
            : 'Sin puntuación';

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className="mb-2 shadow-sm"
            aria-label={`Candidato ${candidate.fullName}`}
            {...listeners}
            {...attributes}
        >
            <Card.Body className="p-2">
                <Card.Title as="h6" className="mb-1">{candidate.fullName}</Card.Title>
                <div className="small text-muted">{educationLabel}</div>
                <div className="small text-muted">{experienceLabel}</div>
                <div className="small mt-1">
                    <strong>Score: </strong>{scoreLabel}
                </div>
            </Card.Body>
        </Card>
    );
};

export default CandidateCard;
