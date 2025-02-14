/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api'

const dropOffLocationApi = {
  async addDropOffLocation(dropOffLocation: any) {
    return await api.post('dropOff-location', dropOffLocation)
  },
  async getDropOffLocations() {
    return await api.get('dropOff-location')
  },

  async getNearestDropOffLocations(userLocation: any) {
    return await api.get('dropOff-location/nearest/location', { params: userLocation })
  },

  async getDropOffLocationById(id: string) {
    return await api.get(`dropOff-location/${id}`)
  },

  async updateDropOffLocation(id: string, dropOffLocation: any) {
    return await api.put(`dropOff-location/${id}`, dropOffLocation)
  },

  async deleteDropOffLocation(id: string) {
    return await api.delete(`dropOff-location/${id}`)
  }
}

export default dropOffLocationApi

