import { useState, useCallback, useEffect } from 'react';
import { QuestionForm } from './components/QuestionForm';
import { ResultCard, DataTable, ChartCard, SQLPanel, ExplanationPanel, ErrorPanel } from './components/ResultCard';
import { History } from './components/History';
import { gerarSql, executarSql, checkHealth, getVisoes } from './lib/api';
import type { GerarSqlResponse, ExecutarResponse, HistoryItem, LoadingState } from './lib/types';
import { generateId } from './lib/utils';

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

    try {
      // Step 1: Generate SQL
      const gerarResponse = await gerarSql(pergunta);

      if (gerarResponse.erro) {
        throw new Error(gerarResponse.erro);
      }

      const sql = gerarResponse.sql;
      const explicacao = gerarResponse.explicacao;

      // Step 2: Execute SQL
      setLoadingState('executando');
      const executarResponse = await executarSql(sql);

      if (!executarResponse.dados || executarResponse.erro) {
        throw new Error(executarResponse.erro || 'Erro ao executar consulta');
      }

      // Success - store result
      const resultData = {
        sql,
        explicacao,
        data: executarResponse.dados,
        columns: executarResponse.colunas,
        totalResultados: executarResponse.total_resultados,
        tabelaPrincipal: gerarResponse.tabelaPrincipal,
        tipoConsulta: 'SELECT',
      };

      setCurrentResult(resultData);

      // Add to history
      const historyItem: HistoryItem = {
        id: generateId(),
        pergunta,
        sql,
        explicacao,
        timestamp: Date.now(),
        sucesso: true,
        totalResultados: executarResponse.total_resultados,
      };
      setHistory(prev => [...prev.slice(-49), historyItem]); // Keep last 50

    } catch (error: any) {
      // Error handling
      const erro = error.message || 'Erro desconhecido';
      const detalhes = error.data?.detalhes || error.data?.erros || [];

      setCurrentResult({
        sql: '',
        explicacao: '',
        data: [],
        columns: [],
        totalResultados: 0,
        erro,
        detalhes,
      });

      // Add failed attempt to history
      const historyItem: HistoryItem = {
        id: generateId(),
        pergunta,
        sql: error.data?.sql || '',
        explicacao: '',
        timestamp: Date.now(),
        sucesso: false,
        erro,
      };
      setHistory(prev => [...prev.slice(-49), historyItem]);

    } finally {
      setLoadingState('idle');
    }
  }, []);

  const handleReuse = useCallback((item: HistoryItem) => {
    // This will be handled by the form component
    // We just need to trigger the submit with the question
    handleSubmit(item.pergunta);
  }, [handleSubmit]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const handleRetry = useCallback(() => {
    if (currentResult?.erro) {
      // Find the last question in history and retry
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

        {/* Results Section */}
        {currentResult && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Resultado</h2>
              {hasError ? (
                <span className="result-badge badge-error">Erro</span>
              ) : hasResults ? (
                <span className="result-badge badge-success">{currentResult.totalResultados} resultado{currentResult.totalResultados !== 1 ? 's' : ''}</span>
              ) : (
                <span className="result-badge badge-warning">Sem resultados</span>
              )}
            </div>
            <div className="section-content">
              {hasError ? (
                <ErrorPanel
                  erro={currentResult.erro!}
                  detalhes={currentResult.detalhes}
                  onRetry={handleRetry}
                  onBack={handleBack}
                />
              ) : (
                <>
                  {/* Explanation and SQL */}
                  <div className="results-grid">
                    <ResultCard title="Explicação" badge="info">
                      <ExplanationPanel
                        explicacao={currentResult.explicacao}
                        tabelaPrincipal={currentResult.tabelaPrincipal}
                        tipoConsulta={currentResult.tipoConsulta}
                      />
                    </ResultCard>

                    <ResultCard title="SQL Executado" badge="info">
                      <SQLPanel sql={currentResult.sql} />
                    </ResultCard>
                  </div>

                  {/* Data and Chart */}
                  {hasResults && (
                    <>
                      <ResultCard title="Tabela de resultados" fullWidth>
                        <DataTable data={currentResult.data} columns={currentResult.columns} />
                      </ResultCard>

                      <ResultCard title="Visualização" fullWidth>
                        <ChartCard data={currentResult.data} columns={currentResult.columns} />
                      </ResultCard>
                    </>
                  )}

                  {!hasError && !hasResults && currentResult.data.length === 0 && (
                    <ResultCard title="Aviso" fullWidth badge="warning">
                      <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', opacity: 0.5 }}>
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <p>A consulta executou com sucesso, mas não retornou resultados.</p>
                        <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>Tente ajustar os filtros ou a pergunta.</p>
                      </div>
                    </ResultCard>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {/* History Section */}
        {showHistory && history.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Histórico</h2>
              <button className="btn btn-secondary" onClick={() => setShowHistory(false)} style={{ fontSize: '0.75rem' }}>
                Fechar
              </button>
            </div>
            <div className="section-content" style={{ padding: 0 }}>
              <History items={history} onReuse={handleReuse} onClear={handleClearHistory} />
            </div>
          </section>
        )}

        {/* Help/Examples Section */}
        {!currentResult && !showHistory && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Exemplos de perguntas</h2>
            </div>
            <div className="section-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {[
                  'Quais os 5 clientes com mais títulos vencidos?',
                  'Saldo de estoque de todos os produtos',
                  'Total de títulos em aberto por cliente',
                  'Faturamento do mês atual',
                  'Clientes inadimplentes com maior valor em aberto',
                  'Notas fiscais emitidas nos últimos 30 dias',
                  'Produtos com estoque abaixo do mínimo',
                  'Títulos a vencer nos próximos 7 dias',
                ].map((exemplo, i) => (
                  <button
                    key={i}
                    className="btn btn-secondary"
                    onClick={() => handleSubmit(exemplo)}
                    disabled={!apiHealthy || loadingState !== 'idle'}
                    style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.8125rem', minHeight: '44px' }}
                  >
                    {exemplo}
                  </button>
                ))}
              </div>
              <p style={{ marginTop: '16px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                As tabelas disponíveis são: clientes, produtos, fornecedores, filiais, titulos, notas_fiscais, itens_nota, movimentos_estoque
                e as visões: v_saldo_estoque, v_titulos_vencidos, v_indicadores_faturamento, v_clientes_inadimplentes.
              </p>
            </div>
          </section>
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