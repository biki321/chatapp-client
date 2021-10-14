import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAxiosIntercept } from "../contexts/AxiosInterceptContext";
import { useSocketContext } from "../contexts/SocketContext";
import IMessage from "../interfaces/iMessage.interface";
import mic from "../static/img/mic.png";
import AutoTextArea from "./AutoTextArea";
import Message from "./Message";
import ProfileMessageBox from "./ProfileMessageBox";
import { v4 as uuidv4 } from "uuid";
import IModifiedUser from "../interfaces/iModifiedUser.interface";

interface IProps {
  otherUserId: string;
}

export default function Chat({ otherUserId }: IProps) {
  const { authState } = useAuth();
  const axiosIntercept = useAxiosIntercept();
  const [profile, setProfile] = useState({} as IModifiedUser);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastTimeStamp, setLastTimeStamp] = useState<string | null>(null);
  const [loadMore, setLoadMore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocketContext();

  const sendReadUpdate = useCallback(
    (unreadMsgIds: string[]) => {
      socket?.emit("update_read", {
        userId: authState.user!.id,
        otherUserId: otherUserId,
        ids: unreadMsgIds,
      });
    },
    [authState.user, otherUserId, socket]
  );

  useEffect(() => {
    console.log("at chat useffect");
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
      } catch (error) {
        setError("error in fetching messagesData");
      }
    })();
  }, [authState.accessToken, axiosIntercept, otherUserId]);

  useEffect(() => {
    (async () => {
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
        setLastTimeStamp((prevState) => {
          const length = messagesData.length;
          if (length > 0) return messagesData[length - 1].timestamp;
          else return prevState;
        });

        setMessages((prevState) => [...prevState, ...messagesData]);

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
  }, [
    authState.accessToken,
    axiosIntercept,
    otherUserId,
    sendReadUpdate,
    loadMore,
  ]);

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

  const loadMorePrevMessage = async () => {
    setLoadMore((prevState) => prevState + 1);
  };

  const sendMsg = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    if (typedMessage.length < 1 || typedMessage.length > 500) {
      setError("msg length should be 1 to 500");
      return;
    }
    const uuid = uuidv4();
    console.log("Your UUID is: " + uuid);
    const msg = {
      userId: authState.user!.id,
      otherUserId: otherUserId,
      id: uuid,
      senderId: authState.user!.id,
      text: typedMessage,
      timestamp: new Date().toISOString(),
    };

    socket?.emit("send_message", msg);
    pushNewMsg(msg);
    setTypedMessage("");
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
  };

  return !loading ? (
    <div className="container-chat">
      <div className="chat">
        <div className="chat-header">
          <ProfileMessageBox profile={profile!} />
        </div>
        <div className="chat-box">
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              self={message.senderId === authState.user!.id}
            />
          ))}
          <div>
            <button className="loadBtn" onClick={loadMorePrevMessage}>
              load
            </button>
          </div>
        </div>

        <div className="chat-footer">
          <AutoTextArea
            onChange={(e) => setTypedMessage(e.target.value)}
            minChars={0}
            maxChars={500}
            text={typedMessage}
          />

          <img src={mic} className="mic" alt="" onClick={(e) => sendMsg(e)} />
        </div>
      </div>
    </div>
  ) : (
    <div>loading </div>
  );
}
