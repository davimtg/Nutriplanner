const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  nome: String,
  email: String,
  senha: String,
  telefone: String,
  endereco: {
    rua: String,
    numero: String,
    bairro: String,
    cidade: String,
    estado: String,
    cep: String,
    complemento: String,
  },
  tipo: String, // admin, cliente, nutricionista, mediador
});

module.exports = mongoose.model("usuario", usuarioSchema);
