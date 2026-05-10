import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Card } from 'react-bootstrap';
import CandidateCard, { CandidateCardData } from './CandidateCard';

export interface KanbanColumnProps {
    stepId: number | null;
    stepName: string;
    candidates: CandidateCardData[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stepId, stepName, candidates }) => {
    const droppableId = stepId === null ? 'step-null' : `step-${stepId}`;
    const { isOver, setNodeRef } = useDroppable({
        id: droppableId,
        data: { stepId },
    });

    const style: React.CSSProperties = {
        backgroundColor: isOver ? '#e7f3ff' : '#f8f9fa',
        minHeight: '300px',
        transition: 'background-color 120ms',
    };

    return (
        <Card ref={setNodeRef} style={style} className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <strong>{stepName}</strong>
                <span className="badge bg-secondary">{candidates.length}</span>
            </Card.Header>
            <Card.Body className="p-2">
                {candidates.length === 0 ? (
                    <div className="text-muted small text-center mt-3">Sin candidatos</div>
                ) : (
                    candidates.map((candidate) => (
                        <CandidateCard key={candidate.applicationId} candidate={candidate} />
                    ))
                )}
            </Card.Body>
        </Card>
    );
};

export default KanbanColumn;
