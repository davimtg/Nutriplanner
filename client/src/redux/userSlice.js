import { createSlice } from "@reduxjs/toolkit";

// Tenta carregar o userType salvo no localStorage
const savedUserType = JSON.parse(localStorage.getItem("userType"));

const initialState = {
  userType: savedUserType || null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserType(state, action) {
      state.userType = action.payload;
      localStorage.setItem("userType", JSON.stringify(action.payload)); // salva localmente
    },
    clearUser(state) {
      state.userType = null;
      localStorage.removeItem("userType");
    },
  },
});

export const { setUserType, clearUser } = userSlice.actions;
export default userSlice.reducer;
