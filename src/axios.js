import axios from 'axios';
import React, {useEffect} from 'react';
import config from './app.json';

export const apiGet = async (url, params) => {
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    const result = await axios.get(
        config.apiBaseUrl + url + '?' + new URLSearchParams(params).toString(),
    );
    return result;
};
export const apiPost = async (url, params) => {
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    if (params.token) axios.defaults.headers.common['Authorization'] = 'Bearer ' + params.token;
    const result = await axios.post(config.apiBaseUrl + url, params);

    return result;
};
