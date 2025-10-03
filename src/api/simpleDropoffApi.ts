import api from "./api";

export interface SimpleDropoffLocation {
  id: string;
  name: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  address?: string;
  materialType: string;
  bulkMaterialTypes?: string[]; // New field for multiple material types
  acceptedSubtypes?: string[];
  organizationName?: string;
  isActive: boolean;
  verificationRequired: boolean;
  maxItemsPerDropOff: number;
  operatingHours?: string;
  contactNumber?: string;
  lastVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
  distance?: number; // Added when fetching nearby locations
}

export interface SimpleDropoff {
  _id: string;
  user: string;
  simpleDropOffLocation: SimpleDropoffLocation;
  materialType: string;
  quantity: number;
  proofPicture: {
    public_id: string;
    url: string;
  };
  cuEarned: number;
  isVerified: boolean;
  rejectionReason?: string;
  gpsCordinates: {
    type: "Point";
    coordinates: [number, number];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface NearbyLocationsParams {
  latitude: number;
  longitude: number;
  radius?: number;
  materialType?: string;
  limit?: number;
}

export interface CreateSimpleDropoffParams {
  simpleDropOffLocationId: string;
  materialType: string;
  quantity: number;
  latitude: number;
  longitude: number;
  proofPicture: File;
}

export interface SimpleDropoffStats {
  totalDropoffs: number;
  totalCuEarned: number;
  verifiedDropoffs: number;
  pendingDropoffs: number;
  materialBreakdown: { [key: string]: number };
}

class SimpleDropoffApi {
  // Location endpoints
  async getNearbyLocations(params: NearbyLocationsParams) {
    const searchParams = new URLSearchParams({
      latitude: params.latitude.toString(),
      longitude: params.longitude.toString(),
      ...(params.radius && { radius: params.radius.toString() }),
      ...(params.materialType && { materialType: params.materialType }),
      ...(params.limit && { limit: params.limit.toString() }),
    });

    return api.get(`/simple-dropoff-locations/nearby?${searchParams}`);
  }

  async getLocationById(id: string) {
    return api.get(`/simple-dropoff-locations/${id}`);
  }

  async getMaterialTypes() {
    return api.get("/simple-dropoff-locations/material-types");
  }

  // Dropoff endpoints
  async createSimpleDropoff(params: CreateSimpleDropoffParams) {
    const formData = new FormData();
    formData.append("simpleDropOffLocationId", params.simpleDropOffLocationId);
    formData.append("materialType", params.materialType);
    formData.append("quantity", params.quantity.toString());
    formData.append("latitude", params.latitude.toString());
    formData.append("longitude", params.longitude.toString());
    formData.append("file", params.proofPicture); // Changed from "proofPicture" to "file"

    return api.post("/simple-dropoffs", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async getMyDropoffs(
    page = 1,
    limit = 10,
    filters?: {
      materialType?: string;
      isVerified?: boolean;
    }
  ) {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.materialType && { materialType: filters.materialType }),
      ...(filters?.isVerified !== undefined && {
        isVerified: filters.isVerified.toString(),
      }),
    });

    return api.get(`/simple-dropoffs/my-dropoffs?${searchParams}`);
  }

  async getUserSimpleDropOffs(userId: string) {
    return api.get(`/simple-dropoffs/user/${userId}`);
  }

  async getMyStats() {
    return api.get("/simple-dropoffs/my-stats");
  }

  async getDropoffById(id: string) {
    return api.get(`/simple-dropoffs/${id}`);
  }

  // Admin endpoints
  async adminGetLocations(
    page = 1,
    limit = 10,
    filters?: {
      materialType?: string;
      isActive?: boolean;
    }
  ) {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.materialType && { materialType: filters.materialType }),
      ...(filters?.isActive !== undefined && {
        isActive: filters.isActive.toString(),
      }),
    });

    return api.get(`/simple-dropoff-locations?${searchParams}`);
  }

  async adminGetLocationById(id: string) {
    return api.get(`/simple-dropoff-locations/${id}`);
  }

  async adminCreateLocation(locationData: {
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    materialType: string;
    bulkMaterialTypes?: string[];
    acceptedSubtypes?: string[];
    organizationName?: string;
    isActive: boolean;
    verificationRequired: boolean;
    maxItemsPerDropOff: number;
    operatingHours?: string;
    contactNumber?: string;
  }) {
    return api.post("/simple-dropoff-locations", locationData);
  }

  async adminUpdateLocation(
    id: string,
    locationData: Partial<{
      name: string;
      latitude: number;
      longitude: number;
      address: string;
      materialType: string;
      bulkMaterialTypes: string[];
      acceptedSubtypes: string[];
      organizationName: string;
      isActive: boolean;
      verificationRequired: boolean;
      maxItemsPerDropOff: number;
      operatingHours: string;
      contactNumber: string;
    }>
  ) {
    return api.put(`/simple-dropoff-locations/${id}`, locationData);
  }

  async adminDeleteLocation(id: string) {
    return api.delete(`/simple-dropoff-locations/${id}`);
  }

  async adminVerifyLocation(id: string) {
    console.log(id);
    return api.patch(`/simple-dropoff-locations/${id}/verify`);
  }

  async adminGetDropoffs(
    page = 1,
    limit = 10,
    filters?: {
      userId?: string;
      materialType?: string;
      isVerified?: boolean;
      startDate?: string;
      endDate?: string;
    }
  ) {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.userId && { userId: filters.userId }),
      ...(filters?.materialType && { materialType: filters.materialType }),
      ...(filters?.isVerified !== undefined && {
        isVerified: filters.isVerified.toString(),
      }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
    });

    return api.get(`/simple-dropoffs?${searchParams}`);
  }

  async adminGetPendingDropoffs(page = 1, limit = 10) {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      isVerified: "false",
    });

    return api.get(`/simple-dropoffs/admin/pending?${searchParams}`);
  }

  async adminGetStats() {
    return api.get("/simple-dropoffs/admin/stats");
  }

  async adminVerifyDropoff(
    id: string,
    isApproved: boolean,
    rejectionReason?: string
  ) {
    return api.patch(`/simple-dropoffs/${id}/verify`, {
      isApproved,
      ...(rejectionReason && { rejectionReason }),
    });
  }

  async adminBulkVerifyDropoffs(
    ids: string[],
    isApproved: boolean,
    rejectionReason?: string
  ) {
    return api.patch("/simple-dropoffs/admin/bulk-verify", {
      ids,
      isApproved,
      ...(rejectionReason && { rejectionReason }),
    });
  }

  async adminDeleteDropoff(id: string) {
    return api.delete(`/simple-dropoffs/${id}`);
  }

  async adminGetLocationStats() {
    return api.get("/simple-dropoff-locations/admin/statistics");
  }

  async searchLocations(params?: {
    search?: string;
    limit?: number;
    page?: number;
  }) {
    return api.get("/simple-dropoff-locations/search", { params });
  }
}

export default new SimpleDropoffApi();
