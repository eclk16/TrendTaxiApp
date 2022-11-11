const INITIAL_STATE = {
    isTrip: false,
    locations: {},
    driverId: null,
    passengerId: null,
    trip: null,
    status: null,
    tripRequest: null,
    tripFind: false,
    distance: 0,
    yon: null,
    yon2: null,
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
        case 'setLoc':
            return {
                ...state,
                locations: [...action.payload],
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
        case 'setDistance':
            return {
                ...state,
                distance: action.payload,
            };
        case 'setYon':
            return {
                ...state,
                yon: action.payload,
            };
        case 'setYon2':
            return {
                ...state,
                yon2: action.payload,
            };
        default:
            return state;
    }
};
export default tripReducer;
