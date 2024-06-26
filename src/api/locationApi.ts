/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

const LocationApi = {
  getLocations: async () => {
    const response = await api.get("/location");
    return response.data;
  },

  getLocation: async (id: string) => {
    const response = await api.get(`/location/${id}`);
    return response.data;
  },

  createLocation: async (body: any) => {
    const response = await api.post("/location", body);
    return response.data;
  },

  updateLocation: async (id: string, body: any) => {
    const response = await api.put(`/location/${id}`, body);
    return response.data;
  },
  
  deleteLocation: async (id: string) => {
    const response = await api.delete(`/location/${id}`);
    return response.data;
  },
};

export default LocationApi;
