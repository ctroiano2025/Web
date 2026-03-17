const express = require('express');
const dotenv = require('dotenv');
const { getPool } = require('./db'); // CORREÇÃO: Importa getPool do db.js
const authRoutes = require('./authRoute');

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir que o Express analise o corpo das requisições JSON
app.use(express.json());

// Middleware para validar a chave API (x-api-key)
const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const requiredApiKey = process.env.API_KEY_SECRET;

    if (!requiredApiKey) {
        console.error("ERRO CRÍTICO: Variável API_KEY_SECRET não está definida no .env!");
        return res.status(500).json({ error: 'Erro de configuração do servidor.' });
    }

    if (!apiKey || apiKey !== requiredApiKey) {
        return res.status(401).json({ error: 'Acesso não autorizado: Chave API inválida ou ausente.' });
    }

    next();
};

// Aplica o middleware de API Key a todas as rotas (exceto se você definir rotas públicas separadas)
// Para este projeto, vamos aplicá-lo em todas as rotas abaixo.

// Rota de teste
app.get('/', (req, res) => {
    res.status(200).send('API do Salão de Beleza está rodando!');
});

// ROTAS
// Aplica apiKeyMiddleware APENAS às rotas que precisam de autenticação/segurança
app.use('/api/auth', apiKeyMiddleware, authRoutes);


// Inicia o servidor Node.js
try {
    // Tenta obter o pool para garantir que a conexão foi estabelecida antes de iniciar o servidor
    const pool = getPool(); 
    if (pool) {
        app.listen(PORT, () => {
            console.log(`Servidor Node.js rodando em http://localhost:${PORT}`);
        });
    } else {
        console.error("ERRO: O Pool de Conexões não está definido. Verifique o db.js.");
    }
} catch (error) {
    console.error("Erro ao iniciar o servidor após checar o Pool:", error.message);
}