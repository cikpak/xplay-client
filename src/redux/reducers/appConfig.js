import { SET_API_VERSION } from "../actionTypes";

const initialState = {
    apiVersion: '1'
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_API_VERSION: {
            return {
                ...state,
                apiVersion: action.payload.version || 1
            };
        }
        default:
            return state;
    }
}
