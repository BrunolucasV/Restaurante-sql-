document.getElementById('valor').innerText = (Math.random() * 100).toFixed(2);

function finalizeOrder() {
    // Redireciona para a página "inicio.html"
    window.location.href = 'inicio.html';
}

/*const Sequelize = require('sequelize');
const sequelize = new Sequelize ("Restaurante","adm","Bruno#040298",{
    host: 'localhost',
    dialect: "mysql",
})*/


sequelize.authenticate().then(function(){
    console.log("deu");
}).cath(function(erro){
    console.log("chora"+erro);
})
///////////////////////////////////////////////////////////////
const mysql = require('mysql2');
const fs = require('fs');

// Configuração de conexão com o banco de dados
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'amd',
  password: 'Bruno#040298',
  database: 'restarante'
});

// Ler o arquivo SQL
fs.readFile('E:\bruno\Restaurante\teste\restarante.sql', 'utf8', (err, data) => {
  if (err) {
    console.error('Erro ao ler o arquivo SQL:', err);
    return;
  }

  // Conectar ao banco de dados e executar o script SQL
  connection.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
      return;
    }

    connection.query(data, (err, results) => {
      if (err) {
        console.error('Erro ao executar o script SQL:', err);
        return;
      }

      console.log('Script SQL executado com sucesso:', results);
      connection.end();
    });
  });
});
