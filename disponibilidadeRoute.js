const express = require('express');
const router = express.Router();

// =========================================================
// 1. DADOS MOCKADOS E CONFIGURAÇÃO (LÓGICA INICIAL)
//    Estes dados simulam as informações do banco (por enquanto)
// =========================================================

const CONFIG_SALAO = {
    HORA_INICIO: "07:00", // Início do expediente
    HORA_FIM: "19:00",   // Fim do expediente
    GRANULARIDADE_MINUTOS: 60, // Horários de início a cada 1 hora (fechados)
    BUFFER_MINUTOS: 10 // Intervalo entre serviços
};

// Duração dos Serviços (em minutos)
const DURACAO_SERVICOS = {
    MANICURE: 60,
    PEDICURE: 60, 
    SOBRANCELHA: 30, 
    COLORACAO: 30,
    ESCOVA_SIMPLES: 60, 
    ESCOVA_MODELADA: 60,
    CORTE: 60,
    MAQUIAGEM: 60, 
    PENTEADO: 120, // 2 horas
    DEPILACAO_BUCO: 30,
    PROGRESSIVA: 120,
    SELANTE: 120, 
    PROGRESSIVA_VOLUMOSA: 180, // 3 horas
};

// MOCK DATA: Agendamentos que estariam no banco de dados para um dia específico
// (Apenas para teste)
const AGENDAMENTOS_MOCK = [
    // Slot de 1 hora (Corte) + 10 min de buffer = Ocupado até 9:10
    { hora_inicio: "08:00", duracao_minutos: DURACAO_SERVICOS.CORTE }, 
    // Slot de 30 min (Sobrancelha) + 10 min de buffer = Ocupado até 15:40
    { hora_inicio: "15:00", duracao_minutos: DURACAO_SERVICOS.SOBRANCELHA } 
];


// ** FUNÇÃO QUE CALCULA A DISPONIBILIDADE **
// Por enquanto, é apenas um placeholder com um retorno fixo para que você possa testar a conexão.
function calcularDisponibilidade(nomeServico) {
    // A lógica complexa de agendamento (o algoritmo) virá aqui.
    
    // Retorna uma lista de horários de teste:
    console.log(`Buscando horários para o serviço: ${nomeServico}`);

    // Estes horários são apenas um MOCK, simulando os horários livres do dia:
    return ["07:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "16:00", "17:00", "18:00"]; 
}


// =========================================================
// 2. ROTA (ENDPOINT)
//    Esta rota será chamada pelo seu man.js (front-end)
// =========================================================

// Método POST no endpoint /api/disponibilidade
router.post('/disponibilidade', (req, res) => {
    try {
        // Pega os dados enviados pelo front-end
        const { servico, profissional, data } = req.body;

        // Validação básica para garantir que os dados vieram
        if (!servico || !profissional) {
            return res.status(400).json({ error: "Serviço e profissional são obrigatórios." });
        }
        
        // Chama a função de cálculo de horários
        // Convertemos para UPPERCASE para facilitar a busca na lista de serviços (DURACAO_SERVICOS)
        const horariosLivres = calcularDisponibilidade(servico.toUpperCase()); 

        // Envia a resposta de volta para o front-end
        return res.json({ 
            profissional: profissional,
            data: data,
            disponiveis: horariosLivres 
        });

    } catch (error) {
        // Se algo der errado (ex: serviço não encontrado), envia um erro 500
        console.error("Erro ao buscar horários:", error.message);
        return res.status(500).json({ error: "Erro interno ao processar a disponibilidade." });
    }
});

module.exports = router; // Exporta o objeto 'router' para ser usado no server.js