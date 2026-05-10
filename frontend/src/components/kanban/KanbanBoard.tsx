import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import {
    getCandidatesByPosition,
    getInterviewSteps,
} from '../../services/positionService';
import { moveStage } from '../../services/applicationService';
import KanbanColumn from './KanbanColumn';
import { CandidateCardData } from './CandidateCard';

interface InterviewStep {
    id: number;
    name: string;
    orderIndex: number;
}

const KanbanBoard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const positionId = id ? parseInt(id, 10) : NaN;

    const [steps, setSteps] = useState<InterviewStep[]>([]);
    const [candidates, setCandidates] = useState<CandidateCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (Number.isNaN(positionId)) {
            setError('Invalid position id');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [stepsData, candidatesData] = await Promise.all([
                getInterviewSteps(positionId),
                getCandidatesByPosition(positionId),
            ]);
            setSteps(stepsData);
            setCandidates(candidatesData);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error loading kanban data');
        } finally {
            setLoading(false);
        }
    }, [positionId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const applicationId = active.data.current?.applicationId as number | undefined;
        const candidateId = active.data.current?.candidateId as number | undefined;
        const targetStepId = over.data.current?.stepId as number | null | undefined;

        if (applicationId === undefined || candidateId === undefined || targetStepId === undefined) {
            return;
        }

        const moved = candidates.find((c) => c.applicationId === applicationId);
        if (!moved) return;
        if (moved.currentInterviewStepId === targetStepId) return;

        setActionError(null);
        try {
            await moveStage(candidateId, applicationId, targetStepId ?? 0);
            const targetStepName =
                targetStepId === null ? null : steps.find((s) => s.id === targetStepId)?.name ?? null;
            setCandidates((prev) =>
                prev.map((c) =>
                    c.applicationId === applicationId
                        ? {
                              ...c,
                              currentInterviewStepId: targetStepId,
                              currentInterviewStep: targetStepName,
                          }
                        : c,
                ),
            );
        } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Error moving candidate');
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status" />
                <div className="mt-2">Cargando tablero...</div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    const columns: Array<{ stepId: number | null; stepName: string }> = [
        { stepId: null, stepName: 'No Asignado' },
        ...steps.map((s) => ({ stepId: s.id, stepName: s.name })),
    ];

    return (
        <Container fluid className="mt-4">
            <h2 className="mb-3">Tablero Kanban — Posición {positionId}</h2>
            {actionError && (
                <Alert variant="warning" onClose={() => setActionError(null)} dismissible>
                    {actionError}
                </Alert>
            )}
            <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <Row className="g-3 flex-nowrap" style={{ overflowX: 'auto' }}>
                    {columns.map((col) => (
                        <Col key={col.stepId === null ? 'null' : col.stepId} style={{ minWidth: '280px' }}>
                            <KanbanColumn
                                stepId={col.stepId}
                                stepName={col.stepName}
                                candidates={candidates.filter((c) => c.currentInterviewStepId === col.stepId)}
                            />
                        </Col>
                    ))}
                </Row>
            </DndContext>
        </Container>
    );
};

export default KanbanBoard;
