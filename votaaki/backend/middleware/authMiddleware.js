/**
 * Middleware de Autenticação JWT
 * 
 * Verifica se o token enviado nos headers é válido e autentica a requisição,
 * anexando os dados do utilizador ao objeto req.
 */

import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  // Tenta obter o token de diferentes headers comuns
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

  // Se não houver token, retorna erro de não autorizado
  if (!token) {
    return res.status(401).json({ message: 'Sem token, autorização negada' });
  }

  try {
    // Verifica e descodifica o token usando a chave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Anexa os dados do utilizador descodificados à requisição
    req.user = decoded;
    
    next();
  } catch (error) {
    // Se o token for inválido ou estiver expirado
    res.status(401).json({ message: 'Token não é válido' });
  }
};

// Exportação nomeada para compatibilidade
export { authMiddleware };
export default authMiddleware;
