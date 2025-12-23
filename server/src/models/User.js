import mongoose from 'mongoose';

const EnderecoSchema = new mongoose.Schema({
  rua: String,
  numero: String,
  bairro: String,
  cidade: String,
  estado: String,
  cep: String,
  complemento: String
}, { _id: false });

const TipoUsuarioSchema = new mongoose.Schema({
  id: Number,
  name: String
}, { _id: false });

const UserSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Mantendo ID numérico legado
  nome: { type: String, required: true },
  email: { type: String, required: true }, // Removido unique global para permitir multiplos tipos
  senha: { type: String, required: true }, // TODO: Migrar para hash posteriormente
  telefone: String,
  endereco: EnderecoSchema,
  tipo: TipoUsuarioSchema,
  objetivo: String,
  planoId: Number,
  nutricionistaId: Number, // Reference to the nutritionist's ID
  idade: Number,
  sexo: String,
  altura: Number,
  peso: Number,
  contatosRecentes: [Number] // Array de IDs de usuários
}, {
  timestamps: true
});

export const User = mongoose.model('User', UserSchema);
