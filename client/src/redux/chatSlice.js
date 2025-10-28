import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUserMessages = createAsyncThunk(
    'mensagens/fetchUserMessages',
    async ({ remetenteId, destinatarioId }) => {
        const response = await fetch(`http://localhost:3001/mensagens?remetenteId=${remetenteId}&destinatarioId=${destinatarioId}`);
        return await response.json();
    }
);

export const enviarMensagem = createAsyncThunk(
    'mensagens/enviarMensagem',
    async (mensagemData, { rejectWithValue }) => {
        try {
            const response = await fetch('http://localhost:3001/mensagens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mensagemData)
            });
            if (!response.ok) throw new Error('Erro ao enviar mensagem');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        lista: [],             
        status: 'idle',        
        error: null,           
        targetUser: null,      
        showChatWindow: false    
    },
    reducers: {
        abrirChat(state, action) {
            state.targetUser = action.payload;
            state.showChatWindow = true;
            state.lista = [];
            state.status = 'idle';
            state.error = null;
        },
        limparMensagens(state) {
            state.lista = [];
            state.status = 'idle';
            state.error = null;
            state.targetUser = null;
            state.showChatWindow = false;
        },
        alternarChat(state) {
            state.showChatWindow = !state.showChatWindow;
        }
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
            })
            .addCase(enviarMensagem.fulfilled, (state, action) => {
                state.lista.push(action.payload);
            });
    }
});

export const { abrirChat, alternarChat, limparMensagens } = chatSlice.actions;
export default chatSlice.reducer;

