import env from "../env.js";

export const useLocalStore = () => {
  const getUserConfig = async () => {
    try {
      const userConfig = localStorage.getItem(env.CONFIG_STORAGE_NAME);
      if (userConfig) return JSON.parse(userConfig);
      throw "bad user config";
    } catch (err) {
      console.error(err);
      return undefined;
    }
  };

  const updateUserConfig = async (userConfig) => {
    try {
      localStorage.setItem(env.CONFIG_STORAGE_NAME, JSON.stringify(userConfig));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const getUserInfo = async () => {
    try {
      const userInfo = localStorage.getItem(env.USER_DATA_STORAGE_NAME);
      if (userInfo) return JSON.parse(userInfo);
      throw "bad user userInfo";
    } catch (err) {
      console.error(err);
      return undefined;
    }
  };

  const updateUserInfo = async (userInfo) => {
    try {
      localStorage.setItem(
        env.USER_DATA_STORAGE_NAME,
        JSON.stringify(userInfo)
      );
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const getTokens = async () => {
    //token, refreshToken, expiresIn
    try {
      const tokens = localStorage.getItem(env.TOKENS_STORAGE_NAME);
      if (tokens) return JSON.parse(tokens);
      throw "bad tokens";
    } catch (err) {
      console.error(err);
      return undefined;
    }
  };

  const updateTokens = async (tokensData) => {
    //token, refreshToken, expiresIn
    try {
      localStorage.setItem(env.TOKENS_STORAGE_NAME, JSON.stringify(tokensData));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const getState = () => {
    try {
      const tokens = JSON.parse(localStorage.getItem(env.TOKENS_STORAGE_NAME));
      const userInfo = JSON.parse(localStorage.getItem(env.USER_DATA_STORAGE_NAME));
      const userConfig = JSON.parse(localStorage.getItem(env.CONFIG_STORAGE_NAME));

      if (tokens && userInfo && userConfig) {
        return {
          tokens,
          userInfo,
          userConfig,
        };
      }

      return undefined;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  };

  return [
    getTokens,
    updateTokens,
    getUserConfig,
    updateUserConfig,
    getUserInfo,
    updateUserInfo,
    getState,
  ];
};
