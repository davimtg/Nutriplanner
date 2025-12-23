import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";

const Biblioteca = () => {
  const [query, setQuery] = useState("");
  const [alimentos, setAlimentos] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal de favoritas
  const [showFavoritas, setShowFavoritas] = useState(false);
  const favoritosIds = useSelector((state) => state.favoritos.receitas);
  const [favoritas, setFavoritas] = useState([]);

  // Modal de criar receita
  const [showCriar, setShowCriar] = useState(false);
  const [novaReceita, setNovaReceita] = useState({
    nome: "",
    img: "",
    tipo: "",
    porcao: "",
    sumario: "",
    ingredientes: [""],
    tempo: { preparacao: "", cozimento: "" },
    passos: [""],
    nutricional: { calorias: 0, carboidrato: 0, gordura: 0, proteina: 0 },
  });

  // Buscar receitas favoritas
  useEffect(() => {
    const fetchFavoritas = async () => {
      if (favoritosIds.length === 0) {
        setFavoritas([]);
        return;
      }
      try {
        const query = favoritosIds.map(id => `id=${id}`).join("&");
        const res = await api.get(`/receitas?${query}`);
        setFavoritas(res.data);
      } catch (err) {
        console.error("Erro ao buscar receitas favoritas:", err);
      }
    };
    if (showFavoritas) fetchFavoritas();
  }, [showFavoritas, favoritosIds]);

  // Buscar alimentos e receitas
  useEffect(() => {
    if (!query) {
      setAlimentos([]);
      setReceitas([]);
      return;
    }
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      try {
        const [alimentosRes, receitasRes] = await Promise.all([
          api.get(`/alimentos?nome_like=${query}&_limit=50`, { // Increased limit to allow better client-side sorting
            signal: controller.signal,
          }),
          api.get(`/receitas?nome_like=${query}&_limit=50`, {
            signal: controller.signal,
          }),
        ]);

        const sortResults = (list, term) => {
          const lowerTerm = term.toLowerCase();
          return list.sort((a, b) => {
            const nameA = a.nome.toLowerCase();
            const nameB = b.nome.toLowerCase();
            const aStarts = nameA.startsWith(lowerTerm);
            const bStarts = nameB.startsWith(lowerTerm);

            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return nameA.localeCompare(nameB);
          });
        };

        const sortedAlimentos = sortResults(alimentosRes.data, query);
        const sortedReceitas = sortResults(receitasRes.data, query);

        setAlimentos(sortedAlimentos.slice(0, 10)); // Max 10 alimentos
        setReceitas(sortedReceitas.slice(0, 12));   // Max 12 receitas
      } catch (err) {
        if (err.name !== "AbortError") console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(fetchData, 500);
    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [query]);

  // Adicionar ingrediente ou passo
  const addItem = (type) => {
    setNovaReceita((prev) => ({
      ...prev,
      [type]: [...prev[type], ""],
    }));
  };

  // Atualizar campo da receita
  const handleChange = (field, value) => {
    setNovaReceita((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleIngredienteChange = (idx, value) => {
    const newIngredientes = [...novaReceita.ingredientes];
    newIngredientes[idx] = value;
    setNovaReceita((prev) => ({ ...prev, ingredientes: newIngredientes }));
  };

  const handlePassoChange = (idx, value) => {
    const newPassos = [...novaReceita.passos];
    newPassos[idx] = value;
    setNovaReceita((prev) => ({ ...prev, passos: newPassos }));
  };

  const handleTempoChange = (field, value) => {
    setNovaReceita((prev) => ({
      ...prev,
      tempo: { ...prev.tempo, [field]: value },
    }));
  };

  const handleNutricionalChange = (field, value) => {
    setNovaReceita((prev) => ({
      ...prev,
      nutricional: { ...prev.nutricional, [field]: Number(value) },
    }));
  };

  const submitReceita = async () => {
    try {
      await api.post("/receitas", novaReceita);
      setShowCriar(false);
      alert("Receita criada com sucesso!");
      setNovaReceita({
        nome: "",
        img: "",
        tipo: "",
        porcao: "",
        sumario: "",
        ingredientes: [""],
        tempo: { preparacao: "", cozimento: "" },
        passos: [""],
        nutricional: { calorias: 0, carboidrato: 0, gordura: 0, proteina: 0 },
      });
    } catch (err) {
      console.error("Erro ao criar receita:", err);
    }
  };

  // Helper para carregar imagem com segurança
  // Helper para carregar imagem com segurança
  const tryLoadImage = (imgName) => {
    if (!imgName) return "https://placehold.co/600x400?text=Sem+Imagem";
    if (imgName.startsWith("data:")) return imgName; // Se for base64, retorna direto
    try {
      return require(`../../assets/img/receitas/${imgName}`);
    } catch (err) {
      return "https://placehold.co/600x400?text=Imagem+N%C3%A3o+Encontrada";
    }
  };

  return (
    <div className="container my-5">
      <h1 className="mb-4">Buscador de Alimentos e Receitas</h1>

      <div className="d-flex mb-3 gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Digite algo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button variant="success" onClick={() => setShowCriar(true)}>
          Criar Receita
        </Button>
        <Button variant="primary" onClick={() => setShowFavoritas(true)}>
          Minhas Favoritas
        </Button>
      </div>

      {loading && <p>Carregando...</p>}

      {alimentos.length > 0 && (
        <div className="mb-5">
          <h3>Alimentos</h3>
          <div className="list-group">
            {alimentos.map((a) => (
              <Link
                to={`/alimento/${a.id}`}
                key={a.id}
                className="list-group-item list-group-item-action"
              >
                <h5>{a.nome}</h5>
                <p>
                  Calorias: {a.calorias} kcal | Carbs: {a.carboidrato} g | Gordura: {a.gordura} g | Proteína: {a.proteina} g
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {receitas.length > 0 && (
        <div>
          <h3>Receitas</h3>
          <div className="row">
            {receitas.map((r) => (
              <div key={r.id} className="col-md-4 mb-4">
                <Link to={`/receita/${r.id}`} className="text-decoration-none">
                  <div className="card h-100">
                    <img
                      src={tryLoadImage(r.img)}
                      className="card-img-top"
                      alt={r.nome}
                      style={{ height: 200, objectFit: "cover" }}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{r.nome}</h5>
                      <p className="card-text">{r.sumario}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Favoritas */}
      <Modal show={showFavoritas} onHide={() => setShowFavoritas(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Minhas Receitas Favoritas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {favoritas.length === 0 ? (
            <p>Nenhuma receita favorita ainda.</p>
          ) : (
            <div className="row">
              {favoritas.map((r) => (
                <div key={r.id} className="col-md-4 mb-4 text-center">
                  <Link to={`/receita/${r.id}`} onClick={() => setShowFavoritas(false)}>
                    <img
                      src={tryLoadImage(r.img)}
                      alt={r.nome}
                      className="img-fluid rounded mb-2"
                      style={{ maxHeight: "150px", objectFit: "cover" }}
                    />
                    <h6 className="text-truncate" title={r.nome}>{r.nome}</h6>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFavoritas(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Botão criar receita */}


      {/* Modal criar receita */}
      {/* Modal criar receita */}
      <Modal show={showCriar} onHide={() => setShowCriar(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Criar Nova Receita</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Nome */}
            <Form.Group className="mb-2">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                value={novaReceita.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                required
              />
            </Form.Group>

            {/* Imagem */}
            <Form.Group className="mb-2">
              <Form.Label>Imagem (apenas JPG)</Form.Label>
              <Form.Control
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handleChange("img", reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                required
              />
            </Form.Group>

            {/* Tipo */}
            <Form.Group className="mb-2">
              <Form.Label>Tipo</Form.Label>
              <Form.Select
                value={novaReceita.tipo}
                onChange={(e) => handleChange("tipo", e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                <option value="Café da manhã">Café da manhã</option>
                <option value="Café da tarde">Café da tarde</option>
                <option value="Prato Principal">Prato Principal</option>
                <option value="Sobremesa">Sobremesa</option>
              </Form.Select>
            </Form.Group>

            {/* Porção */}
            <Form.Group className="mb-2">
              <Form.Label>Porção (número de pessoas)</Form.Label>
              <Form.Control
                type="number"
                value={novaReceita.porcao}
                onChange={(e) => handleChange("porcao", e.target.value)}
                min={1}
                required
              />
            </Form.Group>

            {/* Sumário */}
            <Form.Group className="mb-2">
              <Form.Label>Sumário</Form.Label>
              <Form.Control
                type="text"
                value={novaReceita.sumario}
                onChange={(e) => handleChange("sumario", e.target.value)}
                required
              />
            </Form.Group>

            {/* Ingredientes */}
            <Form.Group className="mb-2">
              <Form.Label>Ingredientes</Form.Label>
              {novaReceita.ingredientes.map((i, idx) => (
                <div key={idx} className="d-flex gap-2 mb-1">
                  <Form.Control
                    type="text"
                    value={i}
                    onChange={(e) => handleIngredienteChange(idx, e.target.value)}
                    required
                  />
                  <Button
                    variant="danger"
                    onClick={() => {
                      const newIngredientes = [...novaReceita.ingredientes];
                      newIngredientes.splice(idx, 1);
                      setNovaReceita((prev) => ({ ...prev, ingredientes: newIngredientes }));
                    }}
                  >
                    &times;
                  </Button>
                </div>
              ))}
              <Button variant="link" onClick={() => addItem("ingredientes")}>
                + Adicionar Ingrediente
              </Button>
            </Form.Group>

            {/* Passos */}
            <Form.Group className="mb-2">
              <Form.Label>Passos</Form.Label>
              {novaReceita.passos.map((p, idx) => (
                <div key={idx} className="d-flex gap-2 mb-1">
                  <Form.Control
                    type="text"
                    value={p}
                    onChange={(e) => handlePassoChange(idx, e.target.value)}
                    required
                  />
                  <Button
                    variant="danger"
                    onClick={() => {
                      const newPassos = [...novaReceita.passos];
                      newPassos.splice(idx, 1);
                      setNovaReceita((prev) => ({ ...prev, passos: newPassos }));
                    }}
                  >
                    &times;
                  </Button>
                </div>
              ))}
              <Button variant="link" onClick={() => addItem("passos")}>
                + Adicionar Passo
              </Button>
            </Form.Group>

            {/* Tempo */}
            <Form.Group className="mb-2">
              <Form.Label>Tempo de Preparo</Form.Label>
              <Form.Control
                type="text"
                value={novaReceita.tempo.preparacao}
                onChange={(e) => handleTempoChange("preparacao", e.target.value)}
                placeholder="Ex: 35 min"
                required
                className="mb-1"
              />
              <Form.Label>Tempo de Cozimento</Form.Label>
              <Form.Control
                type="text"
                value={novaReceita.tempo.cozimento}
                onChange={(e) => handleTempoChange("cozimento", e.target.value)}
                placeholder="Ex: 50 min"
                required
              />
            </Form.Group>

            {/* Nutricional */}
            <Form.Group className="mb-2">
              <Form.Label>Informações Nutricionais (por 100g) <br></br></Form.Label>
              <Form.Label className="d-block">Calorias (kcal)</Form.Label>
              <Form.Control
                type="number"
                value={novaReceita.nutricional.calorias}
                onChange={(e) => handleNutricionalChange("calorias", e.target.value)}
                required
                className="mb-1"
              />
              <Form.Label>Carboidrato (g)</Form.Label>
              <Form.Control
                type="number"
                value={novaReceita.nutricional.carboidrato}
                onChange={(e) => handleNutricionalChange("carboidrato", e.target.value)}
                required
                className="mb-1"
              />
              <Form.Label>Gordura (g)</Form.Label>
              <Form.Control
                type="number"
                value={novaReceita.nutricional.gordura}
                onChange={(e) => handleNutricionalChange("gordura", e.target.value)}
                required
                className="mb-1"
              />
              <Form.Label>Proteína (g)</Form.Label>
              <Form.Control
                type="number"
                value={novaReceita.nutricional.proteina}
                onChange={(e) => handleNutricionalChange("proteina", e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCriar(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={submitReceita}>
            Criar Receita
          </Button>
        </Modal.Footer>
      </Modal>


    </div>
  );
};

export default Biblioteca;
