import type { ColumnInfo, ChartData } from './types';

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
  'ON', 'GROUP BY', 'ORDER BY', 'LIMIT', 'OFFSET', 'AS', 'AND', 'OR', 'NOT',
  'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'ILIKE', 'IS', 'NULL', 'TRUE', 'FALSE',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'DISTINCT', 'UNION', 'ALL', 'EXCEPT',
  'INTERSECT', 'WITH', 'HAVING', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE',
  'CAST', 'EXTRACT', 'DATE_TRUNC', 'CURRENT_DATE', 'CURRENT_TIMESTAMP', 'NOW',
  'INTERVAL', 'ASC', 'DESC', 'OVER', 'PARTITION', 'ROW_NUMBER', 'RANK', 'DENSE_RANK',
];

function highlightSQL(sql: string): string {
  let result = sql;

  // Highlight strings first
  result = result.replace(/'([^']*)'/g, '<span class="sql-string">\'$1\'</span>');

  // Highlight numbers
  result = result.replace(/\b(\d+\.?\d*)\b/g, '<span class="sql-number">$1</span>');

  // Highlight comments
  result = result.replace(/--([^\n]*)/g, '<span class="sql-comment">--$1</span>');

  // Highlight keywords (case insensitive)
  const keywordRegex = new RegExp(`\\b(${SQL_KEYWORDS.join('|')})\\b`, 'gi');
  result = result.replace(keywordRegex, '<span class="sql-keyword">$1</span>');

  return result;
}

export function formatSQL(sql: string): string {
  // Simple formatting - add line breaks for readability
  let formatted = sql
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*=\s*/g, ' = ')
    .replace(/\s*>\s*/g, ' > ')
    .replace(/\s*<\s*/g, ' < ')
    .replace(/\s*>=\s*/g, ' >= ')
    .replace(/\s*<=\s*/g, ' <= ')
    .replace(/\s*<>\s*/g, ' <> ');

  // Add line breaks before major clauses
  const clauses = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'GROUP BY', 'ORDER BY', 'LIMIT', 'HAVING', 'UNION'];
  for (const clause of clauses) {
    const regex = new RegExp(`\\s+${clause}\\s+`, 'gi');
    formatted = formatted.replace(regex, `\n  ${clause} `);
  }

  return highlightSQL(formatted.trim());
}

export function detectColumnTypes(data: any[], columns: string[]): ColumnInfo[] {
  if (data.length === 0) {
    return columns.map(name => ({ name, type: 'text', isNumeric: false }));
  }

  return columns.map(name => {
    const sampleValues = data.slice(0, 10).map(row => row[name]).filter(v => v != null && v !== '');
    const allNumeric = sampleValues.every(v => !isNaN(Number(v)) && typeof v !== 'boolean');
    return {
      name,
      type: allNumeric ? 'numeric' : 'text',
      isNumeric: allNumeric,
    };
  });
}

export function prepareChartData(data: any[], columns: string[], columnTypes: ColumnInfo[]): ChartData | null {
  if (data.length === 0) return null;

  // Find first text column for labels and first numeric column for values
  const textColumns = columnTypes.filter(c => !c.isNumeric).map(c => c.name);
  const numericColumns = columnTypes.filter(c => c.isNumeric).map(c => c.name);

  if (textColumns.length === 0 || numericColumns.length === 0) {
    return null;
  }

  const labelColumn = textColumns[0];
  const valueColumn = numericColumns[0];

  // Limit to top 10 for readability
  const chartData = data.slice(0, 10);

  return {
    labels: chartData.map(row => String(row[labelColumn] || '')),
    datasets: [{
      label: valueColumn,
      data: chartData.map(row => Number(row[valueColumn] || 0)),
      backgroundColor: 'rgba(44, 82, 130, 0.6)',
      borderColor: 'rgba(44, 82, 130, 1)',
    }],
  };
}

export function formatNumber(value: number): string {
  if (value >= 1000000) {
    const formatted = (value / 1000000).toFixed(1);
    return (formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted) + 'M';
  }
  if (value >= 1000) {
    const formatted = (value / 1000).toFixed(1);
    return (formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted) + 'K';
  }
  return value.toLocaleString('pt-BR');
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('pt-BR');
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}