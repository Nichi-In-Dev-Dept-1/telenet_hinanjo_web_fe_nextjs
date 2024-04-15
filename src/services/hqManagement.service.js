import { downloadBase64File, timestampFile, toastDisplay } from "@/helper";
import axios from "@/utils/api";
import { isObject } from "lodash";
import toast from 'react-hot-toast';

export const HeadQuarterManagement = {
    importData: _importData,
    exportData: _exportData,
    getList: _getList,
    show: _show,
    create: _create,
    update: _update,
    delete: _delete,
};

/**
 * Import place data
 * @param {*} payload
 * @param {*} callBackFun
 */
function _importData(payload, callBackFun) {
    axios
        .post("/admin/hq/management/import", payload)
        .then((response) => {
            if (response && response.data) {
                callBackFun(response.data);
                toastDisplay(response, 'import');
            }
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
            callBackFun(false);
            toastDisplay(error.response, 'import');
        });
}

/**
 * Export place data
 * @param {*} payload
 * @param {*} callBackFun
 */
function _exportData(payload) {
    axios
        .post("/admin/hq/management/export", payload)
        .then((response) => {
            if (response && response.data && response.data.result.filePath) {
                downloadBase64File(response.data.result.filePath, timestampFile("Headquaters"));
                toast.success(response?.data?.message, {
                    position: "top-right",
                });
            }
        })
        .catch((error) => {

            console.error("Error fetching data:", error);
            toast.error(error?.response?.data?.message, {
                position: "top-right",
            });
        });
}

/**
 * Get place list
 * @param {*} payload
 * @param {*} callBackFun
 */
function _getList(payload, callBackFun) {
    axios
        .post("/admin/hq/management/list", payload)
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
 * Get place list
 * @param {*} payload
 * @param {*} callBackFun
 */
function _show(payload, callBackFun) {
    axios
        .post("/admin/hq/management/detail", payload)
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
 * Create a new place
 * @param {*} payload
 * @param {*} callBackFun
 */
function _create(payload, callBackFun) {
    axios
        .post("/admin/hq/management/store", payload)
        .then((response) => {
            if (response && response.data) {
                callBackFun(response.data);
                toast.success(response?.data?.message, {
                    position: "top-right",
                });
            }
        })
        .catch((error) => {
            if (error.response && error.response.status == 422) {
                callBackFun();
                if (isObject(error.response.data.message)) {
                    let errorMessages = Object.values(error.response.data.message);
                    let errorString = errorMessages.join('.')
                    let errorArray = errorString.split(".");
                    errorArray = errorArray.filter(message => message.trim() !== "");
                    // Join the error messages with line breaks
                    // Join the error messages with line breaks and add a comma at the end of each line, except the last one
                    let formattedErrorMessage = errorArray
                        .map((message, index) => {
                            return `${message.trim()}`;
                        })
                        .join("\n");
                    toast.error(formattedErrorMessage, {
                        position: "top-right",
                    });
                }
            } else {
                callBackFun();
                console.error(error);
                toast.error(error.response.data.message, {
                    position: "top-right",
                });
            }
        });
}

/**
 * Update place by id
 * @param {*} payload
 * @param {*} callBackFun
 */
function _update(id, payload, callBackFun) {
    axios
        .post(`/admin/hq/management/update`, payload)
        .then((response) => {
            if (response && response.data) {
                callBackFun();
                toast.success(response?.data?.message, {
                    position: "top-right",
                });
            }
        })
        .catch((error) => {
            if (error.response && error.response.status == 422) {
                callBackFun();
                if (isObject(error.response.data.message)) {
                    let errorMessages = Object.values(error.response.data.message);
                    let errorString = errorMessages.join('.')
                    let errorArray = errorString.split(".");
                    errorArray = errorArray.filter(message => message.trim() !== "");
                    // Join the error messages with line breaks
                    // Join the error messages with line breaks and add a comma at the end of each line, except the last one
                    let formattedErrorMessage = errorArray
                        .map((message, index) => {
                            return `${message.trim()}`;
                        })
                        .join("\n");
                    toast.error(formattedErrorMessage, {
                        position: "top-right",
                    });
                }
            } else {
                callBackFun();
                console.error(error);
                toast.error(error.response.data.message, {
                    position: "top-right",
                });
            }
        });
}

/**
 * Get place details by id
 * @param {*} id
 * @param {*} callBackFun
 */
function _delete(id, callBackFun) {
    axios
        .delete(`/admin/hq/management/delete`, { data: { "id": id } })
        .then((response) => {
            if (response && response.data) {
                callBackFun(response.data);
                toast.success(response?.data?.message, {
                    position: "top-right",
                });
            }
        })
        .catch((error) => {

            console.error("Error fetching data:", error);
            toast.error(error?.response?.data?.message, {
                position: "top-right",
            });
        });
}