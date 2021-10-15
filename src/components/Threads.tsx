import pp from "../static/img/pp.png";
import "../static/style/threads.css";
import IThread from "../interfaces/iThread.interface";
import { useCallback, useEffect, useState } from "react";
import { useSocketContext } from "../contexts/SocketContext";
import IMessage from "../interfaces/iMessage.interface";
import { useAuth } from "../contexts/AuthContext";
import { useAxiosIntercept } from "../contexts/AxiosInterceptContext";
import IModifiedUser from "../interfaces/iModifiedUser.interface";
import IUpdateThread from "../interfaces/iUpdateThread.interface";
import { useHistory } from "react-router-dom";

interface IProps {
  currentThreadId: string | null;
  setCurrentThreadId: React.Dispatch<React.SetStateAction<string | null>>;
  updateThread: IUpdateThread | null;
  updateReadProp: number | null;
}

export default function Threads({
  setCurrentThreadId,
  currentThreadId,
  updateThread,
  updateReadProp,
}: IProps) {
  const { socket } = useSocketContext();
  const { authState, logout } = useAuth();
  const axiosIntercept = useAxiosIntercept();
  const [threads, setThreads] = useState<IThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

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
    socket?.on("user_status", onThreadStatusHandler);

    return () => {
      socket?.off("get_message", onMsgReceive);
      socket?.off("user_status", onThreadStatusHandler);
    };
  }, [onMsgReceive, onThreadStatusHandler, socket]);

  useEffect(() => {
    if (updateThread) {
      setThreads((prevState) =>
        prevState.map((thread) => {
          if (updateThread.otherUserId === thread.otherUser.id)
            return {
              otherUser: { ...thread.otherUser },
              threadMessage: {
                ...updateThread.threadMessage,
              },
            };
          else return thread;
        })
      );
    }
  }, [updateThread]);

  useEffect(() => {
    if (updateReadProp && currentThreadId) {
      console.log("inside updateRead");
      updateRead(currentThreadId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateReadProp]);

  const updateRead = (otherUserId: string) => {
    setThreads((prevState) =>
      prevState.map((element) =>
        element.otherUser.id === otherUserId
          ? {
              otherUser: { ...element.otherUser },
              threadMessage: element.threadMessage
                ? { ...element.threadMessage, read: true }
                : null,
            }
          : element
      )
    );
  };

  const logoutHandler = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    logout(() => {
      history.replace("/");
    });
  };

  return !loading ? (
    threads.length > 0 ? (
      <>
        <div className="container-threads">
          <h2 className="brand-name">Chat</h2>
          <div className="owner-profile">
            <img src={authState.user?.avatar || pp} alt="" />
            <h2>{authState.user?.username}</h2>
            <div className="logout" onClick={(e) => logoutHandler(e)}>
              logout
            </div>
          </div>
          <div className="thread-list">
            {threads.map((thread) => (
              <div
                key={thread.otherUser.id}
                className={`profile thread ${
                  currentThreadId
                    ? currentThreadId === thread.otherUser.id
                      ? "current-thread"
                      : ""
                    : ""
                }`}
                onClick={(e) => setCurrentThreadId(thread.otherUser.id)}
              >
                <div className="profile-pic-div">
                  <img src={thread.otherUser?.avatar || pp} alt="" />
                  {thread.otherUser.online && (
                    <div className="thread-online-status">
                      <div className="outer-circle">
                        <div className="inner-circle"></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="profile-name">
                  <h3>{thread.otherUser.username}</h3>
                  {/* if message sent by the authUser then don't use "unread-message class" */}
                  <div
                    className={`thread-msg ${
                      thread.threadMessage?.senderId !== authState.user?.id
                        ? thread.threadMessage?.read
                          ? ""
                          : "unread-message"
                        : ""
                    }`}
                  >
                    {thread.threadMessage?.text.substr(0, 10)}
                  </div>
                </div>

                {thread.threadMessage ? (
                  <div
                    className={`thread-time ${
                      thread.threadMessage?.senderId !== authState.user?.id
                        ? thread.threadMessage?.read
                          ? ""
                          : "unread-message"
                        : ""
                    }`}
                  >
                    {new Date(thread.threadMessage.timestamp).getHours() +
                      ":" +
                      new Date(thread.threadMessage.timestamp).getMinutes()}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </>
    ) : (
      <div>no user exists</div>
    )
  ) : (
    <div>loading</div>
  );
}
