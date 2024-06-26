/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

const ProfileApi = {
  getProfile: async () => {
    const response = await api.get("/profile");
    return response.data;
  },

  updateProfile: async (body: any) => {
    const response = await api.put("/profile", body);
    return response.data;
  },

  updateProfileImage: async (body: any) => {
    const response = await api.put("/profile/image", body);
    return response.data;
  }
};

export default ProfileApi;