import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock API
vi.mock('../lib/api', () => ({
  checkHealth: vi.fn().mockResolvedValue({ status: 'ok' }),
  gerarSql: vi.fn(),
  executarSql: vi.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('shows loading indicator initially', () => {
    render(<App />);
    expect(screen.getByText('Verificando...')).toBeInTheDocument();
  });

  it('shows API online after health check passes', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('API Online')).toBeInTheDocument();
    });
  });

  it('displays question form', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Faça sua pergunta')).toBeInTheDocument();
    });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /perguntar/i })).toBeInTheDocument();
  });

  it('displays question form', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Faça sua pergunta')).toBeInTheDocument();
    });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /perguntar/i })).toBeInTheDocument();
  });

  it('submits a question and shows result', async () => {
    const { gerarSql, executarSql } = await import('../lib/api');

    vi.mocked(gerarSql).mockResolvedValue({
      sql: 'SELECT * FROM clientes LIMIT 10',
      explicacao: 'Lista clientes',
      confidente: true,
      pergunta: 'Quais clientes ativos?',
      dados: [{ cliente_id: 1, codigo: 'CLI001' }],
      colunas: ['cliente_id', 'codigo'],
      total_resultados: 1,
      tempo_execucao_ms: 100,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('API Online')).toBeInTheDocument();
    });

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Quais clientes ativos?');

    const submitButton = screen.getByRole('button', { name: /perguntar/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('CLI001')).toBeInTheDocument();
    });
    expect(executarSql).not.toHaveBeenCalled();
    expect(localStorage.getItem('historico-consultas')).toContain('Quais clientes ativos?');
  });

  it('shows error when API fails', async () => {
    const { gerarSql } = await import('../lib/api');

    vi.mocked(gerarSql).mockRejectedValue(new Error('API error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('API Online')).toBeInTheDocument();
    });

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test query');

    const submitButton = screen.getByRole('button', { name: /perguntar/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Erro ao processar a pergunta')).toBeInTheDocument();
    });
  });
});