import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PerguntaForm from '../src/components/PerguntaForm';

describe('PerguntaForm', () => {
  it('renderiza o formulário', () => {
    const onSubmit = vi.fn();
    render(<PerguntaForm onSubmit={onSubmit} carregando={false} />);

    expect(screen.getByText('Faça sua pergunta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: Quais os 5 clientes com mais titulos vencidos?')).toBeInTheDocument();
    expect(screen.getByText('Consultar')).toBeInTheDocument();
  });

  it('chama onSubmit ao enviar formulário', () => {
    const onSubmit = vi.fn();
    render(<PerguntaForm onSubmit={onSubmit} carregando={false} />);

    const input = screen.getByPlaceholderText('Ex: Quais os 5 clientes com mais titulos vencidos?');
    fireEvent.change(input, { target: { value: 'Teste pergunta' } });
    fireEvent.click(screen.getByText('Consultar'));

    expect(onSubmit).toHaveBeenCalledWith({ texto: 'Teste pergunta' });
  });

  it('desabilita botão quando carregando', () => {
    const onSubmit = vi.fn();
    render(<PerguntaForm onSubmit={onSubmit} carregando={true} />);

    expect(screen.getByText('Consultando...')).toBeDisabled();
  });

  it('mostra sugestões', () => {
    const onSubmit = vi.fn();
    render(<PerguntaForm onSubmit={onSubmit} carregando={false} />);

    expect(screen.getByText('Sugestoes recentes')).toBeInTheDocument();
    expect(screen.getByText('Quais os 5 clientes com mais titulos vencidos?')).toBeInTheDocument();
  });
});