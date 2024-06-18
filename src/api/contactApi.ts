/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

const contactApi = {
  // get all contacts
  getAllContacts: async () => {
    const response = await api.get("/contacts");
    return response;
  },

  // create a contact
  createContact: async (body: any) => {
    const response = await api.post("/contacts", body);
    return response;
  },

  // delete a contact
  deleteContact: async (id: string) => {
    const response = await api.delete(`/contacts/${id}`);
    return response;
  },

}

export default contactApi;