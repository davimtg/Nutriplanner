import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

export function authMiddleware(req, res, next) {
  // Ignorar rotas públicas se necessário, mas geralmente o middleware é aplicado nas rotas específicas
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Adiciona dados do usuário na requisição
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido' });
  }
}
