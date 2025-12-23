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
  id: { type: Number, required: true, unique: true },
  nome: { type: String, required: true },
  email: { type: String, required: true },
  senha: { type: String, required: true },
  telefone: String,
  // endereco principal (legado/padrao)
  endereco: EnderecoSchema,
  // lista d enderecos
  enderecos: [EnderecoSchema],
  tipo: TipoUsuarioSchema,
  foto: String, // Base64 da foto de perfil
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


UserSchema.pre('save', async function () {
  if (!this.isModified('senha')) return;
  // Se a senha já parece um hash do bcrypt, não hashear novamente
  if (this.senha && this.senha.startsWith('$2')) return;

  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
});

export const User = mongoose.model('User', UserSchema);
