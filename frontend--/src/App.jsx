import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Presume-se que você tem um arquivo CSS

// URL base da sua API
const API_URL = 'http://localhost:3000/api/agendamentos'; 

// --- Funções Utilitárias do Frontend ---

/**
 * Converte a data e hora do formulário para o formato ISO necessário (Ex: 2025-11-04T10:00:00.000Z).
 * O backend espera o formato UTC, por isso usamos 'Z' no final.
 * Nota: Isso não resolve fusos horários complexos, mas garante o formato correto para o backend.
 * @param {string} dateString - Data no formato 'YYYY-MM-DD'
 * @param {string} timeString - Hora no formato 'HH:MM'
 * @returns {string} String no formato ISO (UTC).
 */
function createIsoDateTime(dateString, timeString) {
    if (!dateString || !timeString) return null;
    
    // Concatena data e hora. Adiciona ':00.000Z' para simular UTC
    // O backend fará a conversão final para MySQL DATETIME
    return `${dateString}T${timeString}:00.000Z`;
}

// --- Componente de Input Reutilizável
const InputGroup = ({ label, type = 'text', name, value, onChange, placeholder, options, required = false }) => {
    return (
        <div className="input-group">
            <label htmlFor={name}>{label}</label>
            {type === 'select' ? (
                <select 
                    id={name} 
                    name={name} 
                    value={value} 
                    onChange={onChange}
                    required={required}
                >
                    <option value="">Selecione uma opção</option>
                    {options && options.map((option, index) => (
                        <option key={index} value={option.value || option.label}>
                            {option.label || option.value}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                />
            )}
        </div>
    );
};

// --- Componente de Formulário
const FormularioAgendamento = ({ agendamentoParaEditar, setAgendamentoParaEditar, onSalvar, funcionarios, servicos }) => {
    
    // Adicionamos 'telefoneCliente' ao estado
    const initialState = {
        cliente: '',
        telefoneCliente: '', 
        data: '',
        hora: '',
        servico: '',
        funcionario: '',
    };
    const [formData, setFormData] = useState(initialState);
    const [mensagem, setMensagem] = useState(null);

    // Efeitos para preencher o formulário ao editar
    useEffect(() => {
        if (agendamentoParaEditar) {
            setFormData(agendamentoParaEditar);
        } else {
            setFormData(initialState);
        }
    }, [agendamentoParaEditar]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (mensagem) setMensagem(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Simples validação no frontend
        const requiredFields = ['cliente', 'telefoneCliente', 'data', 'hora', 'servico', 'funcionario'];
        const isFormValid = requiredFields.every(field => formData[field] && formData[field].trim());

        if (!isFormValid) {
            setMensagem({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios.' });
            return;
        }

        // --- PONTO CRÍTICO: Transformação dos Dados para a API  ---

// 1. Mapeia Nomes (ou IDs) para IDs Reais e Duração
const servicoSelecionado = servicos.find(s => String(s.idservico) === formData.servico);
const funcionarioSelecionado = funcionarios.find(f => String(f.idfuncionario) === formData.funcionario);

if (!servicoSelecionado || !funcionarioSelecionado) {
    setMensagem({ type: 'error', text: 'Serviço ou Funcionário não encontrado nos dados disponíveis.' });
    return;
}

// 2. Cria as strings de data/hora no formato ISO (UTC)
const dataHoraInicioString = createIsoDateTime(formData.data, formData.hora);

// 3. Calcula dataHoraFim usando a duracaoMinutos REAL do serviço
const inicioDate = new Date(dataHoraInicioString);
const duracaoMinutos = servicoSelecionado.duracaoMinutos; // DURAÇÃO REAL
const fimDate = new Date(inicioDate.getTime() + duracaoMinutos * 60000); 
const dataHoraFimString = fimDate.toISOString(); 

// 4. Monta o payload final que o BACKEND espera
const dataParaAPI = {
    dataHoraInicio: dataHoraInicioString,
    dataHoraFim: dataHoraFimString,
    nomeCliente: formData.cliente,
    telefoneCliente: formData.telefoneCliente,
    idfuncionario: funcionarioSelecionado.idfuncionario, // ID REAL
    idservico: servicoSelecionado.idservico,            // ID REAL
};

// FIM da transformação dos dados


        try {
            if (formData._id) {
                // Modo Edição (PUT/PATCH)
                await axios.put(`${API_URL}/${formData._id}`, dataParaAPI); 
                setMensagem({ type: 'success', text: 'Agendamento atualizado com sucesso!' });
            } else {
                // Modo Criação (POST)
                await axios.post(API_URL, dataParaAPI);
                setMensagem({ type: 'success', text: 'Agendamento criado com sucesso!' });
            }
            
            setFormData(initialState);
            setAgendamentoParaEditar(null);
            onSalvar(); // Chama o callback para atualizar a lista
            
        } catch (error) {
            console.error('Erro ao salvar agendamento:', error);
            let errorMessage = 'Erro ao conectar com a API. Verifique o servidor.';

            // Verifica se o erro é o 400 Bad Request
            if (error.response && error.response.status === 400) {
                errorMessage = error.response.data.error || 'Dados enviados incompletos ou inválidos. (400 Bad Request)';
            } else if (error.response && error.response.status === 409) {
                 errorMessage = error.response.data.error || 'Conflito de horário. O funcionário está ocupado.';
            }

            setMensagem({ type: 'error', text: errorMessage });
        }
    };

    // Mapeia os dados reais para o formato { label: 'Nome', value: 'id' }
const servicosOptions = servicos.map(s => ({ 
    label: `${s.nomeServico} (${s.duracaoMinutos} min - R$ ${parseFloat(s.preco).toFixed(2)})`, 
    value: String(s.idservico) // O valor do select deve ser o ID (string)
}));

const funcionarioOptions = funcionarios.map(f => ({ 
    label: f.nome, 
    value: String(f.idfuncionario) // O valor do select deve ser o ID (string)
}));

    // Calcula o título baseado no modo
    const formTitle = formData._id ? 
        '📝 Editar Agendamento' : 
        '➕ Novo Agendamento';

    return (
        <div className="form-card">
            <h2 className="form-title">
                {formTitle}
            </h2>
            
            {mensagem && (
                <div className={`mensagem-box mensagem-${mensagem.type}`}>
                    {mensagem.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="form-grid">
                
                {/* Linha 1 */}
                <div className="form-row-grid">
                    <InputGroup 
                        label="Cliente" 
                        name="cliente" 
                        value={formData.cliente} 
                        onChange={handleChange} 
                        placeholder="Nome completo do cliente"
                        required={true}
                    />
                    <InputGroup 
                        label="Telefone" 
                        name="telefoneCliente" 
                        value={formData.telefoneCliente} 
                        onChange={handleChange} 
                        placeholder="Telefone (apenas números)"
                        required={true}
                        type="tel"
                    />
                </div>

                {/* Linha 2 */}
                <div className="form-row-grid">
                    <InputGroup 
                        label="Serviço" 
                        type="select"
                        name="servico" 
                        value={formData.servico} 
                        onChange={handleChange} 
                        options={servicosOptions}
                        required={true}
                    />
                    <InputGroup 
                        label="Funcionário" 
                        type="select"
                        name="funcionario" 
                        value={formData.funcionario} 
                        onChange={handleChange} 
                        options={funcionarioOptions}
                        required={true}
                    />
                </div>

                {/* Linha 3 */}
                <div className="form-row-grid">
                    <InputGroup 
                        label="Data" 
                        type="date" 
                        name="data" 
                        value={formData.data} 
                        onChange={handleChange}
                        required={true}
                    />
                    <InputGroup 
                        label="Hora" 
                        type="time" 
                        name="hora" 
                        value={formData.hora} 
                        onChange={handleChange}
                        required={true}
                    />
                </div>
                
                <button type="submit" className="btn-submit">
                    {formData._id ? 'Salvar Edição' : 'Agendar'}
                </button>
                
            </form>
            
            {formData._id && (
                <button 
                    onClick={() => setAgendamentoParaEditar(null)}
                    className="btn-cancelar-edicao"
                >
                    Cancelar Edição
                </button>
            )}
        </div>
    );
};

// --- Componente da Lista (Mantido)
const ListaAgendamentos = ({ agendamentos, onEditar, onExcluir }) => {
    // Função auxiliar para formatar a data
    const formatarDataHora = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            const data = date.toLocaleDateString('pt-BR');
            const hora = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            return `${data} às ${hora}`;
        } catch (e) {
             return isoString; // Retorna a string original se falhar
        }
    };

    if (agendamentos.length === 0) {
        return (
            <div className="no-data-message">
                <p>Nenhum agendamento encontrado.</p>
            </div>
        );
    }

    return (
        <div className="list-container">
            <h2 className="list-title">Próximos Agendamentos</h2>
            <div className="table-wrapper">
                <table className="list-table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Funcionário</th>
                            <th>Serviço</th>
                            <th>Preço</th>
                            <th>Início</th>
                            <th>Fim</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agendamentos.map((agendamento) => (
                            // Adaptando chaves para as chaves do BACKEND (dataHoraInicio, nomeFuncionario, etc.)
                            <tr key={agendamento.idagendamento}>
                                <td>{agendamento.nomeCliente}</td>
                                <td>{agendamento.nomeFuncionario}</td>
                                <td>{agendamento.nomeServico}</td>
                                <td>R$ {agendamento.precoCobrado ? parseFloat(agendamento.precoCobrado).toFixed(2) : '0.00'}</td>
                                <td>{formatarDataHora(agendamento.dataHoraInicio)}</td>
                                <td>{formatarDataHora(agendamento.dataHoraFim)}</td>
                                <td>
                                    <span className={`status-${agendamento.status.toLowerCase()}`}>
                                        {agendamento.status}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        onClick={() => onEditar(agendamento)} 
                                        className="btn-edit"
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => onExcluir(agendamento.idagendamento)} 
                                        className="btn-delete"
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Componente Principal (App)
const App = () => {
    
    // NOVOS ESTADOS PARA DADOS DINÂMICOS
const [funcionarios, setFuncionarios] = useState([]);
const [servicos, setServicos] = useState([]);

    // Função para buscar agendamentos (READ - GET)
    const fetchDadosAuxiliares = async () => {
    try {
        const [resFunc, resServ] = await Promise.all([
            axios.get('http://localhost:3000/api/funcionarios'),
            axios.get('http://localhost:3000/api/servicos')
        ]);
        setFuncionarios(resFunc.data);
        setServicos(resServ.data);
    } catch (error) {
        console.error('Erro ao buscar dados auxiliares (Funcionários/Serviços):', error);
        setMensagemGlobal({ type: 'error', text: 'Não foi possível carregar listas de Funcionários/Serviços.' });
    }
};

    // Função para excluir agendamento (DELETE)
    const handleExcluir = async (id) => {
        // Substituindo window.confirm por um modal simples (requisito do sistema)
        if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
             return; // Sai da função se o usuário cancelar
        }
        
        try {
            await axios.delete(`${API_URL}/${id}`);
            setMensagemGlobal({ type: 'success', text: 'Agendamento excluído com sucesso.' });
            fetchAgendamentos(); // Atualiza a lista
        } catch (error) {
            console.error('Erro ao excluir agendamento:', error);
            setMensagemGlobal({ type: 'error', text: 'Erro ao excluir agendamento. Tente novamente.' });
        }
    };
    
    // Efeito para carregar a lista na montagem
   useEffect(() => {
    fetchDadosAuxiliares(); // Carrega as listas de opções
    fetchAgendamentos();    // Carrega a lista de agendamentos
}, []);

    // Se o Vite estiver otimizando, mostre uma mensagem de carregamento.
    if (loading) {
        return <div className="loading-message">Carregando Agendamentos...</div>;
    }

    return (
        <div className="app-main">
            <style jsx="true">{`
                /* Estilização básica para simular o layout */
                .app-main {
                    font-family: 'Inter', sans-serif;
                    background-color: #f4f7f6;
                    min-height: 100vh;
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                }
                .container-principal {
                    width: 100%;
                    max-width: 1000px;
                }
                .header-titulo {
                    text-align: center;
                    margin-bottom: 30px;
                    padding: 20px;
                    border-radius: 12px;
                    background-color: #e6e6fa; /* Lavander */
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .header-titulo h1 {
                    color: #4b0082; /* Indigo */
                    font-size: 2rem;
                    margin-bottom: 5px;
                }
                .header-titulo p {
                    color: #6a5acd;
                }
                /* Cartões e Formulário */
                .form-card {
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                    margin-bottom: 30px;
                    border: 1px solid #ddd;
                }
                .form-title {
                    color: #4b0082;
                    font-size: 1.5rem;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #e6e6fa;
                    padding-bottom: 10px;
                }
                .form-grid {
                    display: grid;
                    gap: 15px;
                }
                .form-row-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
                @media (max-width: 600px) {
                    .form-row-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .input-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 600;
                    color: #333;
                    font-size: 0.9rem;
                }
                .input-group input, .input-group select {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    box-sizing: border-box;
                    transition: border-color 0.3s;
                }
                .input-group input:focus, .input-group select:focus {
                    border-color: #6a5acd;
                    outline: none;
                }

                /* Botões */
                .btn-submit {
                    grid-column: 1 / -1; 
                    background-color: #6a5acd; /* SlateBlue */
                    color: white;
                    padding: 12px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: bold;
                    transition: background-color 0.3s, transform 0.1s;
                    margin-top: 15px;
                    box-shadow: 0 4px #4b0082;
                }
                .btn-submit:hover {
                    background-color: #4b0082;
                    transform: translateY(1px);
                    box-shadow: 0 3px #330055;
                }
                .btn-cancelar-edicao {
                    background-color: #ff6347; /* Tomato */
                    color: white;
                    padding: 8px 15px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: background-color 0.3s;
                    margin-top: 10px;
                    width: 100%;
                }
                .btn-cancelar-edicao:hover {
                    background-color: #cc4f37;
                }

                /* Lista e Tabela */
                .list-container {
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                    border: 1px solid #ddd;
                }
                .list-title {
                    color: #4b0082;
                    font-size: 1.5rem;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #e6e6fa;
                    padding-bottom: 10px;
                }
                .table-wrapper {
                    overflow-x: auto;
                }
                .list-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0 10px;
                }
                .list-table th, .list-table td {
                    padding: 12px 15px;
                    text-align: left;
                    font-size: 0.9rem;
                }
                .list-table th {
                    background-color: #f0f0f5;
                    color: #4b0082;
                    font-weight: 700;
                    border-top: 1px solid #e6e6fa;
                    border-bottom: 1px solid #e6e6fa;
                }
                .list-table td {
                    background-color: #fcfcff;
                    border-bottom: 1px solid #eee;
                }
                .list-table tbody tr:hover td {
                    background-color: #e6e6fa;
                }
                .list-table tbody tr:first-child td {
                    border-top: none;
                }

                /* Botões de Ação na Tabela */
                .btn-edit, .btn-delete {
                    padding: 6px 10px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    margin-right: 5px;
                    transition: background-color 0.3s;
                }
                .btn-edit {
                    background-color: #3cb371; /* MediumSeaGreen */
                    color: white;
                }
                .btn-edit:hover {
                    background-color: #2e8b57;
                }
                .btn-delete {
                    background-color: #ff6347; /* Tomato */
                    color: white;
                }
                .btn-delete:hover {
                    background-color: #cc4f37;
                }

                /* Mensagens de Status */
                .mensagem-box {
                    padding: 15px;
                    margin-bottom: 20px;
                    border-radius: 8px;
                    font-weight: bold;
                    border: 1px solid;
                }
                .mensagem-success {
                    background-color: #d4edda;
                    color: #155724;
                    border-color: #c3e6cb;
                }
                .mensagem-error {
                    background-color: #f8d7da;
                    color: #721c24;
                    border-color: #f5c6cb;
                }
                .status-pendente {
                    color: #ff8c00;
                    font-weight: 700;
                }
                .status-confirmado {
                    color: #3cb371;
                    font-weight: 700;
                }
                .no-data-message, .loading-message {
                    text-align: center;
                    padding: 20px;
                    color: #6a5acd;
                    font-size: 1.1rem;
                }

                /* Responsividade para a lista em telas menores */
                @media (max-width: 800px) {
                     .list-table th, .list-table td {
                        padding: 8px 10px;
                        font-size: 0.8rem;
                    }
                    .list-table {
                        display: block;
                    }
                    .list-table thead {
                        display: none;
                    }
                    .list-table tbody tr {
                        display: block;
                        margin-bottom: 15px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        padding: 10px;
                    }
                    .list-table td {
                        display: flex;
                        justify-content: space-between;
                        text-align: right;
                        padding: 8px 10px;
                        border-bottom: none;
                        background-color: transparent;
                    }
                    .list-table td::before {
                        content: attr(data-label);
                        font-weight: bold;
                        text-transform: uppercase;
                        margin-right: 10px;
                        color: #4b0082;
                    }
                }
            `}</style>

            <div className="container-principal">
                
                {/* Cabeçalho */}
                <header className="header-titulo">
                    <h1>
                        Sistema de Agendamento
                    </h1>
                    <p>
                        Gerencie seus clientes, serviços e horários de forma simples.
                    </p>
                </header>

                {/* Mensagem Global */}
                {mensagemGlobal && (
                    <div className={`mensagem-box mensagem-${mensagemGlobal.type}`}>
                        {mensagemGlobal.text}
                    </div>
                )}
                
                {/* Formulário (Criar/Editar) */}
                <FormularioAgendamento 
    agendamentoParaEditar={agendamentoParaEditar}
    setAgendamentoParaEditar={setAgendamentoParaEditar}
    onSalvar={fetchAgendamentos}
    funcionarios={funcionarios} // NOVO!
    servicos={servicos}         // NOVO!
/>
                
                {/* Lista */}
                <ListaAgendamentos 
                    agendamentos={agendamentos} 
                    onEditar={setAgendamentoParaEditar} 
                    onExcluir={handleExcluir} 
                />

            </div>
        </div>
    );
};

export default App;