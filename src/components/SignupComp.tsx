import React, { useState } from "react";
import { Redirect, useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
// import "../styles/loginPage.css";

interface LocationState {
  from: {
    pathname: string;
  };
}

export default function SignupComp() {
  const { authState, signup } = useAuth();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const location = useLocation<LocationState>();
  const history = useHistory();
  const { from } = location.state || { from: { pathname: "/chat" } };

  if (authState.isAuthLoading) {
    return <div>Loading</div>;
  }

  if (authState.user) {
    // console.log("isAuthenticated", authState.isAuthenticated);
    // history.replace("/home");
    console.log("login page authState.isAuthenticated", from);
    return <Redirect to={from.pathname} />;
  }

  const signupFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      signup(username, password, () => {
        console.log("at signup func ", from);
        history.replace(from);
      });
      // history.replace("/chat");
    } catch (error) {}
    setUserName("");
    setPassword("");
  };

  return (
    <div className="signup-page-div">
      <p>{authState.signupError}</p>
      <h1>Signup</h1>
      <form className="signup-form" onSubmit={(e) => signupFormSubmit(e)}>
        <input
          type="text"
          name="username"
          id="username"
          value={username}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type="password"
          name="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">signup</button>
      </form>
    </div>
  );
}
