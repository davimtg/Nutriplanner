import bcrypt from 'bcryptjs';

export const createCRUDRoutes = (Model) => {
  return {
    getAll: async (req, res) => {
      try {
        let query = { ...req.query };
        console.log('Incoming query:', req.query);
        let limit = 0;

        // Handle _limit and _page
        let skip = 0;
        if (query._limit) {
          limit = parseInt(query._limit);
          delete query._limit;
        }
        if (query._page) {
          const page = parseInt(query._page);
          if (limit > 0) {
            skip = (page - 1) * limit;
          }
          delete query._page;
        }

        // Handle q (generic search on 'nome')
        if (query.q) {
          query.nome = { $regex: query.q, $options: 'i' };
          delete query.q;
        }

        // Handle *_like (regex search)
        Object.keys(query).forEach(key => {
          if (key.endsWith('_like')) {
            const field = key.replace('_like', '');
            query[field] = { $regex: query[key], $options: 'i' };
            delete query[key];
          }
        });

        // Handle array of IDs (e.g. ?id=1&id=2)
        if (query.id && Array.isArray(query.id)) {
          query.id = { $in: query.id };
        }

        console.log('Final Mongo Query:', query);
        let queryExec = Model.find(query);
        if (skip > 0) queryExec = queryExec.skip(skip);
        if (limit > 0) queryExec = queryExec.limit(limit);

        const items = await queryExec;
        // json-server retorna lista direta
        res.json(items);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },
    getById: async (req, res) => {
      try {
        const item = await Model.findOne({ id: req.params.id }); // Usando id numérico legado
        if (!item) return res.status(404).json({ message: 'Item não encontrado' });
        res.json(item);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },
    create: async (req, res) => {
      try {
        let data = req.body;

        // Hashing de senha se estiver presente no body
        if (data.senha) {
          const salt = await bcrypt.genSalt(10);
          data.senha = await bcrypt.hash(data.senha, salt);
        }

        if (!data.id) {
          const lastItem = await Model.findOne().sort({ id: -1 });
          data.id = lastItem ? lastItem.id + 1 : 1;
        }

        const newItem = new Model(data);
        await newItem.save();
        res.status(201).json(newItem);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    },
    update: async (req, res) => {
      try {
        // Hashing de senha se estiver presente no body
        if (req.body.senha) {
          const salt = await bcrypt.genSalt(10);
          req.body.senha = await bcrypt.hash(req.body.senha, salt);
        }

        const item = await Model.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!item) return res.status(404).json({ message: 'Item não encontrado' });
        res.json(item);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    },
    delete: async (req, res) => {
      try {
        await Model.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Item deletado' });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  };
};
