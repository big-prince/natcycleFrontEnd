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
  impactMeasurement: string;
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
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