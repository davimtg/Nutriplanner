import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

export const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Buscar usuário (senha plain text por enquanto, conforme migração)
    const user = await User.findOne({ email, senha });

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Criar token
    const token = jwt.sign(
      { userId: user.id, email: user.email, tipo: user.tipo },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Retornar dados do usuário e token
    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
