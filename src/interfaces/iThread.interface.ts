import IMessage from "./iMessage.interface";
import IModifiedUser from "./iModifiedUser.interface";

export interface IThreadmessage extends IMessage {
  messageId: string;
}

export default interface IThread {
  otherUser: IModifiedUser;
  threadMessage: IThreadmessage | null;
}
