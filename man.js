// man.js

// 1. DADOS DE TESTE (Simulando dados que viriam do backend/API)
const servicos = [

    { id: 1, nome: "Manicure", duracao: 60 },
    { id: 2, nome: "Pedicure", duracao: 60 },
    { id: 3, nome: "Sobrancelha", duracao: 30 },
    { id: 4, nome: "Coloracao", duracao: 30 },
    { id: 5, nome: "Escova Simples", duracao: 60 },
    { id: 6, nome: "Escova Modelada", duracao: 60 },
    { id: 7, nome: "Corte", duracao: 60 },
    { id: 8, nome: "Maquiagem", duracao: 60 },
    { id: 9, nome: "Penteado", duracao: 120 },
    { id: 10, nome: "Depilação Buço", duracao: 30 },
    { id: 11, nome: "Progressiva", duracao: 120 },
    { id: 12, nome: "Selante", duracao: 120 },
    { id: 13, nome: "Progressiva Volumosa", duracao: 180 }
];

const profissionais = [
    { id: 1, nome: "Cleonice (Cabeleireira)", servicos_permitidos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] }, // Corte, Tintura
    { id: 2, nome: "Gabriela (Manicure)", servicos_permitidos: [2] }, // Manicure
    { id: 3, nome: "Carla Oliveira (Designer)", servicos_permitidos: [3] }, // Sobrancelhas
    { id: 4, nome: "Ana Paula (Cabeleireira)", servicos_permitidos: [1, 4] } // Corte, Tintura
];

// 2. SELEÇÃO DE ELEMENTOS DOM
const selectService = document.getElementById('select-servico');
const selectProfissional = document.getElementById('select-profissional');
const profissionalSelecao = document.getElementById('profissional-selecao'); // div/section que contém o select do profissional
const horarioSelecao = document.getElementById('horario-selecao'); // div/section que contém o select do horário

// 3. VARIÁVEL DE ESTADO
let servicoSelecionadoId = null;

// ====================================================================================
// FUNÇÕES DE CARREGAMENTO
// ====================================================================================

// Função para preencher a lista de serviços
function carregarServicos() {
    servicos.forEach(servico => {
        const option = document.createElement('option');
        option.value = servico.id;
        option.textContent = `${servico.nome} (${servico.duracao} min)`;
        selectService.appendChild(option);
    });
}

// Função para carregar os profissionais disponíveis com base no serviço
function carregarProfissionais(servicoId) {
    // 1. Limpa a lista anterior (exceto a primeira opção)
    selectProfissional.innerHTML = '<option value="">Selecione um Profissional</option>';
    
    // 2. Filtra os profissionais que podem realizar o serviço
    const profissionaisDisponiveis = profissionais.filter(prof => 
        prof.servicos_permitidos.includes(parseInt(servicoId))
    );

    // 3. Preenche a lista de profissionais
    profissionaisDisponiveis.forEach(prof => {
        const option = document.createElement('option');
        option.value = prof.id;
        option.textContent = prof.nome;
        selectProfissional.appendChild(option);
    });

    // 4. Mostra a seção de profissional se houver algum disponível
    if (profissionaisDisponiveis.length > 0) {
        profissionalSelecao.style.display = 'block';
    } else {
        profissionalSelecao.style.display = 'none';
        alert('Nenhum profissional encontrado para este serviço.');
    }
}

// ====================================================================================
// LISTENERS DE EVENTOS
// ====================================================================================

// 1. Quando a página carrega, preenche os serviços
document.addEventListener('DOMContentLoaded', carregarServicos);

// 2. Adiciona evento para quando um serviço for selecionado
selectService.addEventListener('change', function() {
    servicoSelecionadoId = this.value; // Atualiza o ID do serviço

    if (servicoSelecionadoId !== "") { // Se algo foi selecionado
        carregarProfissionais(servicoSelecionadoId); // Chama a função que preenche os profissionais
        // Esconde a próxima seção até que o profissional seja escolhido
        horarioSelecao.style.display = 'none'; 
    } else { // Se selecionou a opção vazia
        // Esconde as seções subsequentes
        profissionalSelecao.style.display = 'none'; //
        horarioSelecao.style.display = 'none'; //
    }
});

// 3. Adiciona evento para quando um profissional for selecionado
selectProfissional.addEventListener('change', function() {
    // Se o usuário selecionou um profissional
    if (this.value !== "") { //
        
        // VARIÁVEIS NECESSÁRIAS
        const servico = selectService.value; // ID do Serviço selecionado
        const profissional = this.value; // ID do Profissional selecionado
        // Mock da Data (ajustaremos depois que o usuário puder selecionar a data)
        const dataHoje = new Date().toISOString().split('T')[0]; 

        // Mostra a próxima seção (Escolha a Data e Hora)
        horarioSelecao.style.display = 'block'; //

        // CHAMADA AO BACKEND (FETCH)
        fetch('/api/disponibilidade', { 
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ // Converte as variáveis para JSON
                servico: servico,
                profissional: profissional,
                data: dataHoje
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na requisição: ' + response.statusText); // Trata erros HTTP
            }
            return response.json(); // Converte a resposta para JSON
        })
        .then(data => {
            console.log('Horários Disponíveis Recebidos:', data.disponiveis); //
            preencherSelectHorario(data.disponiveis); // Chama a função para preencher o select
        })
        .catch(error => {
            console.error('Erro ao buscar horários:', error); // Exibe o erro no console
            alert('Não foi possível carregar os horários. Tente novamente.'); // Avisa o usuário
        });
        
    } else {
        // Esconde a próxima seção
        horarioSelecao.style.display = 'none'; //
    }
});

// ====================================================================================
// FUNÇÃO AUXILIAR (Colocada no final por organização)
// ====================================================================================

function preencherSelectHorario(horarios) {
    // *** ATENÇÃO: VERIFIQUE se 'select-horario' é o ID correto do seu <select> no HTML ***
    const selectHorario = document.getElementById('select-horario'); 
    
    // Limpa as opções antigas e adiciona a opção padrão
    selectHorario.innerHTML = '<option value="">Selecione um horário</option>'; 
    
    // Preenche o select com os horários recebidos do backend
    horarios.forEach(hora => {
        const option = document.createElement('option');
        option.value = hora;
        option.textContent = hora;
        selectHorario.appendChild(option);
    });
}

console.log('Script man.js carregado com sucesso!');