import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchPedidos = createAsyncThunk(
  'pedidos/fetchPedidos',
  async () => {
    const { data } = await api.get('/pedidos');
    return data;
  }
);

export const aceitarPedido = createAsyncThunk(
  'pedidos/aceitarPedido',
  async (id) => {
    const { data } = await api.patch(`/pedidos/${id}`, {
      status: { name: 'Em Execução' }
    });
    return data;
  }
);

export const concluirPedido = createAsyncThunk(
  'pedidos/concluirPedido',
  async (id) => {
    const { data } = await api.patch(`/pedidos/${id}`, {
      status: { name: 'Concluído' }
    });
    return data;
  }
);

export const deletarPedido = createAsyncThunk(
  'pedidos/deletarPedido',
  async (pedido) => {
    // 1. Deletar o pedido
    await api.delete(`/pedidos/${pedido.id}`);

    // 2. Criar mensagem de notificação para o cliente
    const mensagem = {
      remetenteId: 0, // Sistema/Mediador
      destinatarioId: pedido.userId || pedido['user-id'],
      texto: `Seu pedido #${pedido.id} foi cancelado pelo mediador. Para mais informações entre em contato.`,
      tipo: 'pedido_cancelado',
      pedidoId: pedido.id,
      lida: false,
      data: new Date()
    };

    await api.post('/mensagens', mensagem);

    return pedido.id;
  }
);

const pedidosSlice = createSlice({
  name: 'pedidos',
  initialState: {
    pedidos: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPedidos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPedidos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pedidos = action.payload;
      })
      .addCase(fetchPedidos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(aceitarPedido.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.pedidos.findIndex((p) => p.id === updated.id);
        if (index !== -1) {
          state.pedidos[index] = updated;
        }
      })
      .addCase(concluirPedido.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.pedidos.findIndex((p) => p.id === updated.id);
        if (index !== -1) {
          state.pedidos[index] = updated;
        }
      })
      .addCase(deletarPedido.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.pedidos = state.pedidos.filter((p) => p.id !== deletedId);
      });
  }
});

export default pedidosSlice.reducer;
