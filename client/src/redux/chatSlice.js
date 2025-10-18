import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunk para buscar mensagens entre dois usuários
export const fetchUserMessages = createAsyncThunk(
  'mensagens/fetchUserMessages',
  async ({ remetenteId, destinatarioId }) => {
    const response = await fetch(`http://localhost:3001/mensagens?remetenteId=${remetenteId}&destinatarioId=${destinatarioId}`);
    const data = await response.json();
    return data;
  }
);

const mensagensSlice = createSlice({
  name: 'mensagens',
  initialState: {
    lista: [], // todas as mensagens carregadas
    status: 'idle',
    error: null
  },
  reducers: {
    addMensagem(state, action) {
      state.lista.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserMessages.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lista = action.payload;
      })
      .addCase(fetchUserMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { addMensagem, limparMensagens } = mensagensSlice.actions;
export default mensagensSlice.reducer;
