import api from "./api";


const withdrawApi = {
  // get all withdraws
  getAllWithdraws: async () => {
    const response = await api.get("/withdraw");
    return response;
  },

  // create a withdraw
  createWithdraw: async (body: any) => {
    const response = await api.post("/withdraw", body);
    return response;
  },

  // delete a withdraw
  deleteWithdraw: async (id: string) => {
    const response = await api.delete(`/withdraw/${id}`);
    return response;
  },
}

export default withdrawApi;