import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../services/api';

// Tenta carregar dados salvos no localStorage
const savedUserType = JSON.parse(localStorage.getItem("userType"));
const savedUserData = JSON.parse(localStorage.getItem("userData"));

const initialState = {
  userType: savedUserType || null,
  userData: savedUserData || null,
  status: "idle",
  searchResults: [],
  error: null,
  loading: false
};

export const updateUserById = createAsyncThunk(
  "user/updateUserById",
  async (user, { rejectWithValue }) => {
    try {
      const res = await api.put(`/usuarios/${user.id}`, user);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/usuarios/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const queryUsers = createAsyncThunk(
  "user/queryUsers",
  async (query, { rejectWithValue }) => {
    try {
      const res = await api.get('/usuarios', {
        params: { q: query }
      });
      return res.data;
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
    clearSearchResults(state) {
      state.searchResults = [];
    }
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
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.userData = action.payload;
        localStorage.setItem("userData", JSON.stringify(action.payload));
      })
      .addCase(updateUserById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(queryUsers.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      });
  },
});

export const { setUserType, setUserData, clearUser, clearSearchResults } = userSlice.actions;
export default userSlice.reducer;
