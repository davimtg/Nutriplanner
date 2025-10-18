import { createSlice } from "@reduxjs/toolkit";

const favoritosSlice = createSlice({
  name: "favoritos",
  initialState: {
    receitas: [], // array com ids de receitas favorited
  },
  reducers: {
    toggleFavorito: (state, action) => {
      const id = action.payload;
      if (state.receitas.includes(id)) {
        state.receitas = state.receitas.filter((r) => r !== id);
      } else {
        state.receitas.push(id);
      }
    },
  },
});

export const { toggleFavorito } = favoritosSlice.actions;
export default favoritosSlice.reducer;
