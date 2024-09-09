/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

const RewardApi = {
  async adminCreateReward(body: any) {
    return await api.post("/reward", body);
  },

  async adminDeleteAward(id: string) {
    return await api.delete(`/reward/${id}`);
  },

  async adminGetAwards() {
    return await api.get("/reward");
  },

  async adminUpdateAward(id: string, body: any) {
    return await api.put(`/reward/${id}`, body);
  },

  async userGetAwards() {
    return await api.get("/reward/user");
  },

  async userRedeemAward(id: string) {
    return await api.post(`/reward/${id}/redeem`);
  },

  async userGetRedeemedAwards() {
    return api.get("/reward/redeemed");
  },

  async userGetRewards() {
    return await api.get("/reward/user");
  },
};

export default RewardApi;
