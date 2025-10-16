import { useState, useEffect } from "react"
import "bootstrap/dist/css/bootstrap.min.css"

export default function RelatorioUsuario() {
  const [usuario, setUsuario] = useState({ nome: "Maria Santos", idade: 29 })
  const [relatorio, setRelatorio] = useState({
    caloriasConsumidas: 1500,
    caloriasMeta: 2000,
    proteinas: 92,
    carboidratos: 210,
    gorduras: 48,
  })

  useEffect(() => {
    // Futuramente aqui pode vir um fetch:
    // fetch(`/api/relatorio/${idUsuario}`)
    //   .then(res => res.json())
    //   .then(data => setRelatorio(data))
  }, [])

  const progresso = Math.min(
    (relatorio.caloriasConsumidas / relatorio.caloriasMeta) * 100,
    100
  )

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm rounded-4 p-4">
            <h2 className="text-center text-success mb-4">Relatório Nutricional</h2>

            <div className="text-center mb-4">
              <h4 className="mb-1">{usuario.nome}</h4>
              <small className="text-muted">{usuario.idade} anos</small>
            </div>

            <div className="mb-5">
              <h5 className="text-success mb-3">Progresso calórico</h5>
              <div className="progress" style={{ height: "24px" }}>
                <div
                  className="progress-bar bg-success progress-bar-striped"
                  role="progressbar"
                  style={{ width: `${progresso}%` }}
                  aria-valuenow={progresso}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {relatorio.caloriasConsumidas} / {relatorio.caloriasMeta} kcal
                </div>
              </div>
            </div>

            <div className="row text-center mb-4">
              <div className="col-md-4 mb-3">
                <div className="card border-success shadow-sm rounded-3 p-3">
                  <h6 className="text-success">Proteínas</h6>
                  <p className="fs-5 fw-semibold mb-0">{relatorio.proteinas}g</p>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card border-success shadow-sm rounded-3 p-3">
                  <h6 className="text-success">Carboidratos</h6>
                  <p className="fs-5 fw-semibold mb-0">{relatorio.carboidratos}g</p>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card border-success shadow-sm rounded-3 p-3">
                  <h6 className="text-success">Gorduras</h6>
                  <p className="fs-5 fw-semibold mb-0">{relatorio.gorduras}g</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="text-success mb-3">Resumo do dia</h5>
              <div className="card border-0 bg-light p-3 rounded-3 shadow-sm">
                <p className="mb-1">
                  Você atingiu{" "}
                  <strong>{progresso.toFixed(1)}%</strong> da sua meta calórica hoje.
                </p>
                <p className="mb-1">
                  Consumo de proteínas está equilibrado.
                </p>
                <p className="mb-0">
                  Carboidratos dentro do limite recomendado.
                </p>
              </div>
            </div>

            <div className="mt-5 text-center text-muted">
              <small>Última atualização: {new Date().toLocaleDateString()}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
