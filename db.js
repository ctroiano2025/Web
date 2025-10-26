// db.js

const mysql = require('mysql2/promise');

// --- 1. CONFIGURAÇÃO LOCAL DO BANCO DE DADOS ---
const dbConfig = {
    host: 'localhost',      
    user: 'root',           
    password: 'password',   // <--- ALtere para sua senha do MySQL
    database: 'agenda_salao_beleza', // <--- Altere para o nome do seu banco de dados
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Cria um pool de conexões
const pool = mysql.createPool(dbConfig);

// Função para testar se a conexão está funcionando
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("Conexão com o MySQL (pool) estabelecida com sucesso!");
        connection.release(); // Libera a conexão
        return pool;
    } catch (error) {
        console.error("ERRO FATAL: Não foi possível conectar ao MySQL.", error.message);
    }
}

// Chame a função para testar
testConnection();

// Exporta o pool para que outros arquivos possam usá-lo para fazer queries
module.exports = pool;