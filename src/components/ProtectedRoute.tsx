import { Redirect, Route } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface IProps {
  children: JSX.Element;
  path: string;
  exact?: boolean;
}

export default function ProtectedRoute({ children, ...rest }: IProps) {
  const { authState } = useAuth();
  return (
    <Route
      {...rest}
      render={({ location }) => {
        console.log("at protected route", location);
        return authState.user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { from: location },
            }}
          />
        );
      }}
    />
  );
}
