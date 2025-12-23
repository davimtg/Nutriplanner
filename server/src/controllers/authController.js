import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

export const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    let isMatch = false;
    isMatch = await bcrypt.compare(senha, user.senha);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Criar token
    const token = jwt.sign(
      { userId: user.id, email: user.email, tipo: user.tipo },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Retornar dados do usuário e token (excluindo senha)
    const userObject = user.toObject();
    delete userObject.senha;

    res.json({
      token,
      user: userObject
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const register = async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'E-mail já cadastrado' });
    }

    // Gerar ID sequencial (simples para este caso)
    const lastUser = await User.findOne().sort({ id: -1 });
    const newId = lastUser ? lastUser.id + 1 : 1;

    // Formatar tipo de usuário se vier como string do frontend
    let tipoObj = tipo;
    // Se for string, tentamos mapear para o objeto esperado (ou deixamos o frontend enviar o objeto)
    // O frontend atual envia strings "cliente", "nutricionista", etc.
    // O Schema espera { id: Number, name: String }
    if (typeof tipo === 'string') {
      const typesMap = {
        'admin': { id: 0, name: 'admin' },
        'cliente': { id: 1, name: 'cliente' },
        'nutricionista': { id: 2, name: 'nutricionista' },
        'mediador': { id: 3, name: 'mediador' }
      };
      tipoObj = typesMap[tipo.toLowerCase()] || { id: 1, name: 'cliente' };
    }

    // Criptografar senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    const newUser = new User({
      id: newId,
      nome,
      email,
      senha: hashedPassword,
      tipo: tipoObj
    });

    await newUser.save();

    // Auto-login (gerar token)
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, tipo: newUser.tipo },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    const userObject = newUser.toObject();
    delete userObject.senha;

    res.status(201).json({
      token,
      user: userObject
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
};
