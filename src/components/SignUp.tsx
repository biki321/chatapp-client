import { useEffect, useState } from "react";
import { NavLink, Redirect, useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../static/style/signup.css";

interface LocationState {
  from: {
    pathname: string;
  };
}

export default function SignUp() {
  const { authState, signup } = useAuth();
  const [inputData, setInputData] = useState({
    username: "",
    password: "",
    gender: "male",
  });
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
    console.log("signup page authState.isAuthenticated", from);
    return <Redirect to={from.pathname} />;
  }

  const signUpFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      signup(inputData.username, inputData.password, inputData.gender, () => {
        console.log("at signup func ", from);
        history.replace(from);
      });
    } catch (error) {}
    setInputData({ username: "", password: "", gender: "male" });
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
          usernameValid: false,
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
      if (e.target.value.length < 4 || e.target.value.length > 30) {
        setInputError((prevState) => ({
          ...prevState,
          passwordError: "password should be between 5 to 30 characters",
          passwordValid: false,
        }));
      } else {
        setInputError((prevState) => ({
          ...prevState,
          passwordError: "",
          passwordValid: true,
        }));
      }
    } else if (e.target.name === "gender") {
      console.log("gender", e.target.value);
      setInputData((prevState) => ({
        ...prevState,
        gender: e.target.value,
      }));
    }
  };

  return (
    <div className="wrapper-div">
      <div className="signup-page-div">
        <p className="signup-error">{authState.signupError}</p>
        <div className="signup-name">Sign Up</div>
        <form className="signup-form" onSubmit={(e) => signUpFormSubmit(e)}>
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
          <div className="signup-error">{inputError.usernameError}</div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            value={inputData.password}
            onChange={(e) => setInputDataHandler(e)}
            placeholder={"Enter password"}
          />
          <div className="gender-select-div">
            <input
              type="radio"
              id="male"
              name="gender"
              value="male"
              checked={inputData.gender === "male"}
              onChange={(e) => setInputDataHandler(e)}
            />
            <label htmlFor="male">Male</label>
            <input
              type="radio"
              id="female"
              name="gender"
              value="female"
              checked={inputData.gender === "female"}
              onChange={(e) => setInputDataHandler(e)}
            />
            <label htmlFor="female">Female</label>
          </div>

          <div className="signup-error">{inputError.passwordError}</div>
          <button
            type="submit"
            className={`signup-btn ${!valid ? "disabled-btn" : ""}`}
            disabled={!valid}
          >
            {"Sign Up"}
          </button>
        </form>
      </div>
      <div className="toggle-line">
        Create new account?
        <NavLink to="/" className="toggle-btn">
          Sign In
        </NavLink>
      </div>
    </div>
  );
}
