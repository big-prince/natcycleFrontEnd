import api from "./api";


const investmentApi = {
  // create a new investment
  createInvestment: async (investmentPayload: any) => {
    const response = await api.post("/investment", investmentPayload);
    return response;
  },

  // get all investments
  getInvestments: async () => {
    const response = await api.get("/investment");
    return response;
  },

  // get a single investment
  getInvestment: async (id: string) => {
    const response = await api.get(`/investment/${id}`);
    return response;
  },

  // update an investment
  updateInvestment: async (id: string, investmentPayload: any) => {
    const response = await api.put(`/investment/${id}`, investmentPayload);
    return response;
  },

  // delete an investment
  deleteInvestment: async (id: string) => {
    const response = await api.delete(`/investment/${id}`);
    return response;
  },
};

export default investmentApi;