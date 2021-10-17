import { AxiosResponse } from "axios";
import React, { useContext, useEffect, useState, useCallback } from "react";
import Spinner from "../components/spinner";
import IUser from "../interfaces/iUser.interface";
import axiosIns from "../services/axiosIns";

interface IProps {
  children: JSX.Element;
}

interface IAuthState {
  user: IUser | null;
  accessToken: string | null;
  isAuthLoading: boolean;
  loginError: string | null;
  signupError: string | null;
  refreshTokenError: string | null;
}

interface IContext {
  authState: IAuthState;
  login(
    username: string,
    password: string,
    callback: () => void
  ): Promise<void>;
  refreshToken(): Promise<string | null>;
  logout: (callback: () => void) => void;
  signup: (
    username: string,
    password: string,
    gender: string,
    callback: any
  ) => Promise<void>;
}

const initialAuthContext: IContext = {
  authState: {
    user: null,
    accessToken: null,
    isAuthLoading: true,
    loginError: null,
    signupError: null,
    refreshTokenError: null,
  },
  login: function (): Promise<void> {
    throw new Error("Function not implemented.");
  },
  refreshToken: function (): Promise<string | null> {
    throw new Error("Function not implemented.");
  },
  logout: function (): void {
    throw new Error("Function not implemented.");
  },
  signup: function (): Promise<void> {
    throw new Error("Function not implemented.");
  },
};

const AuthContext = React.createContext<IContext>(initialAuthContext);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: IProps) {
  const [authState, setAuthState] = useState<IAuthState>({
    user: null,
    accessToken: null,
    isAuthLoading: true,
    loginError: null,
    signupError: null,
    refreshTokenError: null,
  });

  const errorMsg = (error: any) => {
    if (error.response.data) {
      const data = error.response.data;
      if (data.error) return data.error;
      if (data.message) return data.message;
    } else {
      return null;
    }
  };

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await axiosIns.get("auth/refreshToken", {
        withCredentials: true,
      });
      const token = res.headers["authorization"];

      setAuthState((prevState) => ({
        ...prevState,
        user: res.data,
        accessToken: token,
        isAuthLoading: false,
        refreshTokenError: null,
      }));
      return token;
    } catch (error) {
      setAuthState((prevState) => ({
        ...prevState,
        user: null,
        accessToken: null,
        isAuthLoading: false,
        refreshTokenError: "could not fetch token",
      }));
      return null;
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string, callback) => {
      setAuthState((prevState) => ({ ...prevState, isAuthLoading: true }));
      try {
        const res = await axiosIns.post<
          { username: string; password: string },
          AxiosResponse<IUser>
        >("/auth/login", { username, password }, { withCredentials: true });
        const token = res.headers["authorization"];

        callback();
        setAuthState((prevState) => ({
          ...prevState,
          user: res.data,
          accessToken: token,
          isAuthLoading: false,
          loginError: null,
        }));
      } catch (error) {
        setAuthState((prevState) => ({
          ...prevState,
          user: null,
          accessToken: null,
          isAuthLoading: false,
          loginError: errorMsg(error) || "server error",
        }));
      }
    },
    []
  );

  const signup = useCallback(
    async (username: string, password: string, gender: string, callback) => {
      setAuthState((prevState) => ({ ...prevState, isAuthLoading: true }));
      try {
        const res = await axiosIns.post<
          { username: string; password: string; gender: string },
          AxiosResponse<IUser>
        >(
          "/auth/signUp",
          { username, password, gender },
          { withCredentials: true }
        );
        const token = res.headers["authorization"];

        setAuthState((prevState) => ({
          ...prevState,
          user: res.data,
          accessToken: token,
          isAuthLoading: false,
          signupError: null,
        }));
        callback();
      } catch (error) {
        setAuthState((prevState) => ({
          ...prevState,
          user: null,
          accessToken: null,
          isAuthLoading: false,
          signupError: errorMsg(error) || "sorry signup failed",
        }));
      }
    },
    []
  );

  const logout = async (callback: () => void) => {
    setAuthState((prevState) => ({ ...prevState, isAuthLoading: true }));
    await axiosIns.get("auth/logout", {
      withCredentials: true,
      headers: {
        Authorization: `token ${authState.accessToken}`,
      },
    });

    setAuthState((prevState) => ({
      ...prevState,
      user: null,
      accessToken: null,
      isAuthLoading: false,
    }));

    callback();
  };

  const values = {
    authState,
    login,
    refreshToken,
    logout,
    signup,
  };

  useEffect(() => {
    (async () => {
      await refreshToken();
    })();
  }, [refreshToken]);

  return (
    <AuthContext.Provider value={values}>
      {!authState.isAuthLoading ? (
        children
      ) : (
        <div
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spinner width="60px" />
        </div>
      )}
    </AuthContext.Provider>
  );
}
