import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router";

export default function ChatAppComp() {
  const { logout } = useAuth();
  const history = useHistory();

  console.log("chatAppComp inside");

  const logoutHandler = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    logout(() => {
      history.replace("/");
    });
  };

  return (
    <div>
      chatapp
      <button onClick={(e) => logoutHandler(e)}>logout</button>
    </div>
  );
}
