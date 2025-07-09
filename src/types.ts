/* eslint-disable @typescript-eslint/no-explicit-any */
// types.ts

// LoginPayload
type LoginPayload = {
  email: string;
  password: string;
};

export type SigninPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type ILocation = {
  _id: string;
  name: string;
  address: string;
  state: string;
  hidden: boolean;
};

export type IUser = {
  _id: string;
  carbonUnits: number;
  createdAt: string; // Date string in ISO 8601 format (e.g., "2024-06-26T12:36:08.043Z")
  email: string;
  firstName: string;
  impactMeasurement: string; // Measurement unit (e.g., "birds")
  isAdmin: boolean;
  isBlocked: boolean;
  lastName: string;
  point: number;
  pointsEarned: number;
  profilePicture?: {
    // Optional profile picture object
    public_id: string;
    url: string;
  };
  referralId: string;
  totalItemsCollected: number;
};

export type Pickup = {
  createdAt: string;
  description: string;
  itemType: string;
  location: ILocation;
  pointsEarned: number;
  points_earned: number;
  scheduledDate: string;
  scheduledTimeEnd: string;
  scheduledTimeStart: string;
  status: string;
  updatedAt: string;
  user: IUser;
  __v: number;
  _id: string;
};

export type { LoginPayload };

export type IBadge = {
  _id: string;
  name: string;
  description: string;
  image: {
    public_id: string;
    url: string;
  };
};

export type IReward = {
  status: string;
  image: {
    public_id: string;
    url: string;
  };
  _id: string;
  name: string;
  description: string;
  pointsRequired: number;
  sponsorName: string;
  sponsorLink: string;
};

export type IPickup = {
  _id: string;
  createdAt: string;
  itemType: string;
  itemsCount: number;
  location: {
    _id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  description: string;
  pointsEarned: number;
  scheduledDate: Date;
  scheduledTimeEnd: string;
  scheduledTimeStart: string;
  status: string;
  updatedAt: string;
  completedAt: string;
  user: IUser;
  completedBy: string;
  campaign?: {
    name: string;
  };
};

export interface NormalizedPlaceData {
  address: string; // Full formatted address
  latitude: string;
  longitude: string;
  name?: string; // A derived name for the location (e.g., "Starbucks Main St" or "123 Main St")
  city?: string;
  country?: string;
  postalCode?: string;
  providerRawData?: any; // Optional: store the raw response from the provider
}

export type IDropOff = {
  _id: string;
  location: ILocation;
  itemType: string;
  itemQuantity: number;
  description: string;
  user: IUser;
  pointsEarned: number;
  createdAt: string;
  updatedAt: string;
};

export type LocationType = "regular" | "simple" | "all";

export type DropoffMode = "regular" | "simple";

export interface ISimpleDropoffLocation {
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

export interface ISimpleDropoff {
  _id: string;
  user: string;
  simpleDropOffLocation: ISimpleDropoffLocation;
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

export interface CombinedLocationData {
  regular: any[]; // Your existing location type
  simple: ISimpleDropoffLocation[];
  all: (any | ISimpleDropoffLocation)[];
}
