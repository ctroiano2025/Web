import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // **VERIFIQUE ESTE CAMINHO** - O nome do arquivo deve ser './App' ou './App.jsx' dependendo da sua configuração

// Inicialização padrão do React 18+
const container = document.getElementById('root'); 
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);