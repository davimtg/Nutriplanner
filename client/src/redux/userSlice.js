import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Tenta carregar dados salvos no localStorage
const savedUserType = JSON.parse(localStorage.getItem("userType"));
const savedUserData = JSON.parse(localStorage.getItem("userData"));

const initialState = {
  userType: savedUserType || null,
  userData: savedUserData || null,
  status: "idle",
  error: null,
  loading: false
};

export const updateUserById = createAsyncThunk(
  "user/updateUserById",
  async (user, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `http://localhost:3001/usuarios/lista-de-usuarios/${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user), // envia os dados do usuário para o back-end
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao atualizar usuário");
      }

      const updatedUser = await res.json();
      return updatedUser; // payload para o slice
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserType(state, action) {
      state.userType = action.payload;
      localStorage.setItem("userType", JSON.stringify(action.payload));
    },
    setUserData(state, action) {
      state.userData = action.payload;
      localStorage.setItem("userData", JSON.stringify(action.payload));
    },
    clearUser(state) {
      state.userType = null;
      state.userData = null;
      localStorage.removeItem("userType");
      localStorage.removeItem("userData");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserById.pending, (state) => {
        state.status = "loading";
        state.loading = true;
      })
      .addCase(updateUserById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userData = action.payload;
        state.loading = false
        localStorage.setItem("userData", JSON.stringify(action.payload));
      })
      .addCase(updateUserById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.loading = false;
      })
  },
});

export const { setUserType, setUserData, clearUser } = userSlice.actions;
export default userSlice.reducer;
