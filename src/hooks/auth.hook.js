import { useCallback, useState, useEffect } from "react";
import { useLocalStore } from "./localStorage.hook";
import { useToken } from "./token.hook";
import env from "../env";

const initialState = {
  isAuthenticated: false,
  tokens: {
    token: null,
    refreshToken: null,
    expiresIn: null,
  },
  userInfo: {},
  userConfig: {},
};

export const useAuth = () => {
  var [
    getTokens,
    updateTokens,
    getUserConfig,
    updateUserConfig,
    getUserInfo,
    updateUserInfo,
    getState,
  ] = useLocalStore();

  var [refreshTokens, checkTokenValidity] = useToken();
  const [state, setState] = useState(initialState);

  const login = useCallback(
    async ({ token, refreshToken, expiresIn, userData, userConfig }) => {
      setState({
        isAuthenticated: true,
        tokens: {
          token,
          refreshToken,
          expiresIn,
        },
        userInfo: userData,
        userConfig,
      });

      //save tokens pair
      await updateTokens({
        token,
        refreshToken,
        expiresIn,
      });

      //save user info
      await updateUserInfo(userData);

      //save user config
      await updateUserConfig(userConfig);
    },

    [setState, updateTokens, updateUserConfig, updateUserInfo]
  );

  const logout = useCallback(async () => {
    localStorage.clear();
    setState(initialState);
  }, [setState]);

  const verifyToken = async () => {
    try {
      const state = await getState();

      if (state) {
        const { tokens } = state;

        try {
          const isTokenValid = await checkTokenValidity(tokens.expiresIn);

          try {
            let newTokensPair = undefined;
            if (!isTokenValid) {
              newTokensPair = await refreshTokens(tokens.refreshToken);

              if (newTokensPair) {
                updateTokens(newTokensPair);
                return setState({ ...state, tokens: newTokensPair });
              }

              return undefined
            }

            const newState = { ...state, isAuthenticated: true }
            return setState(newState);
            //new pair fetch success
          } catch (err) {
            console.error(err);
            return setState(initialState);
          }
        } catch (err) {
          console.log('erroooor', err);
          return setState(initialState);
        }
      }

      //clear localStorage and set initial state with auth = false
      localStorage.clear();
      return setState(initialState);
    } catch (err) {
      console.log("eeerrreeerrrerr", err);
      return setState(initialState);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  return [state, logout, login];
};
