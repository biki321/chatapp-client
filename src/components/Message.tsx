import IMessage from "../interfaces/iMessage.interface";
import "../static/style/message.css";
import monthsMap from "../helpers/monthsMap";

interface IProps {
  message: IMessage;
  self: boolean;
}

export default function Message({ message, self }: IProps) {
  const time = new Date(message.timestamp);

  return (
    <div className={`message-box ${self ? "right-side" : "left-side"}`}>
      {self ? <div className="flex1"></div> : null}
      <div className="message-main">
        <div className="message-time">
          {time.getDate() +
            " " +
            monthsMap[time.getMonth()] +
            " at " +
            time.getHours() +
            ":" +
            time.getMinutes()}
        </div>
        <div className="message-content">
          <p>{message.text}</p>
        </div>
        <div className="message-status">{message.read ? "seen" : null}</div>
      </div>
    </div>
  );
}
