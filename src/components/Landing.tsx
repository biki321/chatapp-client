import { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";
import "../static/style/landing.css";

export default function Landing() {
  const [needLogin, setNeedLogin] = useState(true);

  const setNeedLoginHandler = () => {
    setNeedLogin((prevState) => !prevState);
  };

  return (
    <div className="landing-page-div">
      <div className="landing-page">
        {needLogin ? <Login /> : <SignUp />}
        {needLogin ? (
          <div className="toggle-line">
            Create new account?{" "}
            <span className="toggle-btn" onClick={setNeedLoginHandler}>
              Sign Up
            </span>
          </div>
        ) : (
          <div className="toggle-line">
            Already a user?
            <span className="toggle-btn" onClick={setNeedLoginHandler}>
              Sign In
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
