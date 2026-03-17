const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // O token é geralmente enviado no cabeçalho 'Authorization' como 'Bearer <token>'
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    try {
        // Verifica e decodifica o token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
             throw new Error("JWT_SECRET não está definido nas variáveis de ambiente.");
        }
        
        const decoded = jwt.verify(token, secret);
        
        // Adiciona o ID do cliente (idcliente) do token à requisição
        req.userId = decoded.idcliente; 
        
        next(); // Continua para o próximo handler da rota

    } catch (error) {
        console.error("Erro na verificação do token:", error);
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
};

// Exporta a função de forma NOMEADA
module.exports = { verifyToken };