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
      const resposta = await fetch('/api/gerar-sql', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: pergunta.texto })
      });
      const dados = await resposta.json();
      if (!resposta.ok || dados.sucesso === false) throw new Error(dados.erro || 'Falha ao consultar');
      if (!dados.confidente) {
        setErro(dados.explicacao);
        return;
      }
      setResultado({ ...dados, pergunta: pergunta.texto });

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
            sql={resultado.sql || ''}
            explicacao={resultado.explicacao || ''}
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