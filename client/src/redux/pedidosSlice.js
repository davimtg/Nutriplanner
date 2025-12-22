import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Buscar pedidos
export const fetchPedidos = createAsyncThunk(
  'pedidos/fetchPedidos',
  async () => {
    const { data } = await api.get('/pedidos');
    // Backend agora retorna array direto
    return data;
  }
);

export const aceitarPedido = createAsyncThunk(
  'pedidos/aceitarPedido',
  async (id) => {
    const { data } = await api.patch(`/pedidos/${id}`, {
      status: 'Em Execução' // Ajustado para string conforme Schema
    });
    return data;
  }
);

export const concluirPedido = createAsyncThunk(
  'pedidos/concluirPedido',
  async (id) => {
    const { data } = await api.patch(`/pedidos/${id}`, {
      status: 'Concluído' // Ajustado para string
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
      });
  }
});

export default pedidosSlice.reducer;
