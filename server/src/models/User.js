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
  id: { type: Number, required: true, unique: true },
  nome: { type: String, required: true },
  email: { type: String, required: true },
  senha: { type: String, required: true },
  telefone: String,
  endereco: EnderecoSchema,
  tipo: TipoUsuarioSchema,
  objetivo: String,
  planoId: Number,
  nutricionistaId: Number,
  idade: Number,
  sexo: String,
  altura: Number,
  peso: Number,
  contatosRecentes: [Number]
}, {
  timestamps: true
});

export const User = mongoose.model('User', UserSchema);
