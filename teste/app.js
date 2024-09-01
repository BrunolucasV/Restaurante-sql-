// Importar o Handlebars
const handlebars = require('handlebars');

// Registrar um helper para codificar URI
handlebars.registerHelper('encodeURIComponent', function(str) {
    return encodeURIComponent(str);
});

// Importando o express
const express = require('express');

// Importando o fileupload
const fileupload = require('express-fileupload');

// Importando o express-session
const session = require('express-session');

// Módulo express handlebars
const { engine } = require('express-handlebars');

// Módulo mysql
const mysql = require('mysql2');

// File Systems
const fs = require('fs');

// App
const app = express();

// Configurando o express-session
app.use(session({
    secret: 'suaChaveSecretaAqui', // Alterar para uma chave secreta segura
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Altere para true se estiver usando HTTPS
}));

// Habilitando o fileupload
app.use(fileupload());

// Bootstrap
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));

// CSS
app.use('/css', express.static('./css'));

// Ref a pasta imagens
app.use("/imagens", express.static('./imagens'));

// Conf do express handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Dados via rotas
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Conf da conexão
const conexao = mysql.createConnection({
    host: 'localhost',
    user: '???????',
    password: '???????',
    database: 'restaurante'
});

// Rota para a página de login (ou inicial)
app.get("/", function(req, res) {
    res.render('login'); // Renderiza o template de login
});

// Rota para a página inicial
app.get('/home', function(req, res) {
    res.render('home'); // Renderiza o template de home
});

// Rota para processar o login
app.post('/login', function(req, res) {
    const { email, senha } = req.body;

    let sqlVerificaEmail = `SELECT * FROM clientes WHERE email = ?`;
    conexao.query(sqlVerificaEmail, [email], function(errEmail, resultEmail) {
        if (errEmail) {
            console.error("Erro ao verificar email:", errEmail);
            return res.status(500).json({ success: false, error: 'internal' });
        }

        if (resultEmail.length === 0) {
            return res.status(401).json({ success: false, error: 'email' }); // Email não encontrado
        }

        const cliente = resultEmail[0];
        if (cliente.senha !== senha) {
            return res.status(401).json({ success: false, error: 'senha' }); // Senha incorreta
        }
       
         // Armazena o usuário logado na sessão
         req.session.usuarioLogado = cliente;

        let redirectUrl = '/cardapio'; // Redireciona para /home após o login
        /*let redirectUrl = '/home'; // Redireciona para /home após o login */
        if (cliente.funcao === 'Gerente') {
            redirectUrl = '/gerente';
        }

        res.json({ success: true, redirectUrl: redirectUrl });
    });
});

// Rota para a página Gerente 
app.get("/Gerente", function(req, res) {

    // SQL para buscar comidas e bebidas
    let sqlComida = 'SELECT * FROM comida';
    let sqlBebida = 'SELECT * FROM bebida';

    // Executar comando SQL para comidas
    conexao.query(sqlComida, function(erroComida, retornoComida) {
        if (erroComida) {
            console.error("Erro ao buscar comidas:", erroComida);
            return res.status(500).send("Erro ao buscar comidas.");
        }

        // Executar comando SQL para bebidas
        conexao.query(sqlBebida, function(erroBebida, retornoBebida) {
            if (erroBebida) {
                console.error("Erro ao buscar bebidas:", erroBebida);
                return res.status(500).send("Erro ao buscar bebidas.");
            }

            // Renderizar a página com ambos os resultados
            res.render('Gerente', {
                comidas: retornoComida,
                bebidas: retornoBebida
            });
        });
    });
});

// teste da conexao
conexao.connect(function(err) {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
        return;
    }
    console.log("Conexão com o banco de dados estabelecida com sucesso.");
});

app.get("/", function(req, res) {
    // SQL para buscar comidas e bebidas
    let sqlComida = 'SELECT * FROM comida';
    let sqlBebida = 'SELECT * FROM bebida';

    // Executar comando SQL para comidas
    conexao.query(sqlComida, function(erroComida, retornoComida) {
        if (erroComida) {
            console.error("Erro ao buscar comidas:", erroComida);
            return res.status(500).send("Erro ao buscar comidas.");
        }

        // Executar comando SQL para bebidas
        conexao.query(sqlBebida, function(erroBebida, retornoBebida) {
            if (erroBebida) {
                console.error("Erro ao buscar bebidas:", erroBebida);
                return res.status(500).send("Erro ao buscar bebidas.");
            }

            // Renderizar a página com ambos os resultados
            res.render('Gerente', {
                comidas: retornoComida,
                bebidas: retornoBebida
            });
        });
    });
});

// Rota de cadastro de comida 
app.post("/cadastrar", function(req, res) {
    // Dados das comidas/bebidas
    let tipo = req.body.tipo;
    let nome = req.body.nome;
    let valor = parseFloat(req.body.valor); // Garantindo que o valor seja numérico
    let ingredientes = req.body.ingredientes;
    let imagem = req.files.imagem.name;

    // Determina qual tabela inserir baseado no tipo selecionado
    let tabela = (tipo === 'comida') ? 'comida' : 'bebida';

    // SQL para inserir na tabela de comida/bebida
    let sql = `INSERT INTO ${tabela} (nome_${tipo}, valor_${tipo}, ingredientes, imagem, status_${tipo}) VALUES ('${nome}', ${valor}, '${ingredientes}', '${imagem}', 'pronto')`;

    // Executar SQL para inserir na tabela de comida/bebida
    conexao.query(sql, function(erro, retorno) {
        // Caso de erro
        if (erro) {
            throw erro;
        }

        // Mover a imagem para o diretório correto
        req.files.imagem.mv(__dirname + '/imagens/' + req.files.imagem.name, function(err) {
            if (err) {
                return res.status(500).send(err);
            }
            console.log('Arquivo enviado com sucesso!');
        });

        // SQL para inserir na tabela cardapio
        let sqlCardapio;
        if (tipo === 'comida') {
            sqlCardapio = `INSERT INTO cardapio (nome_comida, valor, quantidade) VALUES ('${nome}', ${valor}, 25)`;
        } else {
            sqlCardapio = `INSERT INTO cardapio (nome_bebida, valor, quantidade) VALUES ('${nome}', ${valor}, 30)`;
        }

        // Executar SQL para inserir na tabela cardapio
        conexao.query(sqlCardapio, function(erroCardapio, retornoCardapio) {
            if (erroCardapio) {
                throw erroCardapio;
            }
            console.log('Item adicionado ao cardapio com sucesso!');
        });

        // Log do retorno do banco de dados
        console.log(retorno);
    });

    // Voltar para rota Gerente 
    res.redirect('/Gerente');
});

// remover produtos
app.get('/remover/:tipo/:nome/:imagem', function(req, res) {
    const tipo = req.params.tipo;
    const nome = req.params.nome;
    const imagem = req.params.imagem;

    // SQL para remover referências na tabela `cardapio`
    let sqlCardapio = `DELETE FROM cardapio WHERE nome_${tipo} = ?`;

    // Executar comando SQL para remover referências
    conexao.query(sqlCardapio, [nome], function(erroCardapio, retornoCardapio) {
        if (erroCardapio) {
            console.error("Erro ao remover referências no cardapio:", erroCardapio);
            return res.status(500).send("Erro ao remover referências no cardapio.");
        }

        // SQL para remover o produto (comida ou bebida)
        let sqlProduto = `DELETE FROM ${tipo} WHERE nome_${tipo} = ?`;

        // Executar comando SQL para remover o produto
        conexao.query(sqlProduto, [nome], function(erroProduto, retornoProduto) {
            if (erroProduto) {
                console.error("Erro ao remover produto:", erroProduto);
                return res.status(500).send("Erro ao remover produto.");
            }

            // Remove a imagem
            fs.unlink(__dirname + '/imagens/' + imagem, (erroImagem) => {
                if (erroImagem) {
                    console.log('Erro ao remover a imagem:', erroImagem);
                } else {
                    console.log('Imagem removida com sucesso');
                }
            });

            // Redirecionamento
            res.redirect('/'); // Isso indica rota Gerente 
        });
    });
});

// Rota para exibir o formulário de edição
app.get('/GerenteEditar/:tipo/:nome', function(req, res){
    const tipo = req.params.tipo;
    const nome = decodeURIComponent(req.params.nome);

    let sql;
    if (tipo === 'comida') {
        sql = `SELECT * FROM comida WHERE nome_comida = ?`;
    } else if (tipo === 'bebida') {
        sql = `SELECT * FROM bebida WHERE nome_bebida = ?`;
    } else {
        return res.status(400).send('Tipo inválido.');
    }

    // Buscar os dados do item a ser editado no banco de dados
    conexao.query(sql, [nome], function(err, result) {
        if (err) {
            console.error("Erro ao buscar dados para edição:", err);
            return res.status(500).send("Erro ao buscar dados para edição.");
        }

        // Verificar se encontrou o item
        if (result.length === 0) {
            return res.status(404).send('Item não encontrado.');
        }

        // Renderizar o formulário de edição com os dados encontrados
        const dadosItem = result[0];
        res.render('GerenteEditar', {
            tipo: tipo,
            nome: tipo === 'comida' ? dadosItem.nome_comida : dadosItem.nome_bebida,
            valor: tipo === 'comida' ? dadosItem.valor_comida : dadosItem.valor_bebida,
            ingredientes: dadosItem.ingredientes,
            imagem: dadosItem.imagem
        });
    });
});

app.post('/editar', function(req, res) {
    const tipo = req.body.tipo;
    const nome_original = req.body.nome_original;
    const novo_nome = req.body.nome;
    const valor = parseFloat(req.body.valor);
    const ingredientes = req.body.ingredientes;
    const imagem = req.files ? req.files.imagem.name : null;

    // Verificar se houve alteração no nome
    if (nome_original !== novo_nome) {
        // Verificar se já existe um registro com o novo nome
        let sqlVerificaExistencia;
        if (tipo === 'comida') {
            sqlVerificaExistencia = `SELECT * FROM comida WHERE nome_comida = ?`;
        } else if (tipo === 'bebida') {
            sqlVerificaExistencia = `SELECT * FROM bebida WHERE nome_bebida = ?`;
        } else {
            return res.status(400).send('Tipo inválido.');
        }

        // Executar a consulta para verificar a existência do novo nome
        conexao.query(sqlVerificaExistencia, [novo_nome], function(errVerifica, resultVerifica) {
            if (errVerifica) {
                console.error("Erro ao verificar existência do novo nome:", errVerifica);
                return res.status(500).send("Erro ao verificar existência do novo nome.");
            }

            // Se já existir um registro com o novo nome, retornar erro
            if (resultVerifica.length > 0) {
                return res.status(400).send('Já existe um registro com o novo nome.');
            }

            // Se não existir, proceder com a atualização
            atualizarRegistro();
        });
    } else {
        // Caso o nome não tenha sido alterado, proceder com a atualização normal
        atualizarRegistro();
    }

    // Função para atualizar o registro no banco de dados
    function atualizarRegistro() {
        let sqlUpdate;
        if (imagem) {
            sqlUpdate = `UPDATE ${tipo} SET nome_${tipo} = ?, valor_${tipo} = ?, ingredientes = ?, imagem = ? WHERE nome_${tipo} = ?`;
        } else {
            sqlUpdate = `UPDATE ${tipo} SET nome_${tipo} = ?, valor_${tipo} = ?, ingredientes = ? WHERE nome_${tipo} = ?`;
        }

        const values = imagem ? [novo_nome, valor, ingredientes, imagem, nome_original] : [novo_nome, valor, ingredientes, nome_original];

        // Buscar o caminho da imagem antiga antes de atualizar o banco de dados
        let sqlImagemAntiga = `SELECT imagem FROM ${tipo} WHERE nome_${tipo} = ?`;
        conexao.query(sqlImagemAntiga, [nome_original], function(err, result) {
            if (err) {
                console.error("Erro ao buscar imagem antiga:", err);
                return res.status(500).send("Erro ao buscar imagem antiga.");
            }

            const imagemAntiga = result[0].imagem;

            // Atualizar o banco de dados
            conexao.query(sqlUpdate, values, function(err, result) {
                if (err) {
                    console.error("Erro ao atualizar item:", err);
                    return res.status(500).send("Erro ao atualizar item.");
                }

                // Atualizar o valor na tabela `cardapio`
                let sqlAtualizaCardapio;
                if (tipo === 'comida') {
                    sqlAtualizaCardapio = `UPDATE cardapio SET nome_comida = ?, valor = ? WHERE nome_comida = ?`;
                } else if (tipo === 'bebida') {
                    sqlAtualizaCardapio = `UPDATE cardapio SET nome_bebida = ?, valor = ? WHERE nome_bebida = ?`;
                }

                conexao.query(sqlAtualizaCardapio, [novo_nome, valor, nome_original], function(errCardapio, resultCardapio) {
                    if (errCardapio) {
                        console.error("Erro ao atualizar valor no cardápio:", errCardapio);
                        return res.status(500).send("Erro ao atualizar valor no cardápio.");
                    }

                    if (imagem) {
                        // Mover a imagem para o diretório correto
                        req.files.imagem.mv(__dirname + '/imagens/' + req.files.imagem.name, function(err) {
                            if (err) {
                                return res.status(500).send(err);
                            }
                            console.log('Arquivo enviado com sucesso!');

                            // Remover a imagem antiga
                            fs.unlink(__dirname + '/imagens/' + imagemAntiga, (erroImagem) => {
                                if (erroImagem) {
                                    console.log('Erro ao remover a imagem antiga:', erroImagem);
                                } else {
                                    console.log('Imagem antiga removida com sucesso');
                                }
                            });
                        });
                    }
                    // Redirecionar para a página Gerente (Gerente) após a edição
                    res.redirect('/Gerente');

                });
            });
        });
    }
});

// Rota para processar o login
app.post('/login', function(req, res) {
    const email = req.body.email;
    const senha = req.body.senha;

    // Verifica se o email existe na tabela clientes
    let sqlVerificaEmail = `SELECT * FROM clientes WHERE email = ?`;
    conexao.query(sqlVerificaEmail, [email], function(errEmail, resultEmail) {
        if (errEmail) {
            console.error("Erro ao verificar email:", errEmail);
            return res.status(500).send("Erro ao verificar email.");
        }

        if (resultEmail.length === 0) {
            return res.redirect('/?erro=email'); // Email não encontrado
        }

        // Verifica a senha
        const cliente = resultEmail[0];
        if (cliente.senha !== senha) {
            return res.redirect('/?erro=senha'); // Senha incorreta
        }

        // Redireciona para a página de pedido
        res.redirect('/'); // Ou a página que você deseja redirecionar após o login
    });
});

// Rota para a página de cadastro
app.get('/cliente', function(req, res) { // Nova rota para servir a página de cadastro
    res.render('cadastro'); // Renderiza o template de cadastro
});

// Rota de cadastro de cliente
app.post("/cadastrar_cliente", function(req, res) {
    // Dados do cliente
    let { nome, cpf, email, senha, telefone } = req.body;

    // Verificações básicas
    let errors = {};
    if (!nome) errors.nome = 'Nome é obrigatório.';
    if (!cpf) errors.cpf = 'CPF é obrigatório.';
    if (!email) errors.email = 'Email é obrigatório.';
    if (!senha) errors.senha = 'Senha é obrigatória.';

    // Retorna erros se houver
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    // SQL para inserir na tabela de clientes
    let sql = `INSERT INTO clientes (cpf_cliente, nome, email, tef, senha) VALUES (?, ?, ?, ?, ?)`;
    conexao.query(sql, [cpf, nome, email, telefone, senha], function(erro, resultado) {
        // Caso de erro
        if (erro) {
            console.error("Erro ao cadastrar cliente:", erro);
            return res.status(500).json({ success: false, errors: { geral: 'Erro ao cadastrar cliente.' } });
        }
        // Sucesso
        res.json({ success: true });
    });
});


// Rota para obter itens do cardápio
app.get('/cardapio', function(req, res) {
    let sqlComidas = `SELECT * FROM comida`;
    let sqlBebidas = `SELECT * FROM bebida`;

    conexao.query(sqlComidas, function(errComidas, resultComidas) {
        if (errComidas) {
            console.error("Erro ao obter comidas:", errComidas);
            return res.status(500).json({ success: false, error: 'Erro ao obter comidas' });
        }

        conexao.query(sqlBebidas, function(errBebidas, resultBebidas) {
            if (errBebidas) {
                console.error("Erro ao obter bebidas:", errBebidas);
                return res.status(500).json({ success: false, error: 'Erro ao obter bebidas' });
            }

            res.render('cardapio', { comidas: resultComidas, bebidas: resultBebidas });
        });
    });
});

// Rota para comanda e mesa

// Função para processar pedidos em série
function processarPedidos(pedidos, numeroComanda, numeroMesa, res) {
    let i = 0;

    function processarProximoPedido() {
        if (i >= pedidos.length) {
            res.json({ success: true, message: 'Pedidos e status inseridos com sucesso!' });
            return;
        }

        let pedido = pedidos[i];
        pedido.numero_mesa = numeroMesa; // Atualiza o número da mesa
        pedido.numero_comanda = numeroComanda;

        // SQL para inserir um novo pedido
        let sqlPedido = `INSERT INTO pedido (quantidade, numero_mesa, valor_pedido, status_pedido, id_cardapio, quantidade_cardapio) VALUES (?, ?, ?, ?, ?, ?)`;

        // Valores para o pedido
        let valuesPedido = [
            pedido.quantidade,
            pedido.numero_mesa, // número da mesa que foi passado
            pedido.valor_pedido,
            'preparando', // Status inicial do pedido
            pedido.id_cardapio,
            pedido.quantidade_cardapio
        ];

        // Executar o comando SQL para inserir o pedido
        conexao.query(sqlPedido, valuesPedido, function(erro, resultadoPedido) {
            if (erro) {
                console.error("Erro ao processar pedido:", erro);
                res.status(500).json({ success: false, error: 'Erro ao processar pedido.' });
                return;
            }

            // Recuperar o número do pedido inserido
            const numeroPedido = resultadoPedido.insertId;

            // SQL para inserir o status do pedido
            let sqlStatus = `INSERT INTO status (numero_pedido, status_pedido, nome_pedido) VALUES (?, ?, ?)`;

            // Valores para o status
            let valuesStatus = [
                numeroPedido,
                'preparando', // Status inicial do pedido
                pedido.nome_pedido
            ];

            // Executar o comando SQL para inserir o status
            conexao.query(sqlStatus, valuesStatus, function(erro) {
                if (erro) {
                    console.error("Erro ao inserir status do pedido:", erro);
                    res.status(500).json({ success: false, error: 'Erro ao inserir status do pedido.' });
                    return;
                }

                // Atualizar a mesa na tabela 'mesa'
                let sqlAtualizaMesa = `UPDATE mesa SET numero_comanda = ?, valor = valor + ?, status_mesa = 'ocupada' WHERE numero_mesa = ?`;

                // Executa a atualização na tabela 'mesa'
                conexao.query(sqlAtualizaMesa, [numeroComanda, pedido.valor_pedido, numeroMesa], function(erro) {
                    if (erro) {
                        console.error("Erro ao atualizar mesa na tabela 'mesa':", erro);
                        res.status(500).json({ success: false, error: 'Erro ao atualizar mesa na tabela.' });
                        return;
                    }

                    // Passa para o próximo pedido
                    i++;
                    processarProximoPedido();
                });
            });
        });
    }
    processarProximoPedido();
}


// Função para atualizar o valor da comanda
function atualizarValorComanda(numeroComanda, valorAdicional, callback) {
    // SQL para atualizar o valor da comanda existente
    let sqlAtualizaComanda = `UPDATE comanda SET valor = valor + ? WHERE numero_comanda = ?`;

    conexao.query(sqlAtualizaComanda, [valorAdicional, numeroComanda], function(erro) {
        if (erro) {
            return callback(erro);
        }
        callback(null);
    });
}

// Função para criar uma nova comanda
function criarNovaComanda(cpf_cliente, valorTotal, callback) {
    // Primeiro, pegar a primeira mesa livre
    pegarPrimeiraMesaLivre(function(erro, numeroMesa) {
        if (erro) {
            return callback(erro);  // Se ocorrer um erro ao pegar a mesa, retornar o erro
        }

        // SQL para criar uma nova comanda com o número da mesa correto
        let sqlNovaComanda = `INSERT INTO comanda (numero_mesa, cpf_cliente, pagamento, valor) VALUES (?, ?, 'pendente', ?)`;

        conexao.query(sqlNovaComanda, [numeroMesa, cpf_cliente, valorTotal], function(erroNovaComanda, resultadoNovaComanda) {
            if (erroNovaComanda) {
                return callback(erroNovaComanda);  // Se ocorrer um erro ao criar a comanda, retornar o erro
            }
            console.log(`Nova comanda criada com ID ${resultadoNovaComanda.insertId} e mesa ${numeroMesa}.`);

            // Agora, atualiza a mesa com a nova comanda e o valor total
            atualizarMesaComanda(resultadoNovaComanda.insertId, numeroMesa, valorTotal, function(erroAtualizaMesa) {
                if (erroAtualizaMesa) {
                    return callback(erroAtualizaMesa); // Retorna erro se houver
                }
                
                callback(null, resultadoNovaComanda.insertId);  // Chama o callback com o ID da nova comanda
            });
        });
    });
}


// Função para pegar a primeira mesa livre na tabela 'mesa'
function pegarPrimeiraMesaLivre(callback) {
    // SQL para encontrar a primeira mesa livre
    const sql = `SELECT numero_mesa FROM mesa WHERE status_mesa = 'livre' LIMIT 1`;

    conexao.query(sql, function(erro, resultado) {
        if (erro) {
            console.error("Erro ao pegar a primeira mesa livre:", erro);
            return callback(erro);  // Se ocorrer um erro, retornar o erro
        }

        // Verifica se há uma mesa livre
        if (resultado.length > 0) {
            const mesaLivre = resultado[0].numero_mesa;
            console.log(`Mesa livre encontrada: ${mesaLivre}`);
            callback(null, mesaLivre);  // Retorna o número da mesa livre
        } else {
            console.log("Nenhuma mesa livre encontrada.");
            callback(new Error('Nenhuma mesa livre disponível.'));  // Retorna erro se não houver mesa livre
        }
    });
}

// Função para atualizar a mesa na tabela 'mesa' e associar a comanda
function atualizarMesaComanda(numeroComanda, numeroMesa, valorTotal, callback) {
    // Atualiza a mesa com o número da comanda, o status e o valor total
    const sqlAtualizaMesa = `
        UPDATE mesa 
        SET numero_comanda = ?, 
            status_mesa = 'ocupada', 
            valor = ? 
        WHERE numero_mesa = ?
    `;

    conexao.query(sqlAtualizaMesa, [numeroComanda, valorTotal, numeroMesa], function(erro) {
        if (erro) {
            console.error("Erro ao atualizar mesa na comanda:", erro);
            return callback(erro);
        }
        console.log(`Mesa ${numeroMesa} atualizada com a comanda ${numeroComanda} e valor de ${valorTotal}.`);
        callback(null); // Chama o callback sem erros
    });
}

// Função para atualizar o valor da mesa na tabela 'mesa'
function atualizarValorMesa(numeroMesa, valorAdicional, callback) {
    // Primeiro, pega o valor atual da mesa
    const sqlGetValorMesa = `SELECT valor FROM mesa WHERE numero_mesa = ?`;

    conexao.query(sqlGetValorMesa, [numeroMesa], function(erroGetValor, resultado) {
        if (erroGetValor) {
            console.error("Erro ao obter o valor atual da mesa:", erroGetValor);
            return callback(erroGetValor);
        }

        // Calcula o novo valor somando o valor atual ao valor adicional
        const valorAtual = resultado.length > 0 ? resultado[0].valor : 0;
        const novoValor = valorAtual + valorAdicional;

        // Atualiza o valor da mesa na tabela 'mesa'
        const sqlUpdateValorMesa = `UPDATE mesa SET valor = ? WHERE numero_mesa = ?`;

        conexao.query(sqlUpdateValorMesa, [novoValor, numeroMesa], function(erroUpdateValor) {
            if (erroUpdateValor) {
                console.error("Erro ao atualizar o valor da mesa:", erroUpdateValor);
                return callback(erroUpdateValor);
            }

            console.log(`Valor da mesa ${numeroMesa} atualizado para ${novoValor}.`);
            callback(null); // Chama o callback sem erros
        });
    });
}

// Rota para processar o pedido
app.post('/fazer-pedido', function(req, res) {
    const pedidos = req.body;

    // Verifica se o corpo do pedido não está vazio
    if (!Array.isArray(pedidos) || pedidos.length === 0) {
        return res.status(400).json({ success: false, error: 'Nenhum pedido enviado.' });
    }

    // Acessando o cliente logado via sessão
    const cliente = req.session.usuarioLogado;

    if (!cliente) {
        console.log("Nenhum usuário está logado.");
        return res.status(401).json({ success: false, message: 'Usuário não logado.' });
    }

    const cpf_cliente = cliente.cpf_cliente;

    // Calcula o valor total do novo pedido
    const valorTotalPedido = pedidos.reduce((total, p) => total + (p.quantidade * p.valor_pedido), 0);

    // Verifica se o cliente tem uma comanda pendente
    let sqlVerificaComanda = `SELECT * FROM comanda WHERE cpf_cliente = ? AND pagamento = 'pendente'`;

    conexao.query(sqlVerificaComanda, [cpf_cliente], function(erroComanda, resultadoComanda) {
        if (erroComanda) {
            console.error("Erro ao verificar comanda:", erroComanda);
            return res.status(500).json({ success: false, error: 'Erro ao verificar comanda.' });
        }

        let numeroComanda;
        let numeroMesa;

        if (resultadoComanda.length > 0) {
            console.log(`O cliente ${cpf_cliente} tem uma comanda pendente.`);
            numeroComanda = resultadoComanda[0].numero_comanda;

            // Pega o número da mesa atual do cliente
            numeroMesa = resultadoComanda[0].numero_mesa;

            // Atualiza o valor da comanda existente
            atualizarValorComanda(numeroComanda, valorTotalPedido, function(erroAtualizaComanda) {
                if (erroAtualizaComanda) {
                    console.error("Erro ao atualizar o valor da comanda:", erroAtualizaComanda);
                    return res.status(500).json({ success: false, error: 'Erro ao atualizar o valor da comanda.' });
                }

                // Atualiza o valor na tabela 'mesa'
                atualizarValorMesa(numeroMesa, valorTotalPedido, function(erroAtualizaMesa) {
                    if (erroAtualizaMesa) {
                        console.error("Erro ao atualizar o valor da mesa:", erroAtualizaMesa);
                        return res.status(500).json({ success: false, error: 'Erro ao atualizar o valor da mesa.' });
                    }

                    // Processa os pedidos na comanda existente
                    processarPedidos(pedidos, numeroComanda, numeroMesa, res);
                });
            });
        } else {
            console.log(`O cliente ${cpf_cliente} não tem uma comanda pendente. Criando nova comanda.`);
        
            // Cria uma nova comanda
            criarNovaComanda(cpf_cliente, valorTotalPedido, function(erroCriarComanda, novoNumeroComanda, numeroMesa) {  // Passe numeroMesa para o callback
                if (erroCriarComanda) {
                    console.error("Erro ao criar nova comanda:", erroCriarComanda);
                    return res.status(500).json({ success: false, error: 'Erro ao criar nova comanda.' });
                }
        
                // Atualiza a comanda com a nova mesa
                atualizarMesaComanda(novoNumeroComanda, numeroMesa, valorTotalPedido, function(erroAtualizaMesa) {
                    if (erroAtualizaMesa) {
                        console.error("Erro ao atualizar mesa na comanda:", erroAtualizaMesa);
                        return res.status(500).json({ success: false, error: 'Erro ao atualizar mesa na comanda.' });
                    }
        
                    // Processa os pedidos na nova comanda, passando o numeroMesa
                    processarPedidos(pedidos, novoNumeroComanda, numeroMesa, res);
                });
            });
        }           
    });
});


// Servidor
app.listen(8080, () => {
    console.log("Servidor rodando na porta 8080");
});
