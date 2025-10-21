import { createSlice } from "@reduxjs/toolkit";

// Tenta carregar dados salvos no localStorage
const savedUserType = JSON.parse(localStorage.getItem("userType"));
const savedUserData = JSON.parse(localStorage.getItem("userData"));

const initialState = {
  userType: savedUserType || null,
  userData: savedUserData || null,
};

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
});

export const { setUserType, setUserData, clearUser } = userSlice.actions;
export default userSlice.reducer;
