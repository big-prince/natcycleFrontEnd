/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api'

const DropOffApi = {
  async addDropOff(dropOff: any) {
    return await api.post('dropOff', dropOff)
  },
  async getDropOffs() {
    return await api.get('dropOff')
  },
  async getDropOffById(id: string) {
    return await api.get(`dropOff/${id}`)
  },
  async updateDropOffStatus(id: string, dropOff: any) {
    return await api.put(`dropOff/${id}`, dropOff)
  },
  // adminGetDropOffs
  async adminGetDropOffs() {
    return await api.get('dropOff/admin')
  },
}

export default DropOffApi