import pp from "../static/img/pp.png";
import "../static/style/threads.css";
import IThread from "../interfaces/iThread.interface";
import { useCallback, useEffect, useState } from "react";
import { useSocketContext } from "../contexts/SocketContext";
import IMessage from "../interfaces/iMessage.interface";
import { useAuth } from "../contexts/AuthContext";
import { useAxiosIntercept } from "../contexts/AxiosInterceptContext";
import IModifiedUser from "../interfaces/iModifiedUser.interface";

interface IProps {
  setCurrentThread: (threadId: string) => void;
}

export default function Threads({ setCurrentThread }: IProps) {
  const { socket } = useSocketContext();
  const { authState } = useAuth();
  const axiosIntercept = useAxiosIntercept();
  const [threads, setThreads] = useState<IThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onMsgReceive = useCallback((msg: IMessage) => {
    setThreads((prevState) => {
      let senderProile: IModifiedUser | null = null;
      const filteredState = prevState.filter((thread: IThread, i) => {
        if (thread.otherUser.id === msg.senderId) {
          senderProile = thread.otherUser;
          return false;
        } else {
          return true;
        }
      });

      if (senderProile) {
        return [
          {
            otherUser: senderProile,
            threadMessage: { ...msg, messageId: msg.id },
          },
          ...filteredState,
        ];
      }
      return filteredState;
    });
  }, []);

  const onGetReadReciptUpdate = useCallback(
    ({ userId, otherUserId }: { userId: string; otherUserId: string }) => {
      console.log("msg at onGetReadUpdate");
      updateRead(userId, otherUserId);
    },
    []
  );

  const onThreadStatusHandler = useCallback(
    ({ userId, online }: { userId: string; online: boolean }) => {
      console.log("msg at onThreadStatusHandler");
      setThreads((prevState) => {
        return prevState.map((thread) =>
          thread.otherUser.id === userId
            ? { ...thread, otherUser: { ...thread.otherUser, online: online } }
            : thread
        );
      });
    },
    []
  );

  useEffect(() => {
    console.log("at useeffect threads comp");
    (async () => {
      try {
        const { data: threadsData } = await axiosIntercept.get(
          "/chat/threads",
          {
            headers: {
              Authorization: `token ${authState.accessToken}`,
            },
          }
        );
        console.log("threadsData", threadsData);
        setThreads(threadsData);
      } catch (error) {
        setError("error in fetching threads");
      }
      setLoading(false);
    })();
  }, [authState.accessToken, axiosIntercept]);

  useEffect(() => {
    socket?.on("get_message", onMsgReceive);
    socket?.on("get_read_update", onGetReadReciptUpdate);
    socket?.on("user_status", onThreadStatusHandler);

    return () => {
      socket?.off("get_message", onMsgReceive);
      socket?.off("get_read_update", onGetReadReciptUpdate);
      socket?.off("user_status", onThreadStatusHandler);
    };
  }, [onGetReadReciptUpdate, onMsgReceive, onThreadStatusHandler, socket]);

  const updateRead = (userId: string, otherUserId: string) => {
    setThreads((prevState) =>
      prevState.map((element) =>
        element.otherUser.id === otherUserId
          ? { ...element, read: true }
          : element
      )
    );
  };

  return !loading ? (
    <>
      <div>{authState.user?.username}</div>
      <div className="container-threads">
        {threads.map((thread) => (
          <div
            key={thread.otherUser.id}
            className="profile thread"
            onClick={(e) => setCurrentThread(thread.otherUser.id)}
          >
            <img
              src={thread.otherUser?.avatar || pp}
              className="profile-pic"
              alt=""
            />
            <div className="profile-name">
              <h3>
                {thread.otherUser.username}..
                {thread.otherUser.online ? "on" : "off"}
              </h3>
              <span className="unread-message">
                {thread.threadMessage?.text.substr(0, 10)}
              </span>
            </div>
            <div className="thread-time">11:15</div>
          </div>
        ))}
      </div>
    </>
  ) : (
    <div>loading</div>
  );
}
