import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/appdb';

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB conectado');
  } catch (err) {
    console.error('Erro ao conectar MongoDB', err);
    process.exit(1);
  }
}
