import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAxiosIntercept } from "../contexts/AxiosInterceptContext";
import { useSocketContext } from "../contexts/SocketContext";
import IMessage from "../interfaces/iMessage.interface";
import AutoTextArea from "./AutoTextArea";
import Message from "./Message";
import ProfileMessageBox from "./ProfileMessageBox";
import { v4 as uuidv4 } from "uuid";
import IModifiedUser from "../interfaces/iModifiedUser.interface";
import { IoMdSend } from "react-icons/io";
import "../static/style/chat.css";
import monthsMap from "../helpers/monthsMap";
import IUpdateThread from "../interfaces/iUpdateThread.interface";
import Spinner from "./spinner";

interface IProps {
  otherUserId: string;
  setUpdateThread: React.Dispatch<React.SetStateAction<IUpdateThread | null>>;
  setUpdateReadThread: React.Dispatch<React.SetStateAction<number | null>>;
}

export default function Chat({
  otherUserId,
  setUpdateThread,
  setUpdateReadThread,
}: IProps) {
  const { authState } = useAuth();
  const axiosIntercept = useAxiosIntercept();
  const [profile, setProfile] = useState({} as IModifiedUser);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [typedMessageData, setTypedMessageData] = useState({
    typedMessage: "",
    textError: "",
  });
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [sentOrReceivedMsgCount, setSentOrReceivedMsgCount] = useState(0);
  const [lastTimeStamp, setLastTimeStamp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeMsgId, setActiveMsgId] = useState<string | null>(null);
  const { socket } = useSocketContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendReadUpdate = useCallback(
    (unreadMsgIds: string[]) => {
      socket?.emit("update_read", {
        userId: authState.user!.id,
        otherUserId: otherUserId,
        ids: unreadMsgIds,
      });

      //also update the read of the thread message of this otherUser's thread
      setUpdateReadThread((prevState) => (prevState ? prevState + 1 : 1));
    },
    [authState.user, otherUserId, setUpdateReadThread, socket]
  );

  useEffect(() => {
    console.log("fetch message for", otherUserId);
    (async () => {
      try {
        const { data: profileData } = await axiosIntercept.get(
          `/user/${otherUserId}`,
          {
            headers: {
              Authorization: `token ${authState.accessToken}`,
            },
          }
        );
        console.log("profileData", profileData);
        setProfile(profileData);

        const { data: messagesData } = await axiosIntercept.get<IMessage[]>(
          `/chat/messages/${otherUserId}`,
          {
            headers: {
              Authorization: `token ${authState.accessToken}`,
            },
          }
        );
        console.log("messagesData", messagesData);

        console.log(
          "messagesData[-1]?.timestamp",
          messagesData[messagesData.length - 1]
        );

        const l =
          messagesData.length > 0
            ? messagesData[messagesData.length - 1].timestamp
            : null;
        console.log("l is", l);
        setLastTimeStamp(
          messagesData.length > 0
            ? messagesData[messagesData.length - 1].timestamp
            : null
        );

        setMessages([...messagesData]);

        //send read update for unread msgs
        const unreadMsgIds = messagesData
          .filter((element) => !element.read)
          .map((e) => e.id);
        unreadMsgIds.length > 0 && sendReadUpdate(unreadMsgIds);
      } catch (error) {
        setError("error in fetching messagesData");
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.accessToken, axiosIntercept, otherUserId, sendReadUpdate]);

  const onMsgReceiveHandler = useCallback(
    (message: IMessage) => {
      console.log("msg at onMsgReceiveHandler", message);
      if (message.senderId === otherUserId) {
        pushNewMsg(message);
        sendReadUpdate([message.id]);
      }
    },
    [otherUserId, sendReadUpdate]
  );

  const onGetReadUpdate = useCallback(
    ({ otherUserId: otherPartnerId }: { otherUserId: string }) => {
      console.log("msg at onGetReadUpdate");
      if (otherPartnerId === otherUserId) updateRead();
    },
    [otherUserId]
  );

  const onUserStatusHandler = useCallback(
    ({ userId, online }: { userId: string; online: boolean }) => {
      console.log("msg at onUserStatusHandler");
      if (userId === otherUserId) updateUserStatus(online);
    },
    [otherUserId]
  );

  useEffect(() => {
    socket?.on("get_message", onMsgReceiveHandler);
    socket?.on("get_read_update", onGetReadUpdate);
    socket?.on("user_status", onUserStatusHandler);

    return () => {
      socket?.off("get_message", onMsgReceiveHandler);
      socket?.off("get_read_update", onGetReadUpdate);
      socket?.off("user_status", onUserStatusHandler);
    };
  }, [onGetReadUpdate, onMsgReceiveHandler, onUserStatusHandler, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [sentOrReceivedMsgCount]);

  const loadMorePrevMessage = async () => {
    if (lastTimeStamp) {
      setLoadMoreLoading(true);
      console.log("lastTimeStamp", lastTimeStamp);
      try {
        const { data: messagesData } = await axiosIntercept.get<IMessage[]>(
          `/chat/messages/${otherUserId}`,
          {
            headers: {
              Authorization: `token ${authState.accessToken}`,
            },
            params: lastTimeStamp ? { lastTimeStamp } : {},
          }
        );
        console.log("messagesData", messagesData);

        console.log(
          "messagesData[-1]?.timestamp",
          messagesData[messagesData.length - 1]
        );
        setLastTimeStamp(
          messagesData.length > 0
            ? messagesData[messagesData.length - 1].timestamp
            : null
        );

        setMessages((prevState) => [...prevState, ...messagesData]);

        //send read update for unread msgs
        const unreadMsgIds = messagesData
          .filter((element) => !element.read)
          .map((e) => e.id);
        unreadMsgIds.length > 0 && sendReadUpdate(unreadMsgIds);
      } catch (error) {
        setError("error in fetching messagesData");
      }
      setLoadMoreLoading(false);
    }
  };

  const sendMsg = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
    if (typedMessageData.typedMessage.length > 500) {
      setTypedMessageData((prevState) => ({
        ...prevState,
        textError: "msg length should be 1 to 500",
      }));
      return;
    }
    const uuid = uuidv4();
    console.log("Your UUID is: " + uuid);
    const msg = {
      userId: authState.user!.id,
      otherUserId: otherUserId,
      id: uuid,
      senderId: authState.user!.id,
      text: typedMessageData.typedMessage,
      timestamp: new Date().toISOString(),
    };

    socket?.emit("send_message", msg);
    pushNewMsg(msg);
    setTypedMessageData({ typedMessage: "", textError: "" });

    // setUpdateThread
    // for pushing message to thread
    setUpdateThread({
      otherUserId: otherUserId,
      threadMessage: { ...msg, messageId: msg.id },
    });
  };

  const updateUserStatus = (online: boolean) => {
    setProfile((prevState) => ({ ...prevState, online: online }));
  };

  const updateRead = () => {
    setMessages((prevState) =>
      prevState.map((element) =>
        !element.read ? { ...element, read: true } : element
      )
    );
  };

  const pushNewMsg = (msg: IMessage) => {
    setMessages((prevState) => [msg, ...prevState]);
    setSentOrReceivedMsgCount((prevState) => prevState + 1);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  let lastDate = new Date().toLocaleDateString();
  let currentMsgDate = null;

  return !loading ? (
    <div className="container-chat">
      <div className="error">{error}</div>
      <div className="chat">
        <div className="chat-header">
          <ProfileMessageBox profile={profile!} />
        </div>
        <div className="chat-box">
          <div ref={messagesEndRef} />
          {messages.map((message) => {
            currentMsgDate = new Date(message.timestamp).toLocaleDateString();

            let temp: Date | null = null;
            if (
              new Date(currentMsgDate).getTime() < new Date(lastDate).getTime()
            ) {
              temp = new Date(lastDate);
              lastDate = currentMsgDate;
            } else {
              temp = null;
            }

            return (
              <div key={message.id}>
                <Message
                  activeMsgId={activeMsgId}
                  setActiveMsgId={setActiveMsgId}
                  message={message}
                  self={message.senderId === authState.user!.id}
                />
                {temp ? (
                  <div className="oneday-msgs">
                    {temp.getDate() +
                      " " +
                      monthsMap[temp.getMonth()] +
                      "," +
                      temp.getFullYear()}
                  </div>
                ) : null}
              </div>
            );
          })}

          <div>
            <button className="load-btn" onClick={loadMorePrevMessage}>
              {loadMoreLoading ? "loading" : "load more"}
            </button>
          </div>
        </div>

        <div className="text-error">{typedMessageData.textError}</div>
        <div className="chat-footer">
          <AutoTextArea
            onChange={(e) =>
              setTypedMessageData({
                typedMessage: e.target.value,
                textError: "",
              })
            }
            minChars={0}
            maxChars={500}
            text={typedMessageData.typedMessage}
            placeholder="type your message"
          />
          <IoMdSend className="message-send-btn" onClick={(e) => sendMsg(e)} />
        </div>
      </div>
    </div>
  ) : (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Spinner width="50px" />
    </div>
  );
}
