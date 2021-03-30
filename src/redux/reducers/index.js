import { combineReducers } from "redux";
import configReducer from "./clientConfig";
import userInfoReducer from './userInfo'
import appConfigReducer from './appConfig'

export default combineReducers({
    clientConfig: configReducer,
    userInfo: userInfoReducer,
    appConfig: appConfigReducer
});
