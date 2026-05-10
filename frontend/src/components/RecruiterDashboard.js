import React, { useState } from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/lti-logo.png';
import PositionSelector from './kanban/PositionSelector';

const RecruiterDashboard = () => {
    const [selectedPositionId, setSelectedPositionId] = useState(null);
    const navigate = useNavigate();

    const handleOpenKanban = () => {
        if (selectedPositionId != null) {
            navigate(`/positions/${selectedPositionId}/kanban`);
        }
    };

    return (
        <Container className="mt-5">
            <div className="text-center">
                <img src={logo} alt="LTI Logo" style={{ width: '150px' }} />
            </div>
            <h1 className="mb-4 text-center">Dashboard del Reclutador</h1>
            <Row>
                <Col md={6}>
                    <Card className="shadow p-4 mb-3">
                        <h5 className="mb-4">Añadir Candidato</h5>
                        <Link to="/add-candidate">
                            <Button variant="primary" className="btn-block">Añadir Nuevo Candidato</Button>
                        </Link>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow p-4 mb-3">
                        <h5 className="mb-4">Ver tablero Kanban</h5>
                        <PositionSelector
                            value={selectedPositionId}
                            onChange={setSelectedPositionId}
                        />
                        <Button
                            variant="success"
                            className="mt-3"
                            disabled={selectedPositionId == null}
                            onClick={handleOpenKanban}
                        >
                            Ver tablero
                        </Button>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RecruiterDashboard;
