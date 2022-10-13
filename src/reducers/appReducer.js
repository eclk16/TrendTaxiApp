const INITIAL_STATE = {
    theme: 'light',
    mapTheme: 'light',
    lang: 'gb',
    currentLocation: [],
    isLoading: true,
    isActive: true,
    peoples: [],
    drivers: [],
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
        case 'lang':
            return {...state, lang: action.payload};
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
