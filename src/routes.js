import React from "react";

import Register from './components/register/RegisterController.jsx'
import { useToasts } from 'react-toast-notifications'
import { Switch, Route, Redirect } from "react-router-dom";
import Main from "./components/main/Controller.jsx";
import Login from "./components/login/login.jsx";
import { useHistory } from "react-router-dom";

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
        render={() => isAuthenticated ? <Main auth={authState} history={history}/> : <Redirect push to="/login" />}
      />

      <Route
        path="/login"
        exact
        render={() =>
          isAuthenticated ? <Redirect to="/main" /> : <Login auth={authState} />
        }
      />
      <Route>
        <Redirect to="/main" />
      </Route>
    </Switch>
  );
};
