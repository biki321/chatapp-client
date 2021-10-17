import "../static/style/chatApp.css";
import Threads from "./Threads";
import Chat from "./Chat";
import { useState } from "react";
import IUpdateThread from "../interfaces/iUpdateThread.interface";

export default function ChatApp() {
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  // this state is used to show message in thread which are sent by the authUser
  const [updateThread, setUpdateThread] = useState<IUpdateThread | null>(null);
  const [updateReadThread, setUpdateReadThread] = useState<number | null>(null);

  return (
    <div className="container-chatapp">
      <Threads
        setCurrentThreadId={setCurrentThreadId}
        currentThreadId={currentThreadId}
        updateThread={updateThread}
        updateReadProp={updateReadThread}
      />
      {currentThreadId ? (
        <Chat
          otherUserId={currentThreadId}
          setUpdateThread={setUpdateThread}
          setUpdateReadThread={setUpdateReadThread}
        />
      ) : (
        <div className="chat-blank">
          <div className="welcome-title">Welcome to ChatApp</div>
          <div className="subtitle">Have a good time with your buddies</div>
        </div>
      )}
    </div>
  );
}
