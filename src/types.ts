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
}

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
  profilePicture?: { // Optional profile picture object
    public_id: string;
    url: string;
  };
  referralId: string;
  totalItemsCollected: number;
}

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
}

export type { LoginPayload };

export type IBadge = {
  _id: string;
  name: string;
  description: string;
  image: {
    public_id: string;
    url: string;
  }
}

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
  campaign? : {
    name: string;
  }
}