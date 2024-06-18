import api from "./api";

const supportTicketApi = {
  getAllSupportTickets: async () => {
    const response = await api.get("/support-ticket");
    return response;
  },
  createSupportTicket: async (data: any) => {
    const response = await api.post("/support-ticket", data);
    return response;
  },
  deleteSupportTicket: async (id: string) => {
    const response = await api.delete(`/support-ticket/${id}`);
    return response;
  },
};

export default supportTicketApi;