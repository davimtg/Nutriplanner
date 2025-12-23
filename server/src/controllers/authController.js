import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

export const login = async (req, res) => {
  const { email, senha, tipo } = req.body;

  try {
    // Montar query de busca
    const query = { email };

    // Se o tipo for informado, filtrar também pelo tipo
    if (tipo) {
      // O frontend envia objeto { id, name }, mas podemos checar só o name ou id
      // Se vier string, tratamos também
      if (typeof tipo === 'object' && tipo.name) {
        query['tipo.name'] = tipo.name;
      } else if (typeof tipo === 'string') {
        // Caso venha string (ex: 'mediador')
        query['tipo.name'] = tipo;
      }
    }

    let user = await User.findOne(query);

    // Fallback: Se não achou usuário com o tipo selecionado (ex: Cliente),
    // verifica se existe um usuário 'admin' com esse email.
    // Isso é necessário porque o Admin não seleciona o tipo na tela de login (escondido).
    if (!user && tipo && tipo.name !== 'admin') {
      user = await User.findOne({ email, 'tipo.name': 'admin' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    let isMatch = false;

    // Tenta comparar com bcrypt
    try {
      isMatch = await bcrypt.compare(senha, user.senha);
    } catch (e) {
      isMatch = false;
    }

    // Fallback para senhas antigas em texto plano
    if (!isMatch && senha === user.senha) {
      isMatch = true;
    }

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
    // Formatar tipo de usuário se vier como string do frontend
    let tipoObj = tipo;
    // Se for string, tentamos mapear para o objeto esperado
    if (typeof tipo === 'string') {
      const typesMap = {
        'admin': { id: 0, name: 'admin' },
        'cliente': { id: 1, name: 'cliente' },
        'nutricionista': { id: 2, name: 'nutricionista' },
        'mediador': { id: 3, name: 'mediador' }
      };
      tipoObj = typesMap[tipo.toLowerCase()] || { id: 1, name: 'cliente' };
    }

    // A regra agora é: E-mail pode repetir, mas NÃO no mesmo tipo.
    // userExists vira userExistsInType
    const userExistsInType = await User.findOne({ email, 'tipo.name': tipoObj.name });

    if (userExistsInType) {
      return res.status(400).json({ message: 'E-mail já cadastrado para este tipo de usuário' });
    }

    // Gerar ID sequencial (simples para este caso)
    const lastUser = await User.findOne().sort({ id: -1 });
    const newId = lastUser ? lastUser.id + 1 : 1;

    // A senha será hashada pelo pre-save hook no Model
    const newUser = new User({
      id: newId,
      nome,
      email,
      senha, // Passando em texto plano para o model tratar
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
