import { describe, it, expect, vi } from 'vitest';
import {
  formatSQL,
  detectColumnTypes,
  prepareChartData,
  formatNumber,
  formatCurrency,
  formatDate,
  generateId,
  debounce,
} from './utils';

describe('utils', () => {
  describe('formatSQL', () => {
    it('formats basic SELECT query', () => {
      const sql = 'SELECT * FROM clientes LIMIT 10';
      const result = formatSQL(sql);
      expect(result).toContain('SELECT');
      expect(result).toContain('FROM');
      expect(result).toContain('LIMIT');
    });

    it('highlights SQL keywords', () => {
      const sql = 'SELECT nome, email FROM clientes WHERE ativo = TRUE';
      const result = formatSQL(sql);
      expect(result).toContain('sql-keyword');
      expect(result).toContain('SELECT');
      expect(result).toContain('FROM');
      expect(result).toContain('WHERE');
    });

    it('highlights strings', () => {
      const sql = "SELECT * FROM clientes WHERE nome = 'João'";
      const result = formatSQL(sql);
      expect(result).toContain('sql-string');
      expect(result).toContain('João');
    });

    it('highlights numbers', () => {
      const sql = 'SELECT * FROM clientes LIMIT 100';
      const result = formatSQL(sql);
      expect(result).toContain('sql-number');
      expect(result).toContain('100');
    });
  });

  describe('detectColumnTypes', () => {
    it('detects numeric columns', () => {
      const data = [
        { id: 1, valor: 100, nome: 'A' },
        { id: 2, valor: 200, nome: 'B' },
      ];
      const columns = ['id', 'valor', 'nome'];
      const types = detectColumnTypes(data, columns);

      expect(types.find(t => t.name === 'id')?.isNumeric).toBe(true);
      expect(types.find(t => t.name === 'valor')?.isNumeric).toBe(true);
      expect(types.find(t => t.name === 'nome')?.isNumeric).toBe(false);
    });

    it('handles empty data', () => {
      const data: any[] = [];
      const columns = ['id', 'nome'];
      const types = detectColumnTypes(data, columns);

      expect(types.every(t => !t.isNumeric)).toBe(true);
    });

    it('handles null values', () => {
      const data = [
        { id: 1, valor: null },
        { id: 2, valor: 100 },
      ];
      const columns = ['id', 'valor'];
      const types = detectColumnTypes(data, columns);

      expect(types.find(t => t.name === 'valor')?.isNumeric).toBe(true);
    });
  });

  describe('prepareChartData', () => {
    it('returns null for empty data', () => {
      const result = prepareChartData([], ['nome', 'valor'], []);
      expect(result).toBeNull();
    });

    it('returns null when no text column', () => {
      const data = [{ valor: 100 }, { valor: 200 }];
      const columns = ['valor'];
      const types = [{ name: 'valor', type: 'numeric' as const, isNumeric: true }];
      const result = prepareChartData(data, columns, types);
      expect(result).toBeNull();
    });

    it('returns null when no numeric column', () => {
      const data = [{ nome: 'A' }, { nome: 'B' }];
      const columns = ['nome'];
      const types = [{ name: 'nome', type: 'text' as const, isNumeric: false }];
      const result = prepareChartData(data, columns, types);
      expect(result).toBeNull();
    });

    it('prepares chart data with text and numeric columns', () => {
      const data = [
        { categoria: 'A', total: 100 },
        { categoria: 'B', total: 200 },
        { categoria: 'C', total: 150 },
      ];
      const columns = ['categoria', 'total'];
      const types = [
        { name: 'categoria', type: 'text' as const, isNumeric: false },
        { name: 'total', type: 'numeric' as const, isNumeric: true },
      ];
      const result = prepareChartData(data, columns, types);

      expect(result).not.toBeNull();
      expect(result!.labels).toEqual(['A', 'B', 'C']);
      expect(result!.datasets[0].data).toEqual([100, 200, 150]);
    });

    it('limits to 10 data points', () => {
      const data = Array.from({ length: 15 }, (_, i) => ({ cat: `C${i}`, val: i * 10 }));
      const columns = ['cat', 'val'];
      const types = [
        { name: 'cat', type: 'text' as const, isNumeric: false },
        { name: 'val', type: 'numeric' as const, isNumeric: true },
      ];
      const result = prepareChartData(data, columns, types);

      expect(result!.labels.length).toBe(10);
      expect(result!.datasets[0].data.length).toBe(10);
    });
  });

  describe('formatNumber', () => {
    it('formats millions', () => {
      expect(formatNumber(1500000)).toBe('1.5M');
    });

    it('formats thousands', () => {
      expect(formatNumber(1500)).toBe('1.5K');
    });

    it('formats numbers below 1000 with locale', () => {
      expect(formatNumber(999)).toBe('999');
      expect(formatNumber(123)).toBe('123');
    });

    it('formats 1000 as 1K', () => {
      expect(formatNumber(1000)).toBe('1K');
    });
  });

  describe('formatCurrency', () => {
    it('formats as BRL', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('R$');
      expect(result).toContain('1.234,56');
    });

    it('handles zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('R$');
      expect(result).toContain('0,00');
    });
  });

  describe('formatDate', () => {
    it('formats ISO date string', () => {
      const result = formatDate('2026-11-21');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('formats Date object', () => {
      const result = formatDate(new Date('2026-11-21'));
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });

    it('includes timestamp', () => {
      const id = generateId();
      const timestampPart = id.split('-')[0];
      expect(parseInt(timestampPart)).toBeGreaterThan(Date.now() - 1000);
    });
  });

  describe('debounce', () => {
    it('delays function execution', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 50);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('passes arguments correctly', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 50);

      debounced('arg1', 'arg2');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });
});