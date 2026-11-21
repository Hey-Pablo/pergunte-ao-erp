import { useState } from 'react';
import type { HistoryItem } from '../lib/types';
import { formatDate } from '../lib/utils';

interface HistoryProps {
  items: HistoryItem[];
  onReuse: (item: HistoryItem) => void;
  onClear: () => void;
}

export function History({ items, onReuse, onClear }: HistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="result-card full-width">
        <div className="result-header">
          <span className="result-title">Histórico</span>
        </div>
        <div className="result-content" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', opacity: 0.5 }}>
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <p>Nenhuma pergunta no histórico ainda</p>
          <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>Suas consultas aparecerão aqui</p>
        </div>
      </div>
    );
  }

  return (
    <div className="result-card full-width">
      <div className="result-header">
        <span className="result-title">Histórico de consultas</span>
        <span className="result-badge badge-info">{items.length}</span>
      </div>
      <div className="result-content" style={{ padding: 0 }}>
        <div className="history-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {items.slice().reverse().map(item => (
            <div
              key={item.id}
              className="history-item"
              style={{ borderLeft: `3px solid ${item.sucesso ? 'var(--color-success)' : 'var(--color-error)'}` }}
            >
              <div className="history-question" title={item.pergunta}>
                {item.pergunta}
              </div>
              <div className="history-meta">
                <span>{formatDate(item.timestamp)}</span>
                {item.totalResultados !== undefined && (
                  <span>{item.totalResultados} resultado{item.totalResultados !== 1 ? 's' : ''}</span>
                )}
                <span className={`result-badge badge-${item.sucesso ? 'success' : 'error'}`} style={{ fontSize: '0.5rem', padding: '1px 6px' }}>
                  {item.sucesso ? 'OK' : 'Erro'}
                </span>
              </div>
              <button
                className="history-action"
                onClick={() => onReuse(item)}
                aria-label="Reutilizar esta pergunta"
              >
                Reutilizar
              </button>
              <button
                className="btn btn-icon history-action"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                aria-label={expandedId === item.id ? 'Fechar detalhes' : 'Ver detalhes'}
                title={expandedId === item.id ? 'Fechar' : 'Detalhes'}
                style={{ width: '28px', height: '28px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expandedId === item.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={onClear} style={{ fontSize: '0.75rem' }}>
              Limpar histórico
            </button>
          </div>
        )}

        {/* Expanded details */}
        {expandedId && items.find(i => i.id === expandedId) && (
          <div style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface-hover)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong>Detalhes da consulta</strong>
              <button className="btn btn-icon" onClick={() => setExpandedId(null)} aria-label="Fechar" style={{ width: '24px', height: '24px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div style={{ fontSize: '0.8125rem' }}>
              <p style={{ marginBottom: '8px' }}><strong>Pergunta:</strong> {items.find(i => i.id === expandedId)!.pergunta}</p>
              <p style={{ marginBottom: '8px' }}><strong>SQL:</strong></p>
              <pre style={{ background: 'var(--color-code-bg)', color: 'var(--color-code-text)', padding: '12px', borderRadius: '6px', overflow: 'auto', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', maxHeight: '200px' }}>
                {items.find(i => i.id === expandedId)!.sql}
              </pre>
              <p style={{ marginTop: '12px', marginBottom: '8px' }}><strong>Explicação:</strong> {items.find(i => i.id === expandedId)!.explicacao}</p>
              {items.find(i => i.id === expandedId)!.erro && (
                <p style={{ color: 'var(--color-error)' }}><strong>Erro:</strong> {items.find(i => i.id === expandedId)!.erro}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}