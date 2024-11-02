/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api'

const CampaignApi = {
  async getCampaigns() {
    return await api.get('/campaigns')
  },
  async getCampaign(id: string) {
    return await api.get(`/campaigns/${id}`)
  },
  async createCampaign(data: any) {
    return await api.post('/campaigns', data)
  },
  async updateCampaign(id: string, data: any) {
    return await api.put(`/campaigns/${id}`, data)
  },
  async deleteCampaign(id: string) {
    return await api.delete(`/campaigns/${id}`)
  },
  async getContributors (id: string) {
    return await api.get(`/campaigns/${id}/contributors`)
  },
}

export default CampaignApi