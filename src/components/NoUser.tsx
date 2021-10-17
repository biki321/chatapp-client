import LogoutButton from "./LogoutButton";
import "../static/style/nouser.css";

export default function NoUser() {
  return (
    <div className="no-user-div">
      <p className="no-user-line">No user Exist</p>
      <LogoutButton />
    </div>
  );
}
