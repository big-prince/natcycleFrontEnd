import api from "./api";

export interface SimpleDropoffLocation {
  _id: string;
  name: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  address?: string;
  materialType: string;
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
    formData.append("proofPicture", params.proofPicture);

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
}

export default new SimpleDropoffApi();
