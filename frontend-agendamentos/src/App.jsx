import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { LogOut, Calendar, Users, Briefcase, PlusCircle, Edit3, Trash2, XCircle, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

// --- CONSTANTES ---
// URL base da sua API (Certifique-se de que corresponde ao seu backend)
const API_URL = 'http://localhost:3000/api';
const AGENDAMENTO_URL = `${API_URL}/agendamentos`;
const AUTH_URL = `${API_URL}/auth`; // URL para Login e Cadastro

// Configuração do Axios
const api = axios.create({
  baseURL: API_URL,
});

// Estado inicial para o formulário de agendamento
const initialState = {
  idagendamento: null,
  cliente: '',
  servico: '',
  data: '',
  hora: '',
};

// --- 1. FUNÇÕES E CONFIGURAÇÕES DE AUTENTICAÇÃO ---

// Função para obter o token salvo
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Função para salvar o token
const saveToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Função para remover o token
const removeToken = () => {
  localStorage.removeItem('authToken');
};

// --- 2. COMPONENTES DE UI ---

// Componente para exibir mensagens (sucesso/erro)
const Mensagem = ({ mensagem, setMensagem }) => {
  useEffect(() => {
    if (mensagem.texto) {
      const timer = setTimeout(() => {
        setMensagem({ type: '', texto: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagem, setMensagem]);

  if (!mensagem.texto) return null;

  const styleMap = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg border-l-4 shadow-lg transition-opacity duration-300 ease-in-out ${styleMap[mensagem.type] || 'bg-gray-100 border-gray-400 text-gray-700'}`}
      role="alert"
    >
      <div className="flex items-center">
        {mensagem.type === 'error' && <AlertTriangle className="h-5 w-5 mr-3" />}
        <p className="font-semibold">{mensagem.texto}</p>
        <button
          onClick={() => setMensagem({ type: '', texto: '' })}
          className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-full hover:bg-opacity-20 transition-colors"
          aria-label="Fechar"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// Componente de Sobreposição de Carregamento
const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-[100] flex items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
      <p className="mt-4 text-white text-lg font-medium">Carregando...</p>
    </div>
  </div>
);

// --- 3. TELAS E COMPONENTES DE TELA ---

// Tela de Login/Cadastro
const LoginScreen = ({ setAuthToken, setMensagem }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [credenciais, setCredenciais] = useState({ login: '', senha: '' });
  const [loading, setLoading] = useState(false); // Estado de loading local

  const handleChange = (e) => {
    setCredenciais({ ...credenciais, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ type: '', texto: '' });

    const endpoint = isLogin ? `${AUTH_URL}/login` : `${AUTH_URL}/register`;

    try {
      const response = await axios.post(endpoint, credenciais);
      saveToken(response.data.token);
      setAuthToken(response.data.token);
      setMensagem({ type: 'success', texto: isLogin ? 'Login realizado com sucesso!' : 'Cadastro realizado com sucesso! Faça login.' });
    } catch (error) {
      const msg = error.response?.data?.error || `Erro ao ${isLogin ? 'fazer login' : 'cadastrar'}. Verifique as credenciais e o servidor.`;
      setMensagem({ type: 'error', texto: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {loading && <LoadingOverlay />}
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
          {isLogin ? 'Entrar no Sistema' : 'Criar Conta'}
        </h2>
        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Login (e-mail)</label>
            <input
              type="text"
              name="login"
              value={credenciais.login}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="seu.email@exemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              name="senha"
              value={credenciais.senha}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150"
          >
            {isLogin ? 'Fazer Login' : 'Cadastrar'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition duration-150"
          >
            {isLogin ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Faça Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Formulário de Agendamento (Novo ou Edição)
const FormularioAgendamento = ({ formData, setFormData, handleSubmit, handleClose }) => {
  const isEditing = !!formData.idagendamento;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-40 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="text-2xl font-bold text-indigo-600 flex items-center">
            {isEditing ? <><Edit3 className="mr-2" size={20} /> Editar Agendamento</> : <><PlusCircle className="mr-2" size={20} /> Novo Agendamento</>}
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">
            <XCircle size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <input
              type="text"
              name="cliente"
              value={formData.cliente}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Nome completo do cliente"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Serviço</label>
            <input
              type="text"
              name="servico"
              value={formData.servico}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Serviço a ser realizado"
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Data</label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Hora</label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
            >
              {isEditing ? 'Salvar Alterações' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Tabela de Agendamentos
const TabelaAgendamentos = ({ agendamentos, handleEdit, handleDelete }) => {
  // Ordena os agendamentos por data e hora (em memória)
  const agendamentosOrdenados = useMemo(() => {
    return [...agendamentos].sort((a, b) => {
      const dataA = `${a.data}T${a.hora}`;
      const dataB = `${b.data}T${b.hora}`;
      if (dataA < dataB) return -1;
      if (dataA > dataB) return 1;
      return 0;
    });
  }, [agendamentos]);

  if (agendamentos.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-md mt-4">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto" />
        <p className="mt-4 text-xl font-semibold text-gray-600">Nenhum agendamento encontrado.</p>
        <p className="text-gray-500">Comece adicionando seu primeiro agendamento!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-2xl mt-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-indigo-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider">Cliente</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider">Serviço</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider">Data</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider">Hora</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-indigo-600 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {agendamentosOrdenados.map((item) => (
            <tr key={item.idagendamento} className="hover:bg-gray-50 transition duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.cliente}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.servico}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.hora.substring(0, 5)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-indigo-600 hover:text-indigo-900 transition mr-3 p-1 rounded hover:bg-indigo-50"
                  aria-label="Editar"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(item.idagendamento)}
                  className="text-red-600 hover:text-red-900 transition p-1 rounded hover:bg-red-50"
                  aria-label="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL: APP ---

const App = () => {
  // 1. Estado de Autenticação (Movido para o topo)
  const [authToken, setAuthToken] = useState(getToken());

  // 2. Estados essenciais de UI e Dados
  const [loading, setLoading] = useState(false);
  const [agendamentos, setAgendamentos] = useState([]);
  const [formData, setFormData] = useState(initialState);
  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState(null);
  const [mensagem, setMensagem] = useState({ type: '', texto: '' });


  // Funções de Autenticação
  const handleLogout = useCallback(() => {
    removeToken();
    setAuthToken(null);
    setAgendamentos([]); // Limpa dados
    setMensagem({ type: 'warning', texto: 'Você foi desconectado.' });
  }, [setAuthToken, setMensagem]);

  // Define o token no cabeçalho do Axios sempre que o authToken mudar
  useEffect(() => {
    if (authToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [authToken]);


  // --- CRUD: Buscar Agendamentos ---
  const fetchAgendamentos = useCallback(async () => {
    if (!authToken) return;

    setLoading(true);
    try {
      const response = await api.get(AGENDAMENTO_URL);
      setAgendamentos(response.data);
      setMensagem({ type: 'success', texto: 'Agendamentos carregados.' });
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        handleLogout();
        setMensagem({ type: 'error', texto: 'Sessão expirada. Faça login novamente.' });
      } else {
        setMensagem({ type: 'error', texto: 'Erro ao buscar agendamentos.' });
      }
    } finally {
      setLoading(false);
    }
  }, [authToken, handleLogout, setMensagem]);


  // Carrega agendamentos na montagem e sempre que o token mudar
  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  // --- CRUD: Submeter Formulário (Criar ou Editar) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ type: '', texto: '' });

    const isEditing = !!formData.idagendamento;
    const url = isEditing ? `${AGENDAMENTO_URL}/${formData.idagendamento}` : AGENDAMENTO_URL;
    const method = isEditing ? api.put : api.post;

    try {
      // O método put/post envia o formData, o backend deve tratar o idagendamento (se presente)
      await method(url, formData);

      setMensagem({ type: 'success', texto: isEditing ? 'Agendamento atualizado com sucesso!' : 'Agendamento criado com sucesso!' });
      
      setFormData(initialState); // Reset form
      setAgendamentoParaEditar(null); // Fecha o modal
      await fetchAgendamentos(); // Recarrega a lista
    } catch (error) {
      const msg = error.response?.data?.error || `Erro ao ${isEditing ? 'atualizar' : 'criar'} agendamento.`;
      setMensagem({ type: 'error', texto: msg });
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD: Deletar Agendamento ---
  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) {
        return;
    }
    setLoading(true);
    setMensagem({ type: '', texto: '' });

    try {
      await api.delete(`${AGENDAMENTO_URL}/${id}`);
      setMensagem({ type: 'success', texto: 'Agendamento excluído com sucesso!' });
      await fetchAgendamentos();
    } catch (error) {
      const msg = error.response?.data?.error || 'Erro ao excluir agendamento.';
      setMensagem({ type: 'error', texto: msg });
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD: Preparar Edição ---
  const handleEdit = (item) => {
    setFormData(item);
    setAgendamentoParaEditar(item);
  };

  // --- UI: Fechar Formulário ---
  const handleCloseForm = () => {
    setFormData(initialState);
    setAgendamentoParaEditar(null);
  };


  // --- RENDERIZAÇÃO CONDICIONAL: LOGIN VS DASHBOARD ---

  if (!authToken) {
    // Se não houver token, mostra a tela de Login
    return <LoginScreen setAuthToken={setAuthToken} setMensagem={setMensagem} />;
  }

  // Se houver token, mostra a tela principal de Agendamentos
  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans antialiased">
      {/* Componente de Mensagem Flutuante */}
      <Mensagem mensagem={mensagem} setMensagem={setMensagem} />
      
      {/* Overlay de Loading (Sua linha 400 está por aqui) */}
      {loading && <LoadingOverlay />}

      {/* Cabeçalho do Dashboard */}
      <header className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-lg mb-6">
        <h1 className="text-3xl font-extrabold text-indigo-600 flex items-center mb-4 sm:mb-0">
          <Calendar className="w-8 h-8 mr-3" />
          Agenda Fácil
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={() => { setFormData(initialState); setAgendamentoParaEditar({}); }}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 text-sm font-medium"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Novo Agendamento
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition duration-150 text-sm font-medium"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </button>
        </div>
      </header>

      {/* Área Principal de Conteúdo */}
      <main>
        <TabelaAgendamentos
          agendamentos={agendamentos}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      </main>

      {/* Modal/Formulário de Agendamento */}
      {agendamentoParaEditar && (
        <FormularioAgendamento
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          handleClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default App;

// FIM DO COMPONENTE PRINCIPAL