import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Buscar pedidos
export const fetchPedidos = createAsyncThunk(
  'pedidos/fetchPedidos',
  async () => {
    const response = await fetch('http://localhost:3001/pedidos');
    const data = await response.json();

    // 🔧 Garante compatibilidade com ambos formatos possíveis
    const lista = data?.pedidos?.['lista-de-pedidos'] || data?.['lista-de-pedidos'] || [];

    return lista;
  }
);

// Concluir pedido
export const concluirPedido = createAsyncThunk(
  'pedidos/concluirPedido',
  async (id) => {
    const response = await fetch(`http://localhost:3001/pedidos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: { id: 2, name: 'Concluído' }
      })
    });
    const data = await response.json();
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
