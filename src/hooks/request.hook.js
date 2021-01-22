import { useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { useLocalStore } from "./localStorage.hook";
import axios from "axios";
import env from "../env";

export const useRequest = () => {
  const [updateTokens] = useLocalStore();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const history = useHistory();

  const request = useCallback(
    async (url, { method = "GET", body = null, headers = {} }) => {
      setLoading(true);

      try {
        if (body) {
          if (headers["Content-Type"] === "application/json") {
            body = JSON.stringify({ ...body });
          }
        }

        const response = await axios({ url, method, data: body, headers });

        setLoading(false);
        return response;
      } catch (error) {
        setErr(error.message || "A aparut o eroare, incercati din nou!");
        setLoading(false);
        return undefined;
      }
    },
    []
  );


  const requestWithAuth = useCallback(
    async (url, { method = "GET", body = null, headers = {} }) => {
      let tokenData = null;

      if (localStorage.state) {
        tokenData = localStorage.state;
      } else {
        history.push(env.LOGIN_URL);
      }

      if (tokenData) {
        if (Date.now() >= tokenData.expiresOn * 1000) {
          try {
            const tokenData = refreshToken(refreshToken);
            updateTokens(tokenData);
          } catch (err) {
            console.error(err);
            history.push(env.LOGIN_URL);
          }
        }
      }

      return await request(url, {
        method,
        body,
        headers: {
          ...headers,
          Authorization: `Bearer ${tokenData.token}`,
        },
      });
    },
    []
  );

  return { loading, err, request, requestWithAuth };
};
