// import axios, { AxiosRequestConfig } from "axios";
import React, { useContext, useEffect, useMemo, useState } from "react";
// import jwt_decode from "jwt-decode";
// import { IJwtPayload } from "../interfaces/iJwtPayload.interface";
import { useAuth } from "./AuthContext";
import io, { Socket } from "socket.io-client";

interface IProps {
  children: JSX.Element;
}

interface IContext {
  socket: Socket;
}

const SocketContext = React.createContext<Partial<IContext>>({});

export function useSocketContext() {
  return useContext(SocketContext);
}

export function SocketContextProvider({ children }: IProps) {
  const { authState, refreshToken } = useAuth();
  const [socketObj, setSocket] = useState<Partial<IContext>>({});

  // On the client side you add the authorization header like this:
  let socketOptions = useMemo(
    () => ({
      withCredentials: true,
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `token ${authState.accessToken}`, //'Bearer h93t4293t49jt34j9rferek...'
          },
        },
      },
    }),
    [authState.accessToken]
  );

  useEffect(() => {
    console.log("useeffect at sockt context");
    if (authState.accessToken) {
      const newSocket = io(
        process.env.REACT_APP_BASE_URL_FOR_SCKT!,
        socketOptions
      );
      setSocket({ socket: newSocket });

      console.log("socket at context", newSocket);

      newSocket?.onAny((event, ...args) => {
        console.log("from socket context all events", event, args);
      });

      newSocket?.on("connect_error", (err) => {
        console.log("from socket context err", err);
      });

      newSocket?.on("un_authenticated", async () => {
        console.log("un_authenticated socket");
        await refreshToken();
      });

      return () => {
        newSocket?.off("connect_error");
        newSocket?.off("un_authenticated");
        newSocket?.offAny();
        newSocket?.disconnect();
      };
    }
  }, [authState.accessToken, refreshToken, socketOptions]);

  return (
    <SocketContext.Provider value={{ socket: socketObj.socket }}>
      {children}
    </SocketContext.Provider>
  );
}

// socket.handshake.headers.authorization,
