/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

const BadgeApi = {
  async getBadges() {
    return await api.get('/badges');
  },
  async getBadge(id: string) {
    return await api.get(`/badges/${id}`);
  },
  async createBadge(badge: any) {
    return await api.post('/badges', badge);
  },
  async updateBadge(id: string, badge: any) {
    return await api.put(`/badges/${id}`, badge);
  },
  async deleteBadge(id: string) {
    return await api.delete(`/badges/${id}`);
  },
  async deleteAllBadges() {
    return await api.delete('/badges');
  }
};

export default BadgeApi;