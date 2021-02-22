import { SET_USER_INFO } from "../actionTypes";

const initialState = {
  email: undefined,
  firstname: undefined,
  lastname: undefined,
  nickname: undefined,
  avatar: undefined,
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
    default:
      return state;
  }
};
