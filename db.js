const mysql = require('mysql2/promise'); // Usando mysql2/promise

// Configurações do pool
const poolConfig = {
    host: '127.0.0.1', 
    user: 'dev_user',      
    password: 'dev_password',  
    database: 'agenda_salao_beleza',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true 
};

let pool;

try {
    // Cria o pool de conexões
    pool = mysql.createPool(poolConfig);
    console.log(`Pool de conexões MySQL criado com sucesso para o DB: ${poolConfig.database}`);

    // Teste de conexão (NÃO É MAIS BLOQUEANTE)
    pool.getConnection()
        .then(connection => {
            console.log("Conexão inicial com o MySQL (pool) estabelecida com sucesso!");
            connection.release();
        })
        .catch(err => {
            console.error("Erro CRÍTICO ao conectar ao MySQL (Pool):", err.message);
            console.error("VERIFIQUE: 1. Se o MySQL está rodando. 2. As credenciais (usuário/senha/host).");
        });

} catch (error) {
    console.error("Erro ao criar o pool de conexões MySQL:", error.message);
    // Cria um pool de fallback (para evitar que o servidor caia se a conexão falhar totalmente)
    pool = { execute: () => { throw new Error('O Pool MySQL não foi inicializado corretamente.'); } };
}

// Função de acesso ao pool
function getPool() {
    return pool;
}

module.exports = {
    getPool // Exporta a função para ser usada em server.js e nas rotas
};