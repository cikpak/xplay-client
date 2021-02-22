import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { useHistory } from "react-router-dom";
const {ipcRenderer} = require('electron')
import Login from "./components/login/login.jsx";
import Main from "./components/main/Controller.jsx";
import Register from './components/register/RegisterController.jsx'

export const useRoutes = (authState) => {
  const { isAuthenticated } = authState;
  const history = useHistory();
  
  return (
    <Switch>
      <Route
        exact
        path="/register"
        component={Register}
      />

      <Route
        exact
        path="/main"
        render={() => {
          if (isAuthenticated) {
            // ipcRenderer.send('resize-to-main')
            return <Main auth={authState} history={history} />
          } else {
            return <Redirect push to="/login" />
          }
        }}
      />

      <Route
        path="/login"
        exact
        render={() => {
          if (isAuthenticated) {
            return <Redirect to="/main" />
          } else {
            // ipcRenderer.send('resize-to-login')
            return <Login auth={authState} />
          }
        }
        }
      />
      <Route>
        <Redirect to="/main" />
      </Route>
    </Switch>
  );
};
