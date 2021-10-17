import { useHistory } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import "../static/style/logoutBtn.css";

export default function LogoutButton() {
  const { logout } = useAuth();
  const history = useHistory();

  const logoutHandler = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    logout(() => {
      history.replace("/");
    });
  };

  return (
    <div className="logout-btn" onClick={(e) => logoutHandler(e)}>
      logout
    </div>
  );
}
