// Funções de Middleware para validação de dados
function validateAgendamentoData(req, res, next) {
    const { dataHoraInicio, dataHoraFim, nomeCliente, telefoneCliente, idfuncionario, idservico } = req.body;
    
    if (!dataHoraInicio || !dataHoraFim || !nomeCliente || !telefoneCliente || !idfuncionario || !idservico) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios (data/hora, cliente, telefone, funcionário, serviço) devem ser preenchidos.' });
    }
    
    // Validações de formato simples
    if (typeof nomeCliente !== 'string' || typeof telefoneCliente !== 'string') {
        return res.status(400).json({ error: 'Formato de nome ou telefone inválido.' });
    }

    next();
}

function validateUpdateData(req, res, next) {
    // Para updates, não exigimos todos os campos, mas validamos os que estão presentes
    const allowedUpdates = ['dataHoraInicio', 'dataHoraFim', 'nomeCliente', 'telefoneCliente', 'idfuncionario', 'idservico', 'status'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Atualização inválida! Contém campos não permitidos.' });
    }

    next();
}

// Middleware para validar se o ID na URL é um número
function validateId(req, res, next) {
    const id = req.params.idagendamento;
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID de agendamento inválido.' });
    }
    next();
}

module.exports = {
    validateAgendamentoData,
    validateUpdateData,
    validateId
};