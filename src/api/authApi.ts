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

  forgottenPassword: async (body: any) => {
    const response = await api.post("/auth/forgotten-password", body);
    return response.data;
  },
  
  resetPassword: async (body: any) => {
    const response = await api.post("/auth/reset-password", body);
    return response.data;
  },
};

export default AuthApi;