import Trips from '../../screens/other/trips';
import Settings from '../../screens/other/settings';
import TripDetail from '../../screens/other/tripDetail';
import Profile from '../../screens/other/profile';
import Faq from '../../screens/other/faq';
import Reports from '../../screens/other/reports';
import ProfileEdit from '../../screens/other/profileEdit';
import Home from '../../screens/proccess';

const list = [
    {
        icon: 'home',
        text: 'home',
        navigate: 'Home',
        component: Home,
        header: false,
    },
    {
        icon: 'map-marker-distance',
        text: 'trips',
        navigate: 'Trips',
        component: Trips,
        header: true,
    },
    {
        icon: 'map-marker-distance',
        text: 'trips',
        navigate: 'TripDetails',
        component: TripDetail,
        header: true,
        hidden: true,
    },
    {
        icon: 'account',
        text: 'profile',
        navigate: 'Profile',
        component: Profile,
        header: true,
    },
    {
        icon: 'account',
        text: 'profile',
        navigate: 'ProfileEdit',
        component: ProfileEdit,
        header: true,
        hidden: true,
    },
    {
        icon: 'account',
        text: 'faq',
        navigate: 'Faq',
        component: Faq,
        header: true,
        hidden: true,
    },
    {
        icon: 'google-analytics',
        text: 'reports',
        navigate: 'Reports',
        component: Reports,
        header: true,
    },
    {
        icon: 'cog',
        text: 'settings',
        navigate: 'Settings',
        component: Settings,
        header: true,
        hidden: true,
    },
];

export default list;
