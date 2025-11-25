const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect("mongodb://localhost:27017/nutriplanner");
    console.log("MongoDB conectado!");
  } catch (error) {
    console.error("Erro ao conectar no MongoDB:", error);
  }
}

module.exports = connectDB;
