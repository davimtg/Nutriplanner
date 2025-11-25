const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuario.controller");

router.get("/:id", usuarioController.getUsuarioById);
//router.post("/login", usuarioController.loginUsuario);
router.patch("/:id", usuarioController.updateUsuario);

module.exports = router;
