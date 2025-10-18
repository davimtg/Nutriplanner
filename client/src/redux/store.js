import { configureStore } from '@reduxjs/toolkit';
import pedidosReducer from './pedidosSlice';
import userReducer from "./userSlice";
import favoritosReducer from "./favoritosSlice";

const store = configureStore({
  reducer: {
    pedidos: pedidosReducer,
    user: userReducer,
    favoritos: favoritosReducer
  },
});

export default store;