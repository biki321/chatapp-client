import { useEffect, useState } from "react";
import { Redirect, useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../static/style/login.css";

interface LocationState {
  from: {
    pathname: string;
  };
}

export default function Login() {
  const { authState, signup } = useAuth();
  const [inputData, setInputData] = useState({ username: "", password: "" });
  const [inputError, setInputError] = useState({
    usernameError: "",
    usernameValid: false,
    passwordError: "",
    passwordValid: false,
  });
  const [valid, setValid] = useState(false);
  const location = useLocation<LocationState>();
  const history = useHistory();
  const { from } = location.state || { from: { pathname: "/chat" } };

  useEffect(() => {
    if (inputError.usernameValid && inputError.passwordValid) setValid(true);
    else setValid(false);
  }, [inputError.passwordValid, inputError.usernameValid]);

  if (authState.isAuthLoading) {
    return <div>Loading</div>;
  }

  if (authState.user) {
    // console.log("isAuthenticated", authState.isAuthenticated);
    // history.replace("/home");
    console.log("login page authState.isAuthenticated", from);
    return <Redirect to={from.pathname} />;
  }

  const signUpFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      signup(inputData.username, inputData.password, () => {
        console.log("at signup func ", from);
        history.replace(from);
      });
    } catch (error) {}
    setInputData({ username: "", password: "" });
    setValid(false);
  };

  const setInputDataHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "username") {
      setInputData((prevState) => ({
        ...prevState,
        username: e.target.value,
      }));

      if (e.target.value.length < 4 || e.target.value.length > 30) {
        setInputError((prevState) => ({
          ...prevState,
          usernameError: "username should be between 4 to 30 characters",
        }));
      } else {
        setInputError((prevState) => ({
          ...prevState,
          usernameError: "",
          usernameValid: true,
        }));
      }
    } else if (e.target.name === "password") {
      setInputData((prevState) => ({
        ...prevState,
        password: e.target.value,
      }));
      if (e.target.value.length < 1) {
        setInputError((prevState) => ({
          ...prevState,
          passwordError: "password needed",
        }));
      } else {
        setInputError((prevState) => ({
          ...prevState,
          passwordError: "",
          passwordValid: true,
        }));
      }
    }
  };

  return (
    <div className="login-page-div">
      <p className="login-error">{authState.signupError}</p>
      <div className="login-name">Sign Up</div>
      <form className="login-form" onSubmit={(e) => signUpFormSubmit(e)}>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          name="username"
          id="username"
          value={inputData.username}
          onChange={(e) => setInputDataHandler(e)}
          placeholder={"Enter username"}
          autoComplete="off"
        />
        <div className="login-error">{inputError.usernameError}</div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          value={inputData.password}
          onChange={(e) => setInputDataHandler(e)}
          placeholder={"Enter password"}
        />
        <div className="login-error">{inputError.passwordError}</div>
        <button
          type="submit"
          className={`login-btn ${!valid ? "disabled-btn" : ""}`}
          disabled={!valid}
        >
          {"Sign Up"}
        </button>
      </form>
    </div>
  );
}
