import axios from 'axios';
import { User } from './src/models/User.js';
import { connectDB } from './src/config/db.js';

const API_URL = 'http://localhost:3001/api/usuarios';

async function testUpdate() {
    try {
        await connectDB();

        // 1. Criar ou pegar um usuário existente
        const lastUser = await User.findOne().sort({ id: -1 });
        if (!lastUser) {
            console.error("Nenhum usuário encontrado para teste.");
            process.exit(1);
        }

        console.log(`Tentando atualizar usuário ID: ${lastUser.id} (${lastUser.nome})`);

        // 2. Tentar atualizar via API
        const updateData = {
            ...lastUser.toObject(),
            nome: lastUser.nome + " (Updated)",
        };
        // Simula o que o frontend manda (com _id)

        // OBS: O frontend manda para /usuarios/:id
        try {
            const res = await axios.put(`${API_URL}/${lastUser.id}`, updateData);
            console.log("Status update:", res.status);
            console.log("Nome atualizado:", res.data.nome);
        } catch (apiError) {
            console.error("Erro na requisição PUT:", apiError.response ? apiError.response.data : apiError.message);
        }

    } catch (error) {
        console.error('Erro global:', error);
    } finally {
        process.exit(0);
    }
}

testUpdate();
