import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function PaginaPlanejamento() {
  const [diaSelecionado, setDiaSelecionado] = useState("Segunda");

  const dias = [
    "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"
  ];

  const planoAlimentar = {
    Segunda: [
      {
        refeicao: "Café da Manhã",
        alimentos: [
          { nome: "Pão integral", qtd: "2 fatias" },
          { nome: "Queijo branco", qtd: "1 fatia" },
          { nome: "Suco de laranja", qtd: "1 copo" },
        ],
      },
      {
        refeicao: "Almoço",
        alimentos: [
          { nome: "Arroz integral", qtd: "4 colheres" },
          { nome: "Feijão", qtd: "1 concha" },
          { nome: "Frango grelhado", qtd: "150g" },
          { nome: "Salada verde", qtd: "à vontade" },
        ],
      },
      {
        refeicao: "Jantar",
        alimentos: [
          { nome: "Sopa de legumes", qtd: "1 prato fundo" },
          { nome: "Torradas integrais", qtd: "2 unidades" },
        ],
      },
    ],
    Terça: [
      {
        refeicao: "Café da Manhã",
        alimentos: [
          { nome: "Aveia com banana", qtd: "1 tigela" },
          { nome: "Leite desnatado", qtd: "1 copo" },
        ],
      },
    ],
  };

  const observacoes =
    "Lembre-se de se hidratar bem durante o dia. Evite frituras e doces industrializados. Priorize alimentos naturais.";

  return (
    <div className="min-vh-100 bg-light text-dark p-4">
      <div className="container">

        <h3 className="text-success fw-bold mb-4 text-center">
          Planejamento Alimentar
        </h3>

        {/* Seleção de dia */}
        <div className="d-flex flex-wrap justify-content-center mb-4">
          {dias.map((dia, i) => (
            <button
              key={i}
              onClick={() => setDiaSelecionado(dia)}
              className={`btn m-1 fw-semibold ${
                diaSelecionado === dia
                  ? "btn-success"
                  : "btn-outline-success"
              }`}
            >
              {dia}
            </button>
          ))}
        </div>

        {/* Exibição do plano */}
        {planoAlimentar[diaSelecionado] ? (
          planoAlimentar[diaSelecionado].map((p, i) => (
            <div
              key={i}
              className="bg-white border-start border-4 border-success p-3 mb-3 rounded-3 shadow-sm"
            >
              <h5 className="fw-bold text-success mb-3">{p.refeicao}</h5>
              <ul className="list-unstyled mb-0">
                {p.alimentos.map((a, j) => (
                  <li key={j} className="d-flex justify-content-between py-1 border-bottom text-secondary">
                    <span>{a.nome}</span>
                    <small>{a.qtd}</small>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <div className="bg-white p-4 rounded-3 text-center text-muted shadow-sm">
            Nenhum plano alimentar cadastrado para este dia.
          </div>
        )}

        {/* Observações */}
        <div className="bg-white p-4 rounded-3 mt-4 shadow-sm">
          <h6 className="text-success fw-bold mb-2">Observações do Nutricionista</h6>
          <p className="text-secondary mb-0">{observacoes}</p>
        </div>

      </div>
    </div>
  );
}
