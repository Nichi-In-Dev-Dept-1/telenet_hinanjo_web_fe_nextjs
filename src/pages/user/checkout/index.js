import React, { useEffect, useContext, useState, useRef } from "react";
import _ from 'lodash';
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { Formik } from "formik";
import { gender_en, gender_jp } from '@/utils/constant';
import { convertToSingleByte, getJapaneseDateTimeDisplayActualFormat, toastDisplay, getValueByKeyRecursively as translate } from '@/helper'
import { LayoutContext } from "@/layout/context/layoutcontext";
import { CheckInOutServices, TempRegisterServices, UserPlaceListServices, UserDashboardServices, CommonServices } from "@/services";
import { useAppDispatch } from "@/redux/hooks";
import { setCheckOutData } from "@/redux/checkout";
import { Button, ButtonRounded, CommonPage, CustomHeader, Input, ValidationError, Password, CommonDialog, YappleModal, BarcodeDialog, QrScannerModal, InputDropdown, Calendar } from "@/components";

export default function Admission() {
  const { locale, localeJson, setLoader } = useContext(LayoutContext);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const layoutReducer = useSelector((state) => state.layoutReducer);

  const [audioNameLoader, setAudioNameLoader] = useState(false);
  const [audioFamilyCodeLoader, setAudioFamilyCodeLoader] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(false);
  const [openBasicDataInfoDialog, setOpenBasicDataInfoDialog] = useState(false);
  const [basicDataInfo, setBasicDataInfo] = useState(null);
  const [isSearch, setSearch] = useState(false);
  const [openBarcodeDialog, setOpenBarcodeDialog] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [openQrPopup, setOpenQrPopup] = useState(false);
  const [barcode, setBarcode] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isMRecording, setMIsRecording] = useState(false);
  const [inputType, setInputType] = useState("password");
  const [isVisible,setIsVisible] = useState(false);
  const formikRef = useRef();

  const schema = Yup.object().shape({
    name: Yup.string().max(200, translate(localeJson, "family_name_max")).test({
      test: function (value) {
        const { familyCode } = this.parent;
        return Boolean(familyCode) || Boolean(value);
      },
      message: translate(localeJson, "family_name_required"),
    }),
    password: Yup.string()
      .required(translate(localeJson, "family_password_required"))
      .test("is-four-digits", translate(localeJson, "family_password_min_max"), (value) => {
        return String(value).length === 4;
      }),
    familyCode: Yup.string().test({
      test: function (value) {
        const { name } = this.parent;
        return Boolean(name) || Boolean(value);
      },
      message: translate(localeJson, "family_code_required"),
    }),
    tel: Yup.string()
    .test(
      "starts-with-zero",
      translate(localeJson, "phone_num_start"),
      (value) => {
        if (value) {
          value = convertToSingleByte(value);
          return value.charAt(0) === "0";
        }
        return true; // Return true for empty values
      }
    )
    .test("matches-pattern", translate(localeJson, "phone"), (value) => {
      if (value) {
        const singleByteValue = convertToSingleByte(value);
        return /^[0-9]{10,11}$/.test(singleByteValue);
      }
      return true; // Allow empty values
    }),
    gender: Yup.string().nullable(),
    dob: Yup.date().nullable()
  });

  const initialValues = { name: "", password: "", familyCode: "",dob:"",gender: "",tel: "", };

  const { getList, eventCheckOut, placeCheckout } = CheckInOutServices;
  const { getBasicDetailsUsingUUID, getPPID } = TempRegisterServices;
  const { getActiveList } = UserPlaceListServices;

  /* Services */
  const { getEventListByID } = UserDashboardServices;
  const { getText } = CommonServices;

  useEffect(() => {
    const fetchData = async () => {
      setLoader(false);
      const urlParams = new URLSearchParams(window.location.search);
      const uuid = urlParams.get('UUID') || urlParams.get('uuid');
      if (uuid) {
        validateAndMoveToForm(uuid)
      }
    };
    fetchData();
  }, [locale]);

  useEffect(() => {
    setMIsRecording(isRecording);
  }, [isRecording]);

  const getSearchResult = (res) => {
    if (res?.success && !_.isEmpty(res?.data)) {
      const data = res.data;
      const count = res.data.count||"";
      if(count == 1){
      setSearchResult(data);
      setTableLoading(false);
      dispatch(setCheckOutData(data))
      setLoader(false);
      setIsVisible(false);
      router.push("/user/checkout/details")
      }
      else if(count>1) {
        setLoader(false);
        setIsVisible(true);
      }
      else {
        setLoader(false);
        setIsVisible(false);
      }
    } else {
      setSearchResult([]);
      setTableLoading(false);
      setLoader(false);
    }
  };

  const getCookieValueByKey = (key) => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Check if the cookie starts with the specified key
      if (cookie.startsWith(key + '=')) {
        return cookie.substring(key.length + 1);
      }
    }
    return '';
  };

  const myCookieValue = getCookieValueByKey('idToken');

  const closeQrPopup = () => {
    setOpenQrPopup(false);
  }
  const qrResult = (result) => {
    alert(result);
  }

  const openMyNumberDialog = () => {
    let payload = { id: layoutReducer?.user?.place?.id }
    let evt_payload = { event_id: layoutReducer?.user?.place?.id }
    layoutReducer?.user?.place?.type === "event" ? getEventListByID(evt_payload, (response) => {
      if (response && response.data) {
        let obj = response.data.model;
        if (obj.is_q_active == "1") {
          router.push(`https://login-portal-dev.biz.cityos-dev.hitachi.co.jp?screenID=HCS-100&idToken=${myCookieValue}`)
        }
        else {
          router.push({ pathname: '/user/event-list' })
        }
      }
    }) :
      getActiveList(payload, async (res) => {
        if (res?.data?.model?.active_flg == "1") {
          router.push(`https://login-portal-dev.biz.cityos-dev.hitachi.co.jp?screenID=HCS-100&idToken=${myCookieValue}`)
        }
        else {
          router.push({ pathname: '/user/list' })
        }
      })

  };

  const validateAndMoveToForm = (id) => {
    let ppid;
    let payload = {
      "uuid": id
    }
    getPPID(payload, (res) => {
      if (res) {
        // Parse the inner JSON stored as a string in the "result" field
        const innerJson = JSON.parse(res.result);
        // Extract the value associated with the key "ppid"
        const ppidValue = innerJson.transfer_data.ppid;
        ppid = ppidValue;
        ppid && fetchBasicDetailsInfo(ppid);
      }
    })
  }

  const basicInfoContent = () => {
    return <div>
      <div className='mt-2'>
        <div className='flex align-items-center'>
          <div className='page-header3'>{translate(localeJson, "name_kanji")}:</div>
          <div className='page-header3-sub ml-1'>{basicDataInfo?.name}</div>
        </div>
      </div>
      <div className='mt-2'>
        <div className='flex align-items-center'>
          <div className='page-header3'>{translate(localeJson, "refugee_name")}:</div>
          <div className='page-header3-sub ml-1'>{basicDataInfo?.refugee_name}</div>
        </div>
      </div>
      <div className='mt-2'>
        <div className='flex'>
          <div className='page-header3' style={{ whiteSpace: 'nowrap' }}>{translate(localeJson, "address")}:</div>
          <div className='page-header3-sub ml-1' style={{ whiteSpace: 'normal' }}>{basicDataInfo?.address}</div>
        </div>
      </div>
      <div className='mt-2'>
        <div className='flex align-items-center'>
          <div className='page-header3'>{translate(localeJson, "tel")}:</div>
          <div className='page-header3-sub ml-1'>{basicDataInfo?.tel}</div>
        </div>
      </div>
      <div className='mt-2'>
        <div className='flex align-items-center'>
          <div className='page-header3'>{translate(localeJson, "evacuation_date_time")}:</div>
          <div className='page-header3-sub ml-1'>{basicDataInfo?.join_date ? getJapaneseDateTimeDisplayActualFormat(basicDataInfo.join_date) : ""}</div>
        </div>
      </div>
      <div className='mt-2'>
        <div className='flex align-items-center'>
          <div className='page-header3'>{translate(localeJson, "evacuation_place")}:</div>
          <div className='page-header3-sub ml-1'>{layoutReducer?.user?.place.name}</div>
        </div>
      </div>
    </div>
  }

  const confirmRegistrationBeforeCheckin = () => {
    if (basicDataInfo.is_registered == "1") {
      if (layoutReducer?.user?.place?.type === "event") {
        let eventID = layoutReducer?.user?.place?.type === "event" ? layoutReducer?.user?.place?.id : ""
        eventCheckOut({
          event_id: eventID,
          yapple_id: basicDataInfo.yapple_id
        }, (response) => {
          if (response.success) {
            setOpenBasicDataInfoDialog(false);
          }
        });
      } else {
        let placeId = layoutReducer?.user?.place?.type === "place" ? layoutReducer?.user?.place?.id : ""
        placeCheckout({
          place_id: basicDataInfo.place_id,
          lgwan_family_id: basicDataInfo.lgwan_familiy_id

        }, (response) => {
          if (response.success) {
            setOpenBasicDataInfoDialog(false);
          }
        });
      }
      return
    }
    displayToastAndClose()
  }

  const displayToastAndClose = () => {
    toastDisplay(translate(localeJson, 'notcheck_in_shelter'), '', '', "error");
    setOpenBasicDataInfoDialog(false);
  }

  const fetchBasicDetailsInfo = (id) => {
    let payload = {
      "ppid": id ? id : ""
    };

    getBasicDetailsUsingUUID(payload, (response) => {
      if (response.success) {
        const data = response.data;
        setBasicDataInfo(data);
        setOpenBarcodeDialog(false);
        setOpenBasicDataInfoDialog(true);
      }
    })
  }

  const openYappleModal = () => {
    let payload = { id: layoutReducer?.user?.place?.id }
    let evt_payload = { event_id: layoutReducer?.user?.place?.id }
    layoutReducer?.user?.place?.type === "event" ? getEventListByID(evt_payload, (response) => {
      if (response && response.data) {
        let obj = response.data.model;
        if (obj.is_q_active == "1") {
          setImportModalOpen(true)
        }
        else {
          router.push({ pathname: '/user/event-list' })
        }
      }
    }) :
      getActiveList(payload, async (res) => {
        if (res?.data?.model?.active_flg == "1") {
          setImportModalOpen(true)
        }
        else {
          router.push({ pathname: '/user/list' })
        }
      })

  };

  const handleStaffButtonClick = () => {
    // Logic for the staff button click
  };

  const onImportModalClose = () => {
    setImportModalOpen(false);
  };

  const handleRecordingStateChange = (isRecord) => {
    setMIsRecording(isRecord);
    setIsRecording(isRecord);
  };

  return (
    <>
      <YappleModal
        open={importModalOpen}
        close={onImportModalClose}
        barcode={barcode}
        secondButtonClick={openYappleModal}
        setBarcode={setBarcode}
        isCheckIn={false}
        successHeader={"checkout_info_place"}
        isEvent={true}
        callable={confirmRegistrationBeforeCheckin}
        dynamicButtonText={true}
        keyJson={"de_register"}
        type={layoutReducer?.user?.place?.type}
      />
      <BarcodeDialog header={translate(localeJson, "barcode_dialog_heading")}
        visible={openBarcodeDialog} setVisible={setOpenBarcodeDialog}
        title={translate(localeJson, 'barcode_mynumber_dialog_main_title')}
        subTitle={translate(localeJson, 'barcode_mynumber_dialog_sub_title')}
        validateAndMoveToTempReg={(data) => validateAndMoveToForm(data)}
      ></BarcodeDialog>
      <CommonDialog
        open={openBasicDataInfoDialog}
        dialogBodyClassName="p-0"
        header={translate(localeJson, "checkout_info")}
        content={basicInfoContent()}
        position={"center"}
        footerParentClassName={"mt-5 w-12"}
        dialogClassName={"w-10 sm:w-8 md:w-4 lg:w-4"}
        footerButtonsArray={[
          {
            buttonProps: {
              buttonClass: "w-12",
              text: translate(localeJson, "de_register"),
              onClick: () => {
                confirmRegistrationBeforeCheckin()
              },
            },
            parentClass: "mb-2",
          },
          {
            buttonProps: {
              buttonClass: "w-12 back-button",
              text: translate(localeJson, "yapple_modal_success_div_white_btn"),
              onClick: () => {
                setOpenBasicDataInfoDialog(false);
                setOpenBarcodeDialog(false)
              },
            },
            parentClass: "back-button",
          },
        ]}
        close={() => {
          setOpenBasicDataInfoDialog(false);
        }}
      />
      <Formik
        innerRef={formikRef}
        validationSchema={schema}
        initialValues={initialValues}
        enableReinitialize
        onSubmit={(values) => {
          let fam_val = values.familyCode ? convertToSingleByte(values.familyCode) : "";
          let fam_pass = values.password ? convertToSingleByte(values.password) : "";
          let payload = {
            family_code: values.familyCode ? fam_val : "",
            refugee_name: values.name,
            password: fam_pass,
            place_id: layoutReducer?.user?.place?.id,
            ...(layoutReducer?.user?.place?.type === "place"
              ? { place_id: layoutReducer?.user?.place?.id }
              : layoutReducer?.user?.place?.type === "event"
                ? { event_id: layoutReducer?.user?.place?.id }
                : {}),
          };
          if (isSearch) {
            setLoader(true);
            getList(payload, getSearchResult);
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
        }) => (
          <div>
            <QrScannerModal
              open={openQrPopup}
              close={closeQrPopup}
              callback={qrResult}>
            </QrScannerModal>
            <div className="grid">
              <div className="col-12">
                <div className="card">
                  <CustomHeader headerClass={"page-header1"} header={translate(localeJson, "c_checkout_title")} />
                  <div>
                    <div className="mt-3">
                      <div
                        className="flex"
                        style={{ justifyContent: "flex-end", flexWrap: "wrap" }}
                      >
                        <Button
                          buttonProps={{
                            type: "button",
                            rounded: "true",
                            buttonClass: "back-button",
                            text: translate(localeJson, "check_out_shelter"),
                            onClick: () => {
                              router.push({
                                pathname: 'register/member',
                              })
                            },
                          }}
                          parentClass={"ml-3 mr-3 mt-1 back-button"}
                          parentStyle={{ display: "none" }}
                        />
                      </div>
                    </div>
                    <div className="grid md:gap-6 lg:gap-8">
                      {/* Future */}
                      {/* <div className="mt-3 col-12  md:col-5 lg:col-5" >
                        <div className="flex flex-column justify-content-start align-items-center h-full" style={{ background: "#E6E6E6" }}>
                          <div className="flex col-12 lg:col-6 w-full mt-2">
                            <ButtonRounded
                              buttonProps={{
                                custom: "userDashboard",
                                title: `https://login-portal-dev.biz.cityos-dev.hitachi.co.jp?screenID=HCS-100&idToken=${myCookieValue}`,
                                buttonClass:
                                  "flex align-items-center justify-content-center  primary-button h-3rem md:h-8rem lg:h-8rem ",
                                type: "submit",
                                rounded: "true",
                                icon: <img src="/layout/images/evacuee-card.png" width={'30px'} height={'30px'} alt="scanner" />,
                                text: translate(localeJson, "staff_temp_register_big_btn_one"),
                                onClick: () => {
                                  openMyNumberDialog()
                                }
                              }}
                              parentClass={
                                "userParentDashboard back-button w-full"
                              }
                            />
                          </div>
                          <div className="flex col-12 lg:col-3  mt-2 w-full mb-2">
                            <ButtonRounded
                              buttonProps={{
                                custom: "userDashboard",
                                buttonClass:
                                  "flex align-items-center justify-content-center  primary-button h-3rem md:h-8rem lg:h-8rem ",
                                type: "submit",
                                icon: <img src="/layout/images/mapplescan.svg" width={'40px'} height={'40px'} alt="scanner" />,
                                rounded: "true",
                                text: translate(localeJson, "staff_temp_register_big_btn_two"),
                                onClick: () => {
                                  openYappleModal();
                                }
                              }}
                              parentClass={
                                "userParentDashboard back-button w-full"
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex md:hidden justify-content-center align-items-center text-gray w-full h-full mb-5 mt-5">
                      {translate(localeJson, "or")}
                    </div> */}
                      <div className="mt-3 col-12 md:col-6 lg:col-6">
                        <div
                          className=" lg:ml-3 md:ml-3"
                        >
                          <div className="w-full">
                            <div className="mb-3  w-12">
                              <div className="flex w-12">
                                <div className="w-12">
                                  <Input
                                    inputProps={{
                                      inputParentClassName: `w-full custom_input ${errors.name &&
                                        touched.name &&
                                        "p-invalid"
                                        }`,
                                      labelProps: {
                                        text: translate(localeJson, 'shelter_name'),
                                        inputLabelClassName: "block",
                                        spanText: "*",
                                        inputLabelSpanClassName: "p-error",
                                        labelMainClassName: "pb-1"
                                      },
                                      inputClassName: "w-full",
                                      id: "name",
                                      name: "name",
                                      placeholder: translate(
                                        localeJson,
                                        "placeholder_please_enter_name"
                                      ),
                                      value: values.name,
                                      onChange: handleChange,
                                      onBlur: handleBlur,
                                      isLoading: audioNameLoader,
                                      disabled: audioNameLoader,
                                      hasIcon: true,
                                      inputRightIconProps: {
                                        display: true,
                                        audio: {
                                          display: true,
                                        },
                                        icon: "",
                                        isRecording,
                                        onRecordValueChange: (rec) => {
                                          const fromData = new FormData();
                                          fromData.append("audio_sample", rec);
                                          getText(fromData, (res) => {
                                            if (res?.data?.content) {
                                              setFieldValue("name", res?.data?.content);
                                            }
                                          });
                                        },
                                        onRecordingStateChange:
                                          handleRecordingStateChange,
                                      },
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="w-11">
                                <ValidationError
                                  errorBlock={
                                    errors.name && touched.name && errors.name
                                  }
                                />
                              </div>
                            </div>
                            <div className="mb-3 w-full">
                              <div className="flex w-12">
                                <div className="w-12">
                                  <Input
                                    inputProps={{
                                      inputParentClassName: `w-full custom_input ${errors.password &&
                                        touched.password &&
                                        "p-invalid"
                                        }`,
                                      labelProps: {
                                        text: translate(localeJson, "shelter_password"),
                                        inputLabelClassName: "block font-bold",
                                        spanText: "*",
                                        inputLabelSpanClassName: "p-error",
                                        labelMainClassName: "pb-1 pt-1",
                                      },
                                      inputClassName: "w-full",
                                      id: "password",
                                      name: "password",
                                      value: values.password,
                                      autoFocus: false,
                                      autoComplete: "new-password",
                                      inputMode: "numeric",
                                      disabled: isRecording ? true : false,
                                      type: inputType,
                                      placeholder: translate(
                                        localeJson,
                                        "placeholder_please_enter_password"
                                      ),
                                      onChange: (evt) => {
                                        const re = /^[0-9-]+$/;
                                        if (evt.target.value == "") {
                                          setFieldValue("password", evt.target.value);
                                        }
                                        if (re.test(convertToSingleByte(evt.target.value))) {
                                          setFieldValue("password", evt.target.value);
                                        }
                                      },
                                      onBlur: handleBlur,
                                      inputRightIconProps: {
                                        display: true,
                                        audio: {
                                          display: true,
                                        },
                                        password: {
                                          display: true,
                                          className: inputType == "text" ? "pi pi-eye-slash" : "pi pi-eye",
                                          onClick: () => {
                                            setInputType(inputType == "text" ? "password" : "text");
                                          }
                                        },
                                        icon: "",
                                        isRecording: isRecording,
                                        onRecordValueChange: (rec) => {
                                          const fromData = new FormData();
                                          fromData.append("audio_sample", rec);
                                          getText(fromData, (res) => {
                                            const re = /^[0-9-]+$/;
                                            let newPassword = res?.data?.content;
                                            if (re.test(newPassword)) {
                                              setFieldValue(
                                                "password",
                                                newPassword
                                              );
                                            }
                                          });
                                        },
                                        onRecordingStateChange:
                                          handleRecordingStateChange,
                                      },
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="w-11">
                                <ValidationError
                                  errorBlock={
                                    errors.password &&
                                    touched.password &&
                                    errors.password
                                  }
                                />
                              </div>
                            </div>
                            <div className="mb-3 w-full">
                              <div className="flex w-12">
                                <div className="w-12">
                                  <Input
                                    inputProps={{
                                      inputParentClassName: `w-full custom_input ${errors.familyCode &&
                                        touched.familyCode &&
                                        "p-invalid"
                                        }`,
                                      labelProps: {
                                        text: translate(localeJson, 'shelter_code'),
                                        inputLabelClassName: "block",
                                        spanText: "*",
                                        inputLabelSpanClassName: "p-error",
                                        labelMainClassName: "pb-1"
                                      },
                                      inputClassName: "w-full",
                                      id: "familyCode",
                                      name: "familyCode",
                                      inputMode: "numeric",
                                      placeholder: translate(
                                        localeJson,
                                        "placeholder_family_required"
                                      ),
                                      value: values.familyCode,
                                      isLoading: audioFamilyCodeLoader,
                                      disabled: audioFamilyCodeLoader,
                                      hasIcon: true,
                                      onChange: (evt) => {
                                        const re = /^[0-9-]+$/;
                                        if (
                                          evt.target.value === "" ||
                                          re.test(convertToSingleByte(evt.target.value))
                                        ) {
                                          let val = evt.target.value.replace(
                                            /-/g,
                                            ""
                                          ); // Remove any existing hyphens
                                          if (val.length > 3) {
                                            val =
                                              val.slice(0, 3) +
                                              val.slice(3);
                                          }
                                          setFieldValue("familyCode", val);
                                        }
                                      },
                                      onBlur: handleBlur,
                                      inputRightIconProps: {
                                        display: true,
                                        audio: {
                                          display: true,
                                        },
                                        icon: "",
                                        isRecording,
                                        onRecordValueChange: (rec) => {
                                          const fromData = new FormData();
                                          fromData.append("audio_sample", rec);
                                          getText(fromData, (res) => {
                                            if (res?.data?.content) {
                                              setFieldValue("familyCode", res?.data?.content);
                                            }
                                          });
                                        },
                                        onRecordingStateChange:
                                          handleRecordingStateChange,
                                      },
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="w-11">
                                <ValidationError
                                  errorBlock={
                                    errors.familyCode &&
                                    touched.familyCode &&
                                    errors.familyCode
                                  }
                                />
                              </div>
                            </div>
                            {
                                isVisible && (
                                  <>
                                <div className="mb-3 w-12">
                                <div className="flex w-12">
                                  <div className="w-12">
                                  <Input
                            inputProps={{
                              inputParentClassName: `w-full custom_input ${errors.tel && touched.tel && "p-invalid"
                                }`,
                              labelProps: {
                                text: translate(localeJson, "phone_number"),
                                inputLabelClassName: "block font-bold",
                                inputLabelSpanClassName: "p-error",
                                labelMainClassName: "pb-1",
                              },
                              inputClassName: "w-full",
                              id: "tel",
                              name: "tel",
                              value: values.tel,
                              inputMode: "numeric",
                              placeholder: translate(
                                localeJson,
                                "without_hypen"
                              ),
                              onChange: (evt) => {
                                const re = /^[0-9-]+$/;
                                let val;
                                if (
                                  evt.target.value === "" ||
                                  re.test(convertToSingleByte(evt.target.value))
                                ) {
                                  val = evt.target.value.replace(/-/g, "");
                                  setFieldValue("tel", val);
                                }
                              },
                              onBlur: handleBlur,
                            }}
                          />
                                  </div>
                                </div>
                                <div className="w-11">
                                  <ValidationError
                                    errorBlock={
                                      errors.tel && touched.tel && errors.tel
                                    }
                                  />
                                </div>
                              </div>
                               <div className="mb-3 w-12">
                               <div className="flex w-12">
                                 <div className="w-12">
                                 <Calendar calendarProps={{
                              calendarParentClassName: `lg:w-full ${errors.dob &&
                                touched.dob &&
                                "p-invalid"
                                }`,
                                labelProps: {
                                  text: translate(localeJson, 'c_dob'),
                                  calendarLabelClassName: "block"
                                },
                              date: values.dob,
                              calendarClassName: "w-full",
                              name: "dob",
                              onChange: handleChange,
                              onBlur: handleBlur,

                            }}
                            />
                                 </div>
                               </div>
                               <div className="w-11">
                                 <ValidationError
                                   errorBlock={
                                     errors.dob && touched.dob && errors.dob
                                   }
                                 />
                               </div>
                             </div>
                             <div className="mb-3 w-12"> 
                              <div className="flex w-12">
                              <div className="w-12">
                              <InputDropdown inputDropdownProps={{
                        inputDropdownParenClassName: `custom_input ${errors.gender && touched.gender && "p-invalid pb-1"
                          }`,
                        labelProps: {
                          text: translate(localeJson, 'gender_external_modal'),
                          inputDropdownLabelClassName: "block",
                          inputDropdownLabelSpanClassName: "p-error",
                          // spanText: "*"
                        },
                        inputDropdownClassName: "w-full ",
                        name: "gender",
                        value: values.gender,
                        options: locale == "ja" ? gender_jp : gender_en,
                        optionLabel: "name",
                        onChange: handleChange,
                        onBlur: handleBlur,
                        emptyMessage: translate(localeJson, "data_not_found"),
                      }}
                      />
                      </div>
                      </div>
                      <div className="w-11">
                      <ValidationError
                        errorBlock={
                          errors.gender && touched.gender && errors.gender
                        }
                      />
                              </div>
                             </div>
                             
                             </>
                                )
                              }
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 col-12  md:col-5 lg:col-5" >
                        <div className="flex flex-column justify-content-start align-items-end h-full">
                          <div className="flex col-12 lg:col-6 w-full mt-0 lg:mt-2 md:mt-2">
                            <></>
                          </div>
                          <div className="flex col-12 lg:col-3  mt-0 mb-0 lg:mt-2 lg:mb-2 md:mb-2 md:mt-2 w-full ">
                            <ButtonRounded
                              buttonProps={{
                                rounded: "true",
                                text: translate(localeJson, "mem_search"),
                                onClick: () => {
                                  let payload = { id: layoutReducer?.user?.place?.id }
                                  let evt_payload = { event_id: layoutReducer?.user?.place?.id }
                                  layoutReducer?.user?.place?.type === "event" ? getEventListByID(evt_payload, (response) => {
                                    if (response && response.data) {
                                      let obj = response.data.model;
                                      if (obj.is_q_active == "1") {
                                        setSearch(true);
                                        setTimeout(() => {
                                          handleSubmit()
                                        }, 1000)
                                      }
                                      else {
                                        setSearch(false)
                                        router.push({ pathname: '/user/event-list' })
                                      }
                                    }
                                  }) :
                                    getActiveList(payload, async (res) => {
                                      if (res?.data?.model?.active_flg == "1") {
                                        setSearch(true)
                                        setTimeout(() => {
                                          handleSubmit()
                                        }, 1000)
                                      }
                                      else {
                                        setSearch(false)
                                        router.push({ pathname: '/user/list' })
                                      }
                                    })
                                },
                                custom: "userDashboard",
                                buttonClass:
                                  "flex align-items-center justify-content-center  primary-button h-3rem md:h-8rem lg:h-8rem ",
                              }} parentClass={"w-full primary-button"}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Formik>
    </>
  );
}