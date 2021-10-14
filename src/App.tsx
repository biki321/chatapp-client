import { BrowserRouter, Route, Switch } from "react-router-dom";
import ChatApp from "./components/ChatApp";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import SignUp from "./components/SignUp";
import { AuthProvider } from "./contexts/AuthContext";
import { AxiosInterceptContextProvider } from "./contexts/AxiosInterceptContext";
import { SocketContextProvider } from "./contexts/SocketContext";

function App() {
  console.log("inside app comp");
  return (
    <AuthProvider>
      <AxiosInterceptContextProvider>
        <BrowserRouter>
          <Switch>
            <Route path="/" exact>
              <Login />
            </Route>
            <Route path="/signup" exact>
              <SignUp />
            </Route>
            <SocketContextProvider>
              <ProtectedRoute path="/chat" exact>
                <ChatApp />
              </ProtectedRoute>
            </SocketContextProvider>
          </Switch>
        </BrowserRouter>
      </AxiosInterceptContextProvider>
    </AuthProvider>
  );
}

export default App;
