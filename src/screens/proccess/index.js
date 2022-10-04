import React from 'react';
import {useSelector} from 'react-redux';
import ModalMenu from '../../components/global/menu';
import StatusBarComponent from '../../components/global/status';

import Register from './driver/register';
import DriverWait from './driver/wait';
import DriverGoPassenger from './driver/goPassenger';
import DriverTrip from './driver/trip';

import PassengerCreate from './passenger/create';
import PassengerWait from './passenger/wait';
import PassengerTrip from './passenger/trip';

export default function Home() {
    const data = useSelector((state) => state);
    const GetContent = () => {
        const data = useSelector((state) => state);
        switch (data.auth.user.user_status) {
            case 0:
                return <Register />;
                break;
            default:
                return TypeSelect;
                break;
        }
    };
    const TypeSelect = () => {
        const data = useSelector((state) => state);
        switch (data.auth.userType) {
            case 'passenger':
                return TypePassenger;
                break;
            case 'driver':
                return TypeDriver;
                break;
            default:
                return TypePassenger;
                break;
        }
    };
    const TypePassenger = () => {
        const data = useSelector((state) => state);
        switch (data.trip.trip.status) {
            case 2:
                return <PassengerWait />;
                break;
            case 'driver':
                return <PassengerTrip />;
                break;
            default:
                return <PassengerCreate />;
                break;
        }
    };
    const TypeDriver = () => {
        const data = useSelector((state) => state);
        switch (data.trip.trip.status) {
            case 2:
                return <DriverGoPassenger />;
                break;
            case 'driver':
                return <DriverTrip />;
                break;
            default:
                return <DriverWait />;
                break;
        }
    };

    return (
        <>
            <ModalMenu />
            <StatusBarComponent />
            {data.auth.user.user_status == 0 ? (
                <Register />
            ) : (
                <>
                    {data.auth.userType == 'passenger' ? (
                        <>
                            {data.trip.trip === null ? (
                                <PassengerCreate />
                            ) : (
                                <>
                                    {data.trip.trip.status == 2 ? <PassengerWait /> : null}
                                    {data.trip.trip.status == 3 ? <PassengerTrip /> : null}
                                </>
                            )}
                        </>
                    ) : null}
                    {data.auth.userType == 'driver' ? (
                        <>
                            {data.trip.trip === null ? (
                                <DriverWait />
                            ) : (
                                <>
                                    {data.trip.trip.status == 2 ? <DriverGoPassenger /> : null}
                                    {data.trip.trip.status == 3 ? <DriverTrip /> : null}
                                </>
                            )}
                        </>
                    ) : (
                        <></>
                    )}
                </>
            )}
        </>
    );
}
