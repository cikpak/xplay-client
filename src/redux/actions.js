import { SET_CLIENT_CONFIG, SET_USER_INFO, SET_API_VERSION, UPDATE_NETWORK_DATA } from "./actionTypes";

export const setClientConfig = (config) => ({
  type: SET_CLIENT_CONFIG,
  payload: { ...config }
});

export const updateNetworkConfig = (config) => ({
  type: UPDATE_NETWORK_DATA,
  payload: { ...config }
})

export const setUserInfo = (info) => ({
  type: SET_USER_INFO,
  payload: { ...info }
})

export const setApiVersion = (version) => ({
  type: SET_API_VERSION,
  payload: { version }
})
