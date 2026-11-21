import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

interface Props {
  pergunta: string;
  sql: string;
  explicacao: string;
  dados: any[];
  colunas: string[];
  tempoExecucao: number;
  totalResultados: number;
}

export default function Resultado({
  pergunta,
  sql,
  explicacao,
  dados,
  colunas,
  tempoExecucao,
  totalResultados
}: Props) {
  if (!dados || dados.length === 0) {
    return (
      <section className="resultado-section">
        <h2>Resultado</h2>
        <p>{explicacao}</p>
        <code>{sql}</code>
        <div className="resultado-vazio">
          <p>Nenhum resultado encontrado para sua consulta.</p>
        </div>
      </section>
    );
  }

  // Detectar se eh apropriado para grafico (tabelas com 2-3 colunas numericas)
  const podeGerarGrafico =
    dados.length <= 20 &&
    dados.length > 1 &&
    colunas.length >= 2 &&
    colunas.some(c => typeof dados[0][c] === 'number');

  return (
    <section className="resultado-section">
      <h2>Resultado da Consulta</h2>
      <p>{explicacao}</p>

      <div className="resultado-header">
        <span className="pergunta">{pergunta}</span>
        <span className="tempo-execucao">{tempoExecucao}ms</span>
      </div>

      <div className="sql-block">
        <code>{sql}</code>
      </div>

      {podeGerarGrafico ? (
        <div className="grafico-container">
          <h3>Dados visuais</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dados}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={colunas[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={colunas[1]} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      <div className="tabela-container">
        <h3>Tabela ({totalResultados} resultados)</h3>
        <table className="resultado-tabela">
          <thead>
            <tr>
              {colunas.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dados.slice(0, 100).map((row, i) => (
              <tr key={i}>
                {colunas.map((col) => (
                  <td key={col}>
                    {formatarValor(row[col], col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {dados.length > 100 && (
          <p className="limite-aplicado">Mostrando os primeiros 100 resultados</p>
        )}
      </div>
    </section>
  );
}

function formatarValor(valor: any, coluna?: string): string {
  if (valor === null || valor === undefined) {
    return '-';
  }

  if (typeof valor === 'number') {
    if (coluna?.includes('valor') || coluna?.includes('total') || coluna?.includes('saldo')) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valor);
    }
    if (coluna?.includes('percentual') || coluna?.includes('porcent')) {
      return valor.toFixed(2) + '%';
    }
    return valor.toLocaleString('pt-BR');
  }

  if (typeof valor === 'boolean') {
    return valor ? 'Sim' : 'Nao';
  }

  if (typeof valor === 'object') {
    return JSON.stringify(valor);
  }

  // Formatar datas
  if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}/.test(valor)) {
    const data = new Date(valor);
    return data.toLocaleDateString('pt-BR');
  }

  return String(valor);
}