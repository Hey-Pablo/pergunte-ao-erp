import { useMemo, useState } from 'react';
import { detectColumnTypes, prepareChartData, formatNumber, formatCurrency, formatDate, formatSQL } from '../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
  badge?: 'success' | 'warning' | 'error' | 'info';
  fullWidth?: boolean;
}

export function ResultCard({ title, children, badge, fullWidth }: ResultCardProps) {
  return (
    <div className={`result-card ${fullWidth ? 'full-width' : ''}`}>
      <div className="result-header">
        <span className="result-title">{title}</span>
        {badge && <span className={`result-badge badge-${badge}`}>{badge}</span>}
      </div>
      <div className="result-content">
        {children}
      </div>
    </div>
  );
}

interface DataTableProps {
  data: any[];
  columns: string[];
  maxRows?: number;
}

export function DataTable({ data, columns, maxRows = 100 }: DataTableProps) {
  const columnTypes = useMemo(() => detectColumnTypes(data, columns), [data, columns]);

  const displayData = useMemo(() => data.slice(0, maxRows), [data, maxRows]);

  if (displayData.length === 0) {
    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => <th key={col}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length} className="empty-state">
                Nenhum resultado encontrado
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col}>
                {col}
                {columnTypes.find(c => c.name === col)?.isNumeric && (
                  <span style={{ marginLeft: '4px', fontSize: '0.625rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
                    Σ
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map(col => {
                const value = row[col];
                const colType = columnTypes.find(c => c.name === col);
                let formattedValue: string;

                if (value === null || value === undefined || value === '') {
                  formattedValue = '<span style="color: var(--color-text-muted); font-style: italic;">null</span>';
                } else if (colType?.isNumeric && typeof value === 'number') {
                  if (col.toLowerCase().includes('valor') || col.toLowerCase().includes('preco') || col.toLowerCase().includes('total') || col.toLowerCase().includes('faturamento')) {
                    formattedValue = formatCurrency(value);
                  } else {
                    formattedValue = formatNumber(value);
                  }
                } else if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
                  formattedValue = formatDate(value);
                } else {
                  formattedValue = String(value);
                }

                return (
                  <td key={col} className={colType?.isNumeric ? 'numeric' : ''} dangerouslySetInnerHTML={{ __html: formattedValue }} />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > maxRows && (
        <div style={{ padding: '8px 16px', fontSize: '0.75rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface-hover)' }}>
          Mostrando {maxRows} de {data.length} linhas
        </div>
      )}
    </div>
  );
}

interface ChartCardProps {
  data: any[];
  columns: string[];
  title?: string;
}

export function ChartCard({ data, columns }: ChartCardProps) {
  const columnTypes = useMemo(() => detectColumnTypes(data, columns), [data, columns]);
  const chartData = useMemo(() => prepareChartData(data, columns, columnTypes), [data, columns, columnTypes]);

  if (!chartData || chartData.labels.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span>Dados insuficientes para gráfico</span>
          <small>Precisa de uma coluna de texto e uma numérica</small>
        </div>
      </div>
    );
  }

  const COLORS = [
    'rgba(44, 82, 130, 0.8)',
    'rgba(47, 158, 68, 0.8)',
    'rgba(245, 127, 23, 0.8)',
    'rgba(198, 40, 40, 0.8)',
    'rgba(106, 62, 175, 0.8)',
    'rgba(0, 151, 167, 0.8)',
    'rgba(211, 47, 147, 0.8)',
    'rgba(130, 119, 23, 0.8)',
  ];

  const coloredData = chartData.datasets.map((ds, i) => ({
    ...ds,
    backgroundColor: COLORS[i % COLORS.length],
    borderColor: COLORS[i % COLORS.length].replace('0.8', '1'),
  }));

  return (
    <div className="chart-container" style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData.labels.map((label, i) => ({
            name: label,
            value: coloredData[0].data[i],
          }))}
          margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={value => value >= 1000 ? (value/1000).toFixed(1)+'k' : value}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-lg)',
              padding: '8px 12px',
            }}
            labelStyle={{ color: 'var(--color-text)', fontWeight: 600 }}
            itemStyle={{ color: 'var(--color-text-secondary)' }}
            formatter={(value: number) => [
              value >= 1000000 ? (value/1000000).toFixed(2)+'M' :
              value >= 1000 ? (value/1000).toFixed(1)+'k' : value.toLocaleString('pt-BR'),
              coloredData[0].label,
            ]}
          />
          <Legend />
          <Bar
            dataKey="value"
            name={coloredData[0].label}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          >
            {coloredData[0].data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SQLPanelProps {
  sql: string;
  onCopy?: () => void;
}

export function SQLPanel({ sql, onCopy }: SQLPanelProps) {
  const formattedSQL = useMemo(() => formatSQL(sql), [sql]);

  return (
    <div className="sql-panel">
      <div className="sql-header">
        <span>SQL Executado</span>
        <button
          className="btn btn-secondary btn-icon"
          onClick={onCopy}
          aria-label="Copiar SQL"
          title="Copiar SQL"
          style={{ width: '28px', height: '28px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
      <div className="sql-content">
        <pre className="sql-code" dangerouslySetInnerHTML={{ __html: formattedSQL }} />
      </div>
    </div>
  );
}

interface ExplanationPanelProps {
  explicacao: string;
  tabelaPrincipal?: string;
  tipoConsulta?: string;
}

export function ExplanationPanel({ explicacao, tabelaPrincipal, tipoConsulta }: ExplanationPanelProps) {
  return (
    <div className="explanation-content">
      {tabelaPrincipal && (
        <p style={{ marginBottom: '8px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          <strong>Tabela principal:</strong> {tabelaPrincipal}
          {tipoConsulta && <span style={{ marginLeft: '12px' }}><strong>Tipo:</strong> {tipoConsulta}</span>}
        </p>
      )}
      <p>{explicacao}</p>
    </div>
  );
}

interface ErrorPanelProps {
  erro: string;
  detalhes?: string[];
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorPanel({ erro, detalhes, onRetry, onBack }: ErrorPanelProps) {
  return (
    <div className="error-content">
      <div>
        <p className="error-title">Erro ao processar a pergunta</p>
        <p className="error-message">{erro}</p>
        {detalhes && detalhes.length > 0 && (
          <details style={{ marginTop: '8px' }}>
            <summary className="error-details" style={{ cursor: 'pointer' }}>Detalhes técnicos</summary>
            <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              {detalhes.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </details>
        )}
      </div>
      <div className="error-actions">
        {onRetry && (
          <button className="btn btn-primary" onClick={onRetry}>
            Tentar novamente
          </button>
        )}
        {onBack && (
          <button className="btn btn-secondary" onClick={onBack}>
            Voltar
          </button>
        )}
      </div>
    </div>
  );
}

interface ClarificationDialogProps {
  pergunta: string;
  esclarecimento: string;
  onConfirm: (novaPergunta: string) => void;
  onCancel: () => void;
}

export function ClarificationDialog({ pergunta, esclarecimento, onConfirm, onCancel }: ClarificationDialogProps) {
  const [resposta, setResposta] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resposta.trim()) {
      onConfirm(`${pergunta}. ${resposta.trim()}`);
    }
  };

  return (
    <div className="clarification-dialog" role="dialog" aria-modal="true" aria-labelledby="clarification-title">
      <div className="clarification-content">
        <svg className="clarification-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3 id="clarification-title">Preciso de mais informações</h3>
        <p style={{ marginTop: '8px', color: 'var(--color-text-secondary)' }}>
          Sua pergunta "<strong>{pergunta}</strong>" está ambígua.
        </p>
        <p style={{ marginTop: '8px', color: 'var(--color-text-secondary)' }}>
          {esclarecimento}
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
          <input
            type="text"
            value={resposta}
            onChange={e => setResposta(e.target.value)}
            placeholder="Ex: novembro de 2026"
            className="clarification-input"
            autoFocus
            aria-label="Esclarecimento adicional"
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={!resposta.trim()}>
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}