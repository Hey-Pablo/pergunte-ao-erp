import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Resultado from '../src/components/Resultado';

describe('Resultado', () => {
  const props = {
    pergunta: 'Teste de consulta',
    sql: 'SELECT * FROM clientes LIMIT 10',
    dados: [
      { cliente_id: 1, nome: 'João' },
      { cliente_id: 2, nome: 'Maria' }
    ],
    colunas: ['cliente_id', 'nome'],
    tempoExecucao: 50,
    totalResultados: 2
  };

  it('renderiza resultado com dados', () => {
    render(<Resultado {...props} />);

    expect(screen.getByText('Resultado da Consulta')).toBeInTheDocument();
    expect(screen.getByText('Teste de consulta')).toBeInTheDocument();
  });

  it('mostra tabela com dados', () => {
    render(<Resultado {...props} />);

    expect(screen.getByText('Tabela (2 resultados)')).toBeInTheDocument();
    expect(screen.getByText('João')).toBeInTheDocument();
    expect(screen.getByText('Maria')).toBeInTheDocument();
  });

  it('mostra mensagem para resultado vazio', () => {
    render(<Resultado {...props} dados={[]} />);

    expect(screen.getByText('Resultado')).toBeInTheDocument();
    expect(screen.getByText('Nenhum resultado encontrado para sua consulta.')).toBeInTheDocument();
  });

  it('exibe tempo de execução', () => {
    render(<Resultado {...props} />);

    expect(screen.getByText('50ms')).toBeInTheDocument();
  });

  it('mostra SQL gerado', () => {
    render(<Resultado {...props} />);

    expect(screen.getByText(/SELECT \* FROM clientes/)).toBeInTheDocument();
  });
});