/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

const AuthApi = {
  signup: async (body: any) => {
    const response: any = await api.post("/auth/signup", body);
    return response.data;
  },

  signin: async (body: any) => {
    const response: any = await api.post("/auth/signin", body);
    return response.data;
  },

  signout: async () => {
    const response = await api.get("/auth/signout");
    return response.data;
  },

  verifyEmail: async (body: any) => {
    const response = await api.post("/auth/verify-email", body);
    return response
  },

  requestOtp: async () => {
    const response = await api.get("/auth/request-otp");
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response;
  },

  resetPassword: async (body: any) => {
    const response = await api.post("/auth/reset-password", body);
    return response;
  },
};

export default AuthApi;