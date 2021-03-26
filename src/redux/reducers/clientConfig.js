import { SET_CLIENT_CONFIG, UPDATE_NETWORK_DATA } from "../actionTypes";

const initialState = {
  network: {
    tailscaleId: undefined,
    zerotierId: undefined,
    tailscaleIp: undefined,
    zerotierIp: undefined,
    clientTailscaleIp: undefined,
    clientZerotierIp: undefined
  },
  xboxId: undefined,
  xboxIp: undefined,
  raspberryLocalIp: undefined,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_CLIENT_CONFIG: {
      return {
        ...state,
        ...action.payload
      };
    }
    case UPDATE_NETWORK_DATA: {
      return {
        ...state,
        network: {
          ...state.network,
          ...action.payload
        }
      };
    }
    default:
      return state;
  }
}
