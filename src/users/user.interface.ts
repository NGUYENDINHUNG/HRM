import { Types } from 'mongoose';
export interface IUser {
  _id:  string;
  email: string;
  name: string;
  phone: string;
  address: string;
}
