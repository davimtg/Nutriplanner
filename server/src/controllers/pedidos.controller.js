const Pedido = require("../models/pedidos.model");

module.exports = {
  async listar(req, res) {
    const pedidos = await Pedido.find();
    res.json(pedidos);
  },

  async criar(req, res) {
    const pedido = await Pedido.create(req.body);
    res.json(pedido);
  },

  async buscar(req, res) {
    const pedido = await Pedido.findOne({ id: req.params.id });

    if (!pedido) return res.status(404).json({ erro: "Pedido não encontrado" });

    res.json(pedido);
  }
};
