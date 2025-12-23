const router = require("express").Router();
const controller = require("../controllers/pedidos.controller");

router.get("/", controller.listar);
router.get("/:id", controller.buscar);
router.post("/", controller.criar);

module.exports = router;
