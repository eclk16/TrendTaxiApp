import { combineReducers } from "redux";

import appReducer from "./appReducer";
import authReducer from "./authReducer";
import tripReducer from "./tripReducer";

export default combineReducers({
    app: appReducer,
    auth: authReducer,
    trip: tripReducer
});