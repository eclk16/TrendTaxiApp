const INITIAL_STATE = {
    theme: 'light',
    lang: 'gb',
    currentLocation: {
        lat: 69.242905,
        lon: 41.321998,
    },
    isLoading: true,
};
const appReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'theme':
            return {...state, theme: action.payload};
        case 'lang':
            return {...state, lang: action.payload};
        case 'loc':
            return {...state, currentLocation: action.payload};
        case 'isLoading':
            return {...state, isLoading: action.payload};
        default:
            return state;
    }
};
export default appReducer;
