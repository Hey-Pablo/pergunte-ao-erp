import { useState } from 'react';
import PerguntaForm from './components/PerguntaForm';
import Resultado from './components/Resultado';
import { Pergunta, ResultadoConsulta } from './lib/types';

function App() {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [currentResult, setCurrentResult] = useState<{
    sql: string;
    explicacao: string;
    data: any[];
    columns: string[];
    tabelaPrincipal?: string;
    tipoConsulta?: string;
    totalResultados: number;
    erro?: string;
    detalhes?: string[];
  } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  const [clarification, setClarification] = useState<{
    perguntaOriginal: string;
    perguntaEsclarecimento: string;
  } | null>(null);

  // Check API health on mount
  useEffect(() => {
    const check = async () => {
      try {
        await checkHealth();
        setApiHealthy(true);
      } catch {
        setApiHealthy(false);
      }
    };
    check();
  }, []);

  const handleSubmit = useCallback(async (pergunta: string) => {
    setLoadingState('gerando-sql');
    setCurrentResult(null);
    setClarification(null);

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

    } finally {
      setLoadingState('idle');
    }
  }, []);

  const handleClarificationConfirm = useCallback((novaPergunta: string) => {
    setClarification(null);
    handleSubmit(novaPergunta);
  }, [handleSubmit]);

  const handleClarificationCancel = useCallback(() => {
    setClarification(null);
  }, []);

  const handleReuse = useCallback((item: HistoryItem) => {
    handleSubmit(item.pergunta);
  }, [handleSubmit]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const handleRetry = useCallback(() => {
    if (currentResult?.erro) {
      const lastFailed = history.find(h => !h.sucesso && h.erro === currentResult.erro);
      if (lastFailed) {
        handleSubmit(lastFailed.pergunta);
      }
    }
  }, [currentResult, history, handleSubmit]);

  const handleBack = useCallback(() => {
    setCurrentResult(null);
  }, []);

  const hasResults = currentResult && !currentResult.erro && currentResult.data.length > 0;
  const hasError = currentResult && currentResult.erro;

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">Pergunte ao ERP</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={`result-badge badge-${apiHealthy ? 'success' : apiHealthy === false ? 'error' : 'warning'}`} style={{ fontSize: '0.625rem' }}>
              {apiHealthy === null ? 'Verificando...' : apiHealthy ? 'API Online' : 'API Offline'}
            </span>
            <button
              className="btn btn-secondary btn-icon"
              onClick={() => setShowHistory(!showHistory)}
              aria-label={showHistory ? 'Fechar histórico' : 'Abrir histórico'}
              aria-expanded={showHistory}
              title={showHistory ? 'Fechar histórico' : 'Histórico (H)'}
              style={{ width: '36px', height: '36px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        {/* Question Form Section */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Faça sua pergunta</h2>
          </div>
          <div className="section-content">
            <QuestionForm
              onSubmit={handleSubmit}
              loadingState={loadingState}
              disabled={!apiHealthy}
            />
            {!apiHealthy && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'var(--color-warning-light)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-md)', color: 'var(--color-warning)', fontSize: '0.8125rem' }}>
                ⚠️ A API não está disponível. Verifique se o servidor está rodando em <code>http://localhost:3001</code>.
              </div>
            )}
          </div>
        </section>

        {/* Clarification Dialog */}
        {clarification && (
          <section className="section">
            <div className="section-content">
              <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div className="clarification-dialog" role="dialog" aria-modal="true" aria-labelledby="clarification-title">
                  <div className="clarification-content">
                    <svg className="clarification-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h3 id="clarification-title">Preciso de mais informações</h3>
                    <p style={{ marginTop: '8px', color: 'var(--color-text-secondary)' }}>
                      Sua pergunta <strong>"{clarification.perguntaOriginal}"</strong> está ambígua.
                    </p>
                    <p style={{ marginTop: '8px', color: 'var(--color-text-secondary)' }}>
                      {clarification.perguntaEsclarecimento}
                    </p>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const resposta = formData.get('esclarecimento') as string;
                        if (resposta.trim()) {
                          handleClarificationConfirm(`${clarification.perguntaOriginal}. ${resposta.trim()}`);
                        }
                      }}
                      style={{ marginTop: '16px' }}
                    >
                      <input
                        type="text"
                        name="esclarecimento"
                        placeholder="Ex: novembro de 2026"
                        className="clarification-input"
                        autoFocus
                        aria-label="Esclarecimento adicional"
                        required
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={handleClarificationCancel}>
                          Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Confirmar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
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
        <div className="footer-content">
          <span>Pergunte ao ERP — Projeto de portfólio</span>
          <div className="footer-links">
            <a href="https://github.com/Hey-Pablo/pergunte-ao-erp" target="_blank" rel="noopener noreferrer">Código no GitHub</a>
            <a href="https://hey-pablo.github.io/pablo-dilio-portfolio/" target="_blank" rel="noopener noreferrer">Portfólio</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;