import express, { query, request, response } from "express";
import User from "./user";
import Transactions from "./transactions";
import { v4 as uuidGenerator } from "uuid";

const app = express();

app.use(express.json());

// POST /users: A rota deverá receber name, cpf, email e age dentro do corpo da requisição,
// sendo que o cpf deve ser único por usuário. Criar uma instância da classe User com os
// dados recebidos, e adicionar no array de usuários.
let arrUsers = [];

app.post("/users", (request, response) => {
  const { name, cpf, email, age } = request.body;

  const newUser = new User(uuidGenerator(), name, cpf, email, age);

  if (arrUsers.find((x) => x.cpf === newUser.cpf || x.id === newUser.id)) {
    return response.status(404).json({ error: "Dados inválidos" });
  } else {
    arrUsers.push(newUser);
  }

  return response.json({ Usuários: arrUsers });
});

// GET /users/:id: A rota deverá retornar um único usuário de acordo com o parâmetro
// recebido. Não deverá retornar as transações do usuário nessa rota.

app.get("/users/:id", (request, response) => {
  const { id } = request.params;

  let newArr = [];
  let showUser = [];

  const userIndex = arrUsers.findIndex((user) => user.id === id);
  if (userIndex < 0) {
    return response.status(404).json({ error: "User not found" });
  }

  newArr.push(arrUsers[userIndex]);

  newArr.map(function (item) {
    const newUser = new User(
      item.id,
      item.name,
      item.cpf,
      item.email,
      item.age
    );
    showUser.push(newUser);
  });
  return response.json({ showUser });
});

// GET /users: A rota deve retornar uma listagem com todos os usuários que você cadastrou
// até o momento. Não deverá retornar as transações do usuário nessa rota.
app.get("/users", (request, response) => {
  return response.json({ arrUsers });
});

// PUT/users/:id: A rota deverá editar ou deletar usuários.
app.put("/edit-users/:id", (request, response) => {
  const { id } = request.params;
  const { name, cpf, email, age } = request.body;

  const userIndex = arrUsers.findIndex((user) => user.id === id);
  if (userIndex < 0) {
    return response.status(404).json({ error: "User not found" });
  }

  const editUser = {
    id,
    name,
    cpf,
    email,
    age,
  };

  arrUsers[userIndex] = editUser;

  return response.json({ arrUsers });
});

// PUT/users/:id: A rota deverá editar ou deletar usuários.
app.delete("/remove-user/:id", (request, response) => {
  const { id } = request.params;

  const userIndex = arrUsers.findIndex((user) => user.id === id);
  if (userIndex < 0) {
    return response.status(404).json({ error: "User not found" });
  }

  arrUsers.splice(userIndex, 1);

  return response.status(204).send();
});

// POST /user/:id/transactions: A rota deverá receber title, value, type dentro do corpo da requisição,
//  sendo type o tipo da transação, que deve ter como valor de entradas income (depósitos) e outcome
// para saídas (retiradas). Criar uma instância da classe Transaction, e adicioná-la ao usuário
//  responsável salvo anteriormente no array de usuários.
let contador = 1;

app.post("/user/:id", (request, response) => {
  const { title, value, type } = request.body;
  const { id } = request.params;

  const newTransaction = new Transactions(contador, title, value, type);
  contador++;

  const userIndex = arrUsers.findIndex((user) => user.id === id);
  if (userIndex < 0) {
    return response.status(404).json({ error: "User not found" });
  }

  arrUsers[userIndex].transaction.push(newTransaction);

  return response.json(arrUsers);
});

// GET /user/:id/transactions/:id: A rota deverá retornar uma única transação cadastrada previamente
app.get("/user/:id/transaction/:idT", (request, response) => {
  let { id, idT } = request.params;
  idT = parseFloat(idT);

  const userIndex = arrUsers.findIndex((user) => user.id === id);
  if (userIndex < 0) {
    return response.status(404).json({ error: "User not found" });
  }

  let arrTransactions = arrUsers[userIndex].transaction; //imprime o obj transactions

  let transactionIndex = arrTransactions.findIndex(
    (transaction) => transaction.id == idT
  );
  console.log(transactionIndex);
  let showTransaction = arrTransactions[transactionIndex];

  return response.json(showTransaction);
});
// GET /users/:id/transactions: A rota deverá retornar uma listagem com todas as transações que você
// cadastrou até o momento para um usuário específico, junto com o valor da soma de entradas, retiradas
// e total de crédito.
let totIncome = 0;
let totOutcome = 0;

app.get("/user/:id", (request, response) => {
  const { id } = request.params;

  const userIndex = arrUsers.findIndex((user) => user.id === id);
  if (userIndex < 0) {
    return response.status(404).json({ error: "User not found" });
  }

  let arrTransactions = arrUsers[userIndex].transaction; //imprime o obj transactions

  for (const transaction of arrTransactions) {
    if (transaction.type == "income") {
      let parseValue1 = parseInt(transaction.value);
      totIncome += parseValue1;
    } else if (transaction.type == "outcome") {
      let parseValue2 = parseInt(transaction.value);
      totOutcome += parseValue2;
    }
  }

  let balance = {
    income: totIncome,
    outcome: totOutcome,
    total: totIncome - totOutcome,
  };

  return response.json({ arrTransactions, balance });
});
//DELETE /users/:id/transactions/:id: Deve deletar transações.
app.delete("/user/:id/transaction/:idT", (request, response) => {
  let { id, idT } = request.params;
  idT = parseFloat(idT);

  const userIndex = arrUsers.findIndex((user) => user.id === id);
  if (userIndex < 0) {
    return response.status(404).json({ error: "User not found" });
  }

  let arrTransactions = arrUsers[userIndex].transaction; //imprime o obj transactions

  let transactionIndex = arrTransactions.findIndex(
    (transaction) => transaction.id == idT
  );

  arrTransactions.splice(transactionIndex, 1);

  return response.status(204).send();
});

//PUT /users/:id/transactions/:id: Deve editar transações.
app.put("/user/:id/transaction/:idT", (request, response) => {
  let { id, idT } = request.params;
  const { title, value, type } = request.body;
  idT = parseFloat(idT);

  const userIndex = arrUsers.findIndex((user) => user.id === id);
  if (userIndex < 0) {
    return response.status(404).json({ error: "User not found" });
  }

  let arrTransactions = arrUsers[userIndex].transaction; //imprime o obj transactions

  let transactionIndex = arrTransactions.findIndex(
    (transaction) => transaction.id == idT
  );

  const editTransaction = {
    id,
    title,
    value,
    type,
  };

  arrTransactions[transactionIndex] = editTransaction;

  return response.json({ arrTransactions });
});

app.listen(3340, () => {
  console.log("Server up and running on PORT 3340 🕵️‍♀️");
});
