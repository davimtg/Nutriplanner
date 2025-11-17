const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const pedidosRoutes = require("./routes/pedidos.routes");

const app = express();

app.use(cors());
app.use(express.json());

// conectar ao mongo
connectDB();

// usar rotas
app.use("/api/pedidos", pedidosRoutes);

app.listen(3001, () => console.log("Servidor rodando na porta 3001"));
