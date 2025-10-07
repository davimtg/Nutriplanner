import { useState, useEffect } from "react"

export default function BuscaAlimentos() {
  const [query, setQuery] = useState("")
  const [alimentos, setAlimentos] = useState([])
  const [receitas, setReceitas] = useState([])

  useEffect(() => {
    if (!query.trim()) {
      setAlimentos([])
      setReceitas([])
      return
    }

    const alimentosMock = [
      "Arroz integral",
      "Feijão preto",
      "Frango grelhado",
      "Maçã verde",
      "Banana prata",
      "Ovo cozido",
    ].filter(a => a.toLowerCase().includes(query.toLowerCase()))

    const receitasMock = [
      { nome: "Omelete fit", ingredientes: ["ovo", "tomate", "espinafre"] },
      { nome: "Salada tropical", ingredientes: ["maçã", "banana", "mamão"] },
      { nome: "Frango com batata-doce", ingredientes: ["frango", "batata-doce", "alho"] },
      { nome: "Arroz com feijão", ingredientes: ["arroz", "feijão", "azeite"] },
    ].filter(r =>
      r.ingredientes.some(i => i.toLowerCase().includes(query.toLowerCase()))
    )

    setAlimentos(alimentosMock)
    setReceitas(receitasMock)
  }, [query])

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm rounded-4 p-4">
            <h1 className="text-center text-success mb-4">Busca de Alimentos</h1>

            <input
              type="text"
              className="form-control form-control-lg mb-4"
              placeholder="Digite um alimento..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />

            {alimentos.length > 0 && (
              <div className="mb-5">
                <h4 className="text-success mb-3">Alimentos encontrados:</h4>
                <div className="list-group">
                  {alimentos.map((a, i) => (
                    <div
                      key={i}
                      className="list-group-item list-group-item-action rounded-3 mb-2 shadow-sm"
                    >
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {receitas.length > 0 && (
              <div>
                <h4 className="text-success mb-3">Receitas sugeridas:</h4>
                <div className="row g-3">
                  {receitas.map((r, i) => (
                    <div key={i} className="col-md-6">
                      <div className="card h-100 border-success shadow-sm rounded-4">
                        <div className="card-body">
                          <h5 className="card-title text-success">{r.nome}</h5>
                          <p className="card-text text-muted mb-0">
                            Ingredientes: {r.ingredientes.join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!query && (
              <p className="text-center text-muted mt-4">
                Comece digitando o nome de um alimento...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
