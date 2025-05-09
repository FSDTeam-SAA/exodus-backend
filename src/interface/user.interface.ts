import { Document, Model } from "mongoose";

export interface IUser extends Document {
    _id: string;
    name: string
    email: string
    password?: string,
    username: string,
    credit: number,
    role: "admin" | "user" | "driver",
    verificationInfo: {
        verified: boolean,
        token: string,
    },
    avatar: string,
    password_reset_token: string,
  }
  export type TLoginUser = {
    email: string;
    password: string;
  };
  export interface UserModel extends Model<IUser> {
    isUserExistsByEmail(email: string): Promise<IUser>;
    isOTPVerified(id:string) : Promise<boolean>;
    isPasswordMatched(plainTextPassword: string, hashPassword: string): Promise<boolean>;
    isJWTIssuedBeforePasswordChanged(passordChangeTimeStamp: Date, JwtIssuedTimeStamp: number): boolean;
  }