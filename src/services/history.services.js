import toast from 'react-hot-toast';

import axios from '@/utils/api';


/* Identity and Access management (IAM) */
export const HistoryServices = {
    getList: _getList,
    getPlaceDropdownList: _getPlaceDropdownList,
    exportPlaceHistoryCSVList: _exportPlaceHistoryCSVList,
    registerEmailConfiguration: _registerEmailConfiguration,
    getPrefectureList: _getPrefectureList
};

/**
 * Get History list
 * @param {*} payload 
 * @param {*} callBackFun 
 */
function _getList(payload, callBackFun) {
    axios.post('/admin/place/history/list', payload)
        .then((response) => {
            if (response && response.data) {
                callBackFun(response.data);
            }
        })
        .catch((error) => {
            // Handle errors here
            console.error('Error fetching data:', error);
        });
}

/**
 * Get History list
 * @param {*} payload 
 * @param {*} callBackFun 
 */
function _exportPlaceHistoryCSVList(payload, callBackFun) {
    axios.post('/admin/place/history/export', payload)
        .then((response) => {
            if (response && response.data) {
                callBackFun(response.data);
            }
        })
        .catch((error) => {
            // Handle errors here
            console.error('Error fetching data:', error);
        });
}

/**
 * Register Email Configuration
 * @param {*} payload 
 * @param {*} callBackFun 
 */
function _registerEmailConfiguration(payload, callBackFun) {
    axios.post('/admin/place/history/email/configuration', payload)
        .then((response) => {
            if (response && response.data) {
                callBackFun(response.data);
                toast.success(response?.data?.message, {
                    position: "top-right",
                });
            }
        })
        .catch((error) => {
            toast.error(error?.response?.data?.message, {
                position: "top-right",
            });
        });
}

/**
 * Get Place Dropdown List
 * @param {*} payload 
 * @param {*} callBackFun 
 */
function _getPlaceDropdownList(payload, callBackFun) {
    axios.get('/admin/place/history/dropdown/list', payload)
        .then((response) => {
            if (response && response.data) {
                callBackFun(response.data);
            }
        })
        .catch((error) => {
            // Handle errors here
            console.error('Error fetching data:', error);
        });
}

/**
 * Get Prefecture Dropdown List
 * @param {*} payload 
 * @param {*} callBackFun 
 */
function _getPrefectureList(payload, callBackFun) {
    axios.get('/admin/place/history/prefecture', payload)
        .then((response) => {
            if (response && response.data) {
                callBackFun(response.data);
            }
        })
        .catch((error) => {
            // Handle errors here
            console.error('Error fetching data:', error);
        });
}