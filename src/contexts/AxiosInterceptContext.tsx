import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import React, { useContext } from "react";
import jwt_decode from "jwt-decode";
import { IJwtPayload } from "../interfaces/iJwtPayload.interface";
import { useAuth } from "./AuthContext";

const AxiosInterceptContext = React.createContext({} as AxiosInstance);

interface IProps {
  children: JSX.Element;
}

export function useAxiosIntercept() {
  return useContext(AxiosInterceptContext);
}

export function AxiosInterceptContextProvider({ children }: IProps) {
  const { authState, refreshToken } = useAuth();
  const axiosIntercept = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("axiosintercept comp inside");

  axiosIntercept.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
      console.log("intercept");
      console.log(authState);
      if (!authState.accessToken) {
        console.log("not acc at intercept token");
        return Promise.reject("accessToken is null");
      }
      const { exp } = jwt_decode<IJwtPayload>(authState.accessToken);
      if (exp * 1000 < Date.now().valueOf()) {
        const token = await refreshToken();
        console.log("new tok at intercep", token);
        if (!token) return Promise.reject("could not get new token");
        config.headers!["Authorization"] = `token ${token}`;
      }
      return config;
    }
  );

  return (
    <AxiosInterceptContext.Provider value={axiosIntercept}>
      {children}
    </AxiosInterceptContext.Provider>
  );
}
