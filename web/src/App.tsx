import { useState, useEffect, useCallback } from 'react';
import { QuestionForm } from './components/QuestionForm';
import { ResultCard, DataTable, ChartCard, SQLPanel, ExplanationPanel, ErrorPanel, ClarificationDialog } from './components/ResultCard';
import { History } from './components/History';
import { gerarSql, executarSql, checkHealth } from './lib/api';
import { HistoryItem, LoadingState } from './lib/types';

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

  const addToHistory = useCallback((item: HistoryItem) => {
    setHistory(prev => {
      const newHistory = [item, ...prev];
      return newHistory.slice(0, 50);
    });
  }, []);

  const handleClarificationConfirm = useCallback((novaPergunta: string) => {
    setClarification(null);
    handleSubmit(novaPergunta);
  }, []);

  const handleClarificationCancel = useCallback(() => {
    setClarification(null);
  }, []);

  const handleReuse = useCallback((item: HistoryItem) => {
    handleSubmit(item.pergunta);
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const handleSubmit = useCallback(async (pergunta: string) => {
    setLoadingState('gerando-sql');
    setCurrentResult(null);
    setClarification(null);

    try {
      const resposta = await gerarSql(pergunta);

      if (!resposta.confidente && resposta.explicacao) {
        setClarification({
          perguntaOriginal: resposta.pergunta || pergunta,
          perguntaEsclarecimento: resposta.explicacao
        });
        setLoadingState('idle');
        return;
      }

      if (resposta.erro) {
        setCurrentResult({
          sql: resposta.sql || '',
          explicacao: resposta.explicacao || '',
          data: [],
          columns: [],
          totalResultados: 0,
          erro: resposta.erro
        });
        setLoadingState('idle');
        return;
      }

      if (!resposta.sql || !resposta.sql.trim()) {
        throw new Error(resposta.explicacao || 'Não foi possível gerar SQL');
      }

      // Execute the SQL
      setLoadingState('executando');
      const execResult = await executarSql(resposta.sql);

      if (execResult.erro) {
        setCurrentResult({
          sql: resposta.sql,
          explicacao: resposta.explicacao || '',
          data: [],
          columns: [],
          totalResultados: 0,
          erro: execResult.erro,
          detalhes: execResult.detalhes
        });
        addToHistory({
          id: Date.now().toString(),
          pergunta,
          sql: resposta.sql,
          explicacao: resposta.explicacao || '',
          timestamp: Date.now(),
          sucesso: false,
          erro: execResult.erro
        });
        setLoadingState('idle');
        return;
      }

      const result = {
        sql: resposta.sql,
        explicacao: resposta.explicacao || '',
        data: execResult.dados || [],
        columns: execResult.colunas || [],
        tabelaPrincipal: resposta.tabelaPrincipal,
        tipoConsulta: resposta.tipoConsulta,
        totalResultados: execResult.total_resultados || 0
      };

      setCurrentResult(result);
      setLoadingState('idle');

      // Add to history
      addToHistory({
        id: Date.now().toString(),
        pergunta,
        sql: resposta.sql,
        explicacao: resposta.explicacao || '',
        timestamp: Date.now(),
        sucesso: true,
        totalResultados: result.totalResultados
      });

    } catch (e: any) {
      setCurrentResult({
        sql: '',
        explicacao: '',
        data: [],
        columns: [],
        totalResultados: 0,
        erro: e.message || 'Erro desconhecido'
      });
      setLoadingState('idle');
    }
  }, [addToHistory]);

  const handleRetry = useCallback(() => {
    if (currentResult?.erro && history.length > 0) {
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

        {/* History */}
        {showHistory && (
          <section className="section">
            <History
              items={history}
              onReuse={handleReuse}
              onClear={handleClearHistory}
            />
          </section>
        )}

        {/* Clarification Dialog */}
        {clarification && (
          <ClarificationDialog
            pergunta={clarification.perguntaOriginal}
            onConfirm={handleClarificationConfirm}
            onCancel={handleClarificationCancel}
          />
        )}

        {/* Results */}
        {hasResults && currentResult && (
          <div className="results-grid">
            <ResultCard title="Resultado" badge="success">
              <ExplanationPanel
                explicacao={currentResult.explicacao}
                tabelaPrincipal={currentResult.tabelaPrincipal}
                tipoConsulta={currentResult.tipoConsulta}
              />
              <SQLPanel sql={currentResult.sql} />
              <DataTable data={currentResult.data} columns={currentResult.columns} />
              <ChartCard data={currentResult.data} columns={currentResult.columns} />
            </ResultCard>
          </div>
        )}

        {/* Error */}
        {hasError && currentResult && (
          <ResultCard title="Erro">
            <ErrorPanel
              erro={currentResult.erro || 'Erro desconhecido'}
              detalhes={currentResult.detalhes}
              onRetry={handleRetry}
              onBack={handleBack}
            />
          </ResultCard>
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