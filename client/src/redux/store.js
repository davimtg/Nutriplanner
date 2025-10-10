import { configureStore } from '@reduxjs/toolkit';
import pedidosReducer from './pedidosSlice';

const store = configureStore({
  reducer: {
    pedidos: pedidosReducer,
  },
});

export default store;