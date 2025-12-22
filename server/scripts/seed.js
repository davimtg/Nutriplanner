import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../src/models/User.js';
import { Alimento, Receita, PlanoAlimentar, Pedido, Mensagem } from '../src/models/Moldes.js';
import dotenv from 'dotenv'; // Load env vars if needed, usually passed via command line or default

// Configuração básica se não houver .env ainda
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://renanduque:123123456456@nutriplanner.f4mjfxq.mongodb.net/nutriplanner?appName=NutriPlanner';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..'); // raiz do server

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 Conectado ao MongoDB para seed...');
    console.log(`📂 Lendo arquivos JSON de: ${projectRoot}`);

    // Helpers de leitura
    const readJSON = (file) => {
      const filePath = path.join(projectRoot, file);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
      console.warn(`⚠️ Arquivo ${file} não encontrado.`);
      return null;
    };

    // --- Usuários ---
    const usuariosData = readJSON('usuarios.json');
    if (usuariosData && usuariosData.usuarios && usuariosData.usuarios['lista-de-usuarios']) {
      await User.deleteMany({});
      await User.insertMany(usuariosData.usuarios['lista-de-usuarios']);
      console.log('✅ Usuários importados');
    }

    // --- Alimentos ---
    const alimentosData = readJSON('alimentos.json');
    if (alimentosData && alimentosData.alimentos) {
      await Alimento.deleteMany({});
      const alimentosParaInserir = alimentosData.alimentos.map(a => ({
          ...a,
          porcaoGramas: a['porção-gramas'] // Mapeamento manual
      }));
      await Alimento.insertMany(alimentosParaInserir);
      console.log('✅ Alimentos importados');
    }

    // --- Receitas ---
    const receitasData = readJSON('receitas.json');
    if (receitasData && receitasData.receitas) {
      await Receita.deleteMany({});
      await Receita.insertMany(receitasData.receitas);
      console.log('✅ Receitas importadas');
    }

    // --- Planos Alimentares ---
    const planosData = readJSON('planos-alimentares.json');
    if (planosData && planosData['planos-alimentares']) {
      await PlanoAlimentar.deleteMany({});
      await PlanoAlimentar.insertMany(planosData['planos-alimentares']);
      console.log('✅ Planos Alimentares importados');
    }

    // --- Pedidos ---
    const pedidosData = readJSON('pedidos.json');
    if (pedidosData && pedidosData.pedidos) {
      const pedidosParaInserir = pedidosData.pedidos.map(p => ({
          id: p.id,
          userId: p['user-id'],
          itens: p.itens.map(i => ({ id: i['alimento-id'], quantidade: parseInt(i.quantidade) || 1 })), // Ajuste básico
          status: p.status.name, // Simplificando status para string
          // data e total não estão no json original claramente, deixar sem ou default
      }));
      await Pedido.deleteMany({});
      await Pedido.insertMany(pedidosParaInserir);
      console.log('✅ Pedidos importados');
    }

    // --- Mensagens ---
    const mensagensData = readJSON('mensagens.json');
    if (mensagensData && mensagensData.mensagens) {
      await Mensagem.deleteMany({});
      await Mensagem.insertMany(mensagensData.mensagens);
      console.log('✅ Mensagens importadas');
    }

    console.log('🎉 Seed concluído com sucesso!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

seed();
