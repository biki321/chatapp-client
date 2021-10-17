import Login from "./Login";
import "../static/style/landing.css";
import { NavLink } from "react-router-dom";

export default function Landing() {
  return (
    <div className="landing-page-div">
      <div className="landing-page">
        <Login />

        <div className="toggle-line">
          Create new account?{" "}
          <NavLink to="/signup" className="toggle-btn">
            Sign Up
          </NavLink>
        </div>
      </div>
    </div>
  );
}
