import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';

describe('App', () => {
  it('renderiza o título principal', () => {
    render(<App />);
    expect(screen.getByText('🤖 Pergunte ao ERP')).toBeInTheDocument();
  });

  it('renderiza o componente PerguntaForm', () => {
    render(<App />);
    expect(screen.getByText('Faça sua pergunta')).toBeInTheDocument();
  });

  it('renderiza o subtítulo', () => {
    render(<App />);
    expect(screen.getByText('Interface de consulta SQL com assistência de IA')).toBeInTheDocument();
  });

  it('renderiza o footer', () => {
    render(<App />);
    expect(screen.getByText('ERP Ficticio - Para fins educacionais')).toBeInTheDocument();
  });
});