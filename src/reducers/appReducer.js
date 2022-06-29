const INITIAL_STATE = {
    theme:'light',
    lang:'gb',
    isLoading:true
};
const appReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case "theme":
            return {...state,theme:action.payload};
        case "lang":
            return {...state,lang:action.payload};
        case "isLoading":
            return {...state,isLoading:action.payload};
        default:
            return state;
    }
};
export default appReducer;