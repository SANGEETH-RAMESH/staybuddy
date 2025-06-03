export interface IUserResponse {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  isAdmin: boolean;
  isBlock: boolean;
  wallet_id: string | null;
}
