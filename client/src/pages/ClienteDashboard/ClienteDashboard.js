import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import s from "./ClienteDashboard.module.css";

// dashboard cliente - visual e calc de macros
// migrei estilos pro css module

// utils de data
const fmtKey = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD
const startOfWeekMonday = (d) => {
  const tmp = new Date(d);
  const day = (tmp.getDay() + 6) % 7; // 0=segunda ... 6=domingo
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() - day);
  return tmp;
};
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const addWeeks = (d, n) => addDays(d, n * 7);
const fmtShort = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const weekdayShort = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });

// persistencia via api
// n usa mais localstorage. usamos 'api' e cache em memoria.

// helper p criar id numerico (se precisar no front)
// melhor deixar o back gerar id
// mas pro post precisamos saber se ja existe

// Helper mapping
const mapMealKeyToBackend = (k) => (k === "cafe" ? "cafe_da_manha" : k);
const mapMealKeyFromBackend = (k) => (k === "cafe_da_manha" ? "cafe" : k);

const emptyDay = () => ({ cafe: [], almoco: [], jantar: [], lanches: [] });

// metas (load do localstorage; fallback default)
const defaultGoals = { calorias: 2500, carboidrato: 300, gordura: 70, proteina: 150 };
const saveGoals = (goals) => { try { localStorage.setItem("macro-goals", JSON.stringify(goals)); } catch (_) { } };

// modelo
const MEAL_TYPES = [
  { id: "cafe", label: "Café da Manhã", bi: "bi-cup-hot", color: "warning" },
  { id: "almoco", label: "Almoço", bi: "bi-fork-knife", color: "info" },
  { id: "jantar", label: "Jantar", bi: "bi-moon-stars", color: "danger" },
  { id: "lanches", label: "Lanches", bi: "bi-cookie", color: "secondary" },
];

// comp principal
export default function ClienteDashboard() {
  const [baseDate, setBaseDate] = useState(() => new Date());
  const weekStart = useMemo(() => startOfWeekMonday(baseDate), [baseDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const selectedKey = fmtKey(selectedDate); // YYYY-MM-DD

  // cache dados
  const [allFoods, setAllFoods] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);

  const [userDiary, setUserDiary] = useState([]); // Todos os registros do usuário
  const [userData, setUserData] = useState(null);

  // state do dia atual (hidratado)
  const [dayMeals, setDayMeals] = useState(emptyDay());
  const [currentDiaryId, setCurrentDiaryId] = useState(null); // id do registro no banco

  // Metas
  const [goals, setGoals] = useState(defaultGoals);

  // 1. carga inicial (foods, recipes, user data, user diary)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const storedUser = localStorage.getItem("userData");
        if (!storedUser) return;
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);

        // Load Goals from local for now OR could be in DB (not implemented yet, keeping local preference)
        const localGoals = localStorage.getItem("macro-goals");
        if (localGoals) setGoals(JSON.parse(localGoals));

        // busca alimentos, receitas, diario
        const [foodsRes, recipesRes, diaryRes] = await Promise.all([
          api.get("/alimentos"),
          api.get("/receitas"),
          api.get(`/diario-alimentar?usuarioId=${parsedUser.id}`)
        ]);

        setAllFoods(foodsRes.data);
        setAllRecipes(recipesRes.data);
        setUserDiary(diaryRes.data);

      } catch (err) {
        console.error("Erro ao carregar dados iniciais:", err);
      }
    };
    loadInitialData();
  }, []);

  // 2. hidratacao do dia selecionado
  useEffect(() => {
    if (!userData) return;

    // encontrar registro da data selectedKey
    // back retorna string iso "2023-11-20T00:00:00.000Z"
    // selectedKey eh "2023-11-20"
    const entry = userDiary.find(d => typeof d.data === 'string' && d.data.startsWith(selectedKey));

    if (entry) {
      setCurrentDiaryId(entry.id);

      // hidrata itens
      const newMeals = emptyDay();

      // entry.refeicoes keys: cafe_da_manha, almoco, ...
      if (entry.refeicoes) {
        Object.keys(entry.refeicoes).forEach(backendKey => {
          const frontendKey = mapMealKeyFromBackend(backendKey);
          if (!newMeals[frontendKey]) return;

          const itensRaw = entry.refeicoes[backendKey] || [];

          newMeals[frontendKey] = itensRaw.map(item => {
            // tenta achar em alimentos ou receitas
            // schema do diario grava { id, gramas }, mas n diz se eh alimento ou receita...
            // assumi que id de alimento e receita n colidem ou vamos tentar achar
            // como os jsons originais tinham ids distintos (alimento 1..n, receita 1..n), pode ter colisao?
            // seed recriou tudo.
            // fix: diario schema atual SO tem 'id'. falha de design do schema herdado ou a gente precisa inferir.
            // p mvp, procura em alimentos primeiro. se n achar, receitas. 
            // se colidir, erro.

            let kind = item.kind || "alimento"; // default legacy
            let found = null;

            if (item.kind === 'receita') {
                found = allRecipes.find(r => r.id === item.id);
                kind = 'receita';
            } else if (item.kind === 'alimento') {
                found = allFoods.find(f => f.id === item.id);
                kind = 'alimento';
            } else {
                // Legacy fallback: try foods, then recipes
                found = allFoods.find(f => f.id === item.id);
                kind = "alimento";
                if (!found) {
                  found = allRecipes.find(r => r.id === item.id);
                  kind = "receita";
                }
            }

            if (!found) return null; // Item não existe mais no DB

            // recalcula macros
            const base = found.nutricional || {
              calorias: found.calorias || 0,
              proteina: found.proteina || 0,
              carboidrato: found.carboidrato || 0,
              gordura: found.gordura || 0
            };

            // diferenca de calc: receitas as vezes salvam por 'gramas' no diario, mas front usa porcoes
            // simplificacao: vamo assumir q item.gramas eh o peso consumido.
            const fator = item.gramas / 100;

            return {
              kind,
              id: found.id,
              nome: found.nome,
              quantidade_g: kind === 'alimento' ? item.gramas : undefined,
              porcoes: kind === 'receita' ? 1 : undefined, // Info perdida se salvamos só gramas
              gramasPorPorcao: kind === 'receita' ? item.gramas : undefined, // Info perdida
              macros: {
                calorias: base.calorias * fator,
                proteina: base.proteina * fator,
                carboidrato: base.carboidrato * fator,
                gordura: base.gordura * fator
              }
            };
          }).filter(Boolean);
        });
      }
      setDayMeals(newMeals);

    } else {
      setCurrentDiaryId(null);
      setDayMeals(emptyDay());
    }

  }, [selectedKey, userDiary, allFoods, allRecipes, userData]);

  // 3. salvar (debounced ou direto?) -> vamos salvar direto no add/remove p consistencia
  const syncToBackend = async (newDayMeals, diaryId) => {
    if (!userData) return;

    // Converter Frontend -> Backend Schema
    const refeicoesBackend = {};
    ["cafe", "almoco", "jantar", "lanches"].forEach(key => {
      const backendKey = mapMealKeyToBackend(key);
      refeicoesBackend[backendKey] = newDayMeals[key].map(it => ({
        id: it.id, // id do alimento/receita
        kind: it.kind, // PERSISTE O TIPO PARA EVITAR COLISAO
        gramas: it.kind === 'alimento'
          ? it.quantidade_g
          : (it.porcoes * it.gramasPorPorcao) // calcula total gramas p receita
      }));
    });

    const payload = {
      usuarioId: userData.id,
      data: selectedKey, // "YYYY-MM-DD" -> Backend deve aceitar ou converter
      refeicoes: refeicoesBackend
    };

    try {
      if (diaryId) {
        // Update
        await api.put(`/diario-alimentar/${diaryId}`, payload);
        // Update local cache of diary to reflect changes (avoid refetch)
        setUserDiary(prev => prev.map(d => d.id === diaryId ? { ...d, ...payload } : d));
      } else {
        // Create
        const res = await api.post("/diario-alimentar", payload);
        // Add to local cache
        const newEntry = res.data;
        setUserDiary(prev => [...prev, newEntry]);
        setCurrentDiaryId(newEntry.id);
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar refeição. Tente novamente.");
    }
  };

  // Metas
  useEffect(() => saveGoals(goals), [goals]);

  // Totais do dia
  const totals = useMemo(() => {
    const sum = { calorias: 0, carboidrato: 0, gordura: 0, proteina: 0 };
    for (const mt of MEAL_TYPES) {
      if (!dayMeals[mt.id]) continue;
      for (const it of dayMeals[mt.id]) {
        sum.calorias += it.macros.calorias || 0;
        sum.carboidrato += it.macros.carboidrato || 0;
        sum.gordura += it.macros.gordura || 0;
        sum.proteina += it.macros.proteina || 0;
      }
    }
    return sum;
  }, [dayMeals]);

  // ===== modal add item =====
  const [modalOpen, setModalOpen] = useState(false);
  const [targetMeal, setTargetMeal] = useState(null);

  // busca
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultAlimentos, setResultAlimentos] = useState([]);
  const [resultReceitas, setResultReceitas] = useState([]);

  const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  useEffect(() => {
    if (!modalOpen) return;
    const term = (q || "").trim();
    if (!term) { setResultAlimentos([]); setResultReceitas([]); setLoading(false); return; }

    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const [resA, resR] = await Promise.all([
          api.get(`/alimentos?q=${encodeURIComponent(term)}&_limit=300`, { signal: ctrl.signal }),
          api.get(`/receitas?q=${encodeURIComponent(term)}&_limit=300`, { signal: ctrl.signal }),
        ]);
        const rawA = resA.data;
        const rawR = resR.data;
        const termNorm = norm(term);
        const sortByName = (a, b) => (a?.nome || "").localeCompare(b?.nome || "");
        const filterByNome = (arr) => (Array.isArray(arr) ? arr : []).filter((x) => norm(x?.nome).includes(termNorm)).sort(sortByName);
        setResultAlimentos(filterByNome(rawA).slice(0, 18));
        setResultReceitas(filterByNome(rawR).slice(0, 18));
      } catch (err) {
        if (err?.name !== "AbortError") console.error("Erro na busca:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => { clearTimeout(t); ctrl.abort(); };
  }, [modalOpen, q]);

  // selecao item encontrado
  const [selectedItem, setSelectedItem] = useState(null);
  const [grams, setGrams] = useState(150);
  const [porcoes, setPorcoes] = useState(1);
  const [gramasPorPorcao, setGramasPorPorcao] = useState(100);

  const computedMacros = useMemo(() => {
    if (!selectedItem) return { calorias: 0, carboidrato: 0, gordura: 0, proteina: 0 };
    const base = selectedItem?.dados?.nutricional || {
      calorias: selectedItem?.dados?.calorias || 0,
      carboidrato: selectedItem?.dados?.carboidrato || 0,
      gordura: selectedItem?.dados?.gordura || 0,
      proteina: selectedItem?.dados?.proteina || 0,
    };
    const factor = selectedItem.kind === "alimento"
      ? Math.max(0, grams) / 100
      : (Math.max(0, porcoes) * Math.max(1, gramasPorPorcao)) / 100;
    return {
      calorias: +(base.calorias * factor).toFixed(1),
      carboidrato: +(base.carboidrato * factor).toFixed(1),
      gordura: +(base.gordura * factor).toFixed(1),
      proteina: +(base.proteina * factor).toFixed(1),
    };
  }, [selectedItem, grams, porcoes, gramasPorPorcao]);

  const openAddModal = (mealId) => {
    setTargetMeal(mealId);
    setModalOpen(true);
    setQ("");
    setSelectedItem(null);
    setGrams(150);
    setPorcoes(1);
    setGramasPorPorcao(100);
  };
  const closeModal = () => setModalOpen(false);

  // helpers update local + sync
  const updateMeals = (cb) => {
    // CB retorna novo state
    setDayMeals(prev => {
      const newState = cb(prev);
      // Dispara sync usando o estado calculado
      syncToBackend(newState, currentDiaryId);
      return newState;
    });
  };

  // adaptar funcoes existentes 
  const confirmAdd = () => {
    if (!targetMeal || !selectedItem) return;
    const computed = computedMacros; // do useMemo

    // Preparar payload state local
    const itemPayload = {
      kind: selectedItem.kind,
      id: selectedItem.dados.id,
      nome: selectedItem.dados.nome,
      macros: computed,
    };

    if (selectedItem.kind === "alimento") {
      itemPayload.quantidade_g = Math.max(0, Math.round(grams));
    } else {
      itemPayload.porcoes = Math.max(0, Math.round(porcoes));
      itemPayload.gramasPorPorcao = Math.max(1, Math.round(gramasPorPorcao));
    }

    // usa wrapper de update
    updateMeals(prev => ({
      ...prev,
      [targetMeal]: [...prev[targetMeal], itemPayload]
    }));

    closeModal();
  };

  const removeItem = (mealId, idx) => {
    updateMeals(prev => ({
      ...prev,
      [mealId]: prev[mealId].filter((_, i) => i !== idx)
    }));
  };

  // helpers de ui
  const isSameDay = (a, b) => a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
  const weekRangeLabel = (start) => `${fmtShort.format(start)} — ${fmtShort.format(addDays(start, 6))}`;

  const MacroBar = ({ label, value, goal, variant }) => {
    const pct = Math.min(100, (value / (goal || 1)) * 100);
    return (
      <div className={s.macroBar}>
        <div className="d-flex justify-content-between small mb-1">
          <span>{label}</span>
          <span>{value} / {goal}g</span>
        </div>
        <div className={s.progressTrack}>
          <div
            className={`${s.progressFill} ${variant === "protein" ? s.protein : variant === "carb" ? s.carb : s.fat}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  const kcalPct = Math.min(100, (totals.calorias / (goals.calorias || 1)) * 100);
  const circle = { r: 45, stroke: 10 };
  const C = 2 * Math.PI * circle.r;

  // ===== ui =====
  return (
    <div className="min-vh-100 bg-light text-dark p-3 p-md-4">
      <div className={`container ${s.container}`}>
        {/* NAV SEMANAL — título + pills */}
        <div className={s.weekHeader}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setBaseDate((d) => addWeeks(d, -1))} aria-label="Semana anterior">‹</button>
            <div className="flex-grow-1">
              <div className={s.weekTitle}>Semana {weekRangeLabel(weekStart)}</div>
              <div className={s.weekSub}>toque em um dia para ver/editar</div>
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setBaseDate((d) => addWeeks(d, 1))} aria-label="Próxima semana">›</button>
          </div>

          <div className="d-flex justify-content-center">
            <div className={s.pillWrap}>
              {weekDays.map((d) => {
                const selected = fmtKey(d) === selectedKey;
                const today = isSameDay(d, new Date());
                const w = weekdayShort.format(d).replace(".", "").toUpperCase();
                const date = fmtShort.format(d);

                const classList = [
                  "btn", "btn-sm", s.pillBtn,
                  selected ? s.pillSelected : "",
                  today && !selected ? s.pillToday : "",
                ].join(" ");

                return (
                  <button key={fmtKey(d)} onClick={() => setSelectedDate(d)} className={classList}>
                    <div className="fw-semibold">{w}</div>
                    <div className="small text-muted" style={{ marginTop: -2 }}>{date}</div>
                    {today && <span className={`badge text-bg-success ${s.badgeToday}`}>HOJE</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>


        {/* progresso do dia */}
        <div className={`${s.card} p-4 p-md-5 mb-4`}>
          <h5 className="fw-bold mb-3">Progresso de hoje</h5>
          <div className="d-flex flex-column flex-md-row align-items-center gap-4">
            {/* Anel kcal */}
            <div className={s.ring}>
              <svg viewBox="0 0 100 100" className="w-100 h-100">
                <circle cx="50" cy="50" r={circle.r} stroke="#e7ece7" strokeWidth={circle.stroke} fill="transparent" />
                <circle
                  cx="50" cy="50" r={circle.r}
                  stroke="var(--green)" strokeLinecap="round" strokeWidth={circle.stroke} fill="transparent"
                  style={{ strokeDasharray: C, strokeDashoffset: C - (C * kcalPct) / 100, transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset .35s" }}
                />
              </svg>
              <div className="position-absolute top-50 start-50 translate-middle text-center">
                <div className={s.kcalValue}>{Math.round(totals.calorias)}</div>
                <div className={s.kcalSub}>/ {goals.calorias} kcal</div>
              </div>
            </div>

            {/* barras de macros */}
            <div className="flex-grow-1 w-100">
              <MacroBar label="Proteínas" value={+totals.proteina.toFixed(1)} goal={goals.proteina} variant="protein" />
              <MacroBar label="Carboidratos" value={+totals.carboidrato.toFixed(1)} goal={goals.carboidrato} variant="carb" />
              <MacroBar label="Gorduras" value={+totals.gordura.toFixed(1)} goal={goals.gordura} variant="fat" />
            </div>
          </div>
        </div>

        {/* REFEIÇÕES */}
        {MEAL_TYPES.map((sMeal) => (
          <div key={sMeal.id} className={`${s.card} p-3 p-md-4 mb-3`}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <i className={`bi ${sMeal.bi} text-success`} />
                <h6 className="m-0 fw-bold">{sMeal.label}</h6>
              </div>
              <div className="text-muted small">
                {Math.round((dayMeals[sMeal.id] || []).reduce((acc, x) => acc + (x.macros?.calorias || 0), 0))} kcal
              </div>
            </div>

            {(dayMeals[sMeal.id] || []).length === 0 ? (
              <div className="text-center text-muted py-3">Nenhuma comida adicionada ainda.</div>
            ) : (
              <div className="d-flex flex-column gap-2 mb-3">
                {dayMeals[sMeal.id].map((it, idx) => (
                  <div key={idx} className={`d-flex justify-content-between align-items-center ${s.mealRow}`}>
                    <div className="fw-medium">{it.nome}</div>
                    <div className="d-flex align-items-center gap-3 small text-muted">
                      <span>{it.kind === "alimento" ? `${it.quantidade_g} g` : `${it.porcoes}×${it.gramasPorPorcao} g`}</span>
                      <span>{Math.round(it.macros.calorias)} kcal · P:{it.macros.proteina}g C:{it.macros.carboidrato}g F:{it.macros.gordura}g</span>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeItem(sMeal.id, idx)}>Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className={`btn ${s.addBtn}`} onClick={() => openAddModal(sMeal.id)}>
              <span className="me-1">➕</span> Adicionar
            </button>
          </div>
        ))}

        {/* calc de macros */}
        <div className={`${s.card} p-4 mt-4`}>
          <h5 className="fw-bold mb-3">Calculadora de Macros</h5>
          <MacroCalculator goals={goals} setGoals={setGoals} />
        </div>

        {/* MODAL */}
        {modalOpen && (
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-md">
              <div className="modal-content rounded-4">
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-bold">Adicionar Refeição — {MEAL_TYPES.find((m) => m.id === targetMeal)?.label}</h5>
                  <button className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body pt-0">
                  {/* Busca */}
                  <div className="mb-3">
                    <label className="form-label small text-muted">Alimento ou Receita</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">🔎</span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Digite para buscar..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        autoFocus
                      />
                    </div>
                    {loading && <small className="text-muted">Carregando...</small>}
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <h6 className="mb-2">Alimentos</h6>
                      <div className="list-group" style={{ maxHeight: 180, overflowY: "auto" }}>
                        {resultAlimentos.length === 0 && <div className="list-group-item small text-muted">Nenhum alimento.</div>}
                        {resultAlimentos.map((a) => (
                          <button
                            key={a.id}
                            className={`list-group-item list-group-item-action ${selectedItem?.kind === "alimento" && selectedItem?.dados?.id === a.id ? "active" : ""}`}
                            onClick={() => setSelectedItem({ kind: "alimento", dados: a })}
                          >
                            <div className="d-flex justify-content-between">
                              <div>{a.nome}</div>
                              <small className="text-muted">{a.calorias} kcal /100g</small>
                            </div>
                            <small className="d-block text-muted">C:{a.carboidrato}g · G:{a.gordura}g · P:{a.proteina}g</small>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <h6 className="mb-2">Receitas</h6>
                      <div className="list-group" style={{ maxHeight: 180, overflowY: "auto" }}>
                        {resultReceitas.length === 0 && <div className="list-group-item small text-muted">Nenhuma receita.</div>}
                        {resultReceitas.map((r) => (
                          <button
                            key={r.id}
                            className={`list-group-item list-group-item-action ${selectedItem?.kind === "receita" && selectedItem?.dados?.id === r.id ? "active" : ""}`}
                            onClick={() => setSelectedItem({ kind: "receita", dados: r })}
                          >
                            <div className="d-flex justify-content-between">
                              <div>{r.nome}</div>
                              <small className="text-muted">{(r?.nutricional?.calorias ?? 0)} kcal /100g</small>
                            </div>
                            <small className="d-block text-muted">C:{r?.nutricional?.carboidrato ?? 0}g · G:{r?.nutricional?.gordura ?? 0}g · P:{r?.nutricional?.proteina ?? 0}g</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {selectedItem && (
                    <div className={s.nutriBox + " mt-3"}>
                      {selectedItem.kind === "alimento" ? (
                        <div className="row g-2 align-items-end">
                          <div className="col-12 col-md-5">
                            <label className="form-label small text-muted">Quantidade (g)</label>
                            <input type="number" min={0} className="form-control" value={grams} onChange={(e) => setGrams(Number(e.target.value || 0))} />
                          </div>
                          <div className="col-12 col-md-7">
                            <div className="small text-success fw-bold mb-1">Informação Nutricional</div>
                            <div className="row row-cols-2 g-2 small">
                              <div className="col d-flex justify-content-between"><span>Calorias:</span><b>{computedMacros.calorias} kcal</b></div>
                              <div className="col d-flex justify-content-between"><span>Proteínas:</span><b>{computedMacros.proteina} g</b></div>
                              <div className="col d-flex justify-content-between"><span>Carboidratos:</span><b>{computedMacros.carboidrato} g</b></div>
                              <div className="col d-flex justify-content-between"><span>Gorduras:</span><b>{computedMacros.gordura} g</b></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="row g-2 align-items-end">
                          <div className="col-6 col-md-3">
                            <label className="form-label small text-muted">Porções</label>
                            <input type="number" min={0} className="form-control" value={porcoes} onChange={(e) => setPorcoes(Number(e.target.value || 0))} />
                          </div>
                          <div className="col-6 col-md-3">
                            <label className="form-label small text-muted">g por porção</label>
                            <input type="number" min={1} className="form-control" value={gramasPorPorcao} onChange={(e) => setGramasPorPorcao(Number(e.target.value || 0))} />
                          </div>
                          <div className="col-12 col-md-6">
                            <div className="small text-success fw-bold mb-1">Informação Nutricional</div>
                            <div className="row row-cols-2 g-2 small">
                              <div className="col d-flex justify-content-between"><span>Calorias:</span><b>{computedMacros.calorias} kcal</b></div>
                              <div className="col d-flex justify-content-between"><span>Proteínas:</span><b>{computedMacros.proteina} g</b></div>
                              <div className="col d-flex justify-content-between"><span>Carboidratos:</span><b>{computedMacros.carboidrato} g</b></div>
                              <div className="col d-flex justify-content-between"><span>Gorduras:</span><b>{computedMacros.gordura} g</b></div>
                            </div>
                            <div className="small text-muted mt-1">* Receita interpretada "por 100 g"; ajuste o peso da porção.</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button className="btn btn-light" onClick={closeModal}>Cancelar</button>
                  <button className="btn btn-success" disabled={!selectedItem} onClick={confirmAdd}>Adicionar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backdrop */}
        {modalOpen && <div className="modal-backdrop fade show" />}
      </div>
    </div>
  );
}

// ===== calc de macros =====
function MacroCalculator({ goals, setGoals }) {
  const [sexo, setSexo] = useState("masculino");
  const [idade, setIdade] = useState(30);
  const [peso, setPeso] = useState(75);
  const [altura, setAltura] = useState(175);
  const [atividade, setAtividade] = useState("moderado");
  const [objetivo, setObjetivo] = useState("manter");

  const [protGKg, setProtGKg] = useState(1.8);
  const [fatPct, setFatPct] = useState(25);

  const bmr = useMemo(() => {
    const base = 10 * peso + 6.25 * altura - 5 * idade + (sexo === "masculino" ? 5 : -161);
    return Math.max(0, Math.round(base));
  }, [sexo, idade, peso, altura]);

  const fator = useMemo(() => ({
    sedentario: 1.2, leve: 1.375, moderado: 1.55, intenso: 1.725, muito: 1.9,
  })[atividade], [atividade]);

  const tdee = Math.round(bmr * fator);
  const kcalObjetivo = useMemo(() => {
    if (objetivo === "cutting") return Math.round(tdee * 0.8);
    if (objetivo === "bulking") return Math.round(tdee * 1.15);
    return tdee;
  }, [tdee, objetivo]);

  const proteina = Math.round(protGKg * peso);
  const kcalProteina = proteina * 4;
  const kcalGordura = Math.round((fatPct / 100) * kcalObjetivo);
  const gordura = Math.round(kcalGordura / 9);
  const kcalRestante = Math.max(0, kcalObjetivo - (kcalProteina + kcalGordura));
  const carboidrato = Math.round(kcalRestante / 4);

  return (
    <div>
      <div className="row g-3">
        <div className="col-md-3">
          <label className="form-label">Sexo</label>
          <select className="form-select" value={sexo} onChange={(e) => setSexo(e.target.value)}>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Idade</label>
          <input type="number" className="form-control" value={idade} min={10} max={100} onChange={(e) => setIdade(+e.target.value || 0)} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Peso (kg)</label>
          <input type="number" className="form-control" value={peso} min={20} max={250} onChange={(e) => setPeso(+e.target.value || 0)} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Altura (cm)</label>
          <input type="number" className="form-control" value={altura} min={120} max={230} onChange={(e) => setAltura(+e.target.value || 0)} />
        </div>

        <div className="col-md-4">
          <label className="form-label">Atividade</label>
          <select className="form-select" value={atividade} onChange={(e) => setAtividade(e.target.value)}>
            <option value="sedentario">Sedentário (pouco ou nenhum exercício)</option>
            <option value="leve">Leve (1-3x/semana)</option>
            <option value="moderado">Moderado (3-5x/semana)</option>
            <option value="intenso">Intenso (6-7x/semana)</option>
            <option value="muito">Muito intenso (treino 2x/dia)</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Objetivo</label>
          <select className="form-select" value={objetivo} onChange={(e) => setObjetivo(e.target.value)}>
            <option value="manter">Manter</option>
            <option value="cutting">Perder gordura (−20%)</option>
            <option value="bulking">Ganhar massa (+15%)</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label">Proteína (g/kg)</label>
          <input type="number" step="0.1" className="form-control" value={protGKg} min={1.2} max={2.5} onChange={(e) => setProtGKg(+e.target.value || 0)} />
        </div>
        <div className="col-md-2">
          <label className="form-label">Gordura (% kcal)</label>
          <input type="number" className="form-control" value={fatPct} min={15} max={40} onChange={(e) => setFatPct(+e.target.value || 0)} />
        </div>
      </div>

      <div className="row g-3 mt-3">
        <div className="col-md-4">
          <div className="p-3 border rounded-3 h-100">
            <div className="small text-muted">BMR (Mifflin):</div>
            <div className="fs-5 fw-bold">{bmr} kcal</div>
            <div className="small text-muted mt-2">TDEE (com atividade):</div>
            <div className="fs-6 fw-semibold">{tdee} kcal</div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="p-3 border rounded-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="fw-semibold">Meta diária</div>
              <span><b>{kcalObjetivo} kcal</b></span>
            </div>
            <div className="row row-cols-3 g-2 small">
              <div className="col d-flex justify-content-between"><span>Proteína</span><b>{proteina} g</b></div>
              <div className="col d-flex justify-content-between"><span>Gordura</span><b>{gordura} g</b></div>
              <div className="col d-flex justify-content-between"><span>Carboidrato</span><b>{carboidrato} g</b></div>
            </div>
            <div className="text-end mt-3">
              <button className="btn btn-success" onClick={() => setGoals({ calorias: kcalObjetivo, carboidrato, gordura, proteina })}>
                Aplicar metas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
