const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Pedido = require("../models/pedidos.model");

async function importPedidos() {
  try {
    await mongoose.connect("mongodb://localhost:27017/nutriplanner");
    console.log("MongoDB conectado!");

    const filePath = path.join(__dirname, "../../pedidos.json");
    const rawData = fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(rawData);

    const pedidos = jsonData.pedidos;

    // Limpar a collection antes
    await Pedido.deleteMany({});
    console.log("Collection 'pedidos' limpa.");

    // Inserir pedidos
    await Pedido.insertMany(pedidos);
    console.log("Pedidos importados com sucesso!");

    mongoose.connection.close();
  } catch (err) {
    console.error("Erro ao importar:", err);
    mongoose.connection.close();
  }
}

importPedidos();
