/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

const CampaignApi = {
  // Get all campaigns with optional pagination and filtering
  async getCampaigns(params?: any) {
    return await api.get("/campaigns", { params });
  },

  // Get campaigns near a specific location
  async getNearbyCampaigns(
    latitude: number,
    longitude: number,
    radius?: number,
    materialType?: string
  ) {
    return await api.get("/campaigns/nearby", {
      params: { latitude, longitude, radius, materialType },
    });
  },

  // Search locations for campaign creation
  async searchDropoffLocations(search?: string, limit = 10, page = 1) {
    return await api.get("/dropoff-locations/search", {
      params: { search, limit, page },
    });
  },

  async searchSimpleDropoffLocations(search?: string, limit = 10, page = 1) {
    return await api.get("/simple-dropoff-locations/search", {
      params: { search, limit, page },
    });
  },

  // Get a specific campaign by ID
  async getCampaign(id: string) {
    return await api.get(`/campaigns/${id}`);
  },

  // Create a new campaign
  async createCampaign(data: any) {
    return await api.post("/campaigns", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update an existing campaign
  async updateCampaign(id: string, data: any) {
    return await api.put(`/campaigns/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete a campaign
  async deleteCampaign(id: string) {
    return await api.delete(`/campaigns/${id}`);
  },

  // Get contributors for a campaign
  async getContributors(id: string) {
    return await api.get(`/campaigns/${id}/contributors`);
  },

  // Create a drop-off for a campaign
  async createCampaignDropOff(campaignId: string, data: FormData) {
    return await api.post(`/campaigns/${campaignId}/dropoff`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Get all campaign dropoffs
  async getCampaignDropOffs(params?: any) {
    return await api.get(`/campaigns/dropoffs`, { params });
  },

  //get dropoffs for a certain campaign by ID
  async getDropoffsForCampaign(campaignId: string, params?: any) {
    return await api.get(`/campaigns/${campaignId}/dropoffs`, { params });
  },

  // Export campaign drop-offs as CSV:
  async exportCampaignDropOffs(campaignId: string, params?: any) {
    return await api.get(`/campaigns/${campaignId}/dropoffs/export`, {
      params,
      responseType: "blob",
    });
  },

  // Get campaign statistics
  async getCampaignStats(params?: any) {
    return await api.get("/campaigns/stats", { params });
  },
};

export default CampaignApi;
