import api from './api'

const notificationApi = {
  async getNotifications() {
    return await api.get('/notifications')
  },
  async markAsRead(id: string) {
    return await api.put(`/notifications/${id}`)
  },
  async markAllAsRead() {
    return await api.put('/notifications')
  },
  async deleteNotification(id: string) {
    return await api.delete(`/notifications/${id}`)
  },
  async deleteAllNotifications() {
    return await api.delete('/notifications')
  }
}

export default notificationApi