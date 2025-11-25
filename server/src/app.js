const express = require("express");
const cors = require("cors");
const connectDB = require("./db");


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// rotas/endpoint
const pedidosRoutes = require("./routes/pedidos.routes");


// conectar ao mongo
connectDB();

// usar rotas
app.use("/api/pedidos", pedidosRoutes);

app.listen(3001, () => console.log("Servidor rodando na porta 3001"));
