import IMessage from "../interfaces/iMessage.interface";
import "../static/style/message.css";
import monthsMap from "../helpers/monthsMap";

interface IProps {
  message: IMessage;
  self: boolean;
  activeMsgId: string | null;
  setActiveMsgId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function Message({
  message,
  self,
  setActiveMsgId,
  activeMsgId,
}: IProps) {
  const time = new Date(message.timestamp);

  const setActiveMsgIdHandler = (msgId: string) => {
    if (activeMsgId && activeMsgId === msgId) {
      setActiveMsgId(null);
    } else setActiveMsgId(msgId);
  };

  return (
    <div className={`message-box ${self ? "right-side" : "left-side"}`}>
      {self ? <div className="flex1"></div> : null}
      <div className="message-main">
        {activeMsgId && activeMsgId === message.id && (
          <div className="message-time">
            {time.getDate() +
              " " +
              monthsMap[time.getMonth()] +
              " at " +
              time.getHours() +
              ":" +
              time.getMinutes()}
          </div>
        )}
        <div
          className="message-content"
          onClick={() => setActiveMsgIdHandler(message.id)}
        >
          <p>{message.text}</p>
        </div>
        {activeMsgId && activeMsgId === message.id && (
          <div className="message-status">{message.read ? "seen" : null}</div>
        )}
      </div>
    </div>
  );
}
