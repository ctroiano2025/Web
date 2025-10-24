// Dados de teste que viriam do seu backend (API)
const servicos = [
    { id: 1, nome: "Corte Feminino", duracao: 60 },
    { id: 2, nome: "Manicure e Pedicure", duracao: 90 },
    { id: 3, nome: "Design de Sobrancelhas", duracao: 45 },
    { id: 4, nome: "Tintura", duracao: 120 }
];


// Seleciona o elemento <select> onde os serviços serão listados
const selectServico = document.getElementById('select-servico');
const profissionalSelecao = document.getElementById('profissional-selecao');

// ... (servicos array já existe) ...
// ... (servicos e profissionais arrays já existem) ...
// ... (const selectServico e profissionalSelecao já existem) ...

const selectProfissional = document.getElementById('select-profissional');
const horarioSelecao = document.getElementById('horario-selecao');



// Dados de teste para profissionais (Associando quais serviços cada um faz)
const profissionais = [
    { id: 1, nome: "Maria Silva (Cabeleireira)", servicos_permitidos: [1, 4] }, // Corte, Tintura
    { id: 2, nome: "Gabriela (Manicure)", servicos_permitidos: [2] },         // Manicure
    { id: 3, nome: "Carla Oliveira (Designer)", servicos_permitidos: [3] },     // Sobrancelhas
    { id: 4, nome: "Ana Paula (Cabeleireira)", servicos_permitidos: [1, 4] }    // Corte, Tintura
];

// ... (Restante do seu código) ...

// Função para preencher a lista de serviços
function carregarServicos() {
    // Itera sobre o array de serviços de teste
    servicos.forEach(servico => {
        // Cria um novo elemento <option>
        const option = document.createElement('option');
        
        // Define o valor (id) e o texto (nome)
        option.value = servico.id;
        option.textContent = `${servico.nome} (${servico.duracao} min)`;
        
        // Adiciona a opção ao select
        selectServico.appendChild(option);
    });
}

// Quando a página carrega, preenche os serviços
document.addEventListener('DOMContentLoaded', carregarServicos);



// Função para carregar os profissionais disponíveis com base no serviço
function carregarProfissionais(servicoId) {
    // 1. Limpa a lista anterior (exceto a primeira opção)
    selectProfissional.innerHTML = '<option value="">Selecione um Profissional</option>';

    // 2. Filtra os profissionais que podem realizar o serviço
    // O parseInt é importante para garantir que a comparação seja feita corretamente
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
    
    // Mostra a seção de profissional se houver algum disponível
    profissionalSelecao.style.display = 'block';
}

    // NOVO: Adiciona um evento para quando um serviço for selecionado
selectServico.addEventListener('change', function() {
    const servicoSelecionadoId = this.value;

    if (servicoSelecionadoId !== "") {
        carregarProfissionais(servicoSelecionadoId); // Chama a nova função
        // Esconde a próxima seção até que o profissional seja escolhido
        horarioSelecao.style.display = 'none'; 
    } else {
        // Esconde as seções subsequentes
        profissionalSelecao.style.display = 'none';
        horarioSelecao.style.display = 'none';
    }
});


// NOVO: Adiciona evento para quando um profissional for selecionado
selectProfissional.addEventListener('change', function() {
    // Se o usuário selecionou um profissional
    if (this.value !== "") {
        // Mostra a próxima seção (Escolha a Data e Hora)
        horarioSelecao.style.display = 'block';
    } else {
        horarioSelecao.style.display = 'none';
    }
});

// Chame o console.log para ver se o script está rodando
console.log('Script man.js carregado com sucesso!');