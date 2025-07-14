/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

const DropOffApi = {
  async addDropOff(dropOff: any) {
    return await api.post("dropOff", dropOff);
  },
  async getDropOffs() {
    return await api.get("dropOff");
  },
  async getDropOffById(id: string) {
    return await api.get(`dropOff/${id}`);
  },
  async updateDropOffStatus(id: string, status: string) {
    return await api.put(`dropOff/${id}/status`, { status });
  },
  async getUserDropOffs(userId: string) {
    return await api.get(`dropOff/user/${userId}`);
  },
  // adminGetDropOffs
  async adminGetDropOffs(params?: any) {
    return await api.get("dropOff/admin", { params });
  },
  async adminApproveDropOff(id: string) {
    return await api.get(`dropoff/approve/${id}`);
  },
  // Campaign drop-offs
  async getCampaignDropOffs(campaignId: string, params?: any) {
    return await api.get(`campaigns/${campaignId}/dropoffs`, { params });
  },
  async getCampaignDropOffDetails(dropOffId: string) {
    return await api.get(`dropOff/${dropOffId}`);
  },
  async exportCampaignDropOffs(campaignId: string, params?: any) {
    return await api.get(`campaigns/${campaignId}/dropoffs/export`, {
      params,
      responseType: "blob",
    });
  },
  async updateCampaignDropOff(dropOffId: string, data: any) {
    return await api.put(`dropOff/${dropOffId}`, data);
  },
  async deleteCampaignDropOff(dropOffId: string) {
    return await api.delete(`dropOff/${dropOffId}`);
  },
};

export default DropOffApi;
