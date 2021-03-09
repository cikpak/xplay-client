const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'http://135.181.114.188:8000/api' : 'http://localhost:8000/api'

//TODO - rewrite to functions
export default {
  //URLs
  LOGIN_URL_URL: `${API_BASE_URL}/login`,
  REGISTER_URL: `${API_BASE_URL}/user`,
  REFRESH_TOKEN_URL: `${API_BASE_URL}/token/refresh`,
  UPDATE_ACCOUNT_URL: `${API_BASE_URL}/user`,
  GET_USER_INFO_URL: `${API_BASE_URL}/user/client`,
  SAVE_CONFIG_URL: `${API_BASE_URL}/user/client`,
  JOIN_NETWORK: `${API_BASE_URL}/raspberry/join/`,
  SET_CONFIGURED_CLIENT: `${API_BASE_URL}/client/hello`,

  //utils
  GET_EXTERNAL_IP: 'https://myexternalip.com/json',
  CONFIG_STORAGE_NAME: "config",
  USER_DATA_STORAGE_NAME: "user",
  TOKENS_STORAGE_NAME: "auth",
  LOGIN_URL: "/login",
  START_CONSOLE_COMPANION: 'explorer.exe shell:AppsFolder\\Microsoft.XboxApp_8wekyb3d8bbwe!Microsoft.XboxApp',

  API_BASE_URL,
};