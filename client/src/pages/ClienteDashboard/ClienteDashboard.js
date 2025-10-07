import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function PaginaHoje() {
  const [diaSelecionado, setDiaSelecionado] = useState("Segunda");

  const dias = [
    "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"
  ];

  const caloriasRestantes = 1400;
  const caloriasConsumidas = 0;

  const secoes = [
    { nome: "Café da Manhã", cor: "warning" },
    { nome: "Almoço", cor: "info" },
    { nome: "Jantar", cor: "danger" },
    { nome: "Lanches/Outros", cor: "secondary" },
  ];

  return (
    <div className="min-vh-100 bg-light text-dark p-4">
      <div className="container">

        <h3 className="text-success fw-bold mb-4 text-center">
          Registro de Hoje
        </h3>

        {/* Seleção de dia (nova navbar) */}
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

        {/* Resumo calórico */}
        <div className="bg-white border rounded-4 p-4 mb-4 shadow-sm">
          <h5 className="text-center text-success mb-3 fw-bold">
            Resumo Calórico
          </h5>
          <div className="d-flex justify-content-between px-3">
            <div>
              <small className="text-muted">Calorias Restantes</small>
              <h4 className="text-success fw-bold">{caloriasRestantes}</h4>
            </div>
            <div className="text-end">
              <small className="text-muted">Calorias Consumidas</small>
              <h4 className="text-danger fw-bold">{caloriasConsumidas}</h4>
            </div>
          </div>
          <div className="progress mt-3" style={{ height: "10px", borderRadius: "5px" }}>
            <div
              className="progress-bar bg-success"
              style={{
                width: `${(caloriasConsumidas / (caloriasRestantes + caloriasConsumidas)) * 100}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Refeições */}
        {secoes.map((s, i) => (
          <div
            key={i}
            className={`d-flex justify-content-between align-items-center bg-${s.cor}-subtle border-start border-4 border-${s.cor} p-3 mb-3 rounded-3 shadow-sm`}
          >
            <h6 className="m-0 fw-semibold">{s.nome}</h6>
            <button
              className={`btn btn-outline-${s.cor} btn-sm rounded-circle`}
              style={{ width: 35, height: 35, fontWeight: "bold" }}
            >
              +
            </button>
          </div>
        ))}

        {/* Personalizar refeições */}
        <div className="bg-white border rounded-4 p-3 mt-4 shadow-sm text-center">
          <p className="mb-1 fw-semibold text-secondary">
            Personalizar Refeições
          </p>
          <small className="text-muted">
            Monitore mais do que as refeições principais
          </small>
        </div>

      </div>
    </div>
  );
}
