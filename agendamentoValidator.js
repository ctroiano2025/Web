const Joi = require('joi');

// Schema de validação para a criação (POST)
const agendamentoSchema = Joi.object({
    dataHoraInicio: Joi.date().iso().required().messages({
        'date.base': 'Data e Hora de Início deve ser uma data válida.',
        'date.iso': 'Data e Hora de Início deve estar no formato ISO 8601 (ex: YYYY-MM-DDTHH:MM:SS.000Z).',
        'any.required': 'O campo dataHoraInicio é obrigatório.'
    }),
    dataHoraFim: Joi.date().iso().required().messages({
        'date.base': 'Data e Hora de Fim deve ser uma data válida.',
        'date.iso': 'Data e Hora de Fim deve estar no formato ISO 8601.',
        'any.required': 'O campo dataHoraFim é obrigatório.'
    }),
    nomeCliente: Joi.string().trim().min(3).max(100).required().messages({
        'string.base': 'Nome do Cliente deve ser texto.',
        'string.empty': 'Nome do Cliente não pode ser vazio.',
        'string.min': 'Nome do Cliente deve ter no mínimo {#limit} caracteres.',
        'any.required': 'O campo nomeCliente é obrigatório.'
    }),
    telefoneCliente: Joi.string().trim().min(8).max(20).required().messages({
        'string.base': 'Telefone do Cliente deve ser texto.',
        'string.empty': 'Telefone do Cliente não pode ser vazio.',
        'any.required': 'O campo telefoneCliente é obrigatório.'
    }),
    idfuncionario: Joi.number().integer().min(1).required().messages({
        'number.base': 'ID do Funcionário deve ser um número.',
        'number.min': 'ID do Funcionário deve ser maior que zero.',
        'any.required': 'O campo idfuncionario é obrigatório.'
    }),
    idservico: Joi.number().integer().min(1).required().messages({
        'number.base': 'ID do Serviço deve ser um número.',
        'number.min': 'ID do Serviço deve ser maior que zero.',
        'any.required': 'O campo idservico é obrigatório.'
    }),
});

// Schema de validação para a atualização (PUT)
const updateAgendamentoSchema = agendamentoSchema.keys({
    // Permite que o status seja alterado na atualização
    status: Joi.string().valid('Pendente', 'Confirmado', 'Cancelado', 'Concluído').optional()
});


// Middleware para validar a criação (POST)
const validateAgendamento = (req, res, next) => {
    const { error } = agendamentoSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

// Middleware para validar a atualização (PUT)
const validateUpdateAgendamento = (req, res, next) => {
    const { error } = updateAgendamentoSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

module.exports = {
    validateAgendamento,
    validateUpdateAgendamento
};