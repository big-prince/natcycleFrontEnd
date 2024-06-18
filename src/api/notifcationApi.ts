import api from "./api";


const notificationApi = {
  getAllNotifications: async () => {
    const response = await api.get("/notification");
    return response;
  },
  markAsRead: async (id: string) => {
    const response = await api.put(`/notification/${id}`);
    return response;
  },
  deleteNotification: async (id: string) => {
    const response = await api.delete(`/notification/${id}`);
    return response;
  },
  deleteAllNotifications: async () => {
    const response = await api.delete("/notification");
    return response;
  },
};

export default notificationApi;