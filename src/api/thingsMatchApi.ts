import api from "./api";

const thingsMatchApi = {
  async getAllUsers(signal?: AbortSignal) {
    return await api.get("thingsMatch/TMadmin/users", { signal });
  },
  async getUserById(id: string, signal?: AbortSignal) {
    return await api.get(`thingsMatch/TMadmin/users/${id}`, { signal });
  },
  async getAllItems(signal?: AbortSignal) {
    return await api.get("thingsMatch/TMadmin/items", { signal });
  },
  async getItemById(id: string, signal?: AbortSignal) {
    return await api.get(`thingsMatch/TMadmin/items/${id}`, { signal });
  },
  async getAllMatches(signal?: AbortSignal) {
    return await api.get("thingsMatch/TMadmin/matches", { signal });
  },
  async getMatchById(id: string, signal?: AbortSignal) {
    return await api.get(`thingsMatch/TMadmin/matches/${id}`, { signal });
  },
};

export default thingsMatchApi;
