import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTable, ChartCard, SQLPanel, ExplanationPanel, ErrorPanel, ResultCard } from './ResultCard';

describe('ResultCard Components', () => {
  describe('ResultCard', () => {
    it('renders with title and children', () => {
      render(
        <ResultCard title="Test Title">
          <div>Test Content</div>
        </ResultCard>
      );
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders with badge', () => {
      render(
        <ResultCard title="Test Title" badge="success">
          <div>Content</div>
        </ResultCard>
      );
      expect(screen.getByText('success')).toBeInTheDocument();
    });
  });

  describe('DataTable', () => {
    it('renders table with data', () => {
      const data = [
        { id: 1, nome: 'João', valor: 100 },
        { id: 2, nome: 'Maria', valor: 200 },
      ];
      const columns = ['id', 'nome', 'valor'];

      render(<DataTable data={data} columns={columns} />);

      expect(screen.getByText('João')).toBeInTheDocument();
      expect(screen.getByText('Maria')).toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      render(<DataTable data={[]} columns={['id', 'nome']} />);

      expect(screen.getByText('Nenhum resultado encontrado')).toBeInTheDocument();
    });
  });

  describe('SQLPanel', () => {
    it('renders SQL code', () => {
      const sql = 'SELECT * FROM clientes LIMIT 10';
      render(<SQLPanel sql={sql} />);

      expect(screen.getByText('SQL Executado')).toBeInTheDocument();
      expect(screen.getByText(sql)).toBeInTheDocument();
    });

    it('renders with copy button', () => {
      render(<SQLPanel sql="SELECT 1" />);
      expect(screen.getByTitle('Copiar SQL')).toBeInTheDocument();
    });
  });

  describe('ExplanationPanel', () => {
    it('renders explanation', () => {
      render(
        <ExplanationPanel
          explicacao="Esta consulta lista clientes ativos"
          tabelaPrincipal="clientes"
          tipoConsulta="SELECT"
        />
      );

      expect(screen.getByText('Esta consulta lista clientes ativos')).toBeInTheDocument();
    });
  });

  describe('ErrorPanel', () => {
    it('renders error message', () => {
      render(
        <ErrorPanel
          erro="Erro de conexão"
          detalhes={['Detalhe 1', 'Detalhe 2']}
        />
      );

      expect(screen.getByText('Erro ao processar a pergunta')).toBeInTheDocument();
      expect(screen.getByText('Erro de conexão')).toBeInTheDocument();
    });

    it('renders retry and back buttons', () => {
      render(
        <ErrorPanel
          erro="Erro"
          onRetry={() => {}}
          onBack={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument();
    });
  });

  describe('ChartCard', () => {
    it('shows empty state with insufficient data', () => {
      render(<ChartCard data={[]} columns={['nome', 'valor']} />);

      expect(screen.getByText('Dados insuficientes para gráfico')).toBeInTheDocument();
    });
  });
});