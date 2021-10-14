import IMessage from "../interfaces/iMessage.interface";
import "../static/style/message.css";

interface IProps {
  message: IMessage;
  self: boolean;
}

export default function Message({ message, self }: IProps) {
  let time = new Date(message.timestamp);

  return (
    <div className={`message-box ${self ? "right-side" : "left-side"}`}>
      {self ? <div className="flex1"></div> : null}
      <div className="message-main">
        <div className="message-time">{time.toLocaleString()}</div>
        <div className="message-content">
          <p>{message.text}</p>
        </div>
        <div className="message-status">{message.read ? "seen" : null}</div>
      </div>
    </div>
  );
}
