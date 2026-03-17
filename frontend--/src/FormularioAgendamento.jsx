import React, { useState } from 'react';
// Definição do componente FormularioAgendamento
const FormularioAgendamento = ({ onSubmit }) => {
  // Estado para armazenar os dados do novo agendamento
  const [novoAgendamento, setNovoAgendamento] = useState({
    nomeCliente: '',
    nomeFuncionario: '',
    nomeServico: '',
    data: '',
    hora: '',
    precoCobrado: '',
    telefoneCliente: '',
    duracao: '',
    status: 'PENDENTE', // Define um status inicial padrão
  });
  // Estado para mensagens de erro/sucesso
  const [mensagem, setMensagem] = useState(null);

  // Manipula a mudança nos campos de input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNovoAgendamento(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Manipula o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('Enviando dados...');

    // Combina data e hora para criar a dataHoraInicio
    const dataHoraInicio = `${novoAgendamento.data}T${novoAgendamento.hora}:00.000Z`;

    // Cria o objeto de dados a ser enviado para a API
    const dadosParaEnvio = {
      ...novoAgendamento,
      // A API espera dataHoraInicio e dataHoraFim (calculada pelo backend, mas vamos enviar a data/hora inicial)
      dataHoraInicio: dataHoraInicio,
      // Remover a data e hora separadas do objeto final
      data: undefined, 
      hora: undefined,
      // Converte preçoCobrado para número (a API espera um número)
      precoCobrado: parseFloat(novoAgendamento.precoCobrado), 
    };

    // Remove campos undefined para evitar erros de serialização
    Object.keys(dadosParaEnvio).forEach(key => dadosParaEnvio[key] === undefined && delete dadosParaEnvio[key]);


    try {
      const response = await fetch('http://localhost:3000/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnvio),
      });

      if (!response.ok) {
        // Tenta ler a mensagem de erro do backend
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro de rede: ${response.status} ${response.statusText}`);
      }

      const agendamentoCriado = await response.json();
      setMensagem(`SUCESSO: Agendamento criado para ${agendamentoCriado.nomeCliente}!`);
      
      // Limpa o formulário após o sucesso
      setNovoAgendamento({
        nomeCliente: '',
        nomeFuncionario: '',
        nomeServico: '',
        data: '',
        hora: '',
        precoCobrado: '',
        telefoneCliente: '',
        duracao: '',
        status: 'PENDENTE',
      });

      // Chama a função passada pelo App.jsx para atualizar a lista
      onSubmit(agendamentoCriado);

    } catch (error) {
      console.error("Erro ao adicionar agendamento:", error.message);
      setMensagem(`ERRO: Falha ao cadastrar. ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Novo Agendamento</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Linha 1: Cliente e Funcionário */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nomeCliente" className="block text-sm font-medium text-gray-700">Nome do Cliente *</label>
            <input
              type="text"
              name="nomeCliente"
              id="nomeCliente"
              value={novoAgendamento.nomeCliente}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="nomeFuncionario" className="block text-sm font-medium text-gray-700">Nome do Funcionário *</label>
            <input
              type="text"
              name="nomeFuncionario"
              id="nomeFuncionario"
              value={novoAgendamento.nomeFuncionario}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Linha 2: Serviço e Preço */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nomeServico" className="block text-sm font-medium text-gray-700">Serviço *</label>
            <input
              type="text"
              name="nomeServico"
              id="nomeServico"
              value={novoAgendamento.nomeServico}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="precoCobrado" className="block text-sm font-medium text-gray-700">Preço (R$) *</label>
            <input
              type="number"
              name="precoCobrado"
              id="precoCobrado"
              value={novoAgendamento.precoCobrado}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Linha 3: Data e Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="data" className="block text-sm font-medium text-gray-700">Data *</label>
            <input
              type="date"
              name="data"
              id="data"
              value={novoAgendamento.data}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="hora" className="block text-sm font-medium text-gray-700">Hora *</label>
            <input
              type="time"
              name="hora"
              id="hora"
              value={novoAgendamento.hora}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Linha 4: Telefone e Duração */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="telefoneCliente" className="block text-sm font-medium text-gray-700">Telefone do Cliente</label>
            <input
              type="text"
              name="telefoneCliente"
              id="telefoneCliente"
              value={novoAgendamento.telefoneCliente}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="duracao" className="block text-sm font-medium text-gray-700">Duração (Ex: 01:00)</label>
            <input
              type="text"
              name="duracao"
              id="duracao"
              value={novoAgendamento.duracao}
              onChange={handleChange}
              placeholder="HH:mm"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Botão de Envio e Mensagem */}
        <div className="flex flex-col items-center pt-4">
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
          >
            Cadastrar Agendamento
          </button>
          {mensagem && (
            <p className={`mt-3 text-sm font-semibold ${mensagem.startsWith('SUCESSO') ? 'text-green-600' : 'text-red-600'}`}>
              {mensagem}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default FormularioAgendamento;