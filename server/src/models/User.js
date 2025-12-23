import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const EnderecoSchema = new mongoose.Schema({
  apelido: String, // ex: casa, trabalho
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
  id: { type: Number, required: true, unique: true }, // mantendo id numerico legado
  nome: { type: String, required: true },
  email: { type: String, required: true }, // removido unique global p permitir multiplos tipos
  senha: { type: String, required: true }, // todo: migrar p hash depois
  telefone: String,
  // endereco principal (legado/padrao)
  endereco: EnderecoSchema,
  // lista d enderecos
  enderecos: [EnderecoSchema],
  tipo: TipoUsuarioSchema,
  foto: String, // Base64 da foto de perfil
  objetivo: String,
  planoId: Number,
  nutricionistaId: Number, // ref pro id do nutri
  idade: Number,
  sexo: String,
  altura: Number,
  peso: Number,
  contatosRecentes: [Number] // array ids users
}, {
  timestamps: true
});


UserSchema.pre('save', async function () {
  if (!this.isModified('senha')) return;
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
});

export const User = mongoose.model('User', UserSchema);
