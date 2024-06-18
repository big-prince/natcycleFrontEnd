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

export type Balance = {
  total_balance: number;
  btc_equivalent: number;
  pending_deposit: number;
  total_deposit: number
  total_profit: number;
  total_trades: number;

};

export type User = {
  account: Balance;
  country: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isBlocked: boolean;
  profilePicture: {
    url: string;
  }
  updatedAt: string;
  _id: string;
  verificationStatus: string;
  verificationFile: any;
  withdrawalCode: string;
  createdAt: string;
};

export type { LoginPayload };