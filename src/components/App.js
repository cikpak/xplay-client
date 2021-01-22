import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/global.css";
import React from "react";
import { Provider } from "react-redux";
import store from "../redux/store";
import { useAuth } from "../hooks/auth.hook";
import { useRoutes } from "../routes";
import { HashRouter } from "react-router-dom";
import { ToastProvider } from "react-toast-notifications";
import { AuthContext } from "../context/auth.context";

const App = () => {
  const [state, logout, login] = useAuth();

  const authState = {
    isAuthenticated: state.isAuthenticated,
    userConfig: state.userConfig,
    userInfo: state.userInfo,
    tokens: state.tokens,
    logout,
    login,
  };

  const routes = useRoutes(authState);

  return (
    <HashRouter>
      <AuthContext.Provider value={authState}>
        <ToastProvider placement="bottom-center">
          <Provider store={store}>
            {routes}
          </Provider>
        </ToastProvider>
      </AuthContext.Provider>
    </HashRouter>
  );
};

export default App;
