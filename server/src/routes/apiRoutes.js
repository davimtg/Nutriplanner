import express from 'express';
import { createCRUDRoutes } from '../controllers/crudFactory.js';
import { User } from '../models/User.js';
import { Alimento, Receita, PlanoAlimentar, Pedido, Mensagem, DiarioAlimentar } from '../models/Moldes.js';
import { authMiddleware } from '../middleware/auth.js';
import * as PedidosController from '../controllers/PedidosController.js';

const router = express.Router();

const resources = [
    { path: '/usuarios', model: User },
    { path: '/alimentos', model: Alimento },
    { path: '/receitas', model: Receita },
    { path: '/planos-alimentares', model: PlanoAlimentar },
    { path: '/mensagens', model: Mensagem },
    { path: '/diario-alimentar', model: DiarioAlimentar }
];

resources.forEach(resource => {
    const controller = createCRUDRoutes(resource.model);

    router.get(resource.path, authMiddleware, controller.getAll);
    router.get(`${resource.path}/:id`, authMiddleware, controller.getById);
    router.post(resource.path, authMiddleware, controller.create);
    router.put(`${resource.path}/:id`, authMiddleware, controller.update);
    router.patch(`${resource.path}/:id`, authMiddleware, controller.update);
    router.delete(`${resource.path}/:id`, authMiddleware, controller.delete);
});

const pedidosPath = '/pedidos';
router.get(pedidosPath, authMiddleware, PedidosController.getAll);
router.get(`${pedidosPath}/:id`, authMiddleware, PedidosController.getById);
router.post(pedidosPath, authMiddleware, PedidosController.create);
router.put(`${pedidosPath}/:id`, authMiddleware, PedidosController.update);
router.patch(`${pedidosPath}/:id`, authMiddleware, PedidosController.update);
router.delete(`${pedidosPath}/:id`, authMiddleware, PedidosController.delete);

export default router;
