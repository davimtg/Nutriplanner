import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"];

const Alimentos = () => {
  const { id } = useParams();
  const [alimento, setAlimento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gramas, setGramas] = useState(100);

  useEffect(() => {
    const fetchAlimento = async () => {
      try {
        const res = await fetch(`http://localhost:3001/alimentos/${id}`);
        const data = await res.json();
        setAlimento(data);
      } catch (err) {
        console.error("Erro ao buscar alimento:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlimento();
  }, [id]);

  if (loading)
    return (
      <div className="container text-center my-5">
        <h4>Carregando...</h4>
      </div>
    );

  if (!alimento)
    return (
      <div className="container text-center my-5">
        <h4>Alimento não encontrado.</h4>
      </div>
    );

  const fator = gramas / alimento["porção-gramas"];
  const calorias = (alimento.calorias * fator).toFixed(1);
  const carbs = (alimento.carboidrato * fator).toFixed(2);
  const proteina = (alimento.proteina * fator).toFixed(2);
  const gordura = (alimento.gordura * fator).toFixed(2);

  const dataGrafico = [
    { name: "Carboidrato", value: parseFloat(carbs) },
    { name: "Proteína", value: parseFloat(proteina) },
    { name: "Gordura", value: parseFloat(gordura) },
  ];

  return (
    <div className="container my-5">
      <Link to="/biblioteca" className="btn btn-outline-secondary mb-4">
        ← Voltar
      </Link>

      <div className="card shadow-lg border-0 p-4">
        <h2 className="mb-4 text-center">{alimento.nome}</h2>

        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Porção (g):</label>
              <input
                type="number"
                className="form-control"
                value={gramas}
                min={1}
                onChange={(e) => setGramas(Number(e.target.value) || 0)}
              />
            </div>

            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <strong>Calorias:</strong> {calorias} kcal
              </li>
              <li className="list-group-item">
                <strong>Carboidratos:</strong> {carbs} g
              </li>
              <li className="list-group-item">
                <strong>Proteína:</strong> {proteina} g
              </li>
              <li className="list-group-item">
                <strong>Gordura:</strong> {gordura} g
              </li>
            </ul>
          </div>

          <div className="col-md-6">
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={dataGrafico}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    fill="#8884d8"
                    label
                  >
                    {dataGrafico.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-muted mt-2">
              Distribuição dos macronutrientes (g)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alimentos;
