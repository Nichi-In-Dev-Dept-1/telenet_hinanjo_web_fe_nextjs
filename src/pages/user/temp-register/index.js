/* eslint-disable no-irregular-whitespace */
import React, { useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { Formik } from "formik";
import * as Yup from "yup";
import { Tooltip } from "primereact/tooltip";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setRegisterData,
  setOriginalData,
  reset,
  setPlaceId,
} from "@/redux/tempRegister";
import { LayoutContext } from "@/layout/context/layoutcontext";
import {
  getValueByKeyRecursively as translate,
  getJapaneseDateDisplayYYYYMMDDFormat,
  getEnglishDateDisplayFormat,
  getEnglishDateSlashDisplayFormat,
  getGeneralDateTimeSecondSlashDisplayFormat,
  convertToSingleByte,
  showOverFlow,
  hideOverFlow,
  toastDisplay,
  geocodeAddressAndExtractData,
  extractAddress,
  fetchIvuResponse,
} from "@/helper";
import {
  Button,
  ButtonRounded,
  ValidationError,
  RadioBtn,
  PerspectiveCropping,
  NormalCheckBox,
  Input,
  InputDropdown,
  CustomHeader,
  EvacueeTempRegModal,
  QuestionList,
  QrScannerModal,
  BarcodeDialog,
  NormalLabel,
  CommonDialog,
} from "@/components";
import { prefectures, prefectures_en } from "@/utils/constant";
import {
  CommonServices,
  TempRegisterServices,
  CheckInOutServices,
  MapServices,
} from "@/services";
import _ from "lodash";
import QrConfirmDialog from "@/components/modal/QrConfirmDialog";
import YaburuModal from "@/components/modal/yaburuModal";
import toast from "react-hot-toast";
import { PerspectiveImageCropping } from "@/components/perspectiveImageCropping";
import IvuConfirmDialog from "@/components/modal/ivuConfirmDialog";


export default function Admission() {
  const { locale, localeJson, setLoader ,webFxScaner, selectedScannerName } = useContext(LayoutContext);
  const [webFxScan, setWebFxScan] = useState(null);
  const [selectedScanner, setSelectedScanner] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const personCount = localStorage.getItem("personCountTemp");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const layoutReducer = useAppSelector((state) => state.layoutReducer);
  const regReducer = useAppSelector((state) => state.tempRegisterReducer);
  const discloseInfo =
    locale == "ja"
      ? layoutReducer?.layout?.disclosure_info_ja
      : layoutReducer?.layout?.disclosure_info_en;

  const [evacuee, setEvacuee] = useState([]);
  const [registerModalAction, setRegisterModalAction] = useState("create");
  const [specialCareEditOpen, setSpecialCareEditOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [specialCare, setSpecialCare] = useState([]);
  const [specialCareOptions, setSpecialCareOptions] = useState([]);
  const [specialCareJPOptions, setSpecialCareJPOptions] = useState([]);
  const [specialCareENOptions, setSpecialCareENOptions] = useState([]);
  const [evacueeValues, setEvacueeValues] = useState("");
  const [shelterData, setShelterData] = useState([]);
  const [editObj, setEditObj] = useState({});
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [count, setCounter] = useState(1);
  const [evacueeCount, setEvacueeCounter] = useState(0);
  const [hasErrors, setHasErrors] = useState(false);
  const [isMRecording, setMIsRecording] = useState(false);
  const [inputType, setInputType] = useState("password");
  const [showDetails, setShowDetails] = useState(false);
  const [expandedFamilies, setExpandedFamilies] = useState([]);
  const [modalCountFlag, setModalCountFlag] = useState(true);
  const [perspectiveCroppingVisible, setPerspectiveCroppingVisible] =
    useState(false);
    const [perspectiveImageCroppingVisible, setPerspectiveImageCroppingVisible] = useState(false);
  const [openBarcodeDialog, setOpenBarcodeDialog] = useState(false);
  const [openBarcodeConfirmDialog, setOpenBarcodeConfirmDialog] =
    useState(false);
  const [openQrPopup, setOpenQrPopup] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const formikRef = useRef();
  const [isStep1, setIsStep1] = useState(true);
  const [activeEvacuationOptions, setActiveEvacutaionOptions] = useState([]);
  const [QrScanPopupModalOpen, setQrScanPopupModalOpen] = useState(false);
  const [visible, setVisible] = useState(false);
   const [ivuVisible,setIvuVisible] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [modalMessageFlag, setModalMessageFlag] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [skipStep,setSkipStep] = useState(false);
  const [isIvuDeviceConnected,setIsIvuDeviceConnected] = useState(false);



  const place_id = regReducer.placeId;

  const successData = regReducer.successData;

  const toggleExpansion = (personId) => {
    setExpandedFamilies((prevExpanded) =>
      prevExpanded.includes(personId)
        ? prevExpanded.filter((id) => id !== personId)
        : [...prevExpanded, personId]
    );
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const { basicInfo } = CheckInOutServices;

  /* Services */
  const { getText, getAddressFromZipCode } = CommonServices;

  const {
    getSpecialCareDetails,
    getMasterQuestionnaireList,
    qrScanRegistration,
    ocrScanRegistration,
    ivuToolRegistration,
    getActiveEvacuationPlaceList,
  } = TempRegisterServices;

  useEffect(()=>{
    setWebFxScan(webFxScaner)
    setSelectedScanner(selectedScannerName)
  },[])

  async function scan() {
    return await webFxScan.scan();
  }


// Trigger a scan and save the first image base64
const handleScan = async () => {
  if (!selectedScanner || !webFxScan) return;

  try {
    setLoader(true);
    const {result,data}= await scan();
    if(result)
    {
      setScanResult(data[0].base64);
      ocrResult(data[0].base64);
      return;
        // setPerspectiveImageCroppingVisible(true);
        // setLoader(false);
    }
    else {
      setLoader(false)
      toast.error(locale=="en"?'Try again after making sure your card is positioned correctly.':' カードが正しく配置されていることを確認して、もう一度お試しください。', {
        position: "top-right",
      });
    }
    setLoader(false);
  } catch (err) {
    setLoader(false)
     toast.error(locale=="en"?'Try again after making sure your card is positioned correctly.':' カードが正しく配置されていることを確認して、もう一度お試しください。', {
      position: "top-right",
    });
  }
};

  useEffect(() => {
    const handlePopstate = () => {
      // Clear localStorage when the back button is clicked
      localStorage.removeItem("personCountTemp");
    };

    const handleBeforeUnload = () => {
      // Clear localStorage when the page is about to be unloaded
      localStorage.removeItem("personCountTemp");
    };

    // Attach the event listeners when the component mounts
    window.addEventListener("popstate", handlePopstate);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Clean up the event listeners when the component unmounts
    return () => {
      window.removeEventListener("popstate", handlePopstate);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [locale]);

  useEffect(() => {
    if (successData?.data?.familyCode) {
      let payload = {
        family_code: successData?.data?.familyCode
      }
      TempRegisterServices.isRegistered(payload, (res) => {
        if (res) {
          let data = res.data;
          if (data?.is_registered == "0") {
            localStorage.setItem("showDelete", "true")
            router.push('/user/temp-register/success')
          }
          else {
            localStorage.setItem("showDelete", "false")
            router.push('/user/temp-person-count')
          }
        }
      })
    }
    return;
  }, [locale]);

  useEffect(() => {
    if (place_id) {
      TempRegisterServices.getActiveEvacuationPlaceList((res) => {
        console.log(res);
        if (res) {
          let placeList = res?.data?.model;
          let placeIsAvail = placeList?.find((list) => list.id == place_id);
          if (!placeIsAvail) {
            toastDisplay(
              translate(localeJson, "temp_inactive_place"),
              "",
              "",
              "error"
            );
            dispatch(setPlaceId(""))
            window.location.href = "/";
            return;
          }
        }
      });
    }
    getActiveEvacuationPlace();
    if (
      personCount > 0 &&
      personCount > evacueeCount &&
      evacuee?.length != personCount &&
      modalCountFlag
    ) {
      if (regReducer.originalData?.length <= 0) {
        setTimeout(() => {
          setSpecialCareEditOpen(true);
          hideOverFlow();
        }, 1000);
      }
    } else {
      if (!successData?.data) window.location.href = "/user/temp-person-count";
    }
  }, [locale]);

  useEffect(() => {
    if (evacueeValues !== "") {
      setEvacueeCounter((prevCount) => prevCount + 1);
      let data = evacueeValues;
      if (data.checked == true) {
        formikRef.current.setFieldValue("postalCode", data.postalCode);
        formikRef.current.setFieldValue("prefecture_id", data.prefecture_id);
        formikRef.current.setFieldValue("address", data.address);
        // formikRef.current.setFieldValue("address2", data.address2 || "");
        data.tel != "" && formikRef.current.setFieldValue("tel", data.tel);
        formikRef.current.setFieldValue("name_furigana", data.name_furigana);
        formikRef.current.setFieldValue("name_kanji", data.name);
      }
      setEvacuee((prevEvacuee) => {
        const updatedEvacuees = prevEvacuee.map((evacuee) => {
          if (evacuee.addressAsRep || evacuee.telAsRep) {
            // Update existing evacuee if conditions are met
            return {
              ...evacuee,
              postalCode: evacuee.addressAsRep
                ? evacueeValues.postalCode
                : evacuee.postalCode,
              prefecture_id: evacuee.addressAsRep
                ? evacueeValues.prefecture_id
                : evacuee.prefecture_id,
              address: evacuee.addressAsRep
                ? evacueeValues.address
                : evacuee.address,
              tel: evacuee.telAsRep ? evacueeValues.tel : evacuee.tel,
            };
          } else {
            return evacuee;
          }
        });

        const evacueeIndex = updatedEvacuees.findIndex(
          (evacuee) => evacuee.id === evacueeValues.id
        );

        if (evacueeIndex !== -1) {
          // Update existing evacuee
          const updatedEvacuee = [...updatedEvacuees];
          updatedEvacuee[evacueeIndex] = evacueeValues;
          formikRef.current?.setFieldValue("evacuee", updatedEvacuee);
          return updatedEvacuee;
        } else {
          formikRef.current?.setFieldValue("evacuee", [
            ...prevEvacuee,
            evacueeValues,
          ]);
          return [...prevEvacuee, evacueeValues];
        }
      });
    }
  }, [evacueeValues, setEvacuee]);

  useEffect(() => {
    if (evacuee?.length > 0) {
      evacuee.forEach((data) => {
        if (data.checked === true) {
          formikRef.current.setFieldValue("postalCode", data.postalCode);
          formikRef.current.setFieldValue("prefecture_id", data.prefecture_id);
          formikRef.current.setFieldValue("address", data.address);
          // formikRef.current.setFieldValue("address2", data.address2 || "");
          if (data.tel !== "") {
            formikRef.current.setFieldValue("tel", data.tel);
          }
          formikRef.current.setFieldValue("name_furigana", data.name_furigana);
          formikRef.current.setFieldValue("name_kanji", data.name);
        }
      });
    } else {
      formikRef.current.setFieldValue("postalCode", "");
      formikRef.current.setFieldValue("prefecture_id", "");
      formikRef.current.setFieldValue("address", "");
      // formikRef.current.setFieldValue("address2", "");
      formikRef.current.setFieldValue("tel", "");
      formikRef.current.setFieldValue("name_furigana", "");
      formikRef.current.setFieldValue("name_kanji", "");
    }
  }, [evacuee]);

  useEffect(() => {
    let postal_code = layoutReducer?.user?.place?.zip_code_default;
    let prefecture_id = layoutReducer?.user?.place?.prefecture_id_default;
    let address = layoutReducer?.user?.place?.address_default;

    formikRef.current.setFieldValue(
      "postalCode",
      postal_code ? postal_code.replace(/-/g, "") : null
    );
    formikRef.current.setFieldValue("prefecture_id", prefecture_id);
    formikRef.current.setFieldValue("address", address);
  }, []);

  useEffect(() => {
    if (
      personCount > 0 &&
      personCount > evacueeCount &&
      evacuee?.length != personCount &&
      modalCountFlag
    ) {
      if (regReducer.originalData?.length <= 0) {
        setTimeout(() => {
          setSpecialCareEditOpen(true);
        }, 1000);
      }
    }
  }, [evacueeCount]);

  useEffect(()=>{
      setTimeout(()=>{
      if(evacueeCount>0 && evacuee?.length >0 && (!modalCountFlag||evacueeCount==personCount) && modalMessageFlag)
      {
        if(regReducer.originalData?.length <= 0)
        {
        setShowAnimation(true);
        }
      }
    else{
      setShowAnimation(false);
    }},1000);
    },[evacueeCount,modalCountFlag])

  useEffect(() => {
    fetchMasterQuestion();
    fetchSpecialCare();
    fetchData();
  }, [locale]);

  useEffect(() => {
    setMIsRecording(isRecording);
  }, [isRecording]);

  useEffect(() => {
    if (Object.keys(formikRef.current.errors).length > 0) {
      const firstErrorElement = document.querySelector(".scroll-check");
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [count]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isStep1])

  const agreeTextWithHTML = (
    <div>
      {translate(localeJson, "agree_note_oneA")}
      <span
        dangerouslySetInnerHTML={{
          __html: `<a href="${window.location.origin
            }/privacy" target="_blank"><u>${translate(
              localeJson,
              "c_individual_information"
            )}</u></a>`,
        }}
      />
      {translate(localeJson, "agree_note_oneB")}
    </div>
  );

  const initialValues = {
    evacuee_date: "",
    postalCode: "",
    prefecture_id: null,
    address: "",
    // address2: "",
    evacuee: "",
    tel: "",
    password: "1234",
    questions: null,
    agreeCheckOne: false,
    agreeCheckTwo: false,
    name_furigana: "",
    name_kanji: "",
    evacuationPlace: "",
  };

  const currentDate = new Date();
  // eslint-disable-next-line no-irregular-whitespace
  const minDOBDate = new Date();
  minDOBDate.setFullYear(minDOBDate.getFullYear() - 120);
  const katakanaRegex = /^[\u30A1-\u30F6ー　\u0020]*$/;
  const evacueeSchema = () =>
    Yup.object().shape({
      checked: Yup.boolean().nullable(),
      name_kanji: Yup.string()
        .max(100, translate(localeJson, "name_max")),
      name_furigana: Yup.string()
        .max(100, translate(localeJson, "name_max")),
      dob: Yup.object().shape({
        year: Yup.number().required(
          translate(localeJson, "c_year") + translate(localeJson, "is_required")
        ),
        month: Yup.string().required(
          translate(localeJson, "c_month") +
          translate(localeJson, "is_required")
        ),
        date: Yup.string().required(
          translate(localeJson, "c_date") + translate(localeJson, "is_required")
        ),
      }),
      // Add other fields and validations as needed
      age: Yup.number().required(translate(localeJson, "age_required")),
      age_m: Yup.number().required(translate(localeJson, "age_required")),
      gender: Yup.string().required(translate(localeJson, "gender_required")),
      postalCode: Yup.string()
        .nullable()
        .min(7, translate(localeJson, "postal_code_length"))
        .max(7, translate(localeJson, "postal_code_length")),
      address: Yup.string()
        .required(translate(localeJson, "c_address_is_required"))
        .max(190, translate(localeJson, "address_max_length")),
      // address2: Yup.string()
      //   .nullable()
      //   .max(190, translate(localeJson, "address_max_length")),
      prefecture_id: Yup.string()
        .nullable(),
    });

  const evacueeItemSchema = evacueeSchema();

  const validationSchema = (localeJson) =>
    Yup.object().shape({
      name_kanji: Yup.string()
        .required(translate(localeJson, "name_required_changed"))
        .max(100, translate(localeJson, "name_max")),
      name_furigana: Yup.string()
        .max(100, translate(localeJson, "name_max")),
      postalCode: Yup.string()
        .nullable()
        .min(7, translate(localeJson, "postal_code_length"))
        .max(7, translate(localeJson, "postal_code_length")),
      address: Yup.string()
        .required(translate(localeJson, "address_required"))
        .max(190, translate(localeJson, "address_max_length")),
      // address2: Yup.string()
      //   .nullable()
      //   .max(190, translate(localeJson, "address_max_length")),
      prefecture_id: Yup.string()
        .nullable(),
      password: Yup.string()
        .required(translate(localeJson, "family_password_required"))
        .test(
          "is-four-digits",
          translate(localeJson, "family_password_min_max"),
          (value) => {
            return String(convertToSingleByte(value)).length === 4;
          }
        ),
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
      evacuee: Yup.array()
        .required(translate(localeJson, "c_required"))
        .test(
          "evacuee-min-length",
          translate(localeJson, "c_required"), // Change this message as needed
          (value) => {
            return value.length > 0;
          }
        )
        .test(
          "evacuee-max-length",
          translate(localeJson, "table_count_max"), // Change this message as needed
          (value) => {
            return value.length <= 20;
          }
        )
        .of(evacueeItemSchema),
      agreeCheckOne: Yup.boolean().test(
        "check_is_true",
        translate(localeJson, "c_required"),
        (value) => {
          if (!isStep1) {
            return value == true;
          } else return true;
        }
      ),
      evacuationPlace: Yup.string().test(
        "checkPlace",
        translate(localeJson, "c_required"),
        (value) => {
          if (!isStep1) {
            return value != undefined ? true : false;
          } else true;
        }
      ),
    });

  const fetchData = () => {
    if (
      regReducer.originalData &&
      Object.keys(regReducer.originalData).length > 0
    ) {
      let data = regReducer.originalData;
      formikRef.current.setFieldValue("postalCode", data.postalCode);
      formikRef.current.setFieldValue("prefecture_id", data.prefecture_id);
      formikRef.current.setFieldValue("address", data.address);
      // formikRef.current.setFieldValue("address2", data.address2 || "");
      formikRef.current.setFieldValue("evacuee", data.evacuee);
      formikRef.current.setFieldValue("tel", data.tel);
      formikRef.current.setFieldValue("password", data.password);
      formikRef.current.setFieldValue("agreeCheckOne", data.agreeCheckOne);
      formikRef.current.setFieldValue("agreeCheckTwo", data.agreeCheckTwo);
      formikRef.current.setFieldValue("name_furigana", data.name_furigana);
      formikRef.current.setFieldValue("name_kanji", data.name_kanji);
      formikRef.current.setFieldValue("evacuationPlace", data.evacuationPlace || "");
      data.evacuee && setEvacuee(data.evacuee);
    }
  };

  const fetchSpecialCare = () => {
    getSpecialCareDetails((res) => {
      if (res) {
        setSpecialCare(res.data.model.list);
        const options = res.data.model.list.map((item) => ({
          name: locale === "ja" ? item.name : item.name_en,
          value: item.id.toString(),
        }));
        const options_jp = res.data.model.list.map((item) => ({
          name: item.name,
          value: item.id.toString(),
        }));
        const options_en = res.data.model.list.map((item) => ({
          name: item.name_en,
          value: item.id.toString(),
        }));
        setSpecialCareJPOptions(options_jp);
        setSpecialCareENOptions(options_en);
        setSpecialCareOptions(options);
      }
    });
  };

  const fetchMasterQuestion = () => {
    let payload = {
      filters: {
        start: 0,
        order_by: "desc",
        sort_by: "updated_at",
      },
      event_id: "1",
    };
    getMasterQuestionnaireList(payload, (res) => {
      if (res) {
        const updatedList = res.data.list.map((item) => {
          if (regReducer?.originalData?.questions) {
            const matchingQuestion = regReducer?.originalData?.questions?.find(
              (question) => question.id === item.id
            );

            if (matchingQuestion) {
              // Update the answer property or any other property you need
              return {
                ...item,
                answer: matchingQuestion.answer,
                answer_en: matchingQuestion.answer_en,
              };
            }
            return item;
          }
          return item; // Return the original item if no match is found
        });
        const sortedUpdatedList = updatedList.sort((a, b) => {
          return parseInt(a.display_order) - parseInt(b.display_order);
        });
        setCounter(count + 1);
        // Now, updatedList contains the modified list with updated answers based on matching IDs
        setQuestions(sortedUpdatedList);
      }
    });
  };

  const Qr = {
    url: "/layout/images/evacuee-qr.png",
  };

  const Card = {
    url: "/layout/images/evacuee-card.png",
  };

  const Edit = {
    url: "/layout/images/editIcon.svg",
  };

  const Delete = {
    url: "/layout/images/deleteIcon.svg",
  };

  const ScannerImage = {
    url:"/layout/images/scanImage.jpg",
  }

  const goToPreviousStep = () => {
    setIsStep1(!isStep1);
  };

  const getActiveEvacuationPlace = () => {
    getActiveEvacuationPlaceList((response) => {
      if (response) {
        const data = response.data.model;
        let placesList = [];
        data.map((item) => {
          let place = {
            name: item.name,
            name_en: item.name_en ? item.name_en : item.name,
            value: item.id,
          };
          placesList.push(place);
        });
        setActiveEvacutaionOptions(placesList);
      }
    });
  };

  const genderOptions = [
    { name: translate(localeJson, "c_male"), value: 1 },
    { name: translate(localeJson, "c_female"), value: 2 },
    { name: translate(localeJson, "c_not_answer"), value: 3 },
  ];

  const getAnswerData = (answer) => {
    let answerData = null;
    answer?.map((item) => {
      answerData = answerData ? answerData + ", " + item : item;
    });
    return answerData || "-";
  };

  const handleRadioChange = (evt, rowData) => {
    const isChecked = evt.target.checked;
    let latest_Data = evacuee.map((row) => {
      if (isChecked) {
        let data = rowData;
        if (row.id !== rowData.id) {
          return { ...row, checked: false };
        } else {
          return { ...row, checked: true };
        }
      } else {
        return { ...row, checked: false }; // Handle the case when isChecked is false
      }
    });
    let representativeTel = "";
    let prefecture_id = "";
    let address = "";
    // let address2 = "";
    let postalCode = "";
    if (isChecked) {
      let data = rowData;
      representativeTel = rowData.tel ? rowData.tel : "";
      prefecture_id = rowData.prefecture_id ? rowData.prefecture_id : "";
      address = rowData.address ? rowData.address : "";
      // address2 = rowData.address2 ? rowData.address2 : "";
      postalCode = rowData.postalCode ? rowData.postalCode : "";
      formikRef.current.setFieldValue(
        "postalCode",
        data.postalCode ? data.postalCode?.replace(/-/g, "") : ""
      );
      formikRef.current.setFieldValue("prefecture_id", data.prefecture_id);
      formikRef.current.setFieldValue("address", data.address);
      // formikRef.current.setFieldValue("address2", data.address2 || "");
      data.tel != "" && formikRef.current.setFieldValue("tel", data.tel);
      formikRef.current.setFieldValue("name_furigana", data.name_furigana);
      formikRef.current.setFieldValue("name_kanji", data.name);
    }
    const updatedEvacue = [...latest_Data]; // Create a copy of evacuee array
    updatedEvacue.forEach((data) => {
      if (
        data.checked !== true &&
        data.telAsRep === true &&
        representativeTel !== ""
      ) {
        data.tel = representativeTel;
      }
      if (
        data.checked !== true &&
        data.addressAsRep === true &&
        address !== ""
      ) {
        data.prefecture_id = prefecture_id;
        data.address = address;
        // data.address2 = address2;
        data.postalCode = postalCode;
      }
    });
    formikRef.current.setFieldValue("evacuee", updatedEvacue);
    setEvacuee(updatedEvacue);
  };

  const getSpecialCareName = (nameList) => {
    let specialCareName = "";
    nameList &&
      nameList?.map((item) => {
        specialCareName = specialCareName
          ? specialCareName + ", " + item
          : item;
      });
    return specialCareName || "-";
  };
  const getGenderValue = (gender) => {
    if (gender == 1) {
      return translate(localeJson, "c_male");
    } else if (gender == 2) {
      return translate(localeJson, "c_female");
    } else {
      return translate(localeJson, "c_others_count");
    }
  };

  const getSpecialCareNames = (values) => {
    return values.map((value) => {
      const option = specialCareOptions.find((opt) => opt.value === value);
      return option ? option.name : ""; // Return the name or an empty string if not found
    });
  };

  const getSpecialCareJPNames = (values) => {
    return values?.map((value) => {
      const option = specialCareJPOptions.find((opt) => opt.value === value);
      return option ? option.name : ""; // Return the name or an empty string if not found
    });
  };

  const getSpecialCareENNames = (values) => {
    return values?.map((value) => {
      const option = specialCareENOptions.find((opt) => opt.value === value);
      return option ? option.name : ""; // Return the name or an empty string if not found
    });
  };

  const closeQrPopup = () => {
    setOpenQrPopup(false);
    showOverFlow();
  };

  const closeQrScanPopup = () => {
    setQrScanPopupModalOpen(false);
  };
  const qrResult = async (result) => {
    setLoader(true);
    let formData = new FormData();
    formData.append("content", result);
    setOpenQrPopup(false);
    setQrScanPopupModalOpen(false);
    showOverFlow();
    qrScanRegistration(formData, async (res) => {
      if (res) {
        const evacueeArray = res.data;
        let newEvacuee = createEvacuee(evacueeArray);
        newEvacuee = {
          ...newEvacuee,
          isFromFormReader: true
        };
        if (!newEvacuee.postalCode || !evacueeArray.prefecture_id) {
          const address = evacueeArray.fullAddress || evacueeArray.address;
          try {
            const { prefecture, postalCode, prefecture_id } = await geocodeAddressAndExtractData(address, localeJson, locale, setLoader);

            // Update newEvacuee with geocoding data
            newEvacuee = {
              ...newEvacuee,
              postalCode: postalCode,
              prefecture_id: prefecture_id
            };
          } catch (error) {
            console.error("Error fetching geolocation data:", error);
          }
        }
        setEditObj(newEvacuee)
        setRegisterModalAction("edit");
        setSpecialCareEditOpen(true);
        setEvacuee((prev) => {
          return [
            ...prev, // Use spread operator to include previous items in the array
            newEvacuee, // Add the newEvacuee to the array
          ];
        });
        formikRef.current.setFieldValue("evacuee", [
          ...formikRef.current.values.evacuee,
          newEvacuee,
        ]);
        setLoader(false);
      } else {
        setLoader(false);
      }
    });
    setOpenQrPopup(false);
    setQrScanPopupModalOpen(false);
    showOverFlow();
  };

  const ocrResult = async (result) => {
    setLoader(true);
    let formData = new FormData();
    formData.append("content", result);
    setPerspectiveCroppingVisible(false);
    setPerspectiveImageCroppingVisible(false);
    showOverFlow();
    ocrScanRegistration(formData, async (res) => {
      if (res) {
        const evacueeArray = res.data;
        let newEvacuee = createEvacuee(evacueeArray);
        newEvacuee = {
          ...newEvacuee,
          isFromFormReader: true
        };
        if (!newEvacuee.postalCode || !evacueeArray.prefecture_id) {
          const address = evacueeArray.fullAddress || evacueeArray.address;
          try {
            const { prefecture, postalCode, prefecture_id } = await geocodeAddressAndExtractData(address, localeJson, locale, setLoader);

            // Update newEvacuee with geocoding data
            newEvacuee = {
              ...newEvacuee,
              postalCode: postalCode,
              prefecture_id: prefecture_id
            };
          } catch (error) {
            console.error("Error fetching geolocation data:", error);
          }
        }
        setEditObj(newEvacuee)
        setRegisterModalAction("edit");
        setSpecialCareEditOpen(true);
        setEvacuee((prev) => {
          return [
            ...prev, // Use spread operator to include previous items in the array
            newEvacuee, // Add the newEvacuee to the array
          ];
        });
        formikRef.current.setFieldValue("evacuee", [
          ...formikRef.current.values.evacuee,
          newEvacuee,
        ]);
        setLoader(false);
      } else {
        setLoader(false);
      }
    });
  };

   const ivuResult = async () => {
     // if(window.location.origin === "https://rakuraku.nichi.in"){
        try{
          setLoader(true);
        const res = await fetchIvuResponse();
        if (res) {
          const evacueeArray = res;
          let newEvacuee = createEvacuee(evacueeArray);
          newEvacuee = {
            ...newEvacuee,
            isFromFormReader: true
          };
          if (!newEvacuee.postalCode || !evacueeArray.prefecture_id) {
            const address = evacueeArray.fullAddress || evacueeArray.address;
            try {
              const { prefecture, postalCode, prefecture_id } = await geocodeAddressAndExtractData(address, localeJson, locale, setLoader);
  
              // Update newEvacuee with geocoding data
              newEvacuee = {
                ...newEvacuee,
                postalCode: postalCode,
                prefecture_id: prefecture_id
              };
            } catch (error) {
              console.error("Error fetching geolocation data:", error);
            }
          }
          setEditObj(newEvacuee)
          setRegisterModalAction("edit");
          setSpecialCareEditOpen(true);
          setEvacuee((prev) => {
            return [
              ...prev, // Use spread operator to include previous items in the array
              newEvacuee, // Add the newEvacuee to the array
            ];
          });
          formikRef.current.setFieldValue("evacuee", [
            ...formikRef.current.values.evacuee,
            newEvacuee,
          ]);
          setLoader(false);
        } else {
          setLoader(false);
        }
        }
        catch(err) {
          setLoader(false)
          console.log(err)
  
        }
    //   }
    //   else {
    //   setLoader(true);
    //   let payload = {
    //     client_url:"http://10.8.0.6:50080"
    //   }
    //   ivuToolRegistration(payload, async (res) => {
    //     if (res) {
    //       const evacueeArray = res.data.data;
    //       let newEvacuee = createEvacuee(evacueeArray);
    //       newEvacuee = {
    //         ...newEvacuee,
    //         isFromFormReader: true
    //       };
    //       if (!newEvacuee.postalCode || !evacueeArray.prefecture_id) {
    //         const address = evacueeArray.fullAddress || evacueeArray.address;
    //         try {
    //           const { prefecture, postalCode, prefecture_id } = await geocodeAddressAndExtractData(address, localeJson, locale, setLoader);
  
    //           // Update newEvacuee with geocoding data
    //           newEvacuee = {
    //             ...newEvacuee,
    //             postalCode: postalCode,
    //             prefecture_id: prefecture_id
    //           };
    //         } catch (error) {
    //           console.error("Error fetching geolocation data:", error);
    //         }
    //       }
    //       setEditObj(newEvacuee)
    //       setRegisterModalAction("edit");
    //       setSpecialCareEditOpen(true);
    //       setEvacuee((prev) => {
    //         return [
    //           ...prev, // Use spread operator to include previous items in the array
    //           newEvacuee, // Add the newEvacuee to the array
    //         ];
    //       });
    //       formikRef.current.setFieldValue("evacuee", [
    //         ...formikRef.current.values.evacuee,
    //         newEvacuee,
    //       ]);
    //       setLoader(false);
    //     } else {
    //       setLoader(false);
    //     }
    //   });
    // }
    };

    const checkCardType = async() => {
      let isMyNumber = localStorage.getItem("myNumber")=="true";
      let isDrivingLicense = localStorage.getItem("driverLicense")=="true";
      // checkDeviceConnection()
      isMyNumber && ivuResult("MYNUMBER");
      isDrivingLicense && ivuResult("DRVLIC");
    }

  const handleRecordingStateChange = (isRecord) => {
    setMIsRecording(isRecord);
    setIsRecording(isRecord);
  };
  function convertData(inputData) {
    const outputData = {
      place_id: inputData.evacuationPlace,
      join_date: getGeneralDateTimeSecondSlashDisplayFormat(new Date()),
      zip_code: inputData.postalCode
        ? inputData.postalCode?.replace(/-/g, "")
        : null,
      prefecture_id: inputData.prefecture_id?.toString(),
      address: inputData.address,
      address_default: "",//inputData.address2,
      tel: inputData.tel ? convertToSingleByte(inputData.tel) : null,
      password: inputData.password.toString(),
      is_owner:
        inputData.evacuee.find((evacuee) => evacuee.checked)?.id || null,
      is_public: inputData.agreeCheckOne ? 0 : 1,
      public_info: inputData.agreeCheckTwo ? 0 : 1,
      register_from: 1,
      is_registered: 0,
      person: inputData.evacuee.map((evacuee, index) => {
        let data = evacuee.dob;
        const convertedDate = new Date(data.year, data.month - 1, data.date);
        return {
          id: evacuee.id,
          refugee_name: evacuee.name_furigana,
          name: evacuee.name,
          dob: getEnglishDateSlashDisplayFormat(convertedDate),
          zip_code: evacuee.postalCode
            ? evacuee.postalCode?.replace(/-/g, "")
            : null,
          prefecture_id: evacuee.prefecture_id?.toString(),
          address: evacuee.address,
          address_default: "",//evacuee.address2,
          age: evacuee.age,
          month: evacuee.age_m && parseInt(evacuee.age_m),
          tel: evacuee.tel ? convertToSingleByte(evacuee.tel) : null,
          gender: evacuee.gender,
          special_cares: evacuee.specialCareType || [],
          specialCareName: evacuee.specialCareType
            ? getSpecialCareJPNames(evacuee.specialCareType)
            : "",
          specialCareName2: evacuee.specialCareType
            ? getSpecialCareENNames(evacuee.specialCareType)
            : "",
          connecting_code: evacuee.connecting_code,
          note: evacuee.remarks,
          question: evacuee.individualQuestions?.map((question) => {
            return {
              question_id: question.id.toString(),
              question_type: question.type.toString(),
              question_isRequired: question.isRequired,
              answer: question.answer,
              answer_en: question.answer_en
                ? question.answer_en.length > 0
                  ? question.answer_en
                  : question.answer
                : question.answer,
              title: question.title,
              title_en: question.title_en,
            };
          }),
        };
      }),
      master_question: inputData.questions.map((question) => {
        return {
          question_id: question.id.toString(),
          question_type: question.type.toString(),
          question_isRequired: question.isRequired,
          answer: question.answer,
          answer_en: question.answer_en
            ? question.answer_en.length > 0
              ? question.answer_en
              : question.answer
            : question.answer,
          title: question.title,
          title_en: question.title_en,
        };
      }),
    };
    return outputData;
  }

  function calculateAge(birthDate) {
    const today = new Date();
    const dob = new Date(birthDate);

    let age = {
      years: today.getFullYear() - dob.getFullYear(),
      months: today.getMonth() - dob.getMonth(),
    };

    // Adjust the age if the birth month has not occurred yet
    if (
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    ) {
      age.years--;
      age.months = 12 - dob.getMonth() + today.getMonth();
    }

    // Adjust months to be positive
    if (age.months < 0) {
      age.months += 12;
    }

    return age;
  }

  function createEvacuee(evacuees) {
    const id = evacuee && evacuee.length > 0 ? evacuee.length + 1 : 1;
    const checked = evacuee && evacuee.length > 0 ? false : true;
    const birthDate = new Date(evacuees.dob);
    const convertedObject = {
      year: birthDate.getFullYear(),
      month: (birthDate.getMonth() + 1).toString().padStart(2, "0"), // Adding 1 because months are zero-based
      date: birthDate.getDate().toString().padStart(2, "0"),
    };
    let age = calculateAge(birthDate);
    const boundObject = {
      id: id,
      checked: checked,
      name: evacuees ? evacuees.name || "" : "",
      name_furigana: evacuees
        ? evacuees.refugeeName || evacuees.refugee_name || ""
        : "",
      dob: evacuees ? evacuees.dob != "1900/01/01" ? convertedObject || "" : "" : "",
      age: evacuees ? evacuees.dob != "1900/01/01" ? age.years || "" : "" : "",
      age_m:
        evacuees && evacuees.dob != "1900/01/01" ? age.months !== undefined ? age.months : "" : "",
      gender: evacuees ? parseInt(evacuees.gender) || null : null,
      postalCode: evacuees ? evacuees.postal_code || "" : "",
      tel: evacuees ? evacuees.tel || "" : "",
      prefecture_id: evacuees ? evacuees.prefecture_id || "" : "",
      address: evacuees ? evacuees.address?extractAddress(evacuees.address):"" || "" : "",
      // address2: evacuees ? evacuees.address2 || "" : "",
      specialCareType: null,
      connecting_code: evacuees ? evacuees.connecting_code || "" : "",
      remarks: "",
      individualQuestions: null,
      telAsRep: false,
      addressAsRep: false,
    };
    if (evacuees.postal_code) {
      const re = /^[0-9-]+$/;
      let val;
      if (evacuees.postal_code === "" || re.test(evacuees.postal_code)) {
        val = evacuees.postal_code.replace(/-/g, ""); // Remove any existing hyphens
        if (val.length > 3 && val.length <= 7) {
          val = val.slice(0, 3) + val.slice(3);
          boundObject.postalCode = val;
        }
      }
      if (val.length >= 7) {
        let payload = val;
        // getAddressFromZipCode(payload, (response) => {
        //   if (response) {
        //     let address = response;
        //     const selectedPrefecture = prefectures.find(
        //       (prefecture) => prefecture.value == address.prefcode
        //     );
        //     boundObject.prefecture_id = selectedPrefecture?.value;
        //     boundObject.address = address.address2 + address.address3 || "";
        //   }
        // });
      }
    }

    return boundObject;
  }

  const displayToastMessages = (errorArray) => {
    errorArray.forEach((errorObject) => {
      if (errorObject) {
        Object.values(errorObject).forEach((message) => {
          toastDisplay(message, "", "", "error");
        });
      }
    });
  };

  const getPrefectureName = (id) => {
    if (id) {
      let p_name = prefectures.find((item) => item.value === id);
      return p_name?.name;
    }
    return "";
  };
  useEffect(()=>{

    if(!visible)
    {
      showOverFlow();
    }

  },[visible])

  useEffect(()=>{
    fetchIvuData();
},[])

async function fetchIvuData() {
  try {
      let res = await fetch("http://127.0.0.1:50080/ivuapi/INITIALIZE_STATUS", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({}) // Include any necessary payload
      });

      let data = await res.json(); // Assuming the response is in JSON format
      if(data.result=="OK")
      {
        setIsIvuDeviceConnected(true)
      }
  } catch (error) {
      setIsIvuDeviceConnected(false)
      console.error("Error fetching data:", error);
  }
}

  return (
    <>
    <CommonDialog
                            open={confirm}
                            dialogClassName="w-35rem overflow-auto"
                            dialogBodyClassName="p-3 text-left "
                            header={translate(localeJson, 'guide')}
                            content={
                               <div className="text-center">
                                    <p className=""> {translate(localeJson, 'plusTek_scan_msg')}</p>
                                    <p><img src={ScannerImage.url} width={400} height={400} /></p>
                                    <div className="mt-4 flex items-center justify-center">
                  <NormalCheckBox
                    checkBoxProps={{
                      id: "skipStep",
                      value: translate(localeJson, 'skip_this_step_message'),
                      onChange: (e) => setSkipStep(e.checked),
                      checked: skipStep,
                      labelClass: "ml-2"
                    }}
                  />
                </div>
                                </div>
                             }
                            position={"center"}
                            footerParentClassName={"text-center pt-5"}
                            footerButtonsArray={[
                                {
                                    buttonProps: {
                                        buttonClass: "mt-2 w-full",
                                        type: "submit",
                                        text: translate(localeJson, "scan"),
                                        onClick: () => {
                                          setConfirm(false);
                                          handleScan()
                                        },
                                    },
                                    parentClass: "block"
                                }
                            ]}
                            close={() => {
                              setConfirm(false);
                            }}
                        />
        <CommonDialog
      open={showAnimation}
      dialogBodyClassName="p-3 text-center"
      header={translate(localeJson, 'guide')}
      position="center"
      footerParentClassName="text-center pt-5"
      content={
        <div className="text-left">
          <p className="">{translate(localeJson, 'guide_message')}</p>
          <p>{translate(localeJson, 'title')}</p>
          <p>{translate(localeJson, 'title_policy')}</p>
        </div>
      }
      footerButtonsArray={[]}
      close={() =>{ setShowAnimation(false);
        setModalMessageFlag(false);
      }}
    />
    <IvuConfirmDialog 
           visible={ivuVisible}
           setVisible={setIvuVisible}
           onCardSelected={(type) => {
              checkCardType();
            // 👉 Do whatever you want here — call API, update state, etc.
          }}
          ></IvuConfirmDialog>
      <QrConfirmDialog
        visible={visible}
        setVisible={setVisible}
        setOpenQrPopup={setOpenQrPopup}
        setQrScanPopupModalOpen={setQrScanPopupModalOpen}
      ></QrConfirmDialog>
      <YaburuModal
        open={QrScanPopupModalOpen}
        close={closeQrScanPopup}
        callBack={qrResult}
      ></YaburuModal>
      <QrScannerModal
        open={openQrPopup}
        close={closeQrPopup}
        callback={qrResult}
        setOpenQrPopup={setOpenQrPopup}
      ></QrScannerModal>
      <BarcodeDialog
        header={translate(localeJson, "barcode_dialog_heading")}
        visible={openBarcodeDialog}
        setVisible={setOpenBarcodeDialog}
      ></BarcodeDialog>
      <EvacueeTempRegModal
        open={specialCareEditOpen}
        header={
          registerModalAction == "create"
            ? `${evacuee.length ? evacuee.length + 1 : "1"}${translate(
              localeJson,
              "per_info"
            )} ${evacuee.length == 0
              ? "（" + translate(localeJson, "c_representative") + "）"
              : ""
            }`
            : `${editObj.id} ${translate(localeJson, "per_info")} ${editObj.checked
              ? "（" + translate(localeJson, "c_representative") + "）"
              : ""
            }`
        }
        close={() => {
          setSpecialCareEditOpen(false);
          showOverFlow();
        }}
        editObj={editObj}
        buttonText={translate(
          localeJson,
          registerModalAction == "create" ? "submit" : "update"
        )}
        setEvacueeValues={setEvacueeValues}
        evacuee={evacuee}
        setModalCountFlag={setModalCountFlag}
        registerModalAction={registerModalAction}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        isFrom={"temp"}
      />
      {/* Perspective cropping */}
      <PerspectiveCropping
        visible={perspectiveCroppingVisible}
        hide={() => {
          setPerspectiveCroppingVisible(false);
          showOverFlow();
        }}
        callback={ocrResult}
      />
      <PerspectiveImageCropping
        visible={perspectiveImageCroppingVisible}
        base64Image={scanResult}
        hide={() => setPerspectiveImageCroppingVisible(false)}
        callback={ocrResult}
      />
      <Formik
        innerRef={formikRef}
        validationSchema={validationSchema(localeJson)}
        initialValues={initialValues}
        enableReinitialize={true}
        onSubmit={(values) => {
          if (!hasErrors) {
            values.questions = questions;
            console.log(values)
            dispatch(setOriginalData(values));
            dispatch(setPlaceId(values?.evacuationPlace))
            let payload = convertData(values);
            dispatch(setRegisterData(payload));
            router.push("/user/temp-register/confirm");
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
        }) => {
          return (
            <div className="grid justify-content-center">
              <div className="col-12  sm:col-12 md:col-10 lg:col-10  mdScreenMaxWidth xlScreenMaxWidth mt-3">
                <div className="card">
                  {isStep1 ? (
                    <>
                      <CustomHeader
                        headerClass={"page-header1"}
                        customParentClassName={"mb-0"}
                        header={translate(localeJson, "house_hold_information")}
                      />

                      <div className="">
                        <div
                          className="w-full mt-2 gap-3 column-gap-4 row-gap-6 border-round-3xl footerButtonText"
                          style={{ justifyContent: "start" }}
                        >
                          <div className="flex items-center">
                            <ButtonRounded
                              buttonProps={{
                                type: "button",
                                rounded: "true",
                                custom: "",
                                buttonClass:
                                  "back-button h-4rem border-radius-5rem w-full custom-icon-button flex justify-content-center",
                                text: translate(localeJson, "c_card_reg"),
                                icon: (
                                  <img src={Card.url} width={30} height={30} />
                                ),
                                onClick: () => {
                                  if(selectedScanner)
                                    // {
                                    //   handleScan()
                                    // }
                                    {
                                      if(skipStep)
                                      {
                                        handleScan()
                                      }
                                      else {
                                      setConfirm(true)
                                      }
                                    }
                                    else {
                                    setPerspectiveCroppingVisible(true);
                                    hideOverFlow();
                                    }
                                },
                              }}
                              parentClass={
                                " back-button  w-full flex justify-content-center p-2 pr-0 mb-2"
                              }
                            />
                            <div>
                              <Tooltip target=".custom-target-icon" position="bottom" content={translate(localeJson, "ocr_tooltip")} className="shadow-none" />
                              <i className="custom-target-icon pi pi-info-circle"></i>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <ButtonRounded
                              buttonProps={{
                                type: "button",
                                rounded: "true",
                                custom: "",
                                buttonClass:
                                  "back-button h-4rem border-radius-5rem  w-full flex justify-content-center",
                                text: translate(localeJson, "c_qr_reg"),
                                icon: (
                                  <img
                                    src={Qr.url}
                                    width={40}
                                    height={40}
                                    color="blue"
                                  />
                                ),
                                onClick: () => {
                                  let isCamera = localStorage.getItem("isCamera") == "true";
                                  let isScanner = localStorage.getItem("isScanner") == "true";
                                  isCamera && setOpenQrPopup(true);
                                  isScanner && setQrScanPopupModalOpen(true);
                                  !isCamera && !isScanner && setVisible(true)
                                  hideOverFlow();
                                },
                              }}
                              parentClass={"back-button w-full p-2 mb-2"}
                            />
                            <div>
                              <Tooltip
                                target=".custom-target-icon-2"
                                position="bottom"
                                className="shadow-none"
                              >
                                <>
                                  <div>{translate(localeJson, "qr_scan_message")}</div>
                                  <div>{translate(localeJson, "qr_scan_message2")}</div>
                                </></Tooltip>
                              <i className="custom-target-icon-2 pi pi-info-circle"></i>
                            </div>
                          </div>
                          { ((window.location.origin === "https://hinanjo.nichi.in" || window.location.origin === "http://localhost:3000"|| window.location.origin === "https://rakuraku.nichi.in" )) && 
                          (
                      <div className="flex items-center">
                        <ButtonRounded
                          buttonProps={{
                            type: "button",
                            rounded: "true",
                            custom: "",
                            buttonClass:
                              "back-button h-4rem border-radius-5rem w-full custom-icon-button flex justify-content-center",
                            text: translate(localeJson, "c_card_reg_ivu"),
                            icon: <img src={Card.url} width={30} height={30} />,
                            onClick: () => {
                              isIvuDeviceConnected?setIvuVisible(true):
                              toast.error(locale=="en"?'Please check if the identity verification device is connected.':' 本人確認装置が接続されているかご確認ください。', {
                                position: "top-right",
                              });
                             
                            },
                          }}
                          parentClass={
                            " back-button  w-full flex justify-content-center p-2 pr-0 mb-2"
                          }
                        />
                        <div>
                          <Tooltip
                            target=".custom-target-icon-3"
                            position="bottom"
                            content={translate(localeJson, "c_card_reg_ivu_msg")}
                            className="shadow-none"
                          />
                          <i className="custom-target-icon-3 pi pi-info-circle"></i>
                        </div>
                      </div>)}
                        </div>
                        <div className="mt-3">
                          <div className="grid">
                            <div className="mb-2 col-12 xl:col-12">
                              <div className="w-12">
                                {/* Featured
                                 <Input
                                  inputProps={{
                                    inputParentClassName: `custom_input w-full ${errors.name_kanji &&
                                      touched.name_kanji &&
                                      "p-invalid"
                                      }`,
                                    labelProps: {
                                      text: translate(localeJson, "rep_kanji"),
                                      spanText: "",
                                      inputLabelClassName: "block font-bold",
                                      inputLabelSpanClassName: "p-error",
                                      labelMainClassName: "pb-1",
                                    },
                                    inputClassName: "w-full",
                                    value: values.name_kanji,
                                    placeholder: translate(
                                      localeJson,
                                      "rep_kanji"
                                    ),
                                    onChange: handleChange,
                                    onBlur: handleBlur,
                                    id: "name_kanji",
                                    name: "name_kanji",
                                    disabled: true,
                                    inputRightIconProps: {
                                      display: true,
                                      audio: {
                                        display: false,
                                      },
                                      icon: "",
                                      isRecording,
                                      onRecordValueChange: (rec) => {
                                        const fromData = new FormData();
                                        fromData.append("audio_sample", rec);
                                        getText(fromData, (res) => {
                                          if (res?.data?.content) {
                                            setFieldValue(
                                              "name_kanji",
                                              res?.data?.content
                                            );
                                          }
                                        });
                                      },
                                      onRecordingStateChange:
                                        handleRecordingStateChange,
                                    },
                                  }}
                                />
                                <ValidationError
                                  errorBlock={
                                    errors.name_kanji &&
                                    touched.name_kanji &&
                                    errors.name_kanji
                                  }
                                /> */}
                                <div className="pb-1">
                                  <label className="custom-label">
                                    {translate(localeJson, "rep_kanji")}
                                  </label>
                                </div>
                                <div className="body_table">{values?.name_kanji ? values.name_kanji : "-"}</div>
                              </div>
                            </div>
                            <div className="mb-2  col-12 xl:col-12">
                              <div className="w-12">
                                {/*Featured
                                 <Input
                                  inputProps={{
                                    inputParentClassName: `custom_input w-full ${errors.name_furigana &&
                                      touched.name_furigana &&
                                      "p-invalid"
                                      }`,
                                    labelProps: {
                                      text: translate(
                                        localeJson,
                                        "rep_furigana"
                                      ),
                                      spanText: "",
                                      inputLabelClassName: "block font-bold",
                                      inputLabelSpanClassName: "p-error",
                                      labelMainClassName: "pb-1",
                                    },
                                    inputClassName: "w-full",
                                    value: values.name_furigana,
                                    disabled: true,
                                    placeholder: translate(
                                      localeJson,
                                      "rep_furigana"
                                    ),
                                    onChange: handleChange,
                                    onBlur: handleBlur,
                                    id: "name_furigana",
                                    name: "name_furigana",
                                    inputRightIconProps: {
                                      display: true,
                                      audio: {
                                        display: false,
                                      },
                                      icon: "",
                                      isRecording,
                                      onRecordValueChange: (rec) => {
                                        const fromData = new FormData();
                                        fromData.append("audio_sample", rec);
                                        getText(fromData, (res) => {
                                          if (res?.data?.content) {
                                            setFieldValue(
                                              "name_furigana",
                                              res?.data?.content
                                            );
                                          }
                                        });
                                      },
                                      onRecordingStateChange:
                                        handleRecordingStateChange,
                                    },
                                  }}
                                />
                                <ValidationError
                                  errorBlock={
                                    errors.name_furigana &&
                                    touched.name_furigana &&
                                    errors.name_furigana
                                  }
                                /> */}
                                <div className="pb-1">
                                  <label className="custom-label">
                                    {translate(localeJson, "rep_furigana")}
                                  </label>
                                </div>
                                <div className="body_table">{values?.name_furigana ? values.name_furigana : "-"}</div>
                              </div>
                            </div>
                            <div className="mb-2  col-12 xl:col-12">
                              <div className="w-12">
                                {/* Featured 
                                <Input
                                  inputProps={{
                                    inputParentClassName: `custom_input w-full ${errors.tel && touched.tel && "p-invalid"
                                      }`,
                                    labelProps: {
                                      text: translate(
                                        localeJson,
                                        "phone_number"
                                      ),
                                      spanText: "",
                                      inputLabelClassName: "block font-bold",
                                      inputLabelSpanClassName: "p-error",
                                      labelMainClassName: "pb-1",
                                    },
                                    inputClassName: "w-full",
                                    value: values.tel,
                                    id: "tel",
                                    name: "tel",
                                    inputMode: "numeric",
                                    autoFocus: false,
                                    disabled: true,
                                    placeholder: translate(
                                      localeJson,
                                      "phone_number"
                                    ),
                                    onChange: (evt) => {
                                      const re = /^[0-9-]+$/;
                                      let val;
                                      if (
                                        evt.target.value === "" ||
                                        re.test(
                                          convertToSingleByte(evt.target.value)
                                        )
                                      ) {
                                        val = evt.target.value.replace(
                                          /-/g,
                                          ""
                                        );
                                        setFieldValue("tel", val);
                                      }
                                    },
                                    onBlur: handleBlur,
                                    inputRightIconProps: {
                                      display: false,
                                      audio: {
                                        display: false,
                                      },
                                      icon: "",
                                      isRecording: isRecording,
                                      onRecordValueChange: (rec) => {
                                        const fromData = new FormData();
                                        fromData.append("audio_sample", rec);
                                        getText(fromData, (res) => {
                                          const re = /^[0-9-]+$/;
                                          let tel_no = res?.data?.content;
                                          if (re.test(tel_no)) {
                                            setFieldValue("tel", tel_no);
                                          }
                                        });
                                      },
                                      onRecordingStateChange:
                                        handleRecordingStateChange,
                                    },
                                  }}
                                />
                                <ValidationError
                                  errorBlock={
                                    errors.tel && touched.tel && errors.tel
                                  }
                                /> */}
                                <div className="pb-1">
                                  <label className="custom-label">
                                    {translate(localeJson, "phone_number")}
                                  </label>
                                </div>
                                <div className="body_table">{values?.tel ? values.tel : "-"}</div>
                              </div>
                            </div>

                            <div className="mb-2 xl:mb-0 col-12 xl:col-12">
                              <div className="outer-label pb-1 custom-label w-12">
                                <label>
                                  {translate(localeJson, "address")}
                                </label>
                                {/* <span className="p-error">*</span> */}
                              </div>
                              {/* Featured
                               <Input
                                inputProps={{
                                  inputParentClassName: `custom_input w-full  ${errors.postalCode &&
                                    touched.postalCode &&
                                    "p-invalid"
                                    }`,
                                  labelProps: {
                                    text: "",
                                    spanText: "",
                                    inputLabelClassName: "block font-bold",
                                    inputLabelSpanClassName: "p-error",
                                    labelMainClassName: "pb-1",
                                  },
                                  inputClassName: "w-full",
                                  placeholder: translate(
                                    localeJson,
                                    "post_letter"
                                  ),
                                  id: "postalCode",
                                  name: "postalCode",
                                  inputMode: "numeric",
                                  disabled: true,
                                  value: values.postalCode,
                                  onChange: (evt) => {
                                    const re = /^[0-9-]+$/;
                                    let val = evt.target.value.replace(/-/g, "");
                                    if (evt.target.value === "") {
                                      setFieldValue("postalCode", evt.target.value);
                                      return;
                                    }
                                    if (re.test(convertToSingleByte(val))) {
                                      if (val?.length <= 7) {
                                        val = evt.target.value.replace(/-/g, ""); // Remove any existing hyphens
                                        setFieldValue("postalCode", val);
                                      } else {
                                        setFieldValue("postalCode", val.slice(0, 7));
                                        return;
                                      }
                                    }
                                    if (val?.length == 7) {
                                      let payload = convertToSingleByte(val);
                                      getAddressFromZipCode(payload, (response) => {
                                        if (response) {
                                          let address = response;
                                          const selectedPrefecture =
                                            prefectures.find(
                                              (prefecture) =>
                                                prefecture.value == address.prefcode
                                            );
                                          setFieldValue(
                                            "prefecture_id",
                                            selectedPrefecture?.value
                                          );
                                          setFieldValue(
                                            "address",
                                            address.address2 + address.address3 ||
                                            ""
                                          );
                                        } else {
                                          setFieldValue("prefecture_id", "");
                                          setFieldValue("address", "");
                                        }
                                      })
                                    }
                                  },
                                  onBlur: handleBlur,
                                  inputRightIconProps: {
                                    display: true,
                                    audio: {
                                      display: false,
                                    },
                                    icon: "",
                                    isRecording,
                                    onRecordValueChange: (rec) => {
                                      const fromData = new FormData();
                                      fromData.append("audio_sample", rec);
                                      getText(fromData, (res) => {
                                        let postalCode = res?.data?.content;
                                        const re = /^[0-9-]+$/;
                                        if (postalCode && re.test(postalCode)) {
                                          let val = postalCode?.replace(
                                            /-/g,
                                            ""
                                          ); // Remove any existing hyphens
                                          // Insert hyphen after the first three characters
                                          if (
                                            val.length > 3 &&
                                            val.length <= 7
                                          ) {
                                            val =
                                              val.slice(0, 3) +
                                              "-" +
                                              val.slice(3);
                                            setFieldValue("postalCode", val);
                                          }
                                        }
                                      });
                                    },
                                    onRecordingStateChange:
                                      handleRecordingStateChange,
                                  },
                                }}
                              />
                              <ValidationError
                                errorBlock={
                                  errors.postalCode &&
                                  touched.postalCode &&
                                  errors.postalCode
                                }
                              /> */}
                              {/* Featured 
                              <InputDropdown
                                inputDropdownProps={{
                                  inputDropdownParentClassName: `custom_input mt-2  ${errors.prefecture_id &&
                                    touched.prefecture_id &&
                                    "p-invalid pb-0"
                                    }`,
                                  labelProps: {
                                    inputDropdownLabelClassName:
                                      "block font-bold",
                                    spanText: "",
                                    inputDropdownLabelSpanClassName: "p-error",
                                    labelMainClassName: "pb-1",
                                  },
                                  inputDropdownClassName: "w-full",
                                  name: "prefecture_id",
                                  value: values.prefecture_id,
                                  disabled: true,
                                  placeholder: translate(
                                    localeJson,
                                    "prefecture_places"
                                  ),
                                  options:
                                    locale == "ja"
                                      ? prefectures
                                      : prefectures_en,
                                  optionLabel: "name",
                                  onChange: handleChange,
                                  onBlur: handleBlur,
                                  emptyMessage: translate(
                                    localeJson,
                                    "data_not_found"
                                  ),
                                }}
                              />
                              <ValidationError
                                errorBlock={
                                  errors.prefecture_id &&
                                  touched.prefecture_id &&
                                  errors.prefecture_id
                                }
                              /> */}
                              {/* Featured
                               <Input
                                inputProps={{
                                  inputParentClassName: `custom_input w-full mt-2 ${errors.address &&
                                    touched.address &&
                                    "p-invalid"
                                    }`,
                                  labelProps: {
                                    spanText: "",
                                    inputLabelClassName: "block font-bold",
                                    inputLabelSpanClassName: "p-error",
                                    labelMainClassName: "pb-1",
                                  },
                                  inputClassName: "w-full",
                                  id: "address",
                                  name: "address",
                                  value: values.address,
                                  placeholder: translate(
                                    localeJson,
                                    "city_ward"
                                  ),
                                  onChange: handleChange,
                                  onBlur: handleBlur,
                                  disabled: true,
                                  inputRightIconProps: {
                                    display: true,
                                    audio: {
                                      display: false,
                                    },
                                    icon: "",
                                    isRecording,
                                    // audioCustomClass: "mt-2 mb-2",
                                    onRecordValueChange: (rec) => {
                                      const fromData = new FormData();
                                      fromData.append("audio_sample", rec);
                                      getText(fromData, (res) => {
                                        if (res?.data?.content) {
                                          setFieldValue(
                                            "address",
                                            res?.data?.content
                                          );
                                        }
                                      });
                                    },
                                    onRecordingStateChange:
                                      handleRecordingStateChange,
                                  },
                                }}
                              />
                              <ValidationError
                                errorBlock={
                                  errors.address &&
                                  touched.address &&
                                  errors.address
                                }
                              /> */}
                              <div className="body_table">{values?.postalCode ? values.postalCode : "-"}</div>
                              <div className="body_table">
                                {
                                  locale === "ja"
                                    ? prefectures.find(pref => pref.value == values?.prefecture_id)?.name || ""
                                    : prefectures_en.find(pref => pref.value == values?.prefecture_id)?.name || ""
                                }
                                {values?.address ? values.address : ""}
                              </div>
                              {/* <Input
                                inputProps={{
                                  inputParentClassName: `custom_input w-full mt-2 ${errors.address2 &&
                                    touched.address2 &&
                                    "p-invalid"
                                    }`,
                                  labelProps: {
                                    spanText: "",
                                    inputLabelClassName: "block font-bold",
                                    inputLabelSpanClassName: "p-error",
                                    labelMainClassName: "pb-1",
                                  },
                                  inputClassName: "w-full",
                                  id: "address2",
                                  name: "address2",
                                  value: values.address2,
                                  disabled: true,
                                  placeholder: translate(
                                    localeJson,
                                    "house_name_number"
                                  ),
                                  onChange: handleChange,
                                  onBlur: handleBlur,
                                  inputRightIconProps: {
                                    display: true,
                                    audio: {
                                      display: false,
                                    },
                                    icon: "",
                                    isRecording,
                                    onRecordValueChange: (rec) => {
                                      const fromData = new FormData();
                                      fromData.append("audio_sample", rec);
                                      getText(fromData, (res) => {
                                        if (res?.data?.content) {
                                          setFieldValue(
                                            "address2",
                                            res?.data?.content
                                          );
                                        }
                                      });
                                    },
                                    onRecordingStateChange:
                                      handleRecordingStateChange,
                                  },
                                }}
                              />
                              <ValidationError
                                errorBlock={
                                  errors.address2 &&
                                  touched.address2 &&
                                  errors.address2
                                }
                              /> */}
                            </div>
                            <div className="col-12 xl:col-12 hidden">
                              <div className="w-12">
                                <Input
                                  inputProps={{
                                    inputParentClassName: `w-full custom_input ${errors.password &&
                                      touched.password &&
                                      "p-invalid"
                                      }`,
                                    labelProps: {
                                      text: translate(
                                        localeJson,
                                        "shelter_password"
                                      ),
                                      inputLabelClassName: "block font-bold",
                                      spanText: "*",
                                      inputLabelSpanClassName: "p-error",
                                      labelMainClassName: "pb-1 pt-1",
                                    },
                                    inputClassName: "w-full",
                                    id: "password",
                                    name: "random-password",
                                    value: values.password,
                                    autoFocus: false,
                                    autoComplete: "new-password",
                                    inputMode: "numeric",
                                    disabled: isRecording ? true : false,
                                    type: inputType,
                                    onChange: (evt) => {
                                      const re = /^[0-9-]+$/;
                                      let val;
                                      if (
                                        evt.target.value === "" ||
                                        re.test(
                                          convertToSingleByte(evt.target.value)
                                        )
                                      ) {
                                        val = evt.target.value.replace(
                                          /-/g,
                                          ""
                                        );
                                        if (evt.target.value?.length <= 4) {
                                          setFieldValue(
                                            "password",
                                            evt.target.value
                                          );
                                        }
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
                                        className:
                                          inputType == "text"
                                            ? "pi pi-eye-slash"
                                            : "pi pi-eye",
                                        onClick: () => {
                                          setInputType(
                                            inputType == "text"
                                              ? "password"
                                              : "text"
                                          );
                                        },
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
                                <ValidationError
                                  errorBlock={
                                    errors.password &&
                                    touched.password &&
                                    errors.password
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="household-register">
                          <div className="mb-3">
                            <CustomHeader
                              headerClass={"page-header1"}
                              header={translate(localeJson, "evacuee")}
                            />
                          </div>
                          <div className="flex">
                            <div className="w-full">
                              {evacuee?.map((person, index) => (
                                <div key={person.id} className="">
                                  <div className="">
                                    <div
                                      className={`flex flex-column bg-gray-300 border-round-2xl p-3 pl-3 pt-2 ${evacuee?.length - 1 != index
                                        ? "mb-3"
                                        : ""
                                        }   justify-content-center`}
                                    >
                                      <div className="">
                                        <div className="">
                                          <div className=" flex_row_space_between flex justify-content-between">
                                            <label className="page-header1 flex">
                                              {person.id}
                                              {translate(
                                                localeJson,
                                                "per_information"
                                              )}
                                              {person.checked
                                                ? "（" +
                                                translate(
                                                  localeJson,
                                                  "c_representative"
                                                ) +
                                                "）"
                                                : ""}
                                            </label>
                                            <span className="page-header1">
                                              {!person.checked && (
                                                <div className="ml-2">
                                                  <NormalCheckBox
                                                    checkBoxProps={{
                                                      checked: person.checked,
                                                      disabled: person.checked,
                                                      value: translate(
                                                        localeJson,
                                                        "update_rep"
                                                      ),
                                                      labelClass: `pl-2 ${locale == "en"
                                                        ? "pt-1"
                                                        : ""
                                                        }`,
                                                      onChange: (e) => {
                                                        handleRadioChange(
                                                          e,
                                                          person
                                                        );
                                                      },
                                                    }}
                                                    parentClass={
                                                      "flex approve-check align-items-center"
                                                    }
                                                  />
                                                </div>
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                        <div className=" mt-3">
                                          <div className=" flex_row_space_between">
                                            <label className="header_table">
                                              {translate(
                                                localeJson,
                                                "name_kanji"
                                              )}
                                            </label>
                                          </div>
                                          <div className="body_table">
                                            {person.name}
                                          </div>
                                        </div>
                                        <div className=" mt-3">
                                          <div className=" flex_row_space_between">
                                            <label className="header_table">
                                              {translate(
                                                localeJson,
                                                "c_refugee_name"
                                              )}
                                            </label>
                                          </div>
                                          <div className="body_table">
                                            {person.name_furigana}
                                          </div>
                                        </div>
                                        <div className=" mt-3">
                                          <div className=" flex_row_space_between">
                                            <label className="header_table">
                                              {translate(localeJson, "c_dob")}
                                            </label>
                                          </div>
                                          {!_.isEmpty(person.dob) ? (
                                            locale == "ja"
                                              ? getJapaneseDateDisplayYYYYMMDDFormat(
                                                `${person.dob.year}-${person.dob.month}-${person.dob.date}`
                                              )
                                              : getEnglishDateDisplayFormat(
                                                `${person.dob.year}-${person.dob.month}-${person.dob.date}`
                                              )
                                          ) : "-"}
                                          {/* <div className="body_table">{person.dob}</div> */}
                                        </div>
                                        <div className=" mt-3">
                                          <div className=" flex_row_space_between">
                                            <label className="header_table">
                                              {translate(
                                                localeJson,
                                                "phone_number"
                                              )}
                                            </label>
                                          </div>
                                          <div
                                            className=" mt-1 body_table"
                                            id="phone-number"
                                          >
                                            {person.tel || "-"}
                                          </div>
                                        </div>
                                        <div className=" mt-3">
                                          <div className=" flex_row_space_between">
                                            <label className="header_table">
                                              {translate(localeJson, "c_age")}
                                            </label>
                                          </div>
                                          <div className="body_table">
                                            {person.age}
                                          </div>
                                        </div>
                                        <div className=" mt-3">
                                          <div className=" flex_row_space_between">
                                            <label className="header_table">
                                              {translate(localeJson, "age_m")}
                                            </label>
                                          </div>
                                          <div className="body_table">
                                            {person.age_m}
                                          </div>
                                        </div>

                                        <div className=" mt-3">
                                          <div className=" flex_row_space_between">
                                            <label className="header_table">
                                              {translate(
                                                localeJson,
                                                "c_gender"
                                              )}
                                            </label>
                                          </div>
                                          <div className="body_table">
                                            {getGenderValue(person.gender)}
                                          </div>
                                        </div>
                                      </div>
                                      {expandedFamilies?.includes(
                                        person.id
                                      ) && (
                                          <>
                                            <div className=" mt-3">
                                              <div className=" flex_row_space_between">
                                                <label className="header_table">
                                                  {translate(
                                                    localeJson,
                                                    "c_address"
                                                  )}
                                                </label>
                                              </div>
                                              <div className="body_table">
                                                {person.postalCode
                                                  ? translate(
                                                    localeJson,
                                                    "post_letter"
                                                  ) + person.postalCode
                                                  : ""}
                                              </div>
                                              <div className="body_table">
                                                {getPrefectureName(
                                                  parseInt(person?.prefecture_id)
                                                )}
                                                {person.address}
                                                {/* {person.address2 || ""} */}
                                              </div>
                                            </div>
                                            <div className=" mt-3">
                                              <div className=" flex_row_space_between">
                                                <label className="header_table">
                                                  {translate(
                                                    localeJson,
                                                    "c_special_care_type"
                                                  )}
                                                </label>
                                              </div>
                                              <div className="body_table">
                                                {locale == "ja"
                                                  ? getSpecialCareName(
                                                    getSpecialCareJPNames(
                                                      person.specialCareType
                                                    )
                                                  )
                                                  : getSpecialCareName(
                                                    getSpecialCareENNames(
                                                      person.specialCareType
                                                    )
                                                  )}
                                              </div>
                                            </div>
                                            <div className=" mt-3 hidden">
                                              <div className=" flex_row_space_between">
                                                <label className="header_table">
                                                  {translate(
                                                    localeJson,
                                                    "c_connecting_code"
                                                  )}
                                                </label>
                                              </div>
                                              <div className="body_table">
                                                {person.connecting_code || "-"}
                                              </div>
                                            </div>

                                            <div className=" mt-3">
                                              <div className=" flex_row_space_between">
                                                <label className="header_table">
                                                  {translate(
                                                    localeJson,
                                                    "c_remarks"
                                                  )}
                                                </label>
                                              </div>
                                              <div className="body_table">
                                                {person.remarks || "-"}
                                              </div>
                                            </div>

                                            {person.individualQuestions?.map(
                                              (question) => (
                                                <div key={question?.id}>
                                                  <div className=" mt-3">
                                                    <div className=" flex_row_space_between">
                                                      <label className="header_table">
                                                        {locale == "ja"
                                                          ? question.title
                                                          : question.title_en}
                                                      </label>
                                                    </div>
                                                    <div className="body_table">
                                                      {" "}
                                                      {getAnswerData(
                                                        locale == "ja"
                                                          ? question.answer
                                                          : question.answer_en
                                                            ?.length > 0
                                                            ? question.answer_en
                                                            : question.answer
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </>
                                        )}
                                      <>
                                        <div className=" flex justify-content-center align-items-center text-custom-color font-bold">
                                          <div
                                            onClick={() =>
                                              toggleExpansion(person.id)
                                            }
                                            className="cursor-pointer flex align-items-center"
                                          >
                                            <i
                                              className={`pi mr-2 font-bold ${expandedFamilies.includes(
                                                person.id
                                              )
                                                ? "pi-chevron-up"
                                                : "pi-chevron-down"
                                                }`}
                                            ></i>
                                            {expandedFamilies.includes(
                                              person.id
                                            )
                                              ? translate(
                                                localeJson,
                                                "see_details"
                                              )
                                              : translate(
                                                localeJson,
                                                "see_details"
                                              )}
                                          </div>
                                        </div>
                                        <div className="block">
                                          <ButtonRounded
                                            buttonProps={{
                                              type: "button",
                                              text: translate(
                                                localeJson,
                                                "edit"
                                              ),
                                              buttonClass:
                                                "back-button w-full flex justify-content-center",
                                              icon: (
                                                <img
                                                  src={Edit.url}
                                                  width={20}
                                                  height={20}
                                                />
                                              ),
                                              onClick: () => {
                                                setRegisterModalAction("edit");
                                                setSpecialCareEditOpen(true);
                                                hideOverFlow();
                                                let currentData = {
                                                  id: person.id,
                                                  checked: person.checked,
                                                  name: person.name,
                                                  name_furigana:
                                                    person.name_furigana,
                                                  dob: person.dob,
                                                  age: person.age,
                                                  age_m: person.age_m,
                                                  gender: person.gender,
                                                  postalCode: person.postalCode
                                                    ? person.postalCode?.replace(
                                                      /-/g,
                                                      ""
                                                    )
                                                    : "",
                                                  prefecture_id:
                                                    person.prefecture_id,
                                                  address: person.address,
                                                  // address2: person.address2,
                                                  email: person.email,
                                                  tel: person.tel,
                                                  evacuee: person.evacuee,
                                                  password: person.password,
                                                  specialCareType:
                                                    person.specialCareType,
                                                  connecting_code:
                                                    person.connecting_code,
                                                  remarks: person.remarks,
                                                  individualQuestions:
                                                    person.individualQuestions,
                                                  family_register_from:
                                                    person.family_register_from,
                                                  telAsRep: person.telAsRep,
                                                  addressAsRep:
                                                    person.addressAsRep,
                                                };
                                                setEditObj(currentData);
                                              },
                                            }}
                                            parentClass={" w-full back-button"}
                                          />
                                          <ButtonRounded
                                            buttonProps={{
                                              type: "button",
                                              text: translate(
                                                localeJson,
                                                "remove"
                                              ),
                                              buttonClass:
                                                "mt-2 w-full delete-button-user flex justify-content-center align-items-center",
                                              disabled: evacuee.length <= 1,
                                              icon: (
                                                <img
                                                  src={Delete.url}
                                                  width={20}
                                                  height={20}
                                                />
                                              ),
                                              onClick: () => {
                                                let rowData = person;
                                                if (rowData.checked === true) {
                                                  const message = translate(
                                                    localeJson,
                                                    "rep_del_error"
                                                  );
                                                  const isConfirmed =
                                                    window.confirm(message);

                                                  if (isConfirmed) {
                                                    setEvacuee(
                                                      (prevEvacuee) => {
                                                        let updated =
                                                          prevEvacuee.filter(
                                                            (evacuee) =>
                                                              evacuee.id !==
                                                              rowData.id
                                                          );

                                                        // Update the IDs of the remaining items
                                                        updated = updated.map(
                                                          (evacuee, index) => ({
                                                            ...evacuee,
                                                            id: index + 1,
                                                          })
                                                        );

                                                        if (
                                                          updated.length > 0
                                                        ) {
                                                          updated[0].checked = true;
                                                        }

                                                        formikRef.current?.setFieldValue(
                                                          "evacuee",
                                                          updated
                                                        );
                                                        return updated;
                                                      }
                                                    );
                                                  }
                                                } else {
                                                  setEvacuee((prevEvacuee) => {
                                                    let updated =
                                                      prevEvacuee.filter(
                                                        (evacuee) =>
                                                          evacuee.id !==
                                                          rowData.id
                                                      );

                                                    // Update the IDs of the remaining items
                                                    updated = updated.map(
                                                      (evacuee, index) => ({
                                                        ...evacuee,
                                                        id: index + 1,
                                                      })
                                                    );

                                                    formikRef.current?.setFieldValue(
                                                      "evacuee",
                                                      updated
                                                    );
                                                    return updated;
                                                  });
                                                }
                                              },
                                            }}
                                            parentClass={
                                              " w-full delete-button-user"
                                            }
                                          />
                                        </div>
                                      </>
                                      {/* Add other details as needed */}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div
                            className="flex"
                            style={{
                              justifyContent: "flex-start",
                              flexWrap: "wrap",
                            }}
                          >
                            <div className="col-12 pl-0 pr-0">
                              <ButtonRounded
                                buttonProps={{
                                  type: "button",
                                  rounded: "true",
                                  icon: "pi pi-plus",
                                  custom: "",
                                  buttonClass:
                                    "back-button w-full flex justify-content-center align-items-center",
                                  text: translate(localeJson, "c_add_evacuee"),
                                  onClick: () => {
                                    setEvacueeCounter(evacueeCount + 1);
                                    setRegisterModalAction("create");
                                    handleRecordingStateChange(false);
                                    setSpecialCareEditOpen(true);
                                    hideOverFlow();
                                  },
                                }}
                                parentClass={
                                  "border-round-3xl w-full flex justify-content-start lg:mb-0 back-button"
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div className="household-register mb-3">
                          <div className="mb-3">
                            <CustomHeader
                              headerClass={"page-header1"}
                              header={translate(
                                localeJson,
                                "evacuee_damage_info"
                              )}
                            />
                          </div>
                          <div className="question">
                            <QuestionList
                              questions={questions}
                              isModal={false}
                              isRecording={isRecording}
                              setIsRecording={setIsRecording}
                              setQuestions={setQuestions}
                              isFormSubmitted={isFormSubmitted}
                              setHasErrors={setHasErrors}
                              count={count}
                              isEdit={true}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid block mt-5">
                        <div className="col-12 text-center">
                          <Button
                            buttonProps={{
                              type: "button",
                              text: translate(localeJson, "next"),
                              buttonClass:
                                "multi-form-submit w-12 sm:w-12 md:w-8 lg:w-8",
                              rounded: true,
                              onClick: () => {
                                setIsFormSubmitted(true);
                                if (
                                  !Array.isArray(errors.evacuee) &&
                                  errors.evacuee
                                ) {
                                  let message = translate(
                                    localeJson,
                                    "evacuee_family_required"
                                  );
                                  toastDisplay(message, "", "", "error");
                                }
                                console.log(errors);
                                if (Array.isArray(errors.evacuee)) {
                                  const indexOfObject =
                                    errors.evacuee.findIndex(
                                      (item) =>
                                        item !== null &&
                                        typeof item === "object"
                                    );
                                  let rowData = values.evacuee[indexOfObject];
                                  setRegisterModalAction("edit");
                                  setSpecialCareEditOpen(true);
                                  hideOverFlow();
                                  let currentData = {
                                    id: rowData.id,
                                    checked: rowData.checked,
                                    name: rowData.name,
                                    name_furigana: rowData.name_furigana,
                                    dob: rowData.dob,
                                    age: rowData.age,
                                    age_m: rowData.age_m,
                                    gender: rowData.gender,
                                    postalCode: rowData.postalCode,
                                    prefecture_id: rowData.prefecture_id,
                                    address: rowData.address,
                                    // address2: rowData.address2,
                                    email: rowData.email,
                                    evacuee: rowData.evacuee,
                                    tel: rowData.tel,
                                    password: rowData.password,
                                    specialCareType: rowData.specialCareType,
                                    connecting_code: rowData.connecting_code,
                                    remarks: rowData.remarks,
                                    individualQuestions:
                                      rowData.individualQuestions,
                                    telAsRep: rowData.telAsRep,
                                    addressAsRep: rowData.addressAsRep,
                                  };
                                  setEditObj(currentData);
                                }

                                if (!hasErrors) {
                                  setIsStep1(false);
                                }
                                else {
                                  setCounter(count + 1);
                                }
                              },
                            }}
                            parentClass={"inline"}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <div className='col-12 pb-3 second-step'>
                        <CustomHeader headerClass={"page-header1"} header={translate(localeJson, 'evacuation_place')} />
                      </div>
                      <div className="col-12 pb-3 pt-0">
                        <InputDropdown
                          inputDropdownProps={{
                            name: "evacuationPlace",
                            placeholder: translate(localeJson, "please_select"),
                            inputDropdownParentClassName: `w-12 ${errors.evacuationPlace &&
                              touched.evacuationPlace &&
                              "p-invalid"
                              }`,
                            labelProps: {
                              text: "",
                              inputDropdownLabelClassName: "font-bold pt-0",
                            },
                            options: activeEvacuationOptions,
                            optionLabel: locale == "ja" ? "name" : "name_en",
                            disabled: activeEvacuationOptions.length == 0,
                            inputDropdownClassName: "w-12",
                            value: values.evacuationPlace,
                            onChange: handleChange,
                          }}
                        />
                        <ValidationError
                          errorBlock={
                            errors.evacuationPlace &&
                            touched.evacuationPlace &&
                            errors.evacuationPlace
                          }
                        />
                        <NormalLabel
                          text={translate(localeJson, "place_note_one")}
                          labelClass="block text-red-600 pt-2 pb-1"
                        />
                        <NormalLabel
                          text={translate(localeJson, "place_note_two")}
                          labelClass="block text-red-600 pb-3"
                        />
                      </div>
                      <div className='pb-3'>
                        <CustomHeader headerClass={"page-header1"} header={translate(localeJson, 'individual_agree_note')} />
                      </div>
                      <div className="w-full flex checkbox-space">
                        <NormalCheckBox
                          checkBoxProps={{
                            checked: values.agreeCheckOne,
                            linkLabel: agreeTextWithHTML,
                            labelClass: `pl-2 ${locale == "en" ? "pt-1" : ""} ${errors.agreeCheckOne && touched.agreeCheckOne
                              ? "p-error scroll-check"
                              : ""
                              }`,
                            onChange: (e) =>
                              setFieldValue("agreeCheckOne", e.checked),
                          }}
                          parentClass={"flex approve-check"}
                        />
                        <span className="" style={{ color: '#e24c4c', fontWeight: 'bold' }}>*</span>
                      </div>
                      <div className="w-full checkbox-space">
                        <NormalCheckBox
                          checkBoxProps={{
                            checked: values.agreeCheckTwo,
                            value: translate(localeJson, "agree_note_two"),
                            labelClass: `pl-2 ${locale == "en" ? "pt-1" : ""}`,
                            onChange: (e) =>
                              setFieldValue("agreeCheckTwo", e.checked),
                          }}
                          parentClass={"flex approve-check"}
                        />
                        <div style={{ marginTop: "24px" }}>{discloseInfo}</div>
                      </div>
                      <div className="grid col-12 mt-5">
                        <div className="pt-3 col-12 text-center">
                          <Button
                            buttonProps={{
                              type: "submit",
                              text: translate(
                                localeJson,
                                "go_to_confirmation_screen"
                              ),
                              disabled: !values.agreeCheckOne,
                              buttonClass:
                                "multi-form-submit w-12 sm:w-12 md:w-8 lg:w-8",
                              rounded: true,
                              onClick: () => {
                                setCounter(count + 1);
                                setIsFormSubmitted(true);
                                if (
                                  errors.agreeCheckOne &&
                                  !values.agreeCheckOne
                                ) {
                                  let message = translate(
                                    localeJson,
                                    "person_info_valiadation"
                                  );
                                  toastDisplay(message, "", "", "error");
                                }
                                if (
                                  !Array.isArray(errors.evacuee) &&
                                  errors.evacuee
                                ) {
                                  let message = translate(
                                    localeJson,
                                    "evacuee_family_required"
                                  );
                                  toastDisplay(message, "", "", "error");
                                }

                                console.log(errors);
                                if (Array.isArray(errors.evacuee)) {
                                  const indexOfObject =
                                    errors.evacuee.findIndex(
                                      (item) =>
                                        item !== null &&
                                        typeof item === "object"
                                    );
                                  let rowData = values.evacuee[indexOfObject];
                                  setRegisterModalAction("edit");
                                  setSpecialCareEditOpen(true);
                                  hideOverFlow();
                                  let currentData = {
                                    id: rowData.id,
                                    checked: rowData.checked,
                                    name: rowData.name,
                                    name_furigana: rowData.name_furigana,
                                    dob: rowData.dob,
                                    age: rowData.age,
                                    age_m: rowData.age_m,
                                    gender: rowData.gender,
                                    postalCode: rowData.postalCode,
                                    prefecture_id: rowData.prefecture_id,
                                    address: rowData.address,
                                    // address2: rowData.address2,
                                    email: rowData.email,
                                    evacuee: rowData.evacuee,
                                    tel: rowData.tel,
                                    password: rowData.password,
                                    specialCareType: rowData.specialCareType,
                                    connecting_code: rowData.connecting_code,
                                    remarks: rowData.remarks,
                                    individualQuestions:
                                      rowData.individualQuestions,
                                    telAsRep: rowData.telAsRep,
                                    addressAsRep: rowData.addressAsRep,
                                  };
                                  setEditObj(currentData);
                                }

                                handleSubmit();
                              },
                            }}
                            parentClass={"inline"}
                          />
                        </div>
                        <div className="pt-3 col-12 text-center">
                          <Button
                            buttonProps={{
                              type: "button",
                              text: translate(localeJson, "back"),
                              buttonClass:
                                "multi-form-submit return w-12 sm:w-12 md:w-8 lg:w-8",
                              rounded: true,
                              onClick: () => goToPreviousStep(),
                            }}
                            parentClass={"inline"}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }}
      </Formik>
    </>
  );
}
