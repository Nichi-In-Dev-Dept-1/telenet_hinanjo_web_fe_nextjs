import axios from "@/utils/api";
import { toastDisplay } from "@/helper";

/* Identity and Access management (IAM) */
export const systemSettingServices = {
  getList: _getSystemSettingList,
  update: _updateSystemSetting,
  bulkDelete: _bulkDeleteSystemSetting,
};

function _getSystemSettingList(callBackFun) {
  axios
    .get("/admin/systemSetting")
    .then((response) => {
      if (response && response.data) {
        callBackFun(response.data);
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function _updateSystemSetting(payload, callBackFun) {
  axios
    .post(`/admin/systemSetting/upsert`, payload)
    .then((response) => {
      if (response && response.data) {
        callBackFun(response.data);
        toastDisplay(response);
      }
    })
    .catch((error) => {
      callBackFun(false);
      toastDisplay(error?.response);
    });
}

function _bulkDeleteSystemSetting(callBackFun) {
  axios
    .post(`/admin/reset-database`)
    .then((response) => {
      if (response && response.data) {
        callBackFun(response.data);
        toastDisplay(response);
      }
    })
    .catch((error) => {
      callBackFun(false);
      toastDisplay(error?.response);
    });
}