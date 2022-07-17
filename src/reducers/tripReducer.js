const INITIAL_STATE = {
    isTrip:false,
    trip:{

    }
};
const tripReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case "tripRemove":
            return {
                isTrip:false,
                trip:{}
            };
        case "setTrip":
            return {
                isTrip: true,
                trip:action.payload
            };
        default:
            return state;
    }
};
export default tripReducer;