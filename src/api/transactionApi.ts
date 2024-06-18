/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

const transactionApi = {
  // get all transactions
  getAllTransactions: async (query?: any) => {
    const response = await api.get("/transaction", { params: query });
    return response;
  },

  adminGetAllTransactions: async () => {
    const response = await api.get("/transaction/admin");
    return response;
  },

  // get all users transaction
  getUserTransactions: async (id: string) => {
    const response = await api.get(`/transaction/admin/${id}`);
    return response;
  },

  // place withdrawal request
  placeWithdrawalRequest: async (body: any) => {
    const response = await api.post(`/transaction/withdraw`, body);
    return response;
  },

  // get all withdrawal requests
  getAllWithdrawalRequests: async () => {
    const response = await api.get("/transaction/withdraw");
    return response;
  },

  // create a transaction
  adminCreateTransaction: async (id: string, body: any) => {
    const response = await api.post(`/transaction/admin/${id}`, body);
    return response;
  },

  // delete a transaction
  adminDeleteTransaction: async (id: string) => {
    const response = await api.delete(`/transaction/admin/${id}`);
    return response;
  },

  adminApproveWithdrawal: async (id: string) => {
    const response = await api.put(`/transaction/admin/withdraw/${id}`);
    return response;
  },

  adminGetAllWithdrawalRequests: async () => {
    const response = await api.get(`/transaction/admin/withdrawal/requests`);
    return response;
  }
};

export default transactionApi;