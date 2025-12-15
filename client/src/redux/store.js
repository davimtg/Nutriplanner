import { configureStore } from '@reduxjs/toolkit';
import pedidosReducer from './pedidosSlice';
import userReducer from "./userSlice";
import favoritosReducer from "./favoritosSlice";
import chatReducer from './chatSlice';

const store = configureStore({
  reducer: {
    pedidos: pedidosReducer,
    user: userReducer,
    favoritos: favoritosReducer,
    chat: chatReducer
  },
});

export default store;