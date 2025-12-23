import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, ProgressBar } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { toggleFavorito } from "../../redux/favoritosSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../../services/api";

export default function Receitas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const favoritos = useSelector((state) => state.favoritos.receitas);
  const isFavorito = favoritos.includes(Number(id));

  const [receita, setReceita] = useState(null);
  const [gramas, setGramas] = useState(100);

  useEffect(() => {
    const fetchReceita = async () => {
      try {
        // Usando getById (retorna objeto direto)
        const { data } = await api.get(`/receitas/${id}`);
        setReceita(data);
      } catch (err) {
        console.error("Erro ao carregar receita:", err);
      }
    };
    fetchReceita();
  }, [id]);

  if (!receita)
    return <div className="text-center mt-5">Carregando receita...</div>;

  const { nome, img, tipo, porcao, sumario, ingredientes, tempo, passos, nutricional } = receita;

  // Cálculo proporcional de macros
  const fator = gramas / 100;
  const macros = {
    calorias: (nutricional.calorias * fator).toFixed(1),
    carboidrato: (nutricional.carboidrato * fator).toFixed(1),
    gordura: (nutricional.gordura * fator).toFixed(1),
    proteina: (nutricional.proteina * fator).toFixed(1),
  };

  const tryLoadImage = (imgName) => {
    if (!imgName) return "https://placehold.co/600x400?text=Sem+Imagem";
    if (imgName.startsWith("data:")) return imgName;
    try {
      return require(`../../assets/img/receitas/${imgName}`);
    } catch (err) {
      return "https://placehold.co/600x400?text=Imagem+N%C3%A3o+Encontrada";
    }
  };

  return (
    <div className="container my-5">
      <Button variant="secondary" className="mb-4" onClick={() => navigate(-1)}>
        Voltar
      </Button>

      <Card className="shadow-lg">
        <div className="row g-0">
          <div
            className="col-md-5 d-flex justify-content-center align-items-center"
            style={{ overflow: "hidden" }}
          >
            <img
              src={tryLoadImage(img)}
              alt={nome}
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "cover",
              }}
            />
          </div>
          <div className="col-md-7">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start">
                <Card.Title className="h3 fw-bold">{nome}</Card.Title>
                <Button
                  variant={isFavorito ? "danger" : "outline-danger"}
                  onClick={() => dispatch(toggleFavorito(Number(id)))}
                >
                  {isFavorito ? "❤️ Favorito" : "♡ Favoritar"}
                </Button>
              </div>

              <Card.Subtitle className="mb-2 text-muted">{tipo}</Card.Subtitle>
              <Card.Text className="mt-3">{sumario}</Card.Text>

              <div className="d-flex gap-4 my-3">
                <div>
                  <strong>Porções:</strong> {porcao}
                </div>
                <div>
                  <strong>Preparo:</strong> {tempo.preparacao} | <strong>Cozimento:</strong>{" "}
                  {tempo.cozimento}
                </div>
              </div>

              <div className="mt-3">
                <label className="form-label fw-bold">Quantidade (g):</label>
                <input
                  type="number"
                  value={gramas}
                  onChange={(e) => setGramas(Number(e.target.value))}
                  className="form-control w-50"
                  min={10}
                  step={10}
                />
              </div>

              <div className="mt-4">
                <h5>Informações Nutricionais ({gramas}g)</h5>

                <p className="mb-1">Calorias: {macros.calorias} kcal</p>
                <ProgressBar now={macros.calorias} max={500} label={`${macros.calorias}`} />

                <p className="mb-1 mt-2">Carboidratos: {macros.carboidrato} g</p>
                <ProgressBar
                  variant="info"
                  now={macros.carboidrato}
                  max={100}
                  label={`${macros.carboidrato}`}
                />

                <p className="mb-1 mt-2">Gordura: {macros.gordura} g</p>
                <ProgressBar
                  variant="warning"
                  now={macros.gordura}
                  max={50}
                  label={`${macros.gordura}`}
                />

                <p className="mb-1 mt-2">Proteína: {macros.proteina} g</p>
                <ProgressBar
                  variant="success"
                  now={macros.proteina}
                  max={50}
                  label={`${macros.proteina}`}
                />
              </div>
            </Card.Body>
          </div>
        </div>
      </Card>

      <div className="mt-5">
        <h4>🧂 Ingredientes</h4>
        <ul className="list-group mb-5">
          {ingredientes.map((i, idx) => (
            <li key={idx} className="list-group-item">
              {i}
            </li>
          ))}
        </ul>

        <h4>👨‍🍳 Modo de preparo</h4>
        <ol className="list-group list-group-numbered">
          {passos.map((p, idx) => (
            <li key={idx} className="list-group-item">
              {p}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
