import React, { useState } from 'react';
import { Pergunta } from '../lib/types';

interface Props {
  onSubmit: (pergunta: Pergunta) => void;
  carregando: boolean;
}

const sugestoes = [
  'Quais os 5 clientes com mais titulos vencidos?',
  'Saldo de estoque de todos os produtos',
  'Total de titulos em aberto por cliente',
  'Faturamento do mes atual',
  'Produtos com estoque baixo',
  'Titulos vencidos nos ultimos 30 dias',
  'Clientes que compraram produtos da categoria Informatica',
  'Indicadores de faturamento mensal'
];

export default function PerguntaForm({ onSubmit, carregando }: Props) {
  const [texto, setTexto] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (texto.trim() && !carregando) {
      onSubmit({ texto: texto.trim() });
      setTexto('');
    }
  };

  const handleSugestao = (sugestao: string) => {
    setTexto(sugestao);
    handleSubmit({ target: {} } as any);
  };

  return (
    <section className="form-section">
      <h2>Faça sua pergunta</h2>

      <form onSubmit={handleSubmit} className="pergunta-form">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ex: Quais os 5 clientes com mais titulos vencidos?"
          disabled={carregando}
          className="pergunta-input"
        />
        <button type="submit" disabled={carregando || !texto.trim()}>
          {carregando ? 'Consultando...' : 'Consultar'}
        </button>
      </form>

      <div className="sugestoes">
        <h3>Sugestoes recentes</h3>
        <div className="sugestoes-lista">
          {sugestoes.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSugestao(s)}
              disabled={carregando}
              className="sugestao-btn"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}