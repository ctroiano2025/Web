const express = require('express');
const router = express.Router();
const db = require('./db'); // Conexão com o banco de dados

// ====================================================================
// ROTA 1: CRIAR NOVA DISPONIBILIDADE (POST /disponibilidade)
// ====================================================================
router.post('/', (req, res) => {
    // Note: o frontend envia idFuncionario, mas a desestruturação deve ser idFuncionario (com 'F' minúsculo) 
    // ou se adequar ao que o frontend envia. Assumindo que o frontend envia 'idfuncionario' (minúsculo)
    // conforme o padrão camelCase JS. Se o DB for 'idFuncionario', é melhor padronizar no backend.
    // Usaremos 'idFuncionario' conforme o corpo da sua rota.
    const { idFuncionario, diaSemana, horaInicio, horaFim } = req.body; 

    if (!idFuncionario || !diaSemana || !horaInicio || !horaFim) {
        return res.status(400).json({ error: 'Todos os campos (idFuncionario, diaSemana, horaInicio, horaFim) são obrigatórios.' });
    }
    
    // Validação básica de hora
    if (horaInicio >= horaFim) {
        return res.status(400).json({ error: 'A hora de início deve ser anterior à hora de fim.' });
    }

    const query = 'INSERT INTO Disponibilidade (idFuncionario, diaSemana, horaInicio, horaFim) VALUES (?, ?, ?, ?)';
    
    db.query(query, [idFuncionario, diaSemana, horaInicio, horaFim], (err, result) => {
        if (err) {
            console.error('Erro ao inserir disponibilidade:', err);
            // 1452: Foreign Key Constraint (idFuncionario inexistente)
            if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
                return res.status(409).json({ error: 'O ID do funcionário fornecido não existe.' });
            }
            // 1062: Duplicate Entry (Já existe um registro para este funcionário neste dia)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Já existe um horário de disponibilidade para este funcionário neste dia da semana.' });
            }
            return res.status(500).json({ error: 'Erro interno ao tentar cadastrar a disponibilidade.' });
        }
        
        res.status(201).json({ 
            message: 'Disponibilidade cadastrada com sucesso!', 
            idDisponibilidade: result.insertId,
            idFuncionario,
            diaSemana
        });
    });
});

// ====================================================================
// ROTA 2: OBTER DISPONIBILIDADE (GET /disponibilidade?idFuncionario=X)
// ====================================================================
router.get('/', (req, res) => {
    // Filtro opcional por idFuncionario
    const { idFuncionario } = req.query; 

    let query = `
        SELECT 
            D.idDisponibilidade, 
            D.idFuncionario, 
            F.nome AS nomeFuncionario,
            D.diaSemana, 
            TIME_FORMAT(D.horaInicio, '%H:%i') AS horaInicio, 
            TIME_FORMAT(D.horaFim, '%H:%i') AS horaFim 
        FROM Disponibilidade D
        JOIN Funcionarios F ON D.idFuncionario = F.idFuncionario
    `;
    let values = [];

    if (idFuncionario) {
        query += ' WHERE D.idFuncionario = ?';
        values.push(idFuncionario);
    }
    
    // Ordena por funcionário e depois por dia da semana
    // Note: Os nomes dos dias em Português devem ser exatamente como estão no DB
    query += ' ORDER BY F.nome, FIELD(D.diaSemana, "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado")';

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Erro ao buscar disponibilidades:', err);
            return res.status(500).json({ error: 'Erro interno ao buscar a lista de disponibilidades.' });
        }
        
        res.status(200).json(results);
    });
});

// ====================================================================
// ROTA 3: ATUALIZAR DISPONIBILIDADE (PUT /disponibilidade/:idDisponibilidade)
// ====================================================================
router.put('/:idDisponibilidade', (req, res) => {
    const { idDisponibilidade } = req.params;
    const { diaSemana, horaInicio, horaFim } = req.body; 

    // Certifique-se de que pelo menos um campo está sendo fornecido para atualização
    if (!diaSemana && !horaInicio && !horaFim) {
        return res.status(400).json({ error: 'Pelo menos um campo (diaSemana, horaInicio, ou horaFim) deve ser fornecido para atualização.' });
    }
    
    if (horaInicio && horaFim && horaInicio >= horaFim) {
         return res.status(400).json({ error: 'A hora de início deve ser anterior à hora de fim.' });
    }

    let fields = [];
    let values = [];

    if (diaSemana) { fields.push('diaSemana = ?'); values.push(diaSemana); }
    if (horaInicio) { fields.push('horaInicio = ?'); values.push(horaInicio); }
    if (horaFim) { fields.push('horaFim = ?'); values.push(horaFim); }

    // Adiciona o idDisponibilidade ao final dos valores para a cláusula WHERE
    values.push(idDisponibilidade);

    const query = `UPDATE Disponibilidade SET ${fields.join(', ')} WHERE idDisponibilidade = ?`;
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Erro ao atualizar disponibilidade:', err);
            // 1062: Duplicate Entry (conflito de diaSemana com outro registro do mesmo funcionário)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'A nova alteração de dia conflita com um registro já existente para este funcionário.' });
            }
            return res.status(500).json({ error: 'Erro interno ao atualizar a disponibilidade.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Disponibilidade não encontrada ou nenhum dado alterado.' });
        }

        res.status(200).json({ message: 'Disponibilidade atualizada com sucesso.' });
    });
});

// ====================================================================
// ROTA 4: DELETAR DISPONIBILIDADE (DELETE /disponibilidade/:idDisponibilidade)
// ====================================================================
router.delete('/:idDisponibilidade', (req, res) => {
    const { idDisponibilidade } = req.params;

    const query = 'DELETE FROM Disponibilidade WHERE idDisponibilidade = ?';
    
    db.query(query, [idDisponibilidade], (err, result) => {
        if (err) {
            console.error('Erro ao deletar disponibilidade:', err);
            return res.status(500).json({ error: 'Erro interno ao deletar a disponibilidade.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Disponibilidade não encontrada.' });
        }

        res.status(200).json({ message: 'Disponibilidade deletada com sucesso.' });
    });
});

// ====================================================================
// ROTA 5: CALCULAR HORÁRIOS LIVRES (POST /disponibilidade/livre) - PÚBLICA
//
// Esta rota é crucial para o formulário de agendamento público.
// Recebe: idFuncionario, data ('YYYY-MM-DD'), duracao (minutos)
// Retorna: Lista de slots livres no formato { dataHoraInicio, dataHoraFim }
// ====================================================================
router.post('/livre', (req, res) => {
    const { idFuncionario, data, duracao } = req.body; 

    if (!idFuncionario || !data || !duracao || duracao <= 0) {
        return res.status(400).json({ error: 'Parâmetros inválidos: idFuncionario, data e duracao (> 0) são obrigatórios.' });
    }

    const durationMinutes = parseInt(duracao);
    const interval = 30 * 60 * 1000; // Granularidade de busca: 30 minutos em milissegundos
    const serviceDurationMs = durationMinutes * 60 * 1000;
    
    // Helper para determinar o dia da semana em Português (assumindo que o DB usa os nomes completos)
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    
    try {
        // Cria um objeto Date. Adicionar 'T00:00:00' ajuda o JS a interpretar como a hora local do início do dia.
        const dateObj = new Date(data + 'T00:00:00'); 
        if (isNaN(dateObj)) {
            return res.status(400).json({ error: 'Formato de data inválido. Use YYYY-MM-DD.' });
        }
        const diaSemana = dayNames[dateObj.getDay()];
        
        // -----------------------------------------------------
        // 1. Obter a Disponibilidade Fixa (Horário de Trabalho)
        // -----------------------------------------------------
        const scheduleQuery = `
            SELECT horaInicio, horaFim
            FROM Disponibilidade 
            WHERE idFuncionario = ? AND diaSemana = ?
        `;
        
        db.query(scheduleQuery, [idFuncionario, diaSemana], (err, schedule) => {
            if (err) {
                console.error('Erro ao buscar horário de trabalho:', err);
                return res.status(500).json({ error: 'Erro interno ao buscar horário de trabalho.' });
            }
            
            if (schedule.length === 0) {
                return res.status(200).json([]); // Nenhum horário de trabalho definido
            }

            const { horaInicio, horaFim } = schedule[0];

            // -----------------------------------------------------
            // 2. Obter Agendamentos Existentes
            // -----------------------------------------------------
            // Busca agendamentos PENDENTES e CONFIRMADOS para bloquear o tempo
            const bookingsQuery = `
                SELECT 
                    dataHoraInicio, 
                    dataHoraFim 
                FROM Agendamento 
                WHERE idFuncionario = ? 
                  AND DATE(dataHoraInicio) = ? 
                  AND status IN ('PENDENTE', 'CONFIRMADO')
                ORDER BY dataHoraInicio
            `;
            
            db.query(bookingsQuery, [idFuncionario, data], (err, bookings) => {
                if (err) {
                    console.error('Erro ao buscar agendamentos existentes:', err);
                    return res.status(500).json({ error: 'Erro interno ao buscar agendamentos.' });
                }

                // -----------------------------------------------------
                // 3. Cálculo de Slots Livres
                // -----------------------------------------------------
                
                // Converte hora de início/fim de trabalho (TIME) para objeto Date no dia específico (Timestamp)
                const workStartTS = new Date(`${data}T${horaInicio}`).getTime();
                const workEndTS = new Date(`${data}T${horaFim}`).getTime();
                
                let currentIntervalStartTS = workStartTS;
                const freeSlots = [];
                
                const blockedIntervals = bookings.map(b => ({
                    start: new Date(b.dataHoraInicio).getTime(),
                    end: new Date(b.dataHoraFim).getTime()
                }));

                while (currentIntervalStartTS < workEndTS) {
                    
                    // 1. Encontra o próximo bloqueio que comece DEPOIS ou EXATAMENTE na hora atual
                    const nextBooking = blockedIntervals.find(booking => booking.start >= currentIntervalStartTS);
                    
                    // Define o ponto final para o próximo slot livre
                    let potentialEndTS = workEndTS; 
                    
                    if (nextBooking) {
                        // O próximo bloqueio é o fim do nosso slot livre potencial
                        potentialEndTS = nextBooking.start;
                    }

                    // 2. Garante que o intervalo de tempo seja maior que a duração do serviço
                    const availableDuration = potentialEndTS - currentIntervalStartTS;
                    
                    if (availableDuration >= serviceDurationMs) {
                        
                        // Geramos slots em incrementos (interval) de 30 minutos
                        let checkTime = currentIntervalStartTS;
                        
                        while (checkTime + serviceDurationMs <= potentialEndTS) {
                            const slotStart = new Date(checkTime);
                            const slotEnd = new Date(checkTime + serviceDurationMs);

                            // Formato ISO string YYYY-MM-DDTHH:MM para o frontend
                            // Slice(0, 16) remove segundos e timezone para uma representação simples
                            freeSlots.push({
                                dataHoraInicio: slotStart.toISOString().slice(0, 16), 
                                dataHoraFim: slotEnd.toISOString().slice(0, 16)      
                            });
                            
                            checkTime += interval; // Avança 30 minutos
                        }
                    }

                    // 4. Move o currentIntervalStartTS para o fim do próximo bloqueio
                    if (nextBooking) {
                        // Se encontramos um próximo agendamento, pulamos para o fim dele
                        currentIntervalStartTS = nextBooking.end;
                    } else {
                        // Se não há mais agendamentos, saímos do loop
                        break;
                    }
                }

                res.status(200).json(freeSlots);
                
            });
        });
    } catch (error) {
        // Erro na criação do objeto Date
        console.error('Erro na preparação dos dados de horário:', error);
        return res.status(500).json({ error: 'Erro interno na preparação da data.' });
    }
});


module.exports = router;