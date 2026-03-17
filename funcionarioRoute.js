const express = require('express');
const router = express.Router();
const db = require('./db.js');
// AJUSTE: Importa a função protectRoute do seu authMiddleware.js
const { protectRoute } = require('./authMiddleware.js'); 

// --- ROTA DE LISTAGEM DE FUNCIONÁRIOS (PROTEGIDA) ---
// Note o uso de protectRoute como middleware
router.get('/', protectRoute, async (req, res) => {
    try {
        // Retorna apenas os campos necessários para o Frontend
        const [rows] = await db.execute('SELECT idfuncionario, nome, cargo FROM funcionarios ORDER BY nome');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar funcionários:', error);
        res.status(500).json({ message: 'Erro interno ao buscar funcionários.' });
    }
});

module.exports = router;