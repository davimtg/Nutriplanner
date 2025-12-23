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
                const { remetenteId, destinatarioId } = action.meta.arg;
                const chave = `mensagens_${remetenteId}_${destinatarioId}`;

                if (action.payload && action.payload.length > 0) {
                    state.lista = action.payload;
                    localStorage.setItem(chave, JSON.stringify(action.payload));
                } else {
                    const mensagensLocais = JSON.parse(localStorage.getItem(chave)) || [];
                    state.lista = mensagensLocais;
                }
                state.status = 'succeeded';
            })
            .addCase(fetchUserMessages.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(enviarMensagem.fulfilled, (state, action) => {
                state.lista.push(action.payload);

                const chave = `mensagens_${action.payload.remetenteId}_${action.payload.destinatarioId}`;
                const mensagensSalvas = JSON.parse(localStorage.getItem(chave)) || [];
                mensagensSalvas.push(action.payload);
                localStorage.setItem(chave, JSON.stringify(mensagensSalvas));
            });

    }
});

export const { abrirChat, alternarChat, limparMensagens } = chatSlice.actions;
export default chatSlice.reducer;

