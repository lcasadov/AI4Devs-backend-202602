import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RecruiterDashboard from '../RecruiterDashboard';

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <RecruiterDashboard />
    </MemoryRouter>
  );

describe('RecruiterDashboard', () => {
  it('renders the dashboard title', () => {
    renderWithRouter();

    expect(
      screen.getByRole('heading', { name: /Dashboard del Reclutador/i })
    ).toBeInTheDocument();
  });

  it('renders the "Añadir Nuevo Candidato" action', () => {
    renderWithRouter();

    expect(
      screen.getByRole('button', { name: /Añadir Nuevo Candidato/i })
    ).toBeInTheDocument();
  });

  it('links the action to /add-candidate', () => {
    renderWithRouter();

    const link = screen.getByRole('link', { name: /Añadir Nuevo Candidato/i });
    expect(link).toHaveAttribute('href', '/add-candidate');
  });
});
