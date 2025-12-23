import express from 'express';
import { createCRUDRoutes } from '../controllers/crudFactory.js';
import { User } from '../models/User.js';
import { Alimento, Receita, PlanoAlimentar, Pedido, Mensagem, DiarioAlimentar } from '../models/Moldes.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const resources = [
    { path: '/usuarios', model: User },
    { path: '/alimentos', model: Alimento },
    { path: '/receitas', model: Receita },
    { path: '/planos-alimentares', model: PlanoAlimentar },
    { path: '/pedidos', model: Pedido },
    { path: '/mensagens', model: Mensagem },
    { path: '/diario-alimentar', model: DiarioAlimentar }
];

resources.forEach(resource => {
    const controller = createCRUDRoutes(resource.model);

    // Aplicar authMiddleware em todas, ou seletivamente
    // Para simplificar a migração e segurança imediata, aplicar em métodos de escrita pelo menos.
    // Mas o usuário pediu "controle de acesso das rotas com JWT". Então aplicar em TUDO é o correto.

    router.get(resource.path, authMiddleware, controller.getAll);
    router.get(`${resource.path}/:id`, authMiddleware, controller.getById);
    router.post(resource.path, authMiddleware, controller.create);
    router.put(`${resource.path}/:id`, authMiddleware, controller.update); // json-server usa put/patch
    router.patch(`${resource.path}/:id`, authMiddleware, controller.update);
    router.delete(`${resource.path}/:id`, authMiddleware, controller.delete);
});

export default router;
