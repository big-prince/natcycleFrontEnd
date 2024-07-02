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

  cancelPickUp: async (id: string) => {
    const response = await api.delete(`/pickup/${id}`)
    return response.data
  },

  adminGetPickUps: async (query?: any) => {
    const response = await api.get('/pickup/admin', { params: query })
    return response.data
  },

  adminCompletePickUp: async (id: string) => {
    const response = await api.put(`/pickup/complete/${id}`)
    return response.data
  },

  adminDeletePickUp: async (id: string) => {
    const response = await api.delete(`/pickup/delete/${id}`)
    return response.data
  }
}

export default PickUpApi