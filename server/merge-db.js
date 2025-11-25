const fs = require("fs");

function juntarJSONs() {
  const arquivos = [
    "alimentos.json",
    "pedidos.json",
    "planos-alimentares.json",
    "receitas.json",
    "usuarios.json",
    "mensagens.json"
  ];

  const dbFinal = {};

  for (const nome of arquivos) {
    const conteudo = JSON.parse(fs.readFileSync(nome, "utf-8"));

    for (const chave in conteudo) {
      dbFinal[chave] = conteudo[chave];
    }
  }

  fs.writeFileSync("db.json", JSON.stringify(dbFinal, null, " ")); // O Terceiro argumento de JSON.stringify define como a identação ocorre no arquivo db.json, o arguemnto 0 deixava tudo em uma linha 
}

juntarJSONs();