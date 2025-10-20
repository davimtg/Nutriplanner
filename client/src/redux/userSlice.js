import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Tenta carregar o userType salvo no localStorage
const savedUserType = JSON.parse(localStorage.getItem("userType"));

const initialState = {
  userType: savedUserType || null,
  usuarios: [],
  currentUser: null,
  searchResults: []
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserType(state, action) {
      state.userType = action.payload;
      localStorage.setItem("userType", JSON.stringify(action.payload));
    },
    clearUser(state) { // Quando o usuario faz logout limpa o usuario ativo e tudo pertinente a ele do slice
      state.userType = null;
      localStorage.removeItem("userType");
      state.usuarios = [];
      state.currentUser = null;
    },
    setUsuarios(state, action) {
      state.usuarios = action.payload;
    },
    setCurrentUser(state, action) {
      state.currentUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersById.pending, (state) => {
        state.loadingSearch = true;
        state.errorSearch = null;
        state.searchResults = []; // Limpa a ultima pesquisa antes de pesquisar novamente
      })
      .addCase(fetchUsersById.fulfilled, (state, action) => {
        state.loadingSearch = false;
        state.searchResults = [action.payload];
      })
      .addCase(fetchUsersById.rejected, (state, action) => {
        state.loadingSearch = false;
        state.errorSearch = action.error.message;
      });
  }
});

export const fetchUsersByName = createAsyncThunk( // Busca usuario no servidor por nome
  async (nome, thunkAPI) => {
    const url = `http://localhost:3001/usuarios?nome_like=${nome}`
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro ao buscar usuários");
    return await res.json();
  }
);

export const fetchUsersById = createAsyncThunk(
  "user/fetchUsersById",
  async (id, thunkAPI) => {
    if (typeof id !== "number") throw new Error("O parâmetro 'id' deve ser um número");
    const url = `http://localhost:3001/usuarios/${id}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro ao buscar usuário");

    return await res.json(); // Retorna um único objeto de usuário
  }
);



export const { setUserType, clearUser, setUsuarios, setCurrentUser } = userSlice.actions;
export default userSlice.reducer;
