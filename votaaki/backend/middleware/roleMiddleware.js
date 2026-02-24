/**
 * Middleware de Controlo de Acesso por Cargo (RBAC)
 * 
 * Este middleware verifica se o utilizador autenticado possui o cargo (role)
 * necessário para aceder a uma funcionalidade específica.
 */

const roleMiddleware = (role) => {
  return (req, res, next) => {
    // Verifica se os dados do utilizador existem e se o cargo coincide
    if (!req.user || req.user.tipo !== role) {
      return res.status(403).json({ message: 'Acesso negado: permissão insuficiente' });
    }
    next();
  };
};

// Exportação nomeada para compatibilidade
export { roleMiddleware };
export default roleMiddleware;
