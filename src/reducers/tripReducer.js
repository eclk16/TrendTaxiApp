const INITIAL_STATE = {
    step:1,
    startLocation:null,
    endLocation:null,
    passengerLocation:null,
    driverLocation:null,
    currentLocation:null,
    initialLocation:null,
    carType:null,
    tripId:null,
    tripDetail:null,
    tripStatus:null,
    isAvailable:false,
    acceptProccess:9,
    mapHeight:'100%'
};
const tripReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case "tripRemove":
            return {
                step:1,
                startLocation:null,
                endLocation:null,
                passengerLocation:null,
                driverLocation:null,
                currentLocation:null,
                initialLocation:null,
                carType:null,
                tripId:null,
                tripDetail:null,
                tripStatus:null,
                isAvailable:false,
                acceptProccess:9,
                mapHeight:'100%'
            }
        default:
            return state;
    }
};
export default tripReducer;