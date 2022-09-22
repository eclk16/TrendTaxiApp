const INITIAL_STATE = {
    isTrip: false,
    locations: {},
    driverId: null,
    passengerId: null,
    trip: null,
    status: null,
    tripRequest: null,
    tripFind: false,
};
const tripReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'tripRemove':
            return {
                ...state,
                trip: null,
            };
        case 'setTrip':
            return {
                ...state,
                trip: action.payload,
            };
        case 'setTripFind':
            return {
                ...state,
                tripFind: action.payload,
            };
        case 'setRequest':
            return {
                ...state,
                tripRequest: action.payload,
            };
        default:
            return state;
    }
};
export default tripReducer;
