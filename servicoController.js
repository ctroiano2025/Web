// servicoController.js - Lógica de manipulação do banco de dados para Serviços
const db = require('./db');

/**
 * Lista todos os serviços disponíveis.
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 */
const getAllServicos = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const query = 'SELECT idservico, nome, descricao, preco, duracao FROM servico';
        const [servicos] = await connection.execute(query);
        
        res.status(200).json(servicos);
    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        res.status(500).json({ 
            message: 'Erro interno do servidor ao listar serviços.', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

/**
 * Cria um novo serviço no banco de dados.
 * Requer: nome, preco e duracao.
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 */
const createServico = async (req, res) => {
    const { nome, descricao, preco, duracao } = req.body;

    if (!nome || !preco || !duracao) {
        return res.status(400).json({ message: 'Nome, preço e duração são obrigatórios para o serviço.' });
    }

    const connection = await db.getConnection();
    try {
        const query = `
            INSERT INTO servico (nome, descricao, preco, duracao)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await connection.execute(query, [nome, descricao, preco, duracao]);

        res.status(201).json({ 
            message: 'Serviço criado com sucesso.', 
            idservico: result.insertId 
        });
    } catch (error) {
        // Erro 1062 - Duplicidade (se você tiver uma chave UNIQUE no nome, por exemplo)
        if (error.errno === 1062) {
             return res.status(409).json({ message: 'Erro: Já existe um serviço com este nome.' });
        }
        
        console.error('Erro ao criar serviço:', error);
        res.status(500).json({ 
            message: 'Erro interno do servidor ao criar serviço.', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    getAllServicos,
    createServico,
};