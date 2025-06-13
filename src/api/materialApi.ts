import api from "./api";

const materialApi = {
  getAllMaterials: () => {
    return api.get("/materials");
  },
  getMaterialsCategory: () => {
    return api.get("/materials/primary-types");
  },
  getSubCategories: (primaryType: string) => {
    return api.get(`/materials/subtypes/${primaryType}`);
  },
  getMaterialById: (id: string) => {
    return api.get(`/materials/${id}`);
  },
  createMaterial: (formData: FormData) => {
    // FormData is suitable for file uploads
    return api.post("/materials", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updateMaterial: (id: string, formData: FormData) => {
    return api.patch(`/materials/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteMaterial: (id: string) => {
    return api.delete(`materials/${id}`);
  },
};

export default materialApi;
