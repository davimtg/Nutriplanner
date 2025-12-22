import React, { useState, useEffect, useMemo } from "react";
import { Spinner, Alert } from "react-bootstrap";

// Import api service
import api from "../../services/api";

export default function PaginaPlanejamento() {

  const [diaSelecionado, setDiaSelecionado] = useState("Segunda");
  const [planoCompleto, setPlanoCompleto] = useState(null);
  const [todosAlimentos, setTodosAlimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const NOME_REFEICOES = {
    cafe_da_manha: "Café da Manhã",
    almoco: "Almoço",
    jantar: "Jantar",
  };

  const dias = [
    "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"
  ];

  const diaParaChave = {
    "Segunda": "segunda",
    "Terça": "terca",
    "Quarta": "quarta",
    "Quinta": "quinta",
    "Sexta": "sexta",
    "Sábado": "sabado",
    "Domingo": "domingo",
  };

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const storedUser = localStorage.getItem("userData");
        if (!storedUser) throw new Error("Usuário não autenticado.");
        const user = JSON.parse(storedUser);
        const [userRes, planosRes, alimentosRes] = await Promise.all([
          api.get(`/usuarios/${user.id}`),
          api.get('/planos-alimentares'),
          api.get('/alimentos')
        ]);

        const currentUser = userRes.data;
        // Prioritize plan from fresh API data, fallback to local storage (unlikely needed)
        const userPlanId = currentUser.planoId !== undefined ? currentUser.planoId : (user.planoId || user.PlanoId);

        const planosData = planosRes.data;
        const alimentosDataResponse = alimentosRes.data;
        
        const listaDePlanos = Array.isArray(planosData) ? planosData : planosData['planos-alimentares'] || [];
        
        // Find user's plan or default to first if none linked (or handle no plan)
        let planoDesejado;
        if (userPlanId) {
             planoDesejado = listaDePlanos.find(plano => String(plano.id) === String(userPlanId));
        }
        
        // Fallback: removido a pedido do usuário. Exibe mensagem se não tiver plano. (Linhas 59-62 antigas removidas)
        if (!planoDesejado) {
            // Se realmente não tiver nada, apenas seta como null e não lança erro
            setPlanoCompleto(null);
        } else {
            setPlanoCompleto(planoDesejado);
        }

        const listaDeAlimentos = Array.isArray(alimentosDataResponse) ? alimentosDataResponse : alimentosDataResponse.alimentos || [];
        setTodosAlimentos(listaDeAlimentos);

      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError(err.message || "Erro desconhecido ao carregar planejamento.");
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, []);
  
  const alimentosMap = useMemo(() => {
    const map = new Map();
    todosAlimentos.forEach((alimento) => map.set(String(alimento.id), alimento));
    return map;
  }, [todosAlimentos]);

  const planoDoDia = useMemo(() => {
    if (!planoCompleto?.detalhamento || alimentosMap.size === 0) return null;

    const diaKey = diaParaChave[diaSelecionado];
    const refeicoesDoDia = planoCompleto.detalhamento[diaKey];

    if (!refeicoesDoDia) return [];
    
    return Object.entries(refeicoesDoDia)
      .filter(([_, alimentos]) => alimentos.length > 0)
      .map(([key, alimentos]) => {
        const alimentosComMacros = alimentos.map(item => {
          const alimentoInfo = alimentosMap.get(String(item.id));
          if (!alimentoInfo) {
            return { nome: `Alimento ID: ${item.id} não encontrado`, qtd: `${item.gramas}g`, calorias: 0, proteina: 0, gordura: 0, carboidrato: 0 };
          }
          const proporcao = item.gramas / 100;
          return {
            nome: alimentoInfo.nome,
            qtd: `${item.gramas}g`,
            calorias: (alimentoInfo.calorias || 0) * proporcao,
            proteina: (alimentoInfo.proteina || 0) * proporcao,
            gordura: (alimentoInfo.gordura || 0) * proporcao,
            carboidrato: (alimentoInfo.carboidrato || 0) * proporcao,
          };
        });

        const totaisRefeicao = alimentosComMacros.reduce((acc, curr) => {
          acc.calorias += curr.calorias;
          acc.proteina += curr.proteina;
          acc.gordura += curr.gordura;
          acc.carboidrato += curr.carboidrato;
          return acc;
        }, { calorias: 0, proteina: 0, gordura: 0, carboidrato: 0 });

        return {
          refeicao: NOME_REFEICOES[key] || key,
          alimentos: alimentosComMacros,
          totais: totaisRefeicao,
        };
      });
  }, [planoCompleto, diaSelecionado, alimentosMap]);

  const totaisDoDia = useMemo(() => {
    if (!planoDoDia) return { calorias: 0, proteina: 0, gordura: 0, carboidrato: 0 };
    return planoDoDia.reduce((acc, curr) => {
      acc.calorias += curr.totais.calorias;
      acc.proteina += curr.totais.proteina;
      acc.gordura += curr.totais.gordura;
      acc.carboidrato += curr.totais.carboidrato;
      return acc;
    }, { calorias: 0, proteina: 0, gordura: 0, carboidrato: 0 });
  }, [planoDoDia]);

  const objetivo = planoCompleto?.objetivo;

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="success" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex justify-content-center align-items-center p-4">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Ocorreu um Erro!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  // Se não tiver plano carregado (planoCompleto é null), exibe o aviso solicitado
  if (!planoCompleto) {
    return (
        <div className="min-vh-100 bg-light d-flex justify-content-center align-items-center p-4">
            <div className="bg-white p-5 rounded-3 shadow text-center" style={{ maxWidth: '500px' }}>
                <i className="bi bi-clipboard-x text-warning" style={{ fontSize: '4rem' }}></i>
                <h3 className="fw-bold mt-4 text-secondary">Sem Planejamento</h3>
                <p className="text-muted mt-2">
                    Você ainda não possui um plano alimentar atribuído.
                    <br />
                    Entre em contato com seu nutricionista.
                </p>
                <div className="alert alert-warning mt-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Aguardando cadastro de plano.
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light text-dark p-4">
      <div className="container">

        <h3 className="text-success fw-bold mb-4 text-center">
          {planoCompleto?.nome || "Planejamento Alimentar"}
        </h3>

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

        {/* Resumo do Dia */}
        <div className="bg-white p-3 rounded-3 shadow-sm mb-4">
            <h5 className="text-success fw-bold text-center mb-3">Resumo Nutricional do Dia</h5>
            <div className="d-flex justify-content-around text-center">
                <div>
                    <div className="fw-bold">{totaisDoDia.calorias.toFixed(0)}</div>
                    <small className="text-muted">Kcal</small>
                </div>
                <div>
                    <div className="fw-bold">{totaisDoDia.proteina.toFixed(1)}g</div>
                    <small className="text-muted">Proteínas</small>
                </div>
                <div>
                    <div className="fw-bold">{totaisDoDia.gordura.toFixed(1)}g</div>
                    <small className="text-muted">Gorduras</small>
                </div>
                <div>
                    <div className="fw-bold">{totaisDoDia.carboidrato.toFixed(1)}g</div>
                    <small className="text-muted">Carboidratos</small>
                </div>
            </div>
        </div>

        {objetivo && (
          <div className="bg-white p-4 rounded-3 mt-4 shadow-sm mb-3">
            <h6 className="text-success fw-bold mb-2">Objetivo do Plano</h6>
            <p className="text-secondary">{objetivo}</p>
          </div>
        )}

        {planoDoDia && planoDoDia.length > 0 ? (
          planoDoDia.map((p, i) => (
            <div
              key={i}
              className="bg-white border-start border-4 border-success p-3 mb-3 rounded-3 shadow-sm"
            >
              <h5 className="fw-bold text-success mb-3">{p.refeicao}</h5>
              <ul className="list-unstyled mb-0">
                {p.alimentos.map((a, j) => (
                  <li key={j} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <span className="text-secondary">{a.nome}</span>
                      <small className="d-block text-muted">
                        {a.qtd.replace('g', '')} g &bull; P: {a.proteina.toFixed(1)}g | G: {a.gordura.toFixed(1)}g | C: {a.carboidrato.toFixed(1)}g
                      </small>
                    </div>
                    <div className="text-end">
                      <span className="text-muted small">
                        {a.calorias.toFixed(1)} kcal
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="d-flex justify-content-end fw-bold text-success pt-2 mt-2">
                 Total: {p.totais.calorias.toFixed(1)} kcal
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-4 rounded-3 text-center text-muted shadow-sm">
            Nenhum plano alimentar cadastrado para este dia.
          </div>
        )}
      </div>
    </div>
  );
}
