import React, { useState } from "react";
import { Redirect, useHistory, useLocation, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
// import "../styles/loginPage.css";

interface LocationState {
  from: {
    pathname: string;
  };
}

export default function LoginComp() {
  const { authState, login } = useAuth();
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

  const loginFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      login(username, password, () => {
        console.log("at login func ", from);
        history.replace(from);
      });
      // history.replace("/chat");
    } catch (error) {}
    setUserName("");
    setPassword("");
  };

  return (
    <div className="login-page-div">
      <p>{authState.loginError}</p>
      <h1>Login</h1>
      <form className="login-form" onSubmit={(e) => loginFormSubmit(e)}>
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
        <button type="submit">login</button>
      </form>
      <NavLink to="/signup">signup </NavLink>
    </div>
  );
}
