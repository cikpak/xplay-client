import { SET_USER_INFO, UPDATE_USER_INFO } from "../actionTypes";

const initialState = {
  email: undefined,
  firstname: undefined,
  lastname: undefined,
  nickname: undefined,
  avatar: undefined,
  isClientConfigured: false,
  _id: undefined
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_INFO: {
      return {
        ...state,
        ...action.payload,
      };
    }
    case UPDATE_USER_INFO: {
      return {
        ...state,
        ...action.payload
      }
    }
    default:
      return state;
  }
};
