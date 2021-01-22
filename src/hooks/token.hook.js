import axios from "axios";
import env from "../env";

export const useToken = () => {

  const refreshTokens = async (refreshToken) => {
    try {
      const response = await axios({
        url: env.REFRESH_TOKEN_URL,
        method: "POST",
        data: { refreshToken },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.statusText === 'OK') {
        const {token, refreshToken, expiresIn} = await response.data;
        return {token, refreshToken, expiresIn};
      }

      return undefined
    } catch (err) {
      console.log("err din refreshtokens", err);
      return undefined
    }
  };

  const checkTokenValidity = async (expiresOn) => {
    return Date.now() >= expiresOn ? false : true;
  };

  return [refreshTokens, checkTokenValidity];
};
