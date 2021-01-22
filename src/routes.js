import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { useHistory } from "react-router-dom";
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
        render={() =>
          isAuthenticated ? (
            <Main auth={authState} history={history} />
          ) : (
              <Redirect push to="/login" />
            )
        }
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
