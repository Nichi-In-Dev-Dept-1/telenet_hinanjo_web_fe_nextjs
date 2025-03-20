import axios from "@/utils/api";
import { toastDisplay } from "@/helper";

export const TempRegisterServices = {
  tempRegister: _tempRegister,
  getMasterQuestionnaireList: _getQuestionnaireList,
  getIndividualQuestionnaireList: _getIndividualQuestionnaireList,
  getSpecialCareDetails: _getSpecialCareDetails,
  registerUser: _registerUser,
  qrScanRegistration: _qrScanRegistration,
  ocrScanRegistration: _ocrScanRegistration,
  getAddressByZipCode: _getAddressByZipCode,
  getBasicDetailsInfo: _getBasicDetailsInfo,
  getBasicDetailsInfoStaffTemp: _getBasicDetailsInfoStaffTemp,
  getBasicDetailsUsingUUID: _getBasicDetailsUsingUUID,
  registerTemporaryUser: _registerTemporaryUser,
  getActiveEvacuationPlaceList: _getActiveEvacuationPlaceList,
  getdefaultEventData: _getDefaultEventData,
  autoCheckoutEvacuee: _autoCheckoutEvacuee,
  staffRegisterUser: _staffRegisterUser,
  staffEditUser: _staffEditUser,
  staffTempEditUser: _staffTempEditUser,
  getPPID: _getppID,
  deleteTempFamily: _deleteTempFamily,
  isRegistered: _isRegistered,
  tempDetails: _tempDetails,
  ivuToolRegistration: _ivuToolRegistration,
};

function _getDefaultEventData(callBackFun) {
  axios
    .post("/user/event/default")
    .then((response) => {
      callBackFun(response.data);
    })
    .catch((error) => {
      console.error("Error fetching Default Event Info list:", error);
    });
}

function _getActiveEvacuationPlaceList(callBackFun) {
  axios
    .post("/user/active/place/list")
    .then((response) => {
      callBackFun(response.data);
    })
    .catch((error) => {
      console.error("Error fetching Basic Info list:", error);
    });
}

function _registerTemporaryUser(payload, callBackFun) {
  axios
    .post("/user/temporary/registration", payload)
    .then((response) => {
      callBackFun(response.data);
    })
    .catch((error) => {
      toastDisplay(error?.response);
    });
}

function _autoCheckoutEvacuee(payload, callBackFun) {
  axios
    .post("/user/temporary/checkout", payload)
    .then((response) => {
      callBackFun(response.data);
      toastDisplay(response);
    })
    .catch((error) => {
      toastDisplay(error?.response);
    });
}

function _getBasicDetailsInfo(payload, callBackFun) {
  axios
    .post("/user/basic/info", payload)
    .then((response) => {
      callBackFun(response.data);
    })
    .catch((error) => {
      callBackFun(error);
    });
}

function _getBasicDetailsInfoStaffTemp(payload, callBackFun) {
  axios
    .post("/user/basic/info/search", payload)
    .then((response) => {
      callBackFun(response.data);
    })
    .catch((error) => {
      callBackFun(error);
    });
}

function _getBasicDetailsUsingUUID(payload, callBackFun) {
  axios
    .post("/user/basic/info/uuid", payload)
    .then((response) => {
      callBackFun(response.data);
    })
    .catch((error) => {
      callBackFun(error);
      toastDisplay(error?.response);
    });
}

function _tempRegister(payload, callBackFun) {
  axios
    .post("/user/registration", payload)
    .then((response) => {
      callBackFun(response.data);
    })
    .catch((error) => {
      if (error.response?.status != 409) {
        callBackFun();
        toastDisplay(error.response);
      } else {
        callBackFun(error.response.data);
      }
    });
}

function _getQuestionnaireList(payload, callBackFun) {
  axios
    .post("/user/master/questionnaire/list", payload)
    .then((response) => {
      if (response && response.data) {
        callBackFun(response.data);
      }
    })
    .catch((error) => {
      console.error("Error fetching questionnaire list:", error);
    });
}

function _getIndividualQuestionnaireList(payload, callBackFun) {
  axios
    .post("/user/individual/questionnaire/list", payload)
    .then((response) => {
      if (response && response.data) {
        callBackFun(response.data);
      }
    })
    .catch((error) => {
      console.error("Error fetching questionnaire list:", error);
    });
}

function _getSpecialCareDetails(callBackFun) {
  axios
    .get("/user/special/care")
    .then((response) => {
      if (response && response.data) {
        callBackFun(response.data);
      }
    })
    .catch((error) => {
      console.error("Error fetching special care details:", error);
    });
}

function _registerUser(payload, callBackFun) {
  axios
    .post("/user/registration", payload)
    .then((response) => {
      callBackFun(response.data);
      // toastDisplay(response);
    })
    .catch((error) => {
      if (error.response?.status != 409) {
        callBackFun();
        toastDisplay(error.response);
      } else {
        callBackFun(error.response.data);
      }
    });
}

function _qrScanRegistration(payload, callBackFun) {
  axios
    .post("/user/registration/qr/scan", payload)
    .then((response) => {
      callBackFun(response.data);
      toastDisplay(response);
    })
    .catch((error) => {
      callBackFun(false);
      toastDisplay(error?.response);
    });
}

function _ocrScanRegistration(payload, callBackFun) {
  axios
    .post("/user/registration/ocr/scan", payload)
    .then((response) => {
      callBackFun(response.data);
      toastDisplay(response);
    })
    .catch((error) => {
      callBackFun(false);
      toastDisplay(error?.response);
    });
}

function _staffRegisterUser(payload, callBackFun) {
  axios
    .post("/user/registration ", payload)
    .then((response) => {
      callBackFun(response.data);
      toastDisplay(response);
    })
    .catch((error) => {
      if (error.response?.status != 409) {
        callBackFun();
        toastDisplay(error.response);
      } else {
        callBackFun(error.response.data);
      }
    });
}
function _staffEditUser(payload, callBackFun) {
  axios
    .post("/staff/evacuees/edit ", payload)
    .then((response) => {
      callBackFun(response.data);
      toastDisplay(response);
    })
    .catch((error) => {
      callBackFun(false);
      toastDisplay(error?.response);
    });
}
function _staffTempEditUser(payload, callBackFun) {
  axios
    .post("/staff/temp/evacuees/edit ", payload)
    .then((response) => {
      callBackFun(response.data);
      toastDisplay(response);
    })
    .catch((error) => {
      callBackFun(false);
      toastDisplay(error?.response);
    });
}
//_staffEditUser

async function _getAddressByZipCode(zipCode, callBackFun) {
  try {
    const response = await fetch(
      `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipCode}`
    );
    const data = await response.json();
    if (data.results) {
      callBackFun(data.results);
    } else {
      data && callBackFun();
    }
  } catch (error) {
    console.error("Error fetching address data:", error);
  }
}

function _getppID(payload, callBackFun) {
  let env = process.env.NEXT_PUBLIC_CLIENT_ENV;
  let url =
    env === "development"
      ? "https://login-portal-dev-api.biz.cityos-dev.hitachi.co.jp/get_applinkage"
      : "https://login-portal-api.biz.linkage.city.yabu.hyogo.jp/get_applinkage";

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.resultCode === "00") {
        callBackFun(data);
      } else {
        callBackFun();
        toastDisplay("PPIDが空です。", "", "", "success");
      }
    })
    .catch((error) => {
      callBackFun();
      toastDisplay(error?.message || "An error occurred", "", "", "error");
    });
}

function _deleteTempFamily(payload, callBackFun) {
  axios
    .post("/user/registration/delete/family", payload)
    .then((response) => {
      callBackFun(response.data);
      toastDisplay(response);
    })
    .catch((error) => {
      callBackFun(false);
      toastDisplay(error?.response);
    });
}

function _isRegistered(payload, callBackFun) {
  axios
    .post("/user/registration/status", payload)
    .then((response) => {
      callBackFun(response.data);
    })
    .catch((error) => {
      callBackFun();
    });
}
function _tempDetails(payload, callBackFun) {
  axios
    .post(`/user/registration/qr/app/fetch/temp/evacuee`, payload)
    .then((response) => {
      callBackFun(response.data);
    })
    .catch((error) => {
      callBackFun();
      toastDisplay(error?.response);
    });
}


/**
 * Get my number card detail
 * @param {*} payload 
 * @param {*} callBackFun 
 */
function _ivuToolRegistration(payload, callBackFun) {
  axios.post('/user/ivu/api', payload)
      .then((response) => {
          if (response) {
              callBackFun(response);
          }
      })
      .catch((error) => {
          callBackFun(false);
          toastDisplay(error?.response);
      });
}