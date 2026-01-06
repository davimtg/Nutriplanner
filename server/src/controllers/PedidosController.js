import { Pedido, Alimento } from '../models/Moldes.js';
import { User } from '../models/User.js';
import { createCRUDRoutes } from './crudFactory.js';

const genericController = createCRUDRoutes(Pedido);

const populatePedido = async (pedido) => {
    if (!pedido) return pedido;
    const p = pedido.toObject ? pedido.toObject() : pedido;

    if (!p.status) {
        p.status = { id: 1, name: 'Pendente' };
    } else if (typeof p.status === 'string') {
        p.status = { id: 0, name: p.status };
    } else if (typeof p.status === 'object' && !p.status.name) {
        if (!p.status.id) {
            p.status = { id: 1, name: 'Pendente' };
        }
    }

    if (p.userId && (!p.cliente || !p.telefone || !p.endereco)) {
        const user = await User.findOne({ id: p.userId }).lean();
        if (user) {
            if (!p.cliente) p.cliente = user.nome;
            if (!p.telefone) p.telefone = user.telefone;
            if (!p.endereco && user.endereco) {
                const { rua, numero, bairro, cidade, estado } = user.endereco;
                const parts = [rua, numero, bairro, cidade, estado].filter(Boolean);
                p.endereco = parts.join(', ');
            }
        }
    }

    const itemIds = [];
    if (p.itens && Array.isArray(p.itens)) {
        p.itens.forEach(i => {
            if (i.id !== undefined) itemIds.push(i.id);
        });
    }

    if (itemIds.length > 0) {
        const alimentos = await Alimento.find({ id: { $in: itemIds } }).lean();
        const alimentoMap = new Map(alimentos.map(a => [a.id, a]));

        p.itens = p.itens.map(item => {
            const alim = alimentoMap.get(item.id);
            const itemName = alim ? alim.nome : item.name || item.nome || 'Item não encontrado';
            return {
                ...item,
                name: itemName,
                nome: itemName
            };
        });
    }

    return p;
};

export const getAll = async (req, res) => {
    try {
        let query = { ...req.query };
        if (query._limit) delete query._limit;

        const pedidos = await Pedido.find(query).lean();

        const allItemIds = new Set();
        pedidos.forEach(p => {
            if (p.itens && Array.isArray(p.itens)) {
                p.itens.forEach(i => {
                    if (i.id !== undefined) allItemIds.add(i.id);
                });
            }
        });

        let alimentoMap = new Map();
        if (allItemIds.size > 0) {
            const alimentos = await Alimento.find({ id: { $in: Array.from(allItemIds) } }).lean();
            alimentoMap = new Map(alimentos.map(a => [a.id, a]));
        }

        const populatedPedidos = pedidos.map(p => {
            if (!p.status) {
                p.status = { id: 1, name: 'Pendente' };
            } else if (typeof p.status === 'string') {
                p.status = { id: 0, name: p.status };
            } else if (typeof p.status === 'object' && !p.status.name) {
                if (!p.status.id) {
                    p.status = { id: 1, name: 'Pendente' };
                }
            }

            if (p.itens && Array.isArray(p.itens)) {
                p.itens = p.itens.map(item => {
                    const alim = alimentoMap.get(item.id);
                    const itemName = alim ? alim.nome : item.name || item.nome || 'Item não encontrado';
                    return {
                        ...item,
                        name: itemName,
                        nome: itemName
                    };
                });
            }
            return p;
        });

        res.json(populatedPedidos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getById = async (req, res) => {
    try {
        const item = await Pedido.findOne({ id: req.params.id }).lean();
        if (!item) return res.status(404).json({ message: 'Item não encontrado' });

        const populated = await populatePedido(item);
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const create = async (req, res) => {
    try {
        // Pre-processamento / Normalizacao
        const data = req.body;

        if (!data.status) {
            data.status = { id: 1, name: 'Pendente' };
        } else if (typeof data.status === 'string') {
            data.status = { id: 1, name: data.status };
        }

        if (data.clienteNome && !data.cliente) {
            data.cliente = data.clienteNome;
        }

        if (data.clienteEndereco && !data.endereco) {
            if (typeof data.clienteEndereco === 'object') {
                const e = data.clienteEndereco;
                const parts = [e.rua, e.numero, e.bairro, e.cidade].filter(Boolean);
                data.endereco = parts.join(', ');
            } else {
                data.endereco = String(data.clienteEndereco);
            }
        }

        // Normalizar itens: garantir que name e nome estejam sincronizados
        if (data.itens && Array.isArray(data.itens)) {
            data.itens = data.itens.map(item => {
                const itemName = item.nome || item.name || '';
                return {
                    ...item,
                    name: itemName,
                    nome: itemName
                };
            });
        }

        return genericController.create(req, res);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

export const update = async (req, res) => {
    try {
        let updateData = { ...req.body };

        // Normalização de status se vier como string do frontend
        if (typeof updateData.status === 'string') {
            const statusName = updateData.status;
            let statusId = 0;
            let finalName = statusName;

            switch (statusName) {
                case 'Pendente':
                    statusId = 1;
                    finalName = 'Pendente';
                    break;
                case 'Em Andamento':
                case 'Em Execução':
                    statusId = 2;
                    finalName = 'Em Andamento';
                    break;
                case 'Concluído':
                    statusId = 3;
                    finalName = 'Concluído';
                    break;
                case 'Aguardando Confirmação':
                    statusId = 5;
                    finalName = 'Aguardando Confirmação';
                    break;
                default:
                    statusId = 0;
            }
            updateData.status = { id: statusId, name: finalName };
        }

        const item = await Pedido.findOneAndUpdate({ id: req.params.id }, updateData, { new: true }).lean();
        if (!item) return res.status(404).json({ message: 'Item não encontrado' });

        const populated = await populatePedido(item);
        res.json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const _delete = genericController.delete;
export { _delete as delete };
