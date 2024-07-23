/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

const UsersApi = {
  getUsers: async () => {
    const response = await api.get("/profile/all");
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get(`/profile/${id}`);
    return response.data;
  },

  updateUser: async (id: string, body: any) => {
    const response = await api.put(`/profile/${id}`, body);
    return response.data;
  },

  disableUser: async (id: string) => {
    const response = await api.put(`/profile/disable/${id}`);
    return response.data;
  },

  enableUser: async (id: string) => {
    const response = await api.put(`/profile/enable/${id}`);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/profile/${id}`);
    return response.data;
  },

  getReferrals: async (id: string) => {
    const response = await api.get(`/profile/referrals/${id}`);
    return response.data;
  }
};

export default UsersApi;