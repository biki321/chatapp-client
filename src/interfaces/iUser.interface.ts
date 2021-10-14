export default interface IUser {
  id: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  tokenVersion: number;
}
