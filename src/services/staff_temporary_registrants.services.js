import toast from 'react-hot-toast';

import axios from '@/utils/api';
import { common422ErrorToastDisplay } from '@/helper';

/* Identity and Access management (IAM) */
export const TemporaryStaffRegistrantServices = {
    getDefaultEventDetails: _getDefaultEventDetails,
    getList: _getList,
    exportTemporaryEvacueesCSVList: _exportTemporaryEvacueesCSVList,
    getFamilyTemporaryEvacueesDetail: _getFamilyTemporaryEvacueesDetail,
    updateCheckInDetail: _updateCheckInDetail
};

/**
 * Get default event details
 * @param {*} payload 
 * @param {*} callBackFun 
 */
function _getDefaultEventDetails(payload, callBackFun) {
    axios.post('/user/event/default', payload)
        .then((response) => {
            if (response && response.data) {
                callBackFun(response.data);
            }
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
            callBackFun(false);
        });
}

/**
 * Get History list
 * @param {*} payload 
 * @param {*} callBackFun 
 */
function _getList(payload, callBackFun) {
    axios.post('/staff/temp/evacuees', payload)
        .then((response) => {
            if (response && response.data) {
                callBackFun(response.data);
            }
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
            callBackFun(false);
        });
}

/**
 * Get Evacuees CSV list
 * @param {*} payload 
 * @param {*} callBackFun 
 */
function _exportTemporaryEvacueesCSVList(payload, callBackFun) {
    axios.post('/staff/temp/evacuees/export', payload)
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
 * Get Evacuees Family Data
 * @param {*} payload 
 * @param {*} callBackFun 
 */
function _getFamilyTemporaryEvacueesDetail(payload, callBackFun) {
    axios.post('/staff/temp/evacuees/detail', payload)
        .then((response) => {
            if (response && response.data) {
                callBackFun(response.data);
            }
        })
        .catch((error) => {
            toast.error(error?.response?.data?.message, {
                position: "top-right",
            });
        });
}

/**
 * Get History list
 * @param {*} payload 
 * @param {*} callBackFun 
 */
function _updateCheckInDetail(payload, callBackFun) {
    axios.post('/staff/temp/evacuees/checkin', payload)
        .then((response) => {
            if (response && response.data) {
                callBackFun(response.data);
            }
            toast.success(response?.data?.message, {
                position: "top-right",
            });
        })
        .catch((error) => {
            callBackFun();
            common422ErrorToastDisplay(error);
        });
}