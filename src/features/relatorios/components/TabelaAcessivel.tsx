interface TabelaAcessivelProps {
  legenda: string;
  cabecalhos: [string, string];
  linhas: [string, string][];
}

// Versão em tabela de cada gráfico, só para leitor de tela: o SVG do Recharts
// não expõe os números de forma confiável, e a tabela garante os valores exatos.
export function TabelaAcessivel({ legenda, cabecalhos, linhas }: TabelaAcessivelProps) {
  return (
    <table className="sr-only">
      <caption>{legenda}</caption>
      <thead>
        <tr>
          <th scope="col">{cabecalhos[0]}</th>
          <th scope="col">{cabecalhos[1]}</th>
        </tr>
      </thead>
      <tbody>
        {linhas.map(([rotulo, valor]) => (
          <tr key={rotulo}>
            <th scope="row">{rotulo}</th>
            <td>{valor}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
