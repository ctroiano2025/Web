// =========================================================================
// LÓGICA DE SIMULAÇÃO DE LOGIN & UTILIDADES
// =========================================================================
const loginContainer = document.getElementById('login-container');
const gerenciamentoContainer = document.getElementById('gerenciamento-container');
const agendamentoArea = document.getElementById('agendamento-area');
const formLogin = document.getElementById('form-login');
const loginMessage = document.getElementById('login-message');
const btnLogout = document.getElementById('btn-logout');
const statusGerenciamento = document.getElementById('status-gerenciamento');
const agendamentoStatus = document.getElementById('agendamento-status');
const availabilityStatus = document.getElementById('availability-status'); 

// NOVO: Campo oculto para guardar o ID do agendamento que está sendo editado
const agendamentoIdInput = document.getElementById('agendamento-id') || document.createElement('input'); 
agendamentoIdInput.type = 'hidden';
agendamentoIdInput.id = 'agendamento-id';
agendamentoIdInput.value = '';
if (document.getElementById('formAgendamento')) {
    document.getElementById('formAgendamento').prepend(agendamentoIdInput);
}
const btnAgendar = document.querySelector('#formAgendamento button[type="submit"]'); // Botão de submit


// Estado inicial da aplicação
if (loginContainer && agendamentoArea) {
    loginContainer.classList.remove('hidden');
}

if (gerenciamentoContainer) {
    gerenciamentoContainer.classList.add('hidden');
}

// FUNÇÃO DE UTILIDADE PARA MENSAGENS DE STATUS
function showStatus(message, isSuccess = true, targetElement = statusGerenciamento) {
    if (!targetElement) return;
    targetElement.textContent = message;
    targetElement.className = `px-4 py-2 mb-4 rounded-lg text-sm ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`;
    targetElement.classList.remove('hidden');
    setTimeout(() => {
        targetElement.classList.add('hidden');
    }, 5000);
}


if (formLogin) {
    formLogin.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username-input').value;
        const password = document.getElementById('password-input').value;

        if (username === 'admin' && password === '123') {
            if (loginContainer) loginContainer.classList.add('hidden');
            if (gerenciamentoContainer) gerenciamentoContainer.classList.remove('hidden');
            if (loginMessage) loginMessage.classList.add('hidden');
            
            renderClients(); 
            renderServices();
            renderEmployees();
            populateSelects();
            renderAgenda();
        } else {
            if (loginMessage) {
                loginMessage.textContent = 'Usuário ou senha inválidos.';
                loginMessage.className = 'bg-red-100 text-red-700 px-4 py-2 mt-2 rounded-lg text-sm';
                loginMessage.classList.remove('hidden');
            }
        }
    });
}

if (btnLogout) {
    btnLogout.addEventListener('click', function() {
        if (gerenciamentoContainer) gerenciamentoContainer.classList.add('hidden');
        if (agendamentoArea) agendamentoArea.classList.remove('hidden');
        if (loginContainer) loginContainer.classList.remove('hidden');
        if (formLogin) formLogin.reset();
        showStatus('Você foi desconectado.', false);
    });
}

// =========================================================================
// FUNÇÕES DE MANIPULAÇÃO DE DATAS E HORAS (UTILITIES)
// =========================================================================

// Retorna o dia da semana em formato de chave (seg, ter, etc.)
function getDayKey(dateString) {
    const date = new Date(dateString.replace(/-/g, '/')); // Corrige formatação para compatibilidade
    const day = date.getDay(); // 0 (Domingo) a 6 (Sábado)
    const keys = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    return keys[day];
}

// Converte hora (HH:MM) para minutos a partir da meia-noite (para comparação)
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// Calcula o horário de término (HH:MM)
function calculateEndTime(startTime, durationMinutes) {
    let totalMinutes = timeToMinutes(startTime) + durationMinutes;
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    
    // Formata HORA e MINUTO com zero à esquerda (HH:MM)
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes}`;
}

// Função para limpar o formulário de agendamento e o estado de edição
function resetAppointmentForm() {
    formAgendamento.reset();
    agendamentoIdInput.value = ''; // Remove o ID de edição
    btnAgendar.textContent = 'Finalizar Agendamento'; // Volta o texto do botão
    btnAgendar.classList.remove('bg-blue-500'); // Remove cor de edição
    btnAgendar.classList.add('bg-green-600'); // Volta a cor padrão
    duracaoEstimadaEl.textContent = '0 min';
    precoEstimadoEl.textContent = 'R$ 0,00';
    agendamentoServicoSelect.dispatchEvent(new Event('change')); // Reinicializa a estimativa
}

// =========================================================================
// CÓDIGO CRUD DE CLIENTES, SERVIÇOS, FUNCIONÁRIOS, DISPONIBILIDADE (INALTERADOS)
// (Mantidos simplificados aqui para focar na edição de Agendamento)
// =========================================================================
let clients = JSON.parse(localStorage.getItem('clients')) || [];
let nextClientId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
function saveClients() { localStorage.setItem('clients', JSON.stringify(clients)); }
function renderClients() { /* ... */ populateSelects(); }
if (document.getElementById('client-form')) { /* ... */ }
function editClient(id) { /* ... */ }
function resetClientForm() { /* ... */ }
function deleteClient(id) { /* ... */ }

let services = JSON.parse(localStorage.getItem('services')) || [];
let nextServiceId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
function saveServices() { localStorage.setItem('services', JSON.stringify(services)); }
function renderServices() { /* ... */ populateSelects(); }
if (document.getElementById('service-form')) { /* ... */ }
function editService(id) { /* ... */ }
function resetServiceForm() { /* ... */ }
function deleteService(id) { /* ... */ }

let employees = JSON.parse(localStorage.getItem('employees')) || [];
let nextEmployeeId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
function saveEmployees() { localStorage.setItem('employees', JSON.stringify(employees)); }
function renderEmployees() { /* ... */ populateSelects(); }
if (document.getElementById('employee-form')) { /* ... */ }
function editEmployee(id) { /* ... */ }
function resetEmployeeForm() { /* ... */ }
function deleteEmployee(id) { /* ... */ }

let employeeAvailability = JSON.parse(localStorage.getItem('employeeAvailability')) || {};
const daysOfWeek = [
    { key: 'seg', nome: 'Segunda-feira' },
    { key: 'ter', nome: 'Terça-feira' },
    { key: 'qua', nome: 'Quarta-feira' },
    { key: 'qui', nome: 'Quinta-feira' },
    { key: 'sex', nome: 'Sexta-feira' },
    { key: 'sab', nome: 'Sábado' },
    { key: 'dom', nome: 'Domingo' }
];
// (Funções de Disponibilidade: saveAvailability, populateAvailabilitySelect, loadAvailabilityForm, etc. - INALTERADAS)
// (A lógica interna destas funções foi mantida, mas omitida aqui para brevidade e foco na Edição de Agendamento)

// =========================================================================
// CÓDIGO CRUD DE AGENDAMENTO (ATUALIZADO PARA SUPORTAR EDIÇÃO)
// =========================================================================
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let nextAppointmentId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
const agendamentoClienteSelect = document.getElementById('agendamento-cliente');
const agendamentoServicoSelect = document.getElementById('agendamento-servico');
const agendamentoFuncionarioSelect = document.getElementById('agendamento-funcionario');
const agendamentoDataInput = document.getElementById('agendamento-data');
const agendamentoHoraInput = document.getElementById('agendamento-hora');
const duracaoEstimadaEl = document.getElementById('duracao-estimada');
const precoEstimadoEl = document.getElementById('preco-estimado');
const filtroDataInput = document.getElementById('filtro-data');
const listaAgendamentosDiv = document.getElementById('lista-agendamentos');
const msgVazioEl = document.getElementById('msg-vazio');
const btnRecarregar = document.getElementById('btn-recarregar');

function saveAppointments() { localStorage.setItem('appointments', JSON.stringify(appointments)); }

function populateSelects() {
    // Cliente
    const populateClient = (select) => {
        select.innerHTML = '<option value="">Selecione o Cliente</option>';
        clients.forEach(c => { select.innerHTML += `<option value="${c.id}">${c.nome} (${c.telefone})</option>`; });
    };

    // Serviço
    const populateService = (select) => {
        select.innerHTML = '<option value="">Selecione o Serviço</option>';
        services.forEach(s => { select.innerHTML += `<option value="${s.id}" data-duracao="${s.duracao}" data-preco="${s.preco}">${s.nome} (${s.duracao} min)</option>`; });
    };

    // Funcionário
    const populateEmployee = (select) => {
        select.innerHTML = '<option value="">Selecione o Profissional</option>';
        employees.forEach(e => { select.innerHTML += `<option value="${e.id}">${e.nome} (${e.cargo})</option>`; });
    };

    populateClient(agendamentoClienteSelect);
    populateService(agendamentoServicoSelect);
    populateEmployee(agendamentoFuncionarioSelect);

    // Funcionário (Disponibilidade)
    // Se as variáveis de disponibilidade estivessem aqui, a chamada seria: populateAvailabilitySelect();
}

if (agendamentoServicoSelect) {
    agendamentoServicoSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption && selectedOption.value) {
            const duracao = selectedOption.getAttribute('data-duracao');
            const preco = parseFloat(selectedOption.getAttribute('data-preco') || 0);

            duracaoEstimadaEl.textContent = `${duracao || 0} min`;
            
            const precoFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);
            precoEstimadoEl.textContent = precoFormatado;
        } else {
            duracaoEstimadaEl.textContent = '0 min';
            precoEstimadoEl.textContent = 'R$ 0,00';
        }
    });
}

// -------------------------------------------------------------------------
// NOVA FUNÇÃO: Carregar dados do agendamento para Edição
// -------------------------------------------------------------------------
window.editAppointment = function(id) {
    const app = appointments.find(a => a.id === id);
    if (!app) {
        showStatus('Agendamento não encontrado para edição.', false, statusGerenciamento);
        return;
    }

    // 1. Preenche o campo ID oculto
    agendamentoIdInput.value = app.id;

    // 2. Preenche os campos do formulário
    agendamentoClienteSelect.value = app.clienteId;
    agendamentoServicoSelect.value = app.servicoId;
    agendamentoFuncionarioSelect.value = app.funcionarioId;
    agendamentoDataInput.value = app.data;
    agendamentoHoraInput.value = app.hora;
    
    // Dispara o evento change para atualizar Duração/Preço estimado
    agendamentoServicoSelect.dispatchEvent(new Event('change'));

    // 3. Atualiza o botão para indicar edição
    btnAgendar.textContent = 'Atualizar Agendamento';
    btnAgendar.classList.remove('bg-green-600');
    btnAgendar.classList.add('bg-blue-500');
    
    // (Opcional) Rolagem para o topo do formulário
    document.getElementById('agendamento-form').scrollIntoView({ behavior: 'smooth' });

    // Se estiver na aba Agenda, muda para a aba Clientes/Agendamento para facilitar a edição
    document.querySelectorAll('.nav-tabs .nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
};


// 3. Submissão do Formulário de Agendamento (CREATE / UPDATE) - COM VALIDAÇÃO
if (formAgendamento) {
    formAgendamento.addEventListener('submit', function(event) {
        event.preventDefault();

        const isEditing = !!agendamentoIdInput.value;
        const appointmentId = parseInt(agendamentoIdInput.value);

        const clienteId = parseInt(agendamentoClienteSelect.value);
        const servicoId = parseInt(agendamentoServicoSelect.value);
        const funcionarioId = parseInt(agendamentoFuncionarioSelect.value);
        const data = agendamentoDataInput.value;
        const horaInicio = agendamentoHoraInput.value;

        // 1. Validação básica de campos
        if (!clienteId || !servicoId || !funcionarioId || !data || !horaInicio) {
            showStatus('Por favor, preencha todos os campos do agendamento.', false, agendamentoStatus);
            return;
        }
        
        const selectedService = services.find(s => s.id === servicoId);
        if (!selectedService) {
            showStatus('Serviço inválido.', false, agendamentoStatus);
            return;
        }
        
        const duracao = selectedService.duracao;
        const horaFim = calculateEndTime(horaInicio, duracao);
        const dayKey = getDayKey(data);
        const funcionarioName = employees.find(e => e.id === funcionarioId)?.nome || 'O profissional';

        
        // 2. VALIDAÇÃO DE HORÁRIO DE TRABALHO (Disponibilidade Semanal)
        const availability = employeeAvailability[funcionarioId];
        
        if (!availability || !availability[dayKey] || !availability[dayKey].active) {
            showStatus(`${funcionarioName} não trabalha na ${daysOfWeek.find(d => d.key === dayKey)?.nome || 'data selecionada'}.`, false, agendamentoStatus);
            return;
        }

        const workStart = availability[dayKey].start;
        const workEnd = availability[dayKey].end;
        
        const startMinutes = timeToMinutes(horaInicio);
        const endMinutes = timeToMinutes(horaFim);
        const workStartMinutes = timeToMinutes(workStart);
        const workEndMinutes = timeToMinutes(workEnd);
        
        if (startMinutes < workStartMinutes || endMinutes > workEndMinutes) {
            showStatus(`O agendamento (${horaInicio} - ${horaFim}) está fora do horário de trabalho de ${funcionarioName} (${workStart} - ${workEnd}).`, false, agendamentoStatus);
            return;
        }


        // 3. VALIDAÇÃO DE CONFLITO DE AGENDA (Sobreposição)
        const conflict = appointments.find(app => {
            // Ignorar o próprio agendamento que está sendo editado
            if (isEditing && app.id === appointmentId) return false; 

            // Verifica se é o mesmo funcionário e mesma data
            if (app.funcionarioId === funcionarioId && app.data === data) {
                const existingStart = timeToMinutes(app.hora);
                const existingService = services.find(s => s.id === app.servicoId);
                const existingDuration = existingService ? existingService.duracao : 0;
                const existingEnd = existingStart + existingDuration;

                const startsBeforeExistingEnds = startMinutes < existingEnd; 
                const endsAfterExistingStarts = endMinutes > existingStart;

                return startsBeforeExistingEnds && endsAfterExistingStarts;
            }
            return false;
        });

        if (conflict) {
            const clienteConflito = clients.find(c => c.id === conflict.clienteId)?.nome || 'Um cliente';
            showStatus(`Conflito: ${funcionarioName} já tem um agendamento com ${clienteConflito} na mesma faixa de horário.`, false, agendamentoStatus);
            return;
        }


        // 4. Criação ou Atualização do Agendamento
        const newAppointmentData = {
            clienteId: clienteId,
            servicoId: servicoId,
            funcionarioId: funcionarioId,
            data: data,
            hora: horaInicio,
            duracao: duracao,
            preco: selectedService.preco,
        };

        if (isEditing) {
            // Lógica de Atualização
            const appIndex = appointments.findIndex(a => a.id === appointmentId);
            if (appIndex !== -1) {
                appointments[appIndex] = { ...appointments[appIndex], ...newAppointmentData }; // Mantém timestamp original
                showStatus(`Agendamento ID **${appointmentId}** atualizado com sucesso!`, true, agendamentoStatus);
            }
        } else {
            // Lógica de Criação (Novo)
            const newAppointment = {
                id: nextAppointmentId++,
                ...newAppointmentData,
                timestamp: new Date().toISOString()
            };
            appointments.push(newAppointment);
            showStatus(`Novo agendamento para ${data} às ${horaInicio} concluído com sucesso!`, true, agendamentoStatus);
        }

        saveAppointments();
        resetAppointmentForm(); // Limpa e reseta o estado do formulário
        
        // Renderiza a agenda novamente
        if (document.getElementById('agenda-tab') && document.getElementById('agenda-tab').classList.contains('active')) {
            renderAgenda();
        }
    });
}


// 4. Renderizar a Agenda (READ)
function renderAgenda() {
    if (!listaAgendamentosDiv) return;

    let filterDate = filtroDataInput.value;
    // (Lógica para definir filterDate se estiver vazio - INALTERADA)

    const todayAppointments = appointments.filter(a => a.data === filterDate).sort((a, b) => a.hora.localeCompare(b.hora));

    listaAgendamentosDiv.innerHTML = '';

    if (todayAppointments.length === 0) {
        msgVazioEl.classList.remove('hidden');
        return;
    }
    
    msgVazioEl.classList.add('hidden');

    todayAppointments.forEach(app => {
        const cliente = clients.find(c => c.id === app.clienteId) || { nome: 'Cliente Excluído', telefone: 'N/A' };
        const servico = services.find(s => s.id === app.servicoId) || { nome: 'Serviço Excluído', duracao: '??', preco: 0 };
        const funcionario = employees.find(e => e.id === app.funcionarioId) || { nome: 'Profissional Excluído' };
        
        const horaFim = calculateEndTime(app.hora, app.duracao);
        const precoFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(app.preco);

        const card = document.createElement('div');
        card.className = 'p-4 border rounded shadow-md bg-gray-50';
        card.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h4 class="text-xl font-bold">${app.hora} - ${horaFim} | ${servico.nome}</h4>
                <span class="text-sm text-gray-500">ID: ${app.id}</span>
            </div>
            <p><strong>Cliente:</strong> ${cliente.nome} (${cliente.telefone || 'N/A'})</p>
            <p><strong>Profissional:</strong> ${funcionario.nome}</p>
            <p><strong>Duração:</strong> ${app.duracao} min | <strong>Valor:</strong> ${precoFormatado}</p>
            <div class="mt-2 text-right space-x-2">
                <button class="bg-blue-500 py-1 px-3 text-white rounded text-sm" onclick="editAppointment(${app.id})">Editar</button>
                <button class="bg-red-500 py-1 px-3 text-white rounded text-sm" onclick="deleteAppointment(${app.id})">Cancelar</button>
            </div>
        `;
        listaAgendamentosDiv.appendChild(card);
    });
}

// 5. Deletar Agendamento (DELETE)
function deleteAppointment(id) {
    const appointmentIndex = appointments.findIndex(a => a.id === id);
    if (appointmentIndex !== -1 && confirm('Tem certeza que deseja cancelar este agendamento?')) {
        appointments.splice(appointmentIndex, 1);
        saveAppointments();
        renderAgenda();
        showStatus(`Agendamento cancelado com sucesso!`, false, statusGerenciamento);
        // Garante que o modo de edição seja resetado se o agendamento em edição for excluído
        if (agendamentoIdInput.value == id) {
            resetAppointmentForm();
        }
    }
}

// Eventos de Filtro e Recarga da Agenda (INALTERADOS)
// ...

// LÓGICA DE NAVEGAÇÃO ENTRE ABAS (INALTERADA)
// ...

// Inicialização
populateSelects();