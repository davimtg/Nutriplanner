import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";

const Biblioteca = () => {
  const [query, setQuery] = useState("");
  const [alimentos, setAlimentos] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const favoritosIds = useSelector((state) => state.favoritos.receitas);

  const [favoritas, setFavoritas] = useState([]);

  // Buscar receitas favoritas quando abrir o modal
  useEffect(() => {
    const fetchFavoritas = async () => {
      if (favoritosIds.length === 0) {
        setFavoritas([]);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/receitas?id=${favoritosIds.join("&id=")}`);
        const data = await res.json();
        setFavoritas(data);
      } catch (err) {
        console.error("Erro ao buscar receitas favoritas:", err);
      }
    };

    if (showModal) {
      fetchFavoritas();
    }
  }, [showModal, favoritosIds]);

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
          fetch(`http://localhost:3001/alimentos?nome_like=${query}&_limit=10`, {
            signal: controller.signal,
          }).then((res) => res.json()),
          fetch(`http://localhost:3001/receitas?nome_like=${query}&_limit=18`, {
            signal: controller.signal,
          }).then((res) => res.json()),
        ]);

        setAlimentos(alimentosRes);
        setReceitas(receitasRes);
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
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Receitas Favoritas
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
                      src={require(`../../assets/img/receitas/${r.img}`)}
                      className="card-img-top"
                      alt={r.nome}
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
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Minhas Receitas Favoritas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {favoritas.length === 0 ? (
            <p>Nenhuma receita favorita ainda.</p>
          ) : (
            <div className="row">
              {favoritas.map((r) => (
                <div key={r.id} className="col-md-4 text-center">
                  <Link to={`/receita/${r.id}`} onClick={() => setShowModal(false)}>
                    <img
                      src={require(`../../assets/img/receitas/${r.img}`)}
                      alt={r.nome}
                      className="img-fluid rounded mb-2"
                      style={{ maxHeight: "150px", objectFit: "cover" }}
                    />
                    <h6>{r.nome}</h6>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Biblioteca;
