/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

const userApi = {
  uploadVerification: async (body: any) => {
    const response = await api.post("/user/verification", body);
    return response;
  },

  updateProfile : async (body: any) => {
    const response = await api.patch("/user/profile", body);
    return response;
  },

  updateProfilePicture : async (body: any) => {
    const response = await api.patch("/user/profile-picture", body);
    return response;
  },

  getMe: async () => {
    const response = await api.get("/user/me");
    return response;
  },

  transferMoney: async (body: any) => {
    const response = await api.post("/user/transfer", body);
    return response;
  },

  getUserByUsername: async (username: string) => {
    const response = await api.get(`/user/username/${username}`);
    return response;
  },

  postKYCImages: async (body: any) => {
    const response = await api.post(`/user/kyc/`, body);
    return response;
  },

  // admin routes
  adminGetAllUsers: async () => {
    const response = await api.get("/user/admin");
    return response;
  },

  adminGetUserId: async (id: string) => {
    const response = await api.get(`/user/admin/${id}`);
    return response;
  },

  adminGetUserEmail: async (email: string) => {
    const response = await api.get(`/user/admin/email/${email}`);
    return response;
  },

  adminUpdateUserAccount: async(id: string, body: any) => {
    const response = await api.put(`/user/admin/account/${id}`, body);
    return response;
  },

  adminUpdateUser: async(id: string, body: any) => {
    const response = await api.put(`/user/admin/${id}`, body);
    return response;
  },

  adminDeleteAccount: async(id: string) => {
    const response = await api.delete(`/user/admin/${id}`);
    return response; 
  }
};

export default userApi;