import mongoose from 'mongoose';

const AlimentoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  nome: String,
  calorias: Number,
  proteina: Number,
  carboidrato: Number,
  gordura: Number,
  porcao: String,
  porcaoGramas: Number
});

export const Alimento = mongoose.model('Alimento', AlimentoSchema);

const ReceitaSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  nome: String,
  ingredientes: [String],
  modoPreparo: String,
  tempo: mongoose.Schema.Types.Mixed,
  imagem: String,
  passos: [String],
  tipo: String,
  porcao: String,
  sumario: String,
  nutricional: mongoose.Schema.Types.Mixed
});

export const Receita = mongoose.model('Receita', ReceitaSchema);

const ItemRefeicaoSchema = new mongoose.Schema({
  id: Number,
  gramas: Number,
  kind: String // 'alimento' or 'receita'
}, { _id: false });

const RefeicoesDiaSchema = new mongoose.Schema({
  cafe_da_manha: [ItemRefeicaoSchema],
  almoco: [ItemRefeicaoSchema],
  jantar: [ItemRefeicaoSchema]
}, { _id: false });

const DetalhamentoPlanoSchema = new mongoose.Schema({
  segunda: RefeicoesDiaSchema,
  terca: RefeicoesDiaSchema,
  quarta: RefeicoesDiaSchema,
  quinta: RefeicoesDiaSchema,
  sexta: RefeicoesDiaSchema,
  sabado: RefeicoesDiaSchema,
  domingo: RefeicoesDiaSchema
}, { _id: false });

const PlanoAlimentarSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  nome: String,
  objetivo: String,
  detalhamento: DetalhamentoPlanoSchema
}, { collection: 'planosalimentares' });

export const PlanoAlimentar = mongoose.model('PlanoAlimentar', PlanoAlimentarSchema);


const PedidoItemSchema = new mongoose.Schema({
  id: Number,
  "alimento-id": Number,
  name: String,
  quantidade: mongoose.Schema.Types.Mixed,
  marca: String
}, { _id: false });

const PedidoStatusSchema = new mongoose.Schema({
  id: Number,
  name: String
}, { _id: false });

const PedidoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: Number,
  "user-id": Number,
  cliente: String,
  telefone: String,
  endereco: String,
  data: Date,
  itens: [PedidoItemSchema],
  status: PedidoStatusSchema,
  total: Number
});

export const Pedido = mongoose.model('Pedido', PedidoSchema);

const MensagemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  remetenteId: Number,
  destinatarioId: Number,
  texto: String,
  lida: { type: Boolean, default: false }, // Status de leitura
  data: { type: Date, default: Date.now }
});

export const Mensagem = mongoose.model('Mensagem', MensagemSchema);

const DiarioAlimentarSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  usuarioId: { type: Number, required: true },
  data: Date,
  refeicoes: {
    cafe_da_manha: [ItemRefeicaoSchema],
    almoco: [ItemRefeicaoSchema],
    lanches: [ItemRefeicaoSchema],
    jantar: [ItemRefeicaoSchema]
  }
});

export const DiarioAlimentar = mongoose.model('DiarioAlimentar', DiarioAlimentarSchema);
