// agendamentoRoute.js - Rotas de Agendamentos (Protegidas)
const express = require('express');
const router = express.Router();
const db = require('./db.js'); 
// IMPORTAÇÃO CORRIGIDA com DESTRUTURAÇÃO
const { verifyToken } = require('./authMiddleware'); 

// =======================================================
// ROTA 1: GET /agendamentos (TESTE DE AUTENTICAÇÃO)
// =======================================================
router.get('/agendamentos', verifyToken, (req, res) => {
    console.log(`Usuário autenticado (ID: ${req.userId}) acessou a listagem de agendamentos.`);
    
    // Resposta de sucesso (Você pode substituir esta linha por uma query SELECT no MySQL)
    res.status(200).json({ 
        message: "Acesso liberado! Rota GET /agendamentos funcionando.",
        userId: req.userId 
    });
});

// =======================================================
// ROTA 2: POST /agendamentos (CRIAÇÃO DE NOVO AGENDAMENTO)
// =======================================================
router.post('/agendamentos', verifyToken, async (req, res) => {
    const { 
        dataHoraInicio, 
        dataHoraFim, 
        status, 
        idCliente, 
        idFuncionario, 
        idServico, 
        precoCobrado,
        observacoes 
    } = req.body;

    const clienteIdDoToken = req.userId; 
    
    // ... (restante do código do POST)

    // Validação de campos obrigatórios
    if (!dataHoraInicio || !idFuncionario || !idServico || !clienteIdDoToken) {
        return res.status(400).json({ message: 'Dados essenciais (data, funcionário, serviço ou cliente) não fornecidos.' });
    }

    const connection = await db.getConnection(); 
    await connection.beginTransaction();

    try {
        const agendamentoQuery = `
            INSERT INTO agendamentos (
                dataHoraInicio, dataHoraFim, status, idcliente
            ) VALUES (?, ?, ?, ?)
        `;
        const [agendamentoResult] = await connection.execute(agendamentoQuery, [
            dataHoraInicio, dataHoraFim, status || 'Pendente', clienteIdDoToken
        ]);

        const idAgendamento = agendamentoResult.insertId;

        const itemQuery = `
            INSERT INTO itemagendamento (
                idagendamento, idfuncionario, idservico, precoCobrado, observacoes
            ) VALUES (?, ?, ?, ?, ?)
        `;
        await connection.execute(itemQuery, [
            idAgendamento, idFuncionario, idServico, precoCobrado, observacoes
        ]);

        await connection.commit();
        res.status(201).json({ 
            message: 'Agendamento criado com sucesso!', 
            idAgendamento: idAgendamento 
        });

    } catch (error) {
        await connection.rollback();
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({ 
            message: 'Erro interno do servidor ao criar agendamento.',
            error: error.message 
        });
    } finally {
        connection.release();
    }
});


module.exports = router;