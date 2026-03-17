// servicoRoute.js - Rotas para o módulo de Serviços
const express = require('express');
const router = express.Router();
const servicoController = require('./servicoController');
// Importar o middleware de autenticação (caso queira proteger o POST)
// const { verifyToken } = require('./authMiddleware'); 

// Rota 1: GET /servicos
// Lista todos os serviços. Aberta ao público para o cliente escolher.
router.get('/', servicoController.getAllServicos);

// Rota 2: POST /servicos
// Cria um novo serviço. (Idealmente, deve ser protegida com verifyToken ou um middleware de admin)
router.post('/', servicoController.createServico); 
// Exemplo de como proteger a rota: 
// router.post('/', verifyToken, servicoController.createServico);

module.exports = router;