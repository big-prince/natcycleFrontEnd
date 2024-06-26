/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api'

const PickUpApi = {
  getPickUps: async () => {
    const response = await api.get('/pickup')
    return response.data
  },

  getPickUp: async (id: string) => {
    const response = await api.get(`/pickup/${id}`)
    return response.data
  },

  createPickUp: async (body: any) => {
    const response = await api.post('/pickup', body)
    return response.data
  },

  deletePickUp: async (id: string) => {
    const response = await api.delete(`/pickup/${id}`)
    return response.data
  },
}

export default PickUpApi