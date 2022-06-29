const INITIAL_STATE = {
    isAuth:false,
    userId:null,
    userToken:null,
    userType:null,
    user:{}
};
const authReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case "isAuth":
            return {
                ...state,
                isAuth:action.payload
            };
        case "setAuth":
            return action.payload;
        case "setUser":
            return {
                ...state,
                user:action.payload
            }
        case "authRemove":
            return {
                isAuth:false,
                userId:null,
                userToken:null,
                userType:null,
                user:{}
            };
        default:
            return state;
    }
};
export default authReducer;