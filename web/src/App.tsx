import React, { useState } from 'react';
import PerguntaForm from './components/PerguntaForm';
import Resultado from './components/Resultado';
import { Pergunta, ResultadoConsulta } from './lib/types';

function App() {
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleConsulta = async (pergunta: Pergunta) => {
    setCarregando(true);
    setErro(null);
    setResultado(null);

    try {
      // Passo 1: Gerar SQL
      const gerarResposta = await fetch('/api/gerar-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: pergunta.texto })
      });

      if (!gerarResposta.ok) {
        throw new Error('Falha ao gerar SQL');
      }

      const dadosGeracao = await gerarResposta.json();
      const sql = dadosGeracao.sql;

      // Passo 2: Validar SQL
      const validarResposta = await fetch('/api/validar-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      });

      const dadosValidacao = await validarResposta.json();
      if (!dadosValidacao.valido) {
        throw new Error(`SQL invalido: ${dadosValidacao.erros.join(', ')}`);
      }

      // Passo 3: Executar SQL
      const executarResposta = await fetch('/api/executar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql, limite: 50 })
      });

      if (!executarResposta.ok) {
        const erroDados = await executarResposta.json();
        throw new Error(erroDados.erro || 'Falha ao executar consulta');
      }

      const dadosExecucao = await executarResposta.json();
      setResultado(dadosExecucao);

    } catch (e: any) {
      setErro(e.message || 'Erro inesperado');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🤖 Pergunte ao ERP</h1>
        <p>Interface de consulta SQL com assistência de IA</p>
      </header>

      <main className="main">
        <PerguntaForm onSubmit={handleConsulta} carregando={carregando} />

        {erro && (
          <div className="error-box">
            <strong>Erro:</strong> {erro}
          </div>
        )}

        {resultado && (
          <Resultado
            pergunta={resultado.pergunta || ''}
            sql={resultado.sql}
            dados={resultado.dados || []}
            colunas={resultado.colunas || []}
            tempoExecucao={resultado.tempo_execucao_ms}
            totalResultados={resultado.total_resultados}
          />
        )}
      </main>

      <footer className="footer">
        <p>ERP Ficticio - Para fins educacionais</p>
      </footer>
    </div>
  );
}

export default App;