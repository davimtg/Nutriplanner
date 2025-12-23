import mongoose from 'mongoose';

// --- Alimento ---
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

// --- Receita ---
const ReceitaSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  nome: String,
  ingredientes: [String], // Adaptado para receber strings do JSON legado
  modoPreparo: String, // Se houver
  tempo: mongoose.Schema.Types.Mixed, // JSON "tempo", era tempoPreparo
  img: String,
  passos: [String], // JSON tem array de passos
  tipo: String,
  porcao: String,
  sumario: String,
  nutricional: mongoose.Schema.Types.Mixed // JSON tem objeto nutricional
});

export const Receita = mongoose.model('Receita', ReceitaSchema);

// --- Plano Alimentar ---
const ItemRefeicaoSchema = new mongoose.Schema({
  id: Number, // ID do alimento ou receita
  gramas: Number
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

// --- Pedido ---
const PedidoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: Number,
  data: Date,
  itens: [{
    id: Number, // ID do item
    quantidade: Number
  }],
  status: String,
  total: Number
});

export const Pedido = mongoose.model('Pedido', PedidoSchema);

// --- Mensagem ---
const MensagemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  remetenteId: Number,
  destinatarioId: Number,
  texto: String,
  data: { type: Date, default: Date.now }
});

export const Mensagem = mongoose.model('Mensagem', MensagemSchema);

// --- Diario Alimentar ---
const DiarioAlimentarSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  usuarioId: { type: Number, required: true },
  data: Date,
  refeicoes: {
    cafe_da_manha: [{ id: Number, gramas: Number }],
    almoco: [{ id: Number, gramas: Number }],
    lanches: [{ id: Number, gramas: Number }],
    jantar: [{ id: Number, gramas: Number }]
  }
});

export const DiarioAlimentar = mongoose.model('DiarioAlimentar', DiarioAlimentarSchema);
