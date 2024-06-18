import { PayloadAction, createSlice } from "@reduxjs/toolkit";
interface AuthState {
  token: string | null;
  isAuthenticated: boolean | null;
  user: any | null;
}
const user = localStorage.getItem("natcycle");

// if user is undefined, set it to null
if (user === undefined) {
  localStorage.setItem("natcycle", JSON.stringify(null));
}

const initialState: AuthState = {
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isAuthenticated: null,
  user: user ? JSON.parse(user) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<AuthState["user"]>) => {
      console.log("login action", action.payload);
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("natcycle", JSON.stringify(action.payload.user));
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    },
    logout: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("natcycle");
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
    },
    // update only user profile info
    updateUser: (state, action: PayloadAction<AuthState["user"]>) => {
      // console.log("updateUser action", action.payload);
      localStorage.setItem("natcycle", JSON.stringify(action.payload));
      state.user = action.payload;
    },
  },
});

export const { login, logout, updateUser } = authSlice.actions;

export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;

export default authSlice.reducer;
