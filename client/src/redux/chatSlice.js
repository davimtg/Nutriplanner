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

export const fetchUnreadMessages = createAsyncThunk(
    'mensagens/fetchUnreadMessages',
    async (userId) => {
        // Fetch all unread messages for this user
        const response = await api.get(`/mensagens?destinatarioId=${userId}&lida=false`);
        return response.data;
    }
);

export const markMessagesAsRead = createAsyncThunk(
    'mensagens/markAsRead',
    async ({ remetenteId, destinatarioId }, { dispatch }) => {
        // 1. Get unread msgs from this specific sender
        const { data: unreadMsgs } = await api.get(`/mensagens?remetenteId=${remetenteId}&destinatarioId=${destinatarioId}&lida=false`);

        // 2. Update each to read=true (inefficient but works with standard CRUD)
        await Promise.all(unreadMsgs.map(msg =>
            api.patch(`/mensagens/${msg.id}`, { lida: true })
        ));

        return { remetenteId, count: unreadMsgs.length };
    }
);

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        lista: [],
        unreadCounts: {}, // { [remetenteId]: count }
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
            // Optimistically clear unread count
            if (state.unreadCounts[action.payload.id]) {
                state.unreadCounts[action.payload.id] = 0;
            }
        },
        limparMensagens(state) {
            state.lista = [];
            state.status = 'idle';
            state.error = null;
            // Keep targetUser and showChatWindow state managed by actions above or toggle
        },
        fecharChat(state) {
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

                // Always trust the backend response. If it's empty, it means no messages (or they were deleted).
                state.lista = action.payload || [];
                localStorage.setItem(chave, JSON.stringify(state.lista));
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
            })
            .addCase(fetchUnreadMessages.fulfilled, (state, action) => {
                const counts = {};
                action.payload.forEach(msg => {
                    counts[msg.remetenteId] = (counts[msg.remetenteId] || 0) + 1;
                });
                state.unreadCounts = counts;
            })
            .addCase(markMessagesAsRead.fulfilled, (state, action) => {
                const { remetenteId } = action.payload;
                if (state.unreadCounts[remetenteId]) {
                    state.unreadCounts[remetenteId] = 0;
                }
            });
    }
});

export const { abrirChat, fecharChat, alternarChat, limparMensagens } = chatSlice.actions;
export default chatSlice.reducer;

