import { IThreadmessage } from "./iThread.interface";

export default interface IUpdateThread {
  otherUserId: string;
  threadMessage: IThreadmessage;
}
