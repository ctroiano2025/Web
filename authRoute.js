const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const { getPool } = require('./db.js'); 

// Secret Key para o JWT
const JWT_SECRET = process.env.JWT_SECRET || 'MINHACHAVE_MUITO_SECRETA_E_LONGA'; 

// Rota de Registro de Cliente
router.post('/register', async (req, res) => {
    // Recebe os dados do corpo da requisição
    const { nome, email, telefone, senha } = req.body;

    // 1. Validação simples de entrada
    if (!nome || !email || !telefone || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        const pool = getPool(); // Obtém o pool de conexões

        // 2. Checa se o usuário já existe
        // NOTA: Assumindo que 'idcliente' é a PK e 'email' é UNIQUE
        const [existingUsers] = await pool.execute('SELECT idcliente FROM cliente WHERE email = ?', [email]);
        
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Este email já está registrado.' });
        }

        // 3. Criptografa a senha (SALT_ROUNDS = 10 é o padrão)
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        // 4. Insere o novo cliente no banco de dados
        // MUDANÇA CRÍTICA: A query de INSERT agora usa idcliente.
        // Se idcliente for AUTO_INCREMENT, ele não precisa estar no INSERT
        // O campo datacadastro é 'timestamp' com DEFAULT CURRENT_TIMESTAMP, então não precisa ser incluído na lista de campos
        const query = 'INSERT INTO cliente (nome, email, telefone, senhaHash) VALUES (?, ?, ?, ?)';
        const [result] = await pool.execute(query, [nome, email, telefone, senhaHash]);

        // Assumindo que o ID da coluna é 'idcliente' e que ele foi inserido
        const clienteId = result.insertId;

        // 5. Gera o Token de Autenticação (JWT)
        const token = jwt.sign({ id: clienteId, email: email, tipo: 'cliente' }, JWT_SECRET, {
            expiresIn: '7d', // Expira em 7 dias
        });

        // 6. Resposta de sucesso
        res.status(201).json({ 
            message: 'Cliente registrado com sucesso!',
            token: token 
        });

    } catch (error) {
        console.error('Erro ao registrar novo cliente:', error);
        // Em um erro interno, logamos o erro, mas enviamos uma mensagem genérica
        res.status(500).json({ error: 'Erro interno do servidor ao tentar registrar.' });
    }
});

// Rota de Login (apenas para referência futura)
// ...

module.exports = router;