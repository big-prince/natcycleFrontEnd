/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

const CampaignApi = {
  async getCampaigns(params?: any) {
    return await api.get("/campaigns", { params });
  },
  async getNearbyCampaigns(
    latitude: number,
    longitude: number,
    radius?: number
  ) {
    return await api.get("/campaigns/nearby", {
      params: { latitude, longitude, radius },
    });
  },
  async getCampaign(id: string) {
    return await api.get(`/campaigns/${id}`);
  },
  async createCampaign(data: any) {
    return await api.post("/campaigns", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  async updateCampaign(id: string, data: any) {
    return await api.put(`/campaigns/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  async deleteCampaign(id: string) {
    return await api.delete(`/campaigns/${id}`);
  },
  async getContributors(id: string) {
    return await api.get(`/campaigns/${id}/contributors`);
  },
  async createCampaignDropOff(campaignId: string, data: FormData) {
    return await api.post(`/campaigns/${campaignId}/dropoff`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  async getCampaignStats(params?: any) {
    return await api.get("/campaigns/stats", { params });
  },
};

export default CampaignApi;
