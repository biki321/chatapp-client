import { useState } from "react";
import { Redirect, useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../static/style/login.css";

interface LocationState {
  from: {
    pathname: string;
  };
}

export default function Login() {
  const { authState, login } = useAuth();
  const [inputData, setInputData] = useState({ username: "", password: "" });
  const location = useLocation<LocationState>();
  const history = useHistory();
  const { from } = location.state || { from: { pathname: "/chat" } };

  if (authState.user) {
    console.log("login page authState.isAuthenticated", from);
    return <Redirect to={from.pathname} />;
  }

  const loginFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      login(inputData.username, inputData.password, () => {
        console.log("at login func ", from);
        history.replace(from);
      });
    } catch (error) {}
    setInputData({ username: "", password: "" });
  };

  const setInputDataHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "username") {
      setInputData((prevState) => ({
        ...prevState,
        username: e.target.value,
      }));
    } else if (e.target.name === "password") {
      setInputData((prevState) => ({
        ...prevState,
        password: e.target.value,
      }));
    }
  };

  return (
    <div className="login-page-div">
      <p className="login-error">{authState.loginError}</p>
      <div className="login-name">Sign In</div>
      <form className="login-form" onSubmit={(e) => loginFormSubmit(e)}>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          name="username"
          id="username"
          value={inputData.username}
          onChange={(e) => setInputDataHandler(e)}
          placeholder={"Enter username"}
          autoComplete="off"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          value={inputData.password}
          onChange={(e) => setInputDataHandler(e)}
          placeholder={"Enter password"}
          required
        />

        <button type="submit" className="login-btn">
          {"Sign In"}
        </button>
      </form>
    </div>
  );
}
