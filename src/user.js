export default class User {
  constructor(id, name, cpf, email, age) {
    this.id = id;
    this.name = name;
    this.cpf = cpf;
    this.email = email;
    this.age = age;
    this.transaction = [];
  }
}
