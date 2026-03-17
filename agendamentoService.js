// Função que verifica se há sobreposição de horário para um funcionário.
// connection: A conexão ativa (deve ser passada de uma transação)
// idfuncionario: O ID do funcionário a ser checado
// inicio: O novo horário de início
// fim: O novo horário de fim
// excludeId: O ID do agendamento atual (para PUT, para que ele não conflite consigo mesmo)
async function checkTimeConflict(connection, idfuncionario, inicio, fim, excludeId = null) {
    let query = `
        SELECT
            idagendamento
        FROM
            agendamentos
        WHERE
            idfuncionario = ?
            AND status != 'Cancelado'
            AND (
                -- Caso 1: Novo agendamento começa durante um agendamento existente
                (dataHoraInicio <= ? AND dataHoraFim > ?)
                -- Caso 2: Novo agendamento termina durante um agendamento existente
                OR (dataHoraInicio < ? AND dataHoraFim >= ?)
                -- Caso 3: Novo agendamento engloba um agendamento existente
                OR (dataHoraInicio >= ? AND dataHoraFim <= ?)
            )
    `;
    const params = [idfuncionario, inicio, inicio, fim, fim, inicio, fim];

    if (excludeId) {
        query += ' AND idagendamento != ?';
        params.push(excludeId);
    }
    
    // O pool.execute retorna [results, fields]
    const [results] = await connection.execute(query, params);
    
    // Se results.length for maior que zero, há um conflito.
    return results.length > 0;
}

module.exports = {
    checkTimeConflict
};