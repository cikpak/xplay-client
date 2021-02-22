import { ToastProvider } from "react-toast-notifications";
import { AuthContext } from "../context/auth.context";
import { HashRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../hooks/auth.hook";
import { Provider } from "react-redux";
import { useRoutes } from "../routes";
import store from "../redux/store";
import "../assets/global.css";
import React from "react";

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
