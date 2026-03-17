import express from 'express';
// Renomeando a importação para 'pool' para consistência com o agendamentoRoute.js
// Isso depende de como seu db.js exporta a conexão. Se for default, use db. Se for pool, use pool.
// Assumindo que db.query é o mesmo que pool.execute, mantive a sintaxe db.query para compatibilidade com seu código.
import db from './db.js'; 

const router = express.Router();

// ====================================================================
// ROTA GET /api/clientes - Listar todos os clientes
// ====================================================================
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT idcliente, nome, telefone, email, dataCadastro 
            FROM cliente
            ORDER BY nome ASC
        `;
        // Adicionei 'email' e 'dataCadastro' na seleção para utilidade
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        res.status(500).json({ error: 'Falha interna ao buscar clientes.' });
    }
});


// ====================================================================
// ROTA GET /api/clientes/:id - Buscar cliente por ID (ADICIONADA)
// ====================================================================
router.get('/:id', async (req, res) => {
    const idcliente = req.params.id;

    try {
        const query = `
            SELECT idcliente, nome, telefone, email, dataCadastro
            FROM cliente
            WHERE idcliente = ?
        `;
        const [results] = await db.query(query, [idcliente]);
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error(`Erro ao buscar cliente ID ${idcliente}:`, error);
        res.status(500).json({ error: 'Falha interna ao buscar o cliente.' });
    }
});


// ====================================================================
// ROTA POST /api/clientes - Cadastrar um novo cliente
// ====================================================================
router.post('/', async (req, res) => {
    // Adicionando 'email' como campo opcional
    const { nome, telefone, email } = req.body;

    if (!nome || !telefone) {
        return res.status(400).json({ error: 'Nome e Telefone são obrigatórios.' });
    }

    try {
        const sql = 'INSERT INTO cliente (nome, telefone, email, dataCadastro) VALUES (?, ?, ?, NOW())';
        const values = [nome, telefone, email || null]; // email é opcional

        const [result] = await db.query(sql, values);
        
        res.status(201).json({ 
            message: 'Cliente cadastrado com sucesso!', 
            idcliente: result.insertId,
            nome,
            telefone
        });

    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error);
        res.status(500).json({ error: 'Falha interna ao cadastrar o cliente.' });
    }
});

// ====================================================================
// ROTA PUT /api/clientes/:id - Atualizar um cliente existente (Mantido PUT)
// ====================================================================
router.put('/:id', async (req, res) => {
    const idcliente = req.params.id;
    // Adicionando 'email' para que possa ser atualizado
    const { nome, telefone, email } = req.body; 

    // Se você usa PUT, idealmente deve-se enviar todos os campos. 
    // Mantenho a validação de nome e telefone obrigatórios para consistência.
    if (!nome || !telefone) {
        return res.status(400).json({ error: 'Nome e Telefone são obrigatórios para atualização.' });
    }

    try {
        // Incluindo email na atualização
        const sql = 'UPDATE cliente SET nome = ?, telefone = ?, email = ? WHERE idcliente = ?';
        const values = [nome, telefone, email || null, idcliente];

        const [result] = await db.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }
        
        res.status(200).json({ message: 'Cliente atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({ error: 'Falha interna ao atualizar o cliente.' });
    }
});

// ====================================================================
// ROTA DELETE /api/clientes/:id - Deletar um cliente (REVISADA)
// ====================================================================
router.delete('/:id', async (req, res) => {
    const idcliente = req.params.id;
    let connection;

    try {
        // Usar pool.getConnection e transação para garantir que a verificação e a deleção sejam atômicas
        connection = await db.getConnection(); // Assumindo que db possui o método getConnection()
        await connection.beginTransaction();

        // 1. VERIFICAÇÃO CRÍTICA: Cliente tem agendamentos ativos?
        const [agendamentosAtivos] = await connection.query(
            `SELECT idagendamento FROM agendamentos 
             WHERE idcliente = ? AND status IN ('PENDENTE', 'CONFIRMADO');`,
            [idcliente]
        );

        if (agendamentosAtivos.length > 0) {
            await connection.rollback();
            return res.status(409).json({ // 409 Conflict
                error: `Não é possível deletar o cliente ID ${idcliente}. Existem agendamentos pendentes ou confirmados vinculados.`,
                agendamentos: agendamentosAtivos.map(a => a.idagendamento)
            });
        }
        
        // 2. Tenta deletar o cliente
        const sql = 'DELETE FROM cliente WHERE idcliente = ?';
        const [result] = await connection.query(sql, [idcliente]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }
        
        await connection.commit();
        res.status(200).json({ message: 'Cliente deletado com sucesso (e sem agendamentos ativos).' });

    } catch (error) {
        if (connection) {
            // Se algo falhar (incluindo erro na deleção por chaves estrangeiras se houver histórico)
            await connection.rollback(); 
            connection.release();
        }
        console.error('Erro ao deletar cliente:', error);
        res.status(500).json({ error: 'Falha interna ao deletar o cliente.', details: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

export default router;