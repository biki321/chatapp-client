import "../static/style/chatApp.css";
import Threads from "./Threads";
import Chat from "./Chat";
import { useState } from "react";

export default function ChatApp() {
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);

  console.log("chatAppComp inside");

  const setCurrentThread = (threadId: string) => {
    setCurrentThreadId(threadId);
  };
  return (
    <div className="container-chatapp">
      <Threads setCurrentThread={setCurrentThread} />
      {currentThreadId ? <Chat otherUserId={currentThreadId} /> : <div></div>}
    </div>
  );
}

// const logoutHandler = (
//   e: React.MouseEvent<HTMLButtonElement, MouseEvent>
// ) => {
//   e.preventDefault();
//   logout(() => {
//     history.replace("/");
//   });
// };
