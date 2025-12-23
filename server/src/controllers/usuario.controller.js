const Usuario = require("../models/usuario.model");

exports.getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ id: parseInt(req.params.id) });
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
};

exports.updateUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findOneAndUpdate({id: parseInt(req.params.id)}, req.body, { new: true });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
};

exports.testController = async (req, res) => {
  res.send("Não é possivel listar TODOS os usuarios");
};
