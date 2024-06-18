/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";
import {LoginPayload, SigninPayload} from "../types";

const authApi = {
  // register a new user
  register: async (signinPayload: SigninPayload) => {
    const response = await api.post("/auth/signup", signinPayload);
    return response;
  },

  // login a user
  login: async (loginPayload : LoginPayload) => {
    const response = await api.post("/auth/signin", loginPayload);
    return response;
  },

  verifyEmail: async (body: any) => {
    const response = await api.post("/auth/verify-email", body);
    return response;
  },

  // logout a user
  logout: async () => {
    const response = await api.post("/auth/signout");
    return response;
  },

  // get current user
  getCurrentUser: async () => {
    const response = await api.get("/auth/user");
    return response;
  },

  changePassword: async (body: any) => {
    const response = await api.post("/auth/change-password", body);
    return response;
  },

  requestOtp: async (body: any) => {
    const response = await api.post("/auth/request-otp", body);
    return response;
  },

  verifyOtp: async (body: any) => {
    const response = await api.post("/auth/verify-otp", body);
    return response;
  },
};

export default authApi;
