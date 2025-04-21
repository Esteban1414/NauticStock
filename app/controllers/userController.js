const Controller = require("./Controller");
const User = require("../models/User");
const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const config     = require("../config/config");

class UserController extends Controller {
  constructor() {
    super();
    this.userModel = new User();
  }

  //Metodo para registrar un usuario de prueba
  async register(data) {
    // Sanitizar data
    if (!data || Object.keys(data).length === 0) {
      throw new Error("Datos no pueden estar vacíos");
    }

    // Agregar validaciones manuales o con alguna lib como validator.js
    // Verificar si email es válido, si contraseña es segura, etc.

    const id = await this.userModel.registerUser(data);
    return id;
  }
  async update(id, data) {
    if (!id || typeof data !== "object") {
      throw new Error("Datos inválidos para actualización");
    }
    const result = await this.userModel.updateUser(id, data);
    return result;
  }
  
  async delete(id) {
    if (!id) {
      throw new Error("ID no puede estar vacío");
    }
    const result = await this.userModel.deleteUser(id);
    return result;
  }

  async getAllUsers() {
    const users = await this.userModel.getAllUsers();
    return users;
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new Error("Email y contraseña son requeridos");
    }

    const user = await this.userModel.findByEmail(email);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      throw new Error("Contraseña incorrecta");
    }

    // Genera token con payload mínimo
    const payload = { id: user.id, name: user.name, roleId: user.roleId };
    const token   = jwt.sign(payload, config.jwtSecret, { expiresIn: "2h" });

    // Retornamos token y datos básicos (sin password)
    return {
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        roleId: user.roleId
      }
    };
  }
}

module.exports = UserController;