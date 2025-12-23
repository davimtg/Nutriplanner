const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
    "alimento-id": Number,
    name: String,
    quantidade: mongoose.Schema.Types.Mixed,
    marca: String
});

const StatusSchema = new mongoose.Schema({
    id: Number,
    name: String
});

const PedidoSchema = new mongoose.Schema({
    id: Number,
    "user-id": Number,
    itens: [ItemSchema],
    status: StatusSchema
});

module.exports = mongoose.model("Pedido", PedidoSchema);