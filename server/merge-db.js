import fs from "fs";

function juntarJSONs() {
  const arquivos = [
    "alimentos.json",
    "pedidos.json",
    "planos-alimentares.json",
    "receitas.json",
    "usuarios.json"
  ];

  const dbFinal = {};

  for (const nome of arquivos) {
    const conteudo = JSON.parse(fs.readFileSync(nome, "utf-8"));

    for (const chave in conteudo) {
      dbFinal[chave] = conteudo[chave];
    }
  }

  fs.writeFileSync("db.json", JSON.stringify(dbFinal, null, 2));
}

juntarJSONs();