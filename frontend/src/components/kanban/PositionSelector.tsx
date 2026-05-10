import React, { useEffect, useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { getPositions } from '../../services/positionService';

interface Position {
    id: number;
    title: string;
    status: string;
}

interface PositionSelectorProps {
    value: number | null;
    onChange: (id: number | null) => void;
}

const PositionSelector: React.FC<PositionSelectorProps> = ({ value, onChange }) => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        getPositions()
            .then((data) => {
                if (mounted) setPositions(data);
            })
            .catch((e) => {
                if (mounted) setError(e instanceof Error ? e.message : 'Error');
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    if (loading) return <Spinner animation="border" size="sm" />;
    if (error) return <div className="text-danger small">{error}</div>;

    return (
        <Form.Select
            aria-label="Seleccionar posición"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
        >
            <option value="">-- Selecciona una posición --</option>
            {positions.map((p) => (
                <option key={p.id} value={p.id}>
                    {p.title} ({p.status})
                </option>
            ))}
        </Form.Select>
    );
};

export default PositionSelector;
