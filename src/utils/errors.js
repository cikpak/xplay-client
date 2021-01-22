const errors = {
  //hamachi errors
  HAMACHI_LOGIN_ERROR: "Failed to login in hamachi!",
  NETWORK_ERROR: "Hamachi network error!",
  NETWORK_JOIN_ERROR: "Error on network join!",

  //zerotier errors
  INVALID_NETWORK_ID: "Invalid network id!",
  PRIVATE_NETWORK: "This network is private, make it public and try again!",
  FAILED_TO_JOIN: "Failed to join zerotier network, try again!",
  CONFIGURATION_TIMEOUT: "Network configuration time out!",
  INVALID_NETWORK: "Invalid network!",
  ZEROTIER_ERROR: "Zerotier error ocurred!",
  NETWORK_ERROR: "Zerotier network error!",
  //iptables errors

  //xbox errors
  FAILED_TO_POWER_ON: "Failed to start xbox!",

  //server errors
  SERVER_ERROR: "An error ocured on server, try again later!",
  WRONG_CLIENT: "Wrong client was specified in request!",

  //others
  FAILED_TO_GET_XBOX_IP: "Failed to get xbox ip in local network!",
  FAILED_TO_GET_LOCAL_IP: "Failed to get raspberry local ip!",
  XBOX_IP_NOT_FOUND: "Failed to get xbox local ip!",
};

const status = {
  AVAILABLE: "Server is working!",
  SUCCESS: "Success!",
  FAILED: "Error!",
  UP_TO_DATE: "Server is up to date",
  UPDATED: "Server was updated!",
  UPDATE_ERROR: "Update failed, try again!",
};

module.exports = {
  errors,
  status,
  strErrors: Object.keys(errors),
};
