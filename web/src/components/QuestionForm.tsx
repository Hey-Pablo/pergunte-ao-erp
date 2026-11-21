import { useState, useRef, useEffect, FormEvent } from 'react';
import type { LoadingState } from '../lib/types';

interface QuestionFormProps {
  onSubmit: (pergunta: string) => void;
  loadingState: LoadingState;
  disabled?: boolean;
  placeholder?: string;
}

export function QuestionForm({
  onSubmit,
  loadingState,
  disabled = false,
  placeholder = 'Ex: "Quais os 5 clientes com mais títulos vencidos?"',
}: QuestionFormProps) {
  const [pergunta, setPergunta] = useState('');
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isLoading = loadingState !== 'idle';
  const isDisabled = disabled || isLoading;

  useEffect(() => {
    setCharCount(pergunta.length);
  }, [pergunta]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = pergunta.trim();
    if (trimmed && !isDisabled) {
      onSubmit(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isDisabled) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const loadingLabels: Record<LoadingState, string> = {
    idle: 'Perguntar',
    'gerando-sql': 'Gerando SQL...',
    validando: 'Validando consulta...',
    executando: 'Executando no banco...',
  };

  return (
    <form className="question-form" onSubmit={handleSubmit}>
      <div className="question-input-group">
        <label htmlFor="pergunta" className="question-label">
          Sua pergunta em português
        </label>
        <textarea
          ref={textareaRef}
          id="pergunta"
          className="question-textarea"
          value={pergunta}
          onChange={e => setPergunta(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={4}
          aria-label="Digite sua pergunta sobre o ERP"
          aria-busy={isLoading}
        />
        <div className="question-hint">
          <span>{charCount} caracteres</span>
          <span style={{ marginLeft: 'auto' }}>
            Pressione <kbd style={{ fontFamily: 'inherit', padding: '1px 4px', background: 'var(--color-surface-hover)', borderRadius: '3px', border: '1px solid var(--color-border)' }}>Enter</kbd> para enviar, <kbd style={{ fontFamily: 'inherit', padding: '1px 4px', background: 'var(--color-surface-hover)', borderRadius: '3px', border: '1px solid var(--color-border)' }}>Shift+Enter</kbd> para nova linha
          </span>
        </div>
      </div>

      <div className="question-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isDisabled || !pergunta.trim()}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
              {loadingLabels[loadingState]}
            </>
          ) : (
            'Perguntar'
          )}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setPergunta('')}
          disabled={isDisabled || !pergunta}
          aria-label="Limpar pergunta"
        >
          Limpar
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={() => navigator.clipboard.writeText(pergunta)}
          disabled={isDisabled || !pergunta}
          aria-label="Copiar pergunta"
          title="Copiar pergunta"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>

      {isLoading && (
        <div className="loading-hint" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
          {loadingLabels[loadingState]}
        </div>
      )}
    </form>
  );
}