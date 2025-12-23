import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchUserMessages = createAsyncThunk(
    'mensagens/fetchUserMessages',
    async ({ remetenteId, destinatarioId }) => {
        const [enviadasRes, recebidasRes] = await Promise.all([
            api.get(`/mensagens?remetenteId=${remetenteId}&destinatarioId=${destinatarioId}`),
            api.get(`/mensagens?remetenteId=${destinatarioId}&destinatarioId=${remetenteId}`)
        ]);

        const enviadas = enviadasRes.data;
        const recebidas = recebidasRes.data;

        return [...enviadas, ...recebidas];
    }
);


export const enviarMensagem = createAsyncThunk(
    'mensagens/enviarMensagem',
    async (mensagemData, { rejectWithValue }) => {
        try {
            // No backend schema: remetenteId, destinatarioId, texto, data
            const payload = {
                remetenteId: mensagemData.remetenteId,
                destinatarioId: mensagemData.destinatarioId,
                texto: mensagemData.conteudo,
                data: mensagemData.timestamp
            };
            const { data } = await api.post('/mensagens', payload);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchRecentContacts = createAsyncThunk(
    'chat/fetchRecentContacts',
    async (contactIds, { rejectWithValue }) => {
        if (!contactIds || contactIds.length === 0) return [];
        try {
            const params = new URLSearchParams();
            contactIds.forEach(id => params.append('id', id));
            const { data } = await api.get('/usuarios', { params });
            return data;
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
        showChatWindow: false,
        recentContacts: []
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
                state.lista = action.payload || [];
                state.status = 'succeeded';
            })
            .addCase(fetchUserMessages.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(enviarMensagem.fulfilled, (state, action) => {
                state.lista.push(action.payload);
            })
            .addCase(fetchRecentContacts.fulfilled, (state, action) => {
                state.recentContacts = action.payload;
            });

    }
});

export const { abrirChat, alternarChat, limparMensagens } = chatSlice.actions;
export default chatSlice.reducer;

