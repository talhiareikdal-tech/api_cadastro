const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const clientesFile = path.join(__dirname, "clientes.json");
const carrosFile = path.join(__dirname, "carros.json");
const usuariosFile = path.join(__dirname, "usuarios.json");


function lerArquivo(file) {
    if (!fs.existsSync(file)) {
        return [];
    }

    try {
        const data = fs.readFileSync(file, "utf-8");
        return JSON.parse(data) || [];
    } catch (erro) {
        return [];
    }
}

function salvarArquivo(file, dados) {
    fs.writeFileSync(
        file,
        JSON.stringify(dados, null, 2),
        "utf-8"
    );
}


function lerClientes() {
    return lerArquivo(clientesFile);
}

function salvarClientes(clientes) {
    salvarArquivo(clientesFile, clientes);
}

app.get("/clientes", (req, res) => {
    const clientes = lerClientes();
    res.json(clientes);
});

app.post("/clientes", (req, res) => {
    const {pf,nome, idade, endereco, bairro,contato} = req.body;

    if (!cpf || !nome) {
        return res.status(400).json({
            erro: "O CPF e o Nome são obrigatórios."
        });
    }

    const clientes = lerClientes();

    if (clientes.some(cliente => cliente.cpf === cpf)) {
        return res.status(400).json({
            erro: "Já existe um cliente com este CPF."
        });
    }

    const novoCliente = {cpf,nome, idade,endereco, bairro,contato};

    clientes.push(novoCliente);
    salvarClientes(clientes);

    res.status(201).json({
        mensagem: "Cliente adicionado com sucesso",
        cliente: novoCliente
    });
});

app.put("/clientes/:cpf", (req, res) => {
    const cpf = req.params.cpf;

    const { nome,idade,endereco,bairro, contato} = req.body;

    const clientes = lerClientes();

    const index = clientes.findIndex(
        cliente => cliente.cpf === cpf
    );

    if (index === -1) {
        return res.status(404).json({
            erro: "Cliente não encontrado."
        });
    }

    clientes[index] = {
        ...clientes[index],
        nome,idade, endereco,bairro, contato
 };

    salvarClientes(clientes);

    res.json({
        mensagem: "Cliente atualizado com sucesso",
        cliente: clientes[index]
    });
});


function lerCarros() {
    return lerArquivo(carrosFile);
}

function salvarCarros(carros) {
    salvarArquivo(carrosFile, carros);
}


app.get("/carros", (req, res) => {
    const carros = lerCarros();

    res.json(carros);
});


app.post("/carros", (req, res) => {
    const {
        nome,
        Modelo,
        Marca,
        Cor,
        Ano
    } = req.body;

    if (!nome) {
        return res.status(400).json({
            erro: "O nome do carro é obrigatório."
        });
    }

    const carros = lerCarros();

    const novoCarro = {
        id: crypto.randomUUID(),
        nome,

        Modelo,
        Marca,
        Cor,
        Ano,
    };

    carros.push(novoCarro);
    salvarCarros(carros);

    res.status(201).json({
        mensagem: "Carro cadastrado com sucesso",
        carro: novoCarro
       });
});


app.put("/carros/:id", (req, res) => {
    const id = req.params.id;

    const {
        nome,

        Modelo,
        Marca,
        Cor,
        Ano,
         } = req.body;

    const carros = lerCarros();

    const index = carros.findIndex(
        carro => carro.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            erro: "Carro não encontrado."
        });
    }

    carros[index] = {
        ...carros[index],
        nome,

        Modelo,
        Marca,
        Cor,
        Ano,
    };

    salvarCarros(carros);

    res.json({
        mensagem: "Carro atualizado com sucesso",
        carros: carros[index]
    });
});


app.delete("/carros/:id", (req, res) => {
    const id = req.params.id;

    const carros = lerCarros();

    const index = carros.findIndex(
        carro=> carro.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            erro: "Carro não encontrado."
        });
    }

    const carroRemovido = carros.splice(index, 1)[0];

    salvarCarros(carross);

    res.json({
        mensagem: "Carro excluído com sucesso",
        carro: carroRemovido
    });
});



app.post("/imc", (req, res) => {
    const {
        nome,
        idade,
        altura,
        peso
    } = req.body;

    if (!nome || !idade || !altura || !peso) {
        return res.status(400).json({
            erro: "Dados incompletos"
        });
    }

    const imc = peso / (altura * altura);

    res.json({
        nome,
        idade,
        imc: imc.toFixed(2)
    });
});



function lerUsuarios() {
    return lerArquivo(usuariosFile);
}

function salvarUsuarios(usuarios) {
    salvarArquivo(usuariosFile, usuarios);
}


app.post("/usuarios", (req, res) => {
    const {
        nome,
        email,
        senha
    } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({
            erro: "Nome, e-mail e senha são obrigatórios."
        });
    }

    const usuarios = lerUsuarios();

    if (usuarios.some(usuario => usuario.email === email)) {
        return res.status(400).json({
            erro: "Este e-mail já está cadastrado."
        });
    }

    const novoUsuario = {
        nome,
        email,
        senha
    };

    usuarios.push(novoUsuario);
    salvarUsuarios(usuarios);

    const token = crypto.randomUUID();

    res.status(201).json({
        token,
        mensagem: "Usuário cadastrado com sucesso!"
    });
});


app.post("/login", (req, res) => {
    const {
        user,
        senha
    } = req.body;

    if (!user || !senha) {
        return res.status(400).json({
            erro: "E-mail e senha são obrigatórios."
        });
    }

    const usuarios = lerUsuarios();

    const usuario = usuarios.find(
        usuario => usuario.email === user
    );

    if (!usuario || usuario.senha !== senha) {
        return res.status(401).json({
            erro: "E-mail ou senha incorretos."
        });
    }

    const token = crypto.randomUUID();

    res.json({
        token,
        mensagem: "Login realizado com sucesso!"
    });
});



app.get("/saudacao", (req, res) => {
    const nome = req.query.nome;

    if (!nome) {
        return res.status(400).json({
            erro: "Nome não enviado"
        });
    }

    res.json({
        mensagem: `Seu nome é ${nome}`
    });
});



app.listen(PORT, () => {
    console.log(
        `Servidor rodando em http://localhost:${PORT}`
    );
});
