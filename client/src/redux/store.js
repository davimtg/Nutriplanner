import { configureStore } from '@reduxjs/toolkit';
import pedidosReducer from './pedidosSlice';
import userReducer from "./userSlice";

const store = configureStore({
  reducer: {
    pedidos: pedidosReducer,
    user: userReducer
  },
});

export default store;