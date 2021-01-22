const cmd = require("node-cmd");
const { errors, strErrors } = require("../utils/errors");

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const getNetworkIp = async (network) => {
  const splitNetwork = network.split(" ");
  const networkStatus = splitNetwork[6];
  const ip = splitNetwork[8];
  const networkStatusCode = splitNetwork[0];

  if (networkStatus !== "PUBLIC") {
    if (networkStatus === "PRIVATE") return "PRIVATE_NETWORK";
    //TODO - return more zerotier statuses
    return "NETWORK_ERROR";
  } else if (networkStatusCode !== "200") {
    return "NETWORK_ERROR";
  }

  return ip.split("/")[0];
};

//get ip by network id
const getIpByNetworkId = async (networkId, count = 0) => {
  try {
    const networkIdRegex = new RegExp(networkId);
    const { err, data } = cmd.runSync("zerotier-cli listnetworks");

    if (err) {
      throw err;
    }

    const networks = data.split("\n");

    const userNetwork = networks.filter((network) =>
      network.match(networkIdRegex)
    );

    const splitedData = userNetwork[0].split(" ");

    if (splitedData[0] === "200" && splitedData[5] === "OK") {
      if (splitedData[6] === "PRIVATE") {
        throw "PRIVATE_NETWORK";
      }

      return splitedData[8].split("/")[0];
    } else {
      if (count >= process.env.WAIT_CONFIGURATION) {
        return "CONFIGURATION_TIMEOUT";
      }
      await delay(1000);
      return getIpByNetworkId(networkId, ++count);
    }
  } catch (err) {
    console.error(err);
    return err;
  }
};

const findUserInNetworks = (userNetworkId) => {
  const userNetworkIdRegex = new RegExp(userNetworkId);
  const { err, data } = cmd.runSync("zerotier-cli listnetworks");

  if (err) {
    //TODO - rethink err return logic
    return "ZEROTIER_ERROR";
  }

  //check if user is already in this network
  const networks = data.split("\n").filter(network => network !== '')
  const userNetwork = networks.filter((network) => network.match(userNetworkIdRegex));

  if (userNetwork.length) {
    return getNetworkIp(userNetwork[0]);
  }

  return false;
};

const joinNetwork = async (networkId) => {
  try {
    if (networkId === "") {
      throw "INVALID_NETWORK_ID";
    }

    //check if user is not already in network and return ip if is
    const ip = await findUserInNetworks(networkId);

    if (ip) {
      return ip;
    }

    const { err, data } = cmd.runSync(`zerotier-cli join ${networkId}`);
    if (!data || data.trim() !== "200 join OK") { throw "ZEROTIER_ERROR"; }

    const networkIp = await getIpByNetworkId(networkId);

    if (networkIp in strErrors) {
      throw networkIp;
    }

    return networkIp;
  } catch (err) {
    console.log("err :>> ", err);
    return err;
  }
};

export default joinNetwork
