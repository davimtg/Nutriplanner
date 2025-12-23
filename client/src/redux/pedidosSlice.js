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

export const cancelarPedido = createAsyncThunk(
  'pedidos/cancelarPedido',
  async (id) => {
    const { data } = await api.patch(`/pedidos/${id}`, {
      status: { name: 'Cancelado' }
    });
    return data;
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
      .addCase(cancelarPedido.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.pedidos.findIndex((p) => p.id === updated.id);
        if (index !== -1) {
          state.pedidos[index] = updated;
        }
      });
  }
});

export default pedidosSlice.reducer;
