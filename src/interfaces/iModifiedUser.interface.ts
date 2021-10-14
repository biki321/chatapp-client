import IUser from "./iUser.interface";

export default interface IModifiedUser extends IUser {
  online: boolean;
}
