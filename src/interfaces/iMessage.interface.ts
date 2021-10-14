export default interface IMessage {
  userId: string;
  otherUserId: string;
  id: string;
  senderId: string;
  text: string;
  read?: boolean;
  timestamp: string;
}
