import React, { useContext, useEffect, useState, useRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { SelectButton } from "primereact/selectbutton";

import { LayoutContext } from "@/layout/context/layoutcontext";
import {
    getValueByKeyRecursively as translate,
    convertToSingleByte,
    showOverFlow,
    hideOverFlow,
    getEnglishDateDisplayFormat,
    extractAddress,
    geocodeAddressAndExtractData
} from "@/helper";
import {
    Button,
    ValidationError,
    Input,
    InputDropdown,
    InputNumber,
    CustomHeader,
    ButtonRounded,
    PerspectiveCropping,
    QrScannerModal,
} from "@/components";
import { prefectures, prefectures_en } from "@/utils/constant";
import { CommonServices, TempRegisterServices, UserEventListServices } from "@/services";
import { useAppDispatch } from "@/redux/hooks";
import { setCheckInData } from "@/redux/check_in";
import { Tooltip } from "primereact/tooltip";

export default function UserEventRegModal(props) {
    const { localeJson, locale, setLoader } = useContext(LayoutContext);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const layoutReducer = useSelector((state) => state.layoutReducer);
    const { editObj, registerModalAction, evacuee } = props && props;

    // eslint-disable-next-line no-irregular-whitespace
    const katakanaRegex = /^[\u30A1-\u30F6ー　\u0020]*$/;
    const genderOptions = [
        { name: translate(localeJson, "c_male"), value: 1 },
        { name: translate(localeJson, "c_female"), value: 2 },
        { name: translate(localeJson, "c_not_answer"), value: 3 },
    ];
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [count, setCounter] = useState(1);
    const [hasErrors, setHasErrors] = useState(false);
    const [isMRecording, setMIsRecording] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [dobCounter, setDobCounter] = useState(0);
    const [addressCount, setAddressCount] = useState(0);
    const [inputType, setInputType] = useState("password");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetchZipCode, setFetchedZipCode] = useState("");
    const [openQrPopup, setOpenQrPopup] = useState(false);
    const [perspectiveCroppingVisible, setPerspectiveCroppingVisible] = useState(false);
    const [invalidCounter, setInvalidCounter] = useState(100000000)
    const [postalCodePrefectureId, setPostalCodePrefectureId] = useState(null);
    const [prefCount, setPrefCount] = useState(1)
    const Qr = {
        url: "/layout/images/evacuee-qr.png",
    };
    const Card = {
        url: "/layout/images/evacuee-card.png",
    };

    const validationSchema = () =>
        Yup.object().shape({
            checked: Yup.boolean().nullable(),
            name_furigana: Yup.string()
                .max(100, translate(localeJson, "name_max")),
            name: Yup.string()
                .required(translate(localeJson, "name_required_changed"))
                .max(100, translate(localeJson, "name_max")),
            dob: Yup.object().shape({
                year: Yup.string()
                    .required(
                        translate(localeJson, "c_year") +
                        translate(localeJson, "is_required")
                    )
                    .min(
                        4,
                        translate(localeJson, "c_year") +
                        translate(localeJson, "is_required")
                    ),
                month: Yup.string().required(
                    translate(localeJson, "c_month") +
                    translate(localeJson, "is_required")
                ),
                date: Yup.string().required(
                    translate(localeJson, "c_date") + translate(localeJson, "is_required")
                ),
            }),
            password: Yup.string()
                .required(translate(localeJson, "family_password_required"))
                .test(
                    "is-four-digits",
                    translate(localeJson, "family_password_min_max"),
                    (value) => {
                        return String(value).length === 4;
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
            gender: Yup.string().required(translate(localeJson, "gender_required")),
            postalCode: Yup.string().nullable().required(translate(localeJson, "postal_code_required"))
                .test("testPostalCode", translate(localeJson, "zip_code_mis_match"), 
                (value, context) => {
                const { prefecture_id } = context.parent;
                if (postalCodePrefectureId != null && prefecture_id != null) {
                  return postalCodePrefectureId == prefecture_id
                }
                else return true
              
            })
                // .test(
                //     "is-correct",
                //     translate(localeJson, "zip_code_mis_match"),
                //     (value) => {
                //         if (value != undefined)
                //             return (
                //                 convertToSingleByte(value) == convertToSingleByte(fetchZipCode)
                //             );
                //         else return true;
                //     }
                // )
                .min(7, translate(localeJson, "postal_code_length"))
                .max(7, translate(localeJson, "postal_code_length")),
            address: Yup.string()
                .required(translate(localeJson, "c_address_is_required"))
                .max(190, translate(localeJson, "address_max_length")),
            // address2: Yup.string()
            //     .nullable()
            //     .max(190, translate(localeJson, "address_max_length")),
            prefecture_id: Yup.string()
                .nullable()
                .required(translate(localeJson, "c_perfacture_is_required")),
        });

    /** Services */
    const { getText, getAddressFromZipCode, getZipCodeFromAddress, convertToKatakana } = CommonServices;
    const {
        qrScanRegistration,
        ocrScanRegistration,
    } = TempRegisterServices;

    useEffect(() => {
        setMIsRecording(isRecording);
    }, [isRecording]);

    useEffect(() => {
        let dob = formikRef?.current?.values?.dob;
        if (dob.year && dob.month && dob.date) {
            const convertedDate = new Date(
                convertToSingleByte(dob.year),
                convertToSingleByte(dob.month) - 1,
                convertToSingleByte(dob.date)
            );
            let age = calculateAge(convertedDate);
            let currentYear = new Date().getFullYear();
            let minYear = 1900;
            if (minYear <= parseInt(convertToSingleByte(dob.year))) {
                formikRef.current.setFieldValue("age", age.years);
                formikRef.current.setFieldValue("age_m", age.months);
            }
        }
    }, [dobCounter]);

    useEffect(() => {
        if( formikRef.current.values.postalCode != "" && formikRef.current.values.postalCode != null)
          {
        formikRef.current.setFieldValue(
          "postalCode",
          formikRef.current.values.postalCode,
          true
        );
        formikRef.current.setFieldTouched("postalCode", true);
        formikRef.current.validateField("postalCode");
      }
      }, [prefCount])

    useEffect(() => {
        let address = formikRef.current.values.address;
        let stateId = formikRef.current.values.prefecture_id;
        let postalCode = formikRef.current.values.postalCode;
        let state = prefectures.find(x => x.value == stateId)?.name;

        let firstConditionCompleted = "false";

        // First condition - Handling by address and state
        if (address && state) {
            getZipCodeFromAddress((state + address), (res) => {
                if (res) {
                    let zipCode = res.data.zipcode;
                    setFetchedZipCode(zipCode.replace(/-/g, ""));
                    zipCode && formikRef.current.setFieldValue("postalCode", zipCode.replace(/-/g, ""));
                    formikRef.current.validateField("postalCode");
                    firstConditionCompleted = "true";
                } else {
                    setFetchedZipCode(invalidCounter + 1);
                    formikRef.current.validateField("postalCode");
                    firstConditionCompleted = "false";
                }
            });
        }

        // Check to not execute if first condition completed its work
        else if (postalCode) {
            getAddressFromZipCode(postalCode, (res) => {
                let _address = res;
                if (stateId != _address.prefcode || address != (_address.address2 + _address?.address3)) {
                    setFetchedZipCode("");
                    formikRef.current.validateField("postalCode");
                } else {
                    formikRef.current.validateField("address", _address.address2 + _address.address3);
                    formikRef.current.validateField("prefecture_id", _address.prefcode);
                    setFetchedZipCode(postalCode);
                    formikRef.current.validateField("postalCode", postalCode);
                }
            });
        }
    }, [addressCount]);

    const handleRecordingStateChange = (isRecord) => {
        setMIsRecording(isRecord);
        setIsRecording(isRecord);
    };

    const formikRef = useRef();
    const initialValues =
        registerModalAction == "edit"
            ? editObj
            : {
                id: evacuee && evacuee.length > 0 ? evacuee.length + 1 : 1,
                checked: evacuee && evacuee.length > 0 ? false : true,
                name: "",
                name_furigana: "",
                dob: {
                    year: "",
                    month: "",
                    date: "",
                },
                age: "",
                age_m: "",
                gender: null,
                postalCode: "",
                prefecture_id: null,
                address: "",
                // address2: "",
                email: "",
                tel: "",
                specialCareType: null,
                connecting_code: "",
                remarks: "",
                individualQuestions: null,
                telAsRep: false,
                addressAsRep: false,
                password: "1234"
            };

    function calculateAge(birthdate) {
        const birthdateObj = new Date(birthdate);
        const currentDate = new Date();
        let years = currentDate.getFullYear() - birthdateObj.getFullYear();
        let months = currentDate.getMonth() - birthdateObj.getMonth();
        if (currentDate.getDate() < birthdateObj.getDate()) {
            // Adjust for cases where the birthdate has not occurred yet in the current month
            months--;
        }
        if (months < 0) {
            // Adjust for cases where the birthdate month is ahead of the current month
            years--;
            months += 12;
        }
        return { years, months };
    }

    const mapObjects = (object1) => {
        const object2 = {
            event_id: layoutReducer?.user?.place?.id, // Fill this value accordingly
            zip_code: object1.postalCode
                ? convertToSingleByte(object1.postalCode)
                : "",
            prefecture_id: object1.prefecture_id
                ? convertToSingleByte(object1.prefecture_id)
                : "",
            address: object1.address,
            address_default: null, // Fill this value accordingly
            tel: object1.tel ? convertToSingleByte(object1.tel) : "",
            refugee_name: object1.name_furigana,
            name: object1.name, // Fill this value accordingly
            dob: `${object1.dob.year}/${parseInt(object1.dob.month) < 10
                ? "0" + object1.dob.month
                : object1.dob.month
                }/${object1.dob.date < 10 ? "0" + object1.dob.date : object1.dob.date}`,
            age: object1.age,
            month: object1.age_m,
            gender: object1.gender,
            password: object1.password
        };
        return object2;
    };

    const closeQrPopup = () => {
        setOpenQrPopup(false);
        showOverFlow();
    };

    const register = async(data) => {
         if (!data.prefecture_id || !data.postal_code) {
              let address = extractAddress(data.fullAddress) || extractAddress(data.address);
        
              try {
                const { prefecture, postalCode, prefecture_id } = await geocodeAddressAndExtractData(address, localeJson, locale, setLoader);
        
                data['postal_code'] = postalCode;
                data['prefecture_id'] = prefecture_id;
              } catch (error) {
                console.error("Error processing address:", error);
              }
            }
        formikRef.current.setFieldValue("postalCode", data.postal_code);
        formikRef.current.setFieldValue("prefecture_id", data.prefecture_id);
        formikRef.current.setFieldValue("address", data.address);
        setPostalCodePrefectureId( data.prefecture_id)
        // formikRef.current.setFieldValue("address2", data.address2 || "");
        data.tel != "" && formikRef.current.setFieldValue("tel", data.tel);
        formikRef.current.setFieldValue("name_furigana", data.name_furigana);
        formikRef.current.setFieldValue("name", data.name || "");
        formikRef.current.setFieldValue("gender", data.gender);
        if (data.dob) {
            let age = calculateAge(data.dob);
            const dobc = getEnglishDateDisplayFormat(data.dob)
            const dobParts = dobc.split('-');
            const year = parseInt(dobParts[0]);
            const month = parseInt(dobParts[1]);
            const date = parseInt(dobParts[2]);
            formikRef.current.setFieldValue("dob", { year, month, date });
            formikRef.current.setFieldValue('age', age.years);
            formikRef.current.setFieldValue('age_m', age.months);
        }
    }
    const qrResult = (result) => {
        setLoader(true)
        let formData = new FormData()
        formData.append('content', result)
        setOpenQrPopup(false)
        showOverFlow();
        qrScanRegistration(formData, (res) => {
            if (res) {
                const data = res.data;
                register(data);
                setLoader(false)
            }
            else {
                setLoader(false)
            }
        });
        setOpenQrPopup(false)
        showOverFlow();
    };

    const ocrResult = (result) => {
        setLoader(true)
        let formData = new FormData();
        formData.append("content", result);
        setPerspectiveCroppingVisible(false);
        showOverFlow();
        ocrScanRegistration(formData, (res) => {
            if (res) {
                const data = res.data;
                register(data);
                setLoader(false)
            }
            else {
                setLoader(false)
            }
        });
    }

    return (
        <>
            <QrScannerModal
                open={openQrPopup}
                close={closeQrPopup}
                callback={qrResult}
                setOpenQrPopup={setOpenQrPopup}
            ></QrScannerModal>
            {/* Perspective cropping */}
            <PerspectiveCropping
                visible={perspectiveCroppingVisible}
                hide={() => {
                    setPerspectiveCroppingVisible(false)
                    showOverFlow();
                }
                }
                callback={ocrResult}
            />
            <Formik
                innerRef={formikRef}
                validationSchema={validationSchema}
                initialValues={initialValues}
                enableReinitialize
                onSubmit={(values, actions) => {
                    if (!isSubmitting && !hasErrors) {
                        setIsRecording(false);
                        setLoader(true);
                        setIsSubmitting(true);
                        console.log(values)
                        UserEventListServices.createUserEvent(mapObjects(values), (res) => {
                            setFetchedZipCode("");
                            setPostalCodePrefectureId("")
                            actions.resetForm({ values: initialValues });
                            setLoader(false);
                            setIsSubmitting(false);
                            if (res) {
                                dispatch(setCheckInData(res?.result));
                                router.push("/user/event/register/member/success");
                            }
                        });
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
                    resetForm,
                    setFieldValue,
                    setErrors,
                }) => (
                    <div className="grid justify-content-center" id="permanentRegister">
                        <div class="col-12  sm:col-12 md:col-10 lg:col-10  mdScreenMaxWidth xlScreenMaxWidth mt-3">
                            <form onSubmit={handleSubmit}>
                                <div className={`card`}>
                                    {/* <CustomHeader
                                        headerClass={"page-header1"}
                                        header={translate(localeJson, "per_info")}
                                    /> */}
                                    <div className="">
                                        <div className="">
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
                                                                icon: <img src={Card.url} width={30} height={30} />,
                                                                onClick: () => {
                                                                    setPerspectiveCroppingVisible(true);
                                                                    hideOverFlow();
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
                                                    <ButtonRounded
                                                        buttonProps={{
                                                            type: "button",
                                                            rounded: "true",
                                                            custom: "",
                                                            buttonClass:
                                                                "back-button h-4rem border-radius-5rem  w-full flex justify-content-center",
                                                            text: translate(localeJson, "c_qr_reg"),
                                                            icon: <img src={Qr.url} width={30} height={30} color="green" />,
                                                            onClick: () => {
                                                                setOpenQrPopup(true);
                                                                hideOverFlow();
                                                            },
                                                        }}
                                                        parentClass={"back-button w-full p-2 mb-2"}
                                                    />
                                                </div>
                                                <div className="mb-2 col-12 mt-2">
                                                    <Input
                                                        inputProps={{
                                                            inputParentClassName: `w-full custom_input ${errors.name && touched.name && "p-invalid"
                                                                }`,
                                                            labelProps: {
                                                                text: translate(localeJson, "c_name_kanji"),
                                                                inputLabelClassName: "block font-bold",
                                                                labelMainClassName: "pb-1",
                                                                spanText: "*",
                                                                inputLabelSpanClassName: "p-error",
                                                            },
                                                            inputClassName: "w-full",
                                                            id: "name",
                                                            name: "name",
                                                            value: values.name,
                                                            placeholder: translate(
                                                                localeJson,
                                                                "placeholder_name"
                                                            ),
                                                            onChange: handleChange,
                                                            onBlur: handleBlur,
                                                            disabled:
                                                                values?.family_register_from == "0" || isMRecording
                                                                    ? true
                                                                    : false,
                                                            inputRightIconProps: {
                                                                display: true,
                                                                audio: {
                                                                    display: true,
                                                                },
                                                                icon: "",
                                                                isRecording: isMRecording,
                                                                onRecordValueChange: (rec) => {
                                                                    const fromData = new FormData();
                                                                    fromData.append("audio_sample", rec);
                                                                    getText(fromData, (res) => {
                                                                        if (res?.data?.content) {
                                                                            setFieldValue("name", res?.data?.content);
                                                                        }
                                                                    });
                                                                },
                                                                onRecordingStateChange: handleRecordingStateChange,
                                                            },
                                                        }}
                                                    />
                                                    <ValidationError
                                                        errorBlock={errors.name && touched.name && errors.name}
                                                    />
                                                </div>
                                                <div className="mb-2 col-12">
                                                    <div className="w-12">
                                                        <Input
                                                            inputProps={{
                                                                inputParentClassName: `w-full custom_input ${errors.name_furigana &&
                                                                    touched.name_furigana &&
                                                                    "p-invalid"
                                                                    }`,
                                                                labelProps: {
                                                                    text: translate(localeJson, "c_refugee_name"),
                                                                    inputLabelClassName: "block font-bold",
                                                                    inputLabelSpanClassName: "p-error",
                                                                    labelMainClassName: "pb-1",
                                                                },
                                                                inputClassName: "w-full",
                                                                id: "name_furigana",
                                                                name: "name_furigana",
                                                                value: values.name_furigana,
                                                                disabled:
                                                                    values?.family_register_from == "0" ||
                                                                        isMRecording
                                                                        ? true
                                                                        : false,
                                                                placeholder: translate(
                                                                    localeJson,
                                                                    "placeholder_furigana"
                                                                ),
                                                                onChange: handleChange,
                                                                onBlur: handleBlur,
                                                                inputRightIconProps: {
                                                                    display: true,
                                                                    audio: {
                                                                        display: true,
                                                                    },
                                                                    icon: "",
                                                                    isRecording: isMRecording,
                                                                    onRecordValueChange: (rec) => {
                                                                        const fromData = new FormData();
                                                                        fromData.append("audio_sample", rec);
                                                                        getText(fromData, (res) => {
                                                                            if (res?.data?.content) {
                                                                                convertToKatakana(res?.data?.content, (res) => {
                                                                                    if (res) {
                                                                                        setFieldValue(
                                                                                            "name_furigana",
                                                                                            res.converted.replace(/ /g, "")
                                                                                        );
                                                                                    }
                                                                                    else {
                                                                                        setFieldValue(
                                                                                            "name_furigana",
                                                                                            res?.data?.content.replace(/ /g, "")
                                                                                        );
                                                                                    }
                                                                                })
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
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mb-2  col-12 ">
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
                                                                disabled:
                                                                    values?.family_register_from == "0" ||
                                                                        isMRecording ||
                                                                        values.telAsRep
                                                                        ? true
                                                                        : false,
                                                                placeholder: translate(localeJson, "without_hypen"),
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
                                                                inputRightIconProps: {
                                                                    display: true,
                                                                    audio: {
                                                                        display: true,
                                                                    },
                                                                    icon: "",
                                                                    isRecording: isMRecording,
                                                                    onRecordValueChange: (rec) => {
                                                                        const fromData = new FormData();
                                                                        fromData.append("audio_sample", rec);
                                                                        getText(fromData, (res) => {
                                                                            const re = /^[0-9-]+$/;
                                                                            if (res?.data?.content) {
                                                                                if (re.test(res?.data?.content)) {
                                                                                    setFieldValue("tel", res?.data?.content);
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
                                                            errorBlock={errors.tel && touched.tel && errors.tel}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mb-2  col-12 ">
                                                    <div className="outer-label pb-1 w-12">
                                                        <label>{translate(localeJson, "c_address")}</label>
                                                        <span className="p-error">*</span>
                                                    </div>
                                                    <Input
                                                        inputProps={{
                                                            inputParentClassName: `w-full custom_input ${errors.postalCode &&
                                                                touched.postalCode &&
                                                                "p-invalid"
                                                                }`,
                                                            labelProps: {
                                                                text: "",
                                                                spanText: "*",
                                                                inputLabelClassName: "block font-bold",
                                                                inputLabelSpanClassName: "p-error",
                                                                labelMainClassName: "pb-1",
                                                            },
                                                            inputClassName: "w-full",
                                                            id: "postalCode",
                                                            name: "postalCode",
                                                            inputMode: "numeric",
                                                            type: "text",
                                                            value: values.postalCode,
                                                            disabled:
                                                                values?.family_register_from == "0" ||
                                                                    isMRecording ||
                                                                    values.addressAsRep
                                                                    ? true
                                                                    : false,
                                                            placeholder: translate(localeJson, "post_letter"),
                                                            onChange: (evt) => {
                                                                const re = /^[0-9-]+$/;
                                                                let val = evt.target.value.replace(/-/g, "");
                                                                if (evt.target.value === "") {
                                                                    setFieldValue("postalCode", evt.target.value);
                                                                    setFetchedZipCode("");
                                                                    return;
                                                                }
                                                                if (re.test(convertToSingleByte(val))) {
                                                                    if (val?.length <= 7) {
                                                                        val = evt.target.value.replace(/-/g, ""); // Remove any existing hyphens
                                                                        setFieldValue("postalCode", val);
                                                                        setFetchedZipCode(val.replace(/-/g, ""));

                                                                    } else {
                                                                        setFieldValue("postalCode", val.slice(0, 7));
                                                                        setFetchedZipCode(val.slice(0, 7));
                                                                        return;
                                                                    }
                                                                }
                                                                if (val?.length == 7) {
                                                                    let payload = convertToSingleByte(val);
                                                                    getAddressFromZipCode(payload, (response) => {
                                                                        if (response) {
                                                                            let address = response;
                                                                            const selectedPrefecture = prefectures.find(
                                                                                (prefecture) =>
                                                                                    prefecture.value == address.prefcode
                                                                            );
                                                                            setFieldValue(
                                                                                "prefecture_id",
                                                                                selectedPrefecture?.value
                                                                            );
                                                                            setPostalCodePrefectureId(selectedPrefecture?.value)
                                                                            setFieldValue(
                                                                                "address",
                                                                                address.address2||"" + address.address3 || ""
                                                                            );
                                                                        } else {
                                                                            setFieldValue("prefecture_id", "");
                                                                            setFieldValue("address", "");
                                                                            setPostalCodePrefectureId("")
                                                                            
                                                                        }
                                                                    });
                                                                }
                                                            },
                                                            onBlur: handleBlur,
                                                            inputRightIconProps: {
                                                                display: true,
                                                                audio: {
                                                                    display: true,
                                                                },
                                                                icon: "",
                                                                isRecording: isMRecording,
                                                                onRecordValueChange: (rec) => {
                                                                    const fromData = new FormData();
                                                                    fromData.append("audio_sample", rec);
                                                                    getText(fromData, (res) => {
                                                                        if (res?.data?.content) {
                                                                            const re = /^[0-9-]+$/;
                                                                            if (re.test(res?.data?.content)) {
                                                                                let val = res?.data?.content?.substring(0, 7)
                                                                                setFieldValue(
                                                                                    "postalCode",
                                                                                    val
                                                                                );
                                                                                if (val?.length == 7) {
                                                                                    let payload = convertToSingleByte(val);
                                                                                    getAddressFromZipCode(payload, (response) => {
                                                                                        if (response) {
                                                                                            let address = response;
                                                                                            const selectedPrefecture = prefectures.find(
                                                                                                (prefecture) =>
                                                                                                    prefecture.value == address.prefcode
                                                                                            );
                                                                                            setFieldValue(
                                                                                                "prefecture_id",
                                                                                                selectedPrefecture?.value
                                                                                            );
                                                                                            setPostalCodePrefectureId(selectedPrefecture?.value)
                                                                                            setFieldValue(
                                                                                                "address",
                                                                                                address.address2||"" + address.address3 || ""
                                                                                            );
                                                                                        } else {
                                                                                            setFieldValue("prefecture_id", "");
                                                                                            setFieldValue("address", "");
                                                                                            setPostalCodePrefectureId("")
                                                                                            
                                                                                        }
                                                                                    });
                                                                                }
                                                                            }
                                                                        }
                                                                    });
                                                                },
                                                                onRecordingStateChange: handleRecordingStateChange,
                                                            },
                                                        }}
                                                    />
                                                    <ValidationError
                                                        errorBlock={
                                                            errors.postalCode &&
                                                            touched.postalCode &&
                                                            errors.postalCode
                                                        }
                                                    />
                                                    <InputDropdown
                                                        inputDropdownProps={{
                                                            inputDropdownParentClassName: `custom_input mt-2 ${errors.prefecture_id &&
                                                                touched.prefecture_id &&
                                                                "p-invalid"
                                                                }`,
                                                            labelProps: {
                                                                inputDropdownLabelClassName: "block font-bold",
                                                                spanText: "*",
                                                                inputDropdownLabelSpanClassName: "p-error",
                                                                labelMainClassName: "pb-2",
                                                            },
                                                            inputDropdownClassName: "w-full w-full",
                                                            name: "prefecture_id",
                                                            value: values.prefecture_id,
                                                            disabled:
                                                                values?.family_register_from == "0" ||
                                                                    values.addressAsRep
                                                                    ? true
                                                                    : false,
                                                            placeholder: translate(
                                                                localeJson,
                                                                "prefecture_places"
                                                            ),
                                                            options:
                                                                locale == "ja" ? prefectures : prefectures_en,
                                                            optionLabel: "name",
                                                            onChange: (e) => {
                                                                setFieldValue("prefecture_id", e.target.value);
                                                                if (values.postalCode) {
                                                                    let payload = values.postalCode;
                                                                    getAddressFromZipCode(payload, (res) => {
                                                                        if (res && res.prefcode != e.target.value) {
                                                                            setPostalCodePrefectureId(res.prefcode);
                                                                            // setFieldValue("prefecture_id", res.prefcode);
                                                                        }
                                                                    });
                                                                }
                                                            },
                                                            emptyMessage: translate(localeJson, "data_not_found"),
                                                        }}
                                                    />
                                                    <ValidationError
                                                        errorBlock={
                                                            errors.prefecture_id &&
                                                            touched.prefecture_id &&
                                                            errors.prefecture_id
                                                        }
                                                    />
                                                    <Input
                                                        inputProps={{
                                                            inputParentClassName: `w-full custom_input mt-2 mb-2 ${errors.address && touched.address && "p-invalid"
                                                                }`,
                                                            labelProps: {
                                                                spanText: "*",
                                                                inputLabelClassName: "block font-bold",
                                                                inputLabelSpanClassName: "p-error",
                                                                labelMainClassName: "pb-2",
                                                            },
                                                            inputClassName: "w-full",
                                                            id: "address",
                                                            name: "address",
                                                            value: values.address,
                                                            disabled:
                                                                values?.family_register_from == "0" ||
                                                                    isMRecording ||
                                                                    values.addressAsRep
                                                                    ? true
                                                                    : false,
                                                            placeholder: translate(localeJson, "city_ward"),
                                                            onChange: (evt) => {
                                                                setFieldValue("address", evt.target.value);
                                                                // setAddressCount(addressCount + 1);
                                                            },
                                                            onBlur: handleBlur,
                                                            inputRightIconProps: {
                                                                display: true,
                                                                audio: {
                                                                    display: true,
                                                                },
                                                                icon: "",
                                                                isRecording: isMRecording,
                                                                onRecordValueChange: (rec) => {
                                                                    const fromData = new FormData();
                                                                    fromData.append("audio_sample", rec);
                                                                    getText(fromData, (res) => {
                                                                        if (res?.data?.content) {
                                                                            setFieldValue("address", res?.data?.content);
                                                                        }
                                                                    });
                                                                },
                                                                onRecordingStateChange: handleRecordingStateChange,
                                                            },
                                                        }}
                                                    />
                                                    <ValidationError
                                                        errorBlock={
                                                            errors.address && touched.address && errors.address
                                                        }
                                                    />
                                                  {/*  <Input
                                                        inputProps={{
                                                            inputParentClassName: `w-full custom_input ${errors.address2 && touched.address2 && "p-invalid"
                                                                }`,
                                                            labelProps: {
                                                                spanText: "*",
                                                                inputLabelClassName: "block font-bold",
                                                                inputLabelSpanClassName: "p-error",
                                                                labelMainClassName: "pb-2",
                                                            },
                                                            inputClassName: "w-full",
                                                            id: "address2",
                                                            name: "address2",
                                                            value: values.address2,
                                                            disabled:
                                                                values?.family_register_from == "0" ||
                                                                    isMRecording ||
                                                                    values.addressAsRep
                                                                    ? true
                                                                    : false,
                                                            placeholder: translate(
                                                                localeJson,
                                                                "house_name_number"
                                                            ),
                                                            onChange: (evt) => {
                                                                setFieldValue("address2", evt.target.value);
                                                                setAddressCount(addressCount + 1);
                                                            },
                                                            onBlur: handleBlur,
                                                            inputRightIconProps: {
                                                                display: true,
                                                                audio: {
                                                                    display: true,
                                                                },
                                                                icon: "",
                                                                isRecording: isMRecording,
                                                                onRecordValueChange: (rec) => {
                                                                    const fromData = new FormData();
                                                                    fromData.append("audio_sample", rec);
                                                                    getText(fromData, (res) => {
                                                                        if (res?.data?.content) {
                                                                            setFieldValue("address2", res?.data?.content);
                                                                        }
                                                                    });
                                                                },
                                                                onRecordingStateChange: handleRecordingStateChange,
                                                            },
                                                        }}
                                                    />
                                                     <ValidationError
                                                        errorBlock={
                                                            errors.address2 && touched.address2 && errors.address2
                                                        }/> */}
                                                </div>
                                                <div className="mb-2  col-12 hidden">
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
                                                                        re.test(convertToSingleByte(evt.target.value))
                                                                    ) {
                                                                        val = evt.target.value.replace(/-/g, "");
                                                                        if (evt.target.value?.length <= 4) {
                                                                            setFieldValue("password", evt.target.value);
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
                                                        <ValidationError
                                                            errorBlock={errors.password && touched.password && errors.password}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mb-2 col-12">
                                                    <div className="outer-label pb-1 w-12">
                                                        <label>{translate(localeJson, "c_dob")}</label>
                                                        <span className="p-error">*</span>
                                                    </div>
                                                    <div className="grid">
                                                        <div className="flex">
                                                            <div className="pl-0 col-4 sm:col-6 md:col-6 lg:col-6 xl:col-6  pb-0 pr-0 pl-1">
                                                                <div className="flex align-items-baseline">
                                                                    <Input
                                                                        inputProps={{
                                                                            inputParentClassName: `w-12 pr-1`,
                                                                            labelProps: {
                                                                                text: "",
                                                                                inputLabelClassName: "block font-bold",
                                                                                spanText: "*",
                                                                                inputLabelSpanClassName: "p-error",
                                                                                labelMainClassName: "pb-1 pt-1",
                                                                                parentStyle: { lineHeight: "18px" },
                                                                            },
                                                                            inputClassName: "w-full",
                                                                            id: "dob.year",
                                                                            name: "dob.year",
                                                                            inputMode: "numeric",
                                                                            value: values.dob.year,
                                                                            type: "text",
                                                                            disabled:
                                                                                values?.family_register_from == "0"
                                                                                    ? true
                                                                                    : false,
                                                                            onChange: (evt) => {
                                                                                setDobCounter(dobCounter + 1);
                                                                                const re = /^[0-9-]+$/;
                                                                                if (evt.target.value == "") {
                                                                                    setFieldValue(
                                                                                        "dob.year",
                                                                                        evt.target.value
                                                                                    );
                                                                                    setFieldValue("dob.month", "");
                                                                                    setFieldValue("dob.date", "");
                                                                                    setFieldValue("age", "");
                                                                                    setFieldValue("age_m", "");
                                                                                    return;
                                                                                }
                                                                                const enteredYear = parseInt(
                                                                                    convertToSingleByte(evt.target.value)
                                                                                );
                                                                                const currentYear =
                                                                                    new Date().getFullYear();
                                                                                if (
                                                                                    evt.target.value.length <= 3 &&
                                                                                    re.test(
                                                                                        convertToSingleByte(evt.target.value)
                                                                                    )
                                                                                ) {
                                                                                    setFieldValue(
                                                                                        "dob.year",
                                                                                        evt.target.value
                                                                                    );
                                                                                }
                                                                                let minYear = 1899;
                                                                                if (
                                                                                    evt.target.value?.length <= 4 &&
                                                                                    re.test(
                                                                                        convertToSingleByte(evt.target.value)
                                                                                    )
                                                                                ) {
                                                                                    if (
                                                                                        evt.target.value.length == 4 &&
                                                                                        enteredYear > minYear &&
                                                                                        enteredYear <= currentYear
                                                                                    ) {
                                                                                        setFieldValue(
                                                                                            "dob.year",
                                                                                            evt.target.value
                                                                                        );
                                                                                    }
                                                                                }
                                                                            },

                                                                            onBlur: handleBlur,
                                                                        }}
                                                                    />
                                                                    <div className="outer-label">
                                                                        <label className="">
                                                                            {translate(localeJson, "c_year")}
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <ValidationError
                                                                    errorBlock={
                                                                        errors.dob?.year &&
                                                                        touched.dob?.year &&
                                                                        errors.dob?.year
                                                                    }
                                                                    parentClass="pr-1"
                                                                />
                                                            </div>
                                                            <div className="pl-0 col-4 sm:col-3 md:col-3 lg:col-3 xl:col-3 pb-0 pr-0 pl-1">
                                                                <div className="flex align-items-baseline">
                                                                    <Input
                                                                        inputProps={{
                                                                            inputParentClassName: `w-12 pr-1`,
                                                                            labelProps: {
                                                                                text: "",
                                                                                inputLabelClassName: "block font-bold",
                                                                                spanText: "*",
                                                                                inputLabelSpanClassName: "p-error",
                                                                                labelMainClassName: "pb-1 pt-1",
                                                                                parentStyle: { lineHeight: "18px" },
                                                                            },
                                                                            inputClassName: "w-full",
                                                                            id: "dob.month",
                                                                            name: "dob.month",
                                                                            inputMode: "numeric",
                                                                            value: values.dob.month,
                                                                            disabled:
                                                                                values?.family_register_from == "0"
                                                                                    ? true
                                                                                    : false,
                                                                            onChange: (evt) => {
                                                                                const re = /^[0-9-]+$/;
                                                                                setDobCounter(dobCounter + 1);
                                                                                if (evt.target.value == "") {
                                                                                    setFieldValue(
                                                                                        "dob.month",
                                                                                        evt.target.value
                                                                                    );
                                                                                    setFieldValue("dob.date", "");
                                                                                    setFieldValue("age", "");
                                                                                    setFieldValue("age_m", "");
                                                                                    return;
                                                                                }
                                                                                let Month = convertToSingleByte(
                                                                                    evt.target.value
                                                                                );
                                                                                const enteredMonth = parseInt(Month);
                                                                                const currentMonth =
                                                                                    new Date().getMonth() + 1; // Month is zero-based, so add 1
                                                                                const currentYear =
                                                                                    new Date().getFullYear();
                                                                                if (
                                                                                    re.test(Month) &&
                                                                                    evt.target.value?.length <= 2 &&
                                                                                    enteredMonth > 0 &&
                                                                                    enteredMonth <= 12 &&
                                                                                    convertToSingleByte(values.dob.year)
                                                                                ) {
                                                                                    if (
                                                                                        enteredMonth > currentMonth &&
                                                                                        convertToSingleByte(values.dob.year) ==
                                                                                        currentYear
                                                                                    ) {
                                                                                        return;
                                                                                    }
                                                                                    setFieldValue(
                                                                                        "dob.month",
                                                                                        evt.target.value
                                                                                    );
                                                                                }
                                                                            },
                                                                            onBlur: handleBlur,
                                                                        }}
                                                                    />
                                                                    <div className="outer-label">
                                                                        <label className="font-bold">
                                                                            {translate(localeJson, "c_month")}
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <ValidationError
                                                                    errorBlock={
                                                                        errors.dob?.month &&
                                                                        touched.dob?.month &&
                                                                        errors.dob?.month
                                                                    }
                                                                    parentClass="pr-1"
                                                                />
                                                            </div>
                                                            <div className="pl-0 col-3 sm:col-3 md:col-3 lg:col-3 xl:col-3 pb-0 pr-0 pl-1">
                                                                <div className="flex align-items-baseline">
                                                                    <Input
                                                                        inputProps={{
                                                                            inputParentClassName: `w-12 pr-2`,
                                                                            labelProps: {
                                                                                text: "",
                                                                                inputLabelClassName: "block font-bold",
                                                                                spanText: "*",
                                                                                inputLabelSpanClassName: "p-error",
                                                                                labelMainClassName: "pb-1 pt-1",
                                                                                parentStyle: { lineHeight: "18px" },
                                                                            },
                                                                            inputClassName: "w-full",
                                                                            id: "dob.date",
                                                                            name: "dob.date",
                                                                            inputMode: "numeric",
                                                                            value: values.dob.date,
                                                                            disabled:
                                                                                values?.family_register_from == "0"
                                                                                    ? true
                                                                                    : false,
                                                                            onChange: (evt) => {
                                                                                setDobCounter(dobCounter + 1);
                                                                                const { value, name } = evt.target;
                                                                                const month = convertToSingleByte(
                                                                                    values.dob.month
                                                                                );
                                                                                const year = convertToSingleByte(
                                                                                    values.dob.year
                                                                                );
                                                                                const re = /^[0-9-]+$/;
                                                                                let maxDays = 31; // Default to 31 days
                                                                                if (value == "") {
                                                                                    setFieldValue("dob.date", "");
                                                                                    return;
                                                                                }
                                                                                const currentYear =
                                                                                    new Date().getFullYear();
                                                                                const currentMonth =
                                                                                    new Date().getMonth() + 1;
                                                                                const currentDay = new Date().getDate();
                                                                                const enteredDay = parseInt(
                                                                                    convertToSingleByte(evt.target.value)
                                                                                );
                                                                                if (
                                                                                    name === "dob.date" &&
                                                                                    value?.length <= 2 &&
                                                                                    parseInt(convertToSingleByte(value)) >
                                                                                    0 &&
                                                                                    year &&
                                                                                    month &&
                                                                                    re.test(
                                                                                        convertToSingleByte(evt.target.value)
                                                                                    )
                                                                                ) {
                                                                                    if (
                                                                                        year == currentYear &&
                                                                                        month == currentMonth &&
                                                                                        enteredDay > currentDay
                                                                                    ) {
                                                                                        return;
                                                                                    }
                                                                                    if (month == 2) {
                                                                                        // February
                                                                                        maxDays =
                                                                                            year % 4 === 0 &&
                                                                                                (year % 100 !== 0 || year % 400 === 0)
                                                                                                ? 29
                                                                                                : 28;
                                                                                    } else if (
                                                                                        [4, 6, 9, 11].includes(month)
                                                                                    ) {
                                                                                        // Months with 30 days
                                                                                        maxDays = 30;
                                                                                    }
                                                                                    // Update the state only if the entered day is valid
                                                                                    if (
                                                                                        parseInt(convertToSingleByte(value)) <=
                                                                                        maxDays
                                                                                    ) {
                                                                                        setFieldValue(
                                                                                            "dob.date",
                                                                                            evt.target.value
                                                                                        );
                                                                                    }
                                                                                }
                                                                            },

                                                                            onBlur: handleBlur,
                                                                        }}
                                                                    />
                                                                    <div className="outer-label">
                                                                        <label className="font-bold pb-2 ">
                                                                            {translate(localeJson, "c_date")}
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <ValidationError
                                                                    errorBlock={
                                                                        errors.dob?.date &&
                                                                        touched.dob?.date &&
                                                                        errors.dob?.date
                                                                    }
                                                                    parentClass="pr-1"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mb-2 col-12 hidden">
                                                    <InputNumber
                                                        inputNumberProps={{
                                                            inputNumberParentClassName: `${errors.age && touched.age && "p-invalid pb-0"
                                                                }`,
                                                            labelProps: {
                                                                text: translate(localeJson, "c_age_y"),
                                                                inputNumberLabelClassName: "block font-bold",
                                                                spanText: "*",
                                                                inputNumberLabelSpanClassName: "p-error",
                                                                labelMainClassName: "pb-1",
                                                            },
                                                            inputNumberClassName: "w-full w-full",
                                                            id: "age",
                                                            name: "age",
                                                            value: values.age,
                                                            disabled: true,
                                                            onChange: (evt) => {
                                                                setFieldValue("age", evt.value);
                                                            },
                                                            onValueChange: (evt) => {
                                                                setFieldValue("age", evt.value);
                                                            },
                                                            onBlur: handleBlur,
                                                        }}
                                                    />
                                                    <ValidationError
                                                        errorBlock={errors.age && touched.age && errors.age}
                                                    />
                                                </div>
                                                <div className="mb-2 col-12 hidden">
                                                    <InputNumber
                                                        inputNumberProps={{
                                                            inputNumberParentClassName: `${errors.age && touched.age && "p-invalid pb-0"
                                                                }`,
                                                            labelProps: {
                                                                text: translate(localeJson, "c_age_m"),
                                                                inputNumberLabelClassName: "block font-bold",
                                                                spanText: "*",
                                                                inputNumberLabelSpanClassName: "p-error",
                                                                labelMainClassName: "pb-1",
                                                            },
                                                            inputNumberClassName: "w-full w-full",
                                                            id: "age_m",
                                                            name: "age_m",
                                                            value: values.age_m,
                                                            disabled: true,
                                                            onChange: (evt) => {
                                                                setFieldValue("age_m", evt.value);
                                                            },
                                                            onValueChange: (evt) => {
                                                                setFieldValue("age_m", evt.value);
                                                            },
                                                            onBlur: handleBlur,
                                                        }}
                                                    />
                                                    <ValidationError
                                                        errorBlock={
                                                            errors.age_m && touched.age_m && errors.age_m
                                                        }
                                                    />
                                                </div>
                                                {/* dob age and age_month end */}
                                                <div className="col-12">
                                                    <div className="outer-label w-12 pb-1">
                                                        <label>{translate(localeJson, "c_gender")}</label>
                                                        <span className="p-error">*</span>
                                                    </div>
                                                    <div className="gender-view mt-0">
                                                        <SelectButton
                                                            options={genderOptions}
                                                            value={values?.gender}
                                                            optionLabel="name"
                                                            disabled={
                                                                values?.family_register_from == "0" ? true : false
                                                            }
                                                            onChange={(e) => setFieldValue("gender", e.value)}
                                                        />
                                                    </div>
                                                    <ValidationError
                                                        errorBlock={
                                                            errors.gender && touched.gender && errors.gender
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center flex flex-column pl-5 pr-5">
                                            <Button
                                                buttonProps={{
                                                    buttonClass:
                                                        "w-full primary-button h-3rem border-radius-5rem mb-3",
                                                    type: "submit",
                                                    text: translate(localeJson, "submit"),
                                                    onClick: () => {
                                                        setCounter(count + 1);
                                                        setIsFormSubmitted(true);
                                                        setFieldValue(
                                                            "dob.year",
                                                            convertToSingleByte(values.dob.year)
                                                        );
                                                        setFieldValue(
                                                            "dob.month",
                                                            convertToSingleByte(values.dob.month)
                                                        );
                                                        setFieldValue(
                                                            "dob.date",
                                                            convertToSingleByte(values.dob.date)
                                                        );
                                                        handleSubmit();
                                                    },
                                                }}
                                                parentClass={"inline primary-button"}
                                            />
                                            <Button
                                                buttonProps={{
                                                    buttonClass: "w-full back-button h-3rem border-radius-5rem",
                                                    text: translate(localeJson, "cancel"),
                                                    type: "reset",
                                                    onClick: () => {
                                                        router.push({
                                                            pathname: '/user/event/dashboard',
                                                        })
                                                        resetForm();
                                                    },
                                                }}
                                                parentClass={"inline back-button"}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </Formik>
        </>
    );
}
