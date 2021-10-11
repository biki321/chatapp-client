import { BrowserRouter, Route, Switch } from "react-router-dom";
import ChatAppComp from "./components/chatAppComp";
import LoginComp from "./components/LoginComp";
import ProtectedRoute from "./components/ProtectedRoute";
import SignupComp from "./components/SignupComp";
import TestComp from "./components/testComp";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  console.log("inside app comp");
  return (
    <AuthProvider>
      <BrowserRouter>
        <Switch>
          <Route path="/" exact>
            <LoginComp />
          </Route>
          <Route path="/signup" exact>
            <SignupComp />
          </Route>
          <ProtectedRoute path="/chat" exact>
            <ChatAppComp />
          </ProtectedRoute>
          <ProtectedRoute path="/test" exact>
            <TestComp />
          </ProtectedRoute>
        </Switch>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
