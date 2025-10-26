// server.js

// ----------------------------------------------------
// 1. IMPORTAÇÕES E CONFIGURAÇÃO INICIAL
// ----------------------------------------------------
const express = require('express');
const app = express();

// IMPORTANTE PARA O HEROKU: Usa a porta definida pelo ambiente ou a porta 3000 localmente.
const PORT = process.env.PORT || 3000; 

// ----------------------------------------------------
// 2. MIDDLEWARES
// ----------------------------------------------------

// Middleware para processar JSON (necessário para ler o corpo das requisições POST/PUT)
app.use(express.json());

// Se você instalou o 'hpp' para segurança, descomente a linha abaixo:
// const hpp = require('hpp');
// app.use(hpp()); 
const disponibilidadeRoute = require ('./disponibilidadeRoute');
app.use ('/api, disponibilidadeRoute');
// ----------------------------------------------------
// 3. ROTAS DE API
// ----------------------------------------------------

// Rota de Teste (Método: GET)
// Endpoint: http://localhost:3000/api/saudacao
app.get('/api/saudacao', (req, res) => {
    // Retorna um status 200 (OK) e um objeto JSON
    res.status(200).json({ 
        mensagem: 'Minha primeira rota de API está funcionando perfeitamente!',
        ambiente: PORT === 3000 ? 'Local' : 'Heroku' 
    });
});

// Exemplo de Rota POST para criar um item (simulação)
// Endpoint: http://localhost:3000/api/item
/*
let dadosArmazenados = [];
let nextId = 1; 

app.post('/api/item', (req, res) => {
    const novoItem = {
        id: nextId++,
        nome: req.body.nome,
        data: new Date()
    };

    dadosArmazenados.push(novoItem);
    
    res.status(201).json({ 
        mensagem: "Item criado com sucesso!", 
        dados: novoItem 
    });
});
*/


// ----------------------------------------------------
// 4. INICIA O SERVIDOR
// ----------------------------------------------------

app.listen(PORT, () => {
    console.log(`\nServidor Express rodando na porta ${PORT}`);
    console.log(`Acesse localmente em: http://localhost:${PORT}/api/saudacao\n`);
});