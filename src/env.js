const RAPSBERRY_BASE_URL = "http://172.22.100.167:8000";
const API_BASE_URL = 'http://localhost:8000/api'
const V2_API_BASE_URL = 'http://185.206.212.83:8000/api/v2'

//TODO - rewrite to functions
export default {
  //rasp endpoints
  SERVER_IS_WORKING_URL: RAPSBERRY_BASE_URL,
  PLAY_URL: `${RAPSBERRY_BASE_URL}/play`,
  GET_XBOX_IP: `${API_BASE_URL}/xbox-ip`,
  IPTABLES_URL: `${RAPSBERRY_BASE_URL}/play`,
  XBOX_ON_URL: `${RAPSBERRY_BASE_URL}/xbox-on`,
  JOIN_URL: `${RAPSBERRY_BASE_URL}/join`,
  //tailscale routes
  v2: {
    XBOX_ON_URL: `${V2_API_BASE_URL}/xbox-on`,
    IPTABLES_URL: `${V2_API_BASE_URL}/play`,
    PLAY_URL: `${V2_API_BASE_URL}/play`,
    JOIN_URL: `${V2_API_BASE_URL}/join`,
    GET_XBOX_IP: `${V2_API_BASE_URL}/xbox-ip`,
  },

  //auth endpoints
  LOGIN_URL_URL: `${API_BASE_URL}/login`,
  REGISTER_URL: `${API_BASE_URL}/user`,
  REFRESH_TOKEN_URL: `${API_BASE_URL}/token/refresh`,

  //utils
  CONFIG_STORAGE_NAME: "config",
  USER_DATA_STORAGE_NAME: "user",
  TOKENS_STORAGE_NAME: "auth",
  LOGIN_URL: "/login",
  START_CONSOLE_COMPANION: 'explorer.exe shell:AppsFolder\\Microsoft.XboxApp_8wekyb3d8bbwe!Microsoft.XboxApp',

  //user encpoints
  GET_USER_INFO_URL: `${RAPSBERRY_BASE_URL}/api/user/client`,
  SAVE_CONFIG_URL: `${API_BASE_URL}/user/client`,
  GET_USER_INFO_URL: `${API_BASE_URL}/user/client`,


};
