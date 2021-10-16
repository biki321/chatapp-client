import { BrowserRouter, Route, Switch } from "react-router-dom";
import ChatApp from "./components/ChatApp";
import Landing from "./components/Landing";
import ProtectedRoute from "./components/ProtectedRoute";
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
              <Landing />
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
