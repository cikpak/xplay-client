const { exec } = require("child_process");

//move to env !!!
const getRaspberryIpScriptPath =
  "C:\\Users\\cikpak\\Desktop\\xplay-client\\scripts\\raspIp.bat";

const getRaspberryIp = async (callback) => {
  try {
    exec(getRaspberryIpScriptPath, callback);
  } catch (err) {
    console.log("errrrooooooor");
    console.error(err);
  }
};

module.exports = {
  getRaspberryIp,
};
