// src/components/ListaAgendamentos.jsx

import React, { useState, useEffect } from 'react';
// Importa a API
import { api } from '../api/api'; 

function ListaAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // CHAMA A ROTA CORRETA CONFIRMADA: /api/agendamentos
        const response = await api.get('/api/agendamentos'); 
        
        // Os dados vêm dentro de response.data
        setAgendamentos(response.data);
        
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
        // Exibe uma mensagem útil em caso de falha na conexão
        setError("Falha ao carregar agendamentos. Verifique se o backend (porta 3000) está ativo.");
        setAgendamentos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamentos();
  }, []);

  // --- Renderização Condicional ---
  if (loading) {
    return <h2>Carregando Agendamentos...</h2>;
  }

  if (error) {
    return <h2 style={{ color: 'red', padding: '20px' }}>Erro de Conexão: {error}</h2>;
  }
  
  // Se não houver erro e o carregamento terminou, exibe a lista
  return (
    <div>
      <h2>Agendamentos Cadastrados</h2>
      {agendamentos.length > 0 ? (
        <ul>
          {/* IMPORTANTE: Ajuste 'agenda.id', 'agenda.cliente' e 'agenda.dataHora' 
            para os nomes exatos dos campos que seu backend retorna!
          */}
          {agendamentos.map(agenda => (
            <li key={agenda.id || agenda._id}> 
              Cliente: {agenda.cliente || 'Nome Indisponível'} - Data: {new Date(agenda.dataHora).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>Ainda não há agendamentos cadastrados no sistema. Hora de criar o formulário!</p>
      )}
    </div>
  );
}

export default ListaAgendamentos;