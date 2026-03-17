import { StrictMode } from 'react'; // Corrigido para 'import' minúsculo
import { createRoot } from 'react-dom/client';
import './index.global.css';
import App from './App.jsx';

// LOG DE VERIFICAÇÃO: Confirma que o main.jsx está sendo executado.
console.log('Main.jsx carregado e renderização iniciada.'); 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);