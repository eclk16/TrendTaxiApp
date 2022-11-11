const INITIAL_STATE = {
    theme: 'dark',
    mapTheme: 'dark',
    lang: 'uz',
    currentLocation: {
        default: true,
        accuracy: 5,
        altitude: 0,
        altitude_accuracy: -1,
        ellipsoidal_altitude: 0,
        floor: 'aaa',
        heading: -1,
        heading_accuracy: -1,
        latitude: 41.299409367279715,
        longitude: 69.23993027755733,
        speed: -1,
        speed_accuracy: -1,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    },
    isLoading: true,
    isActive: true,
    locations: [],
    peoples: [],
    drivers: [],
    driverConfig: {
        getRadius: 3000,
    },
    menu: false,
};
const appReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'theme':
            return {...state, theme: action.payload};
        case 'mapTheme':
            return {...state, mapTheme: action.payload};
        case 'ia':
            return {...state, isActive: action.payload};
        case 'dc':
            return {...state, driverConfig: action.payload};
        case 'lang':
            return {...state, lang: action.payload};
        case 'locations':
            return {...state, locations: action.payload};
        case 'loc':
            return {...state, currentLocation: action.payload};
        case 'isLoading':
            return {...state, isLoading: action.payload};
        case 'setPeoples':
            return {...state, peoples: action.payload};
        case 'setDrivers':
            return {...state, drivers: action.payload};
        case 'setMenu':
            return {...state, menu: action.payload};
        default:
            return state;
    }
};
export default appReducer;
