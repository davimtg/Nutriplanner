import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Painel de Detalhes do Dia Selecionado
export const DetalhesDia = ({ dadosDia, metas }) => {
  if (!dadosDia) return <p className="text-muted text-center mt-4">Selecione um dia acima para ver detalhes.</p>;

  const progressoCalorias = Math.min((dadosDia.caloriasConsumidas / metas.calorias) * 100, 100);
  
  const macros = [
    { nome: "Proteínas", valor: dadosDia.proteinas, meta: metas.proteinas, cor: "primary" },
    { nome: "Carboidratos", valor: dadosDia.carboidratos, meta: metas.carboidratos, cor: "success" },
    { nome: "Gorduras", valor: dadosDia.gorduras, meta: metas.gorduras, cor: "info" } // 'info' no bootstrap é azul claro
  ];

  return (
    <div className="mt-4 p-4 border rounded bg-light">
      <h4 className="text-success mb-3">Resumo de {dadosDia.diaFormatado}</h4>
      
      <div className="mb-4">
        <div className="d-flex justify-content-between mb-1">
          <span className="fw-bold">Calorias</span>
          <small>{dadosDia.caloriasConsumidas} / {metas.calorias} kcal</small>
        </div>
        <div className="progress" style={{ height: "20px" }}>
          <div 
            className="progress-bar bg-success progress-bar-striped" 
            role="progressbar" 
            style={{ width: `${progressoCalorias}%` }}
          />
        </div>
      </div>

      <div className="row">
        {macros.map((m) => {
            // Evita divisão por zero se meta não existir
            const porcentagem = m.meta ? Math.min((m.valor / m.meta) * 100, 100) : 0; 
            return (
                <div key={m.nome} className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                        <small className="text-muted">{m.nome}</small>
                        <h5 className="card-title">{m.valor}g <span className="text-muted fs-6">/ {m.meta}g</span></h5>
                        <div className="progress" style={{ height: "6px" }}>
                        <div className={`progress-bar bg-${m.cor}`} style={{ width: `${porcentagem}%` }} />
                        </div>
                    </div>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};

// Gráfico de Barras Semanal
export const GraficoSemanal = ({ dados, metaCalorica }) => {
  
  // Cria uma nova lista contendo apenas os últimos 7 registros
  // Se houver menos de 7 dias, ele mostra todos os disponíveis.
  const dadosRecentes = dados.slice(-7);

  return (
    <div className="mt-5" style={{ height: 300 }}>
      <h5 className="text-success mb-3">Evolução da Semana (Últimos 7 dias)</h5>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dadosRecentes} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="diaFormatado" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="caloriasConsumidas" fill="#198754" name="Consumidas" />
          <Bar dataKey={() => metaCalorica} fill="#a3d9a5" name="Meta" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};