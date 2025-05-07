import React, { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Formik } from "formik";
import * as Yup from "yup";

import {
  getValueByKeyRecursively as translate,
  getGeneralDateTimeDisplayFormat,
  convertToSingleByte,
  toastDisplay
} from "@/helper";
import { LayoutContext } from "@/layout/context/layoutcontext";
import { prefectures, prefectures_en, default_place_id } from "@/utils/constant";
import { useAppSelector } from "@/redux/hooks";
import {
  Button,
  NormalLabel,
  ValidationError,
  GoogleMapComponent,
  InputSwitch,
  CustomHeader,
  Calendar,
  Input,
  InputDropdown,
  InputNumber
} from "@/components";
import { PlaceServices, CommonServices } from "@/services";

export default function PlaceUpdatePage() {
  const { locale, localeJson, setLoader } = useContext(LayoutContext);
  const router = useRouter();
  const Place = useAppSelector((state) => state.placeReducer.place);
  const settings_data = useAppSelector((state) => state?.layoutReducer?.layout);
  const id = Place?.id

  const [apiResponse, setApiResponse] = useState({});
  const [postalCodePrefectureId, setPostalCodePrefectureId] = useState(0);
  const [postalCodeDefaultPrefectureId, setPostalCodeDefaultPrefectureId] = useState(0);
  const [currentLattitude, setCurrentlatitude] = useState(0);
  const [currentLongitude, setCurrentlongitude] = useState(0);
  const [activeFlagValue, setActiveFlagValue] = useState(false);
  const [publicAvailabilityFlagValue, setPublicAvailabilityFlagValue] = useState(false);
  const [prefCount, setPrefCount] = useState(1)
  const formikRef = useRef();
  const [initialValues, setInitialValues] = useState({
    place_id: "",
    name: "",
    refugee_name: "",
    name_en: "",
    postal_code_1: "",
    postal_code_2: "",
    prefecture_id: null,
    address: "",
    prefecture_en_id: null,
    address_en: "",
    postal_code_default_1: "",
    postal_code_default_2: "",
    prefecture_id_default: null,
    address_default: "",
    prefecture_default_en_id: null,
    address_default_en: "",
    total_place: "",
    tel: "",
    longitude: "",
    latitude: "",
    altitude: "",
    opening_date_time: "",
    closing_date_time: "",
    opening_date: "",
    opening_time: "",
    closing_date: "",
    closing_time: "",
    public_availability: "",
    active_flg: "",
    remarks: "",
});

  const today = new Date();
  const invalidDates = Array.from({ length: today.getDate() - 1 }, (_, index) => {
    const day = index + 1;
    return new Date(today.getFullYear(), today.getMonth(), day);
  });

  /* Services */
  const { update, details } = PlaceServices;
  const { getAddressFromZipCode } = CommonServices;

  useEffect(() => {
    const fetchData = async () => {
      await onGetPlaceDetailsOnMounting();
    };
    fetchData();
  }, [locale]);

  useEffect(() => {
    formikRef.current.validateForm()
  }, [prefCount])

  const schema = Yup.object().shape({
    name: Yup.string()
      .required(
        translate(localeJson, "evacuation_location") +
        translate(localeJson, "is_required")
      )
      .max(
        200,
        translate(localeJson, "evacuation_location") +
        translate(localeJson, "max_length_200")
      ),
    refugee_name: Yup.string().max(
      200,
      translate(localeJson, "evacuation_location_furigana") +
      translate(localeJson, "max_length_200")
    ),
    name_en: Yup.string().max(
      200,
      translate(localeJson, "evacuation_location_english") +
      translate(localeJson, "max_length_200")
    ),
    postal_code_1: Yup.string()
      .test("checkDoubleByte", translate(localeJson, "postal_code_1_validation"),
        (value) => {
          let val = convertToSingleByte(value)
          return /^\d+$/.test(val)
        })
      .max(3, translate(localeJson, "postal_code_1_validation"))
      .min(3, translate(localeJson, "postal_code_1_validation"))
      .required(
        translate(localeJson, "postal_code") +
        translate(localeJson, "is_required")
      ).test("testPostalCode", translate(localeJson, "zip_code_mis_match"), (value, context) => {
        if (context.parent.postal_code_2?.length == 4) {
          const { prefecture_id } = context.parent;
          if (postalCodePrefectureId != null && prefecture_id != null) {
            return postalCodePrefectureId == prefecture_id
          }
          else return true
        }
        else {
          return true
        }
      }),
    postal_code_2: Yup.string()
      .test("checkDoubleByte", translate(localeJson, "postal_code_2_validation"),
        (value) => {
          let val = convertToSingleByte(value)
          return /^\d+$/.test(val)
        })

      .max(4, translate(localeJson, "postal_code_2_validation"))
      .min(4, translate(localeJson, "postal_code_2_validation"))
      .required(
        translate(localeJson, "postal_code") +
        translate(localeJson, "is_required")
      ).test("testPostalCode", translate(localeJson, "zip_code_mis_match"), (value, context) => {
        if (context.parent.postal_code_1?.length == 3) {
          const { prefecture_id } = context.parent;
          if (postalCodePrefectureId != null && prefecture_id != null) {
            return postalCodePrefectureId == prefecture_id
          }
          else return true
        }
        else {
          return true
        }
      }),
    prefecture_id: Yup.string().required(
      translate(localeJson, "prefecture_places") +
      translate(localeJson, "is_required")
    ),
    address: Yup.string()
      .required(
        translate(localeJson, "address") + translate(localeJson, "is_required")
      )
      .max(
        255,
        translate(localeJson, "address") +
        translate(localeJson, "max_length_255")
      ),
    address_en: Yup.string().max(
      255,
      translate(localeJson, "address_en") +
      translate(localeJson, "max_length_255")
    ),
    postal_code_default_1: Yup.string()
      .test("checkDoubleByte", translate(localeJson, "postal_code_1_validation"),
        (value) => {
          let val = convertToSingleByte(value)
          return /^\d+$/.test(val)
        })
      .max(3, translate(localeJson, "postal_code_1_validation"))
      .min(3, translate(localeJson, "postal_code_1_validation"))
      .required(
        translate(localeJson, "default_prefecture_place") +
        translate(localeJson, "is_required")
      ).test("testPostalCode", translate(localeJson, "zip_code_mis_match"), (value, context) => {
        if (context.parent.postal_code_default_2?.length == 4) {
          const { prefecture_id_default } = context.parent;
          if (postalCodeDefaultPrefectureId != null && prefecture_id_default != null) {
            return postalCodeDefaultPrefectureId == prefecture_id_default
          }
          else return true
        }
        else {
          return true
        }
      }),
    postal_code_default_2: Yup.string()
      .test("checkDoubleByte", translate(localeJson, "postal_code_2_validation"),
        (value) => {
          let val = convertToSingleByte(value)
          return /^\d+$/.test(val)
        })
      .max(4, translate(localeJson, "postal_code_2_validation"))
      .min(4, translate(localeJson, "postal_code_2_validation"))
      .required(
        translate(localeJson, "default_prefecture_place") +
        translate(localeJson, "is_required")
      ).test("testPostalCode", translate(localeJson, "zip_code_mis_match"), (value, context) => {
        if (context.parent.postal_code_default_1?.length == 3) {
          const { prefecture_id_default } = context.parent;
          if (postalCodeDefaultPrefectureId != null && prefecture_id_default != null) {
            return postalCodeDefaultPrefectureId == prefecture_id_default
          }
          else return true
        }
        else {
          return true
        }
      }),
    prefecture_id_default: Yup.string().required(
      translate(localeJson, "default_prefecture_place") +
      translate(localeJson, "is_required")
    ),
    address_default: Yup.string()
      .required(
        translate(localeJson, "default_address") +
        translate(localeJson, "is_required")
      )
      .max(
        255,
        translate(localeJson, "default_address") +
        translate(localeJson, "max_length_255")
      ),
    address_default_en: Yup.string().max(
      255,
      translate(localeJson, "default_address_en") +
      translate(localeJson, "max_length_255")
    ),
    tel: Yup.string()
      .required(translate(localeJson, "phone_no_required"))
      .test(
        "starts-with-zero",
        translate(localeJson, "phone_num_start"),
        (value) => {
          if (value) {
            value = convertToSingleByte(value);
            return value.charAt(0) === "0";
          }
          return true; // Return true for empty values or use .required() in schema to enforce non-empty strings
        }
      )
      .test(
        "is-not-empty",
        translate(localeJson, "phone_no_required"),
        (value) => {
          return value.trim() !== ""; // Check if the string is not empty after trimming whitespace
        }
      )
      .test("matches-pattern", translate(localeJson, "phone"), (value) => {
        if (value) {
          const singleByteValue = convertToSingleByte(value);
          return /^[0-9]{10,11}$/.test(singleByteValue);
        }
        else {
          return true;
        }
      }),

    latitude: Yup.number().required(
      translate(localeJson, "latitude") + translate(localeJson, "is_required")
    ),
    longitude: Yup.number().required(
      translate(localeJson, "longitude") + translate(localeJson, "is_required")
    ),
    altitude: Yup.string().required(
      translate(localeJson, "altitude") + translate(localeJson, "is_required")
    ),
    total_place: Yup.string()
      .required(
        translate(localeJson, "capacity") + translate(localeJson, "is_required")
      )
      .max(
        9,
        translate(localeJson, "capacity") +
        translate(localeJson, "capacity_max_length")
      ),
    remarks: Yup.string().max(
      255,
      translate(localeJson, "remarks") +
      translate(localeJson, "max_length_255")
    ),
    closing_date: Yup.date().nullable()
      .min(Yup.ref('opening_date'), translate(localeJson, "closing_date")),
    opening_date:
      Yup.date()
        .nullable()
        .when('closing_date', {
          is: (closingDate) => {
            return closingDate != null && (closingDate != undefined || closingDate != '')
          },
          then: () => Yup.date().required(translate(localeJson, "opening_required_when_closing_available")),
          otherwise: () => Yup.date().nullable(),
        }),

  });

  /**
   * Get place list on mounting
   */
  const onGetPlaceDetailsOnMounting = async () => {
    // Get places list
    details(id, fetchData);
  };

  function fetchData(response) {
    setLoader(true);
    const model = response.data.model;
    let initialValuesPayload = {};
    initialValuesPayload.place_id = Place?.id;
    let openingDate = model.opening_date_time
      ? new Date(model.opening_date_time)
      : "";
    let closingDate = model.closing_date_time
      ? new Date(model.closing_date_time)
      : "";
    initialValuesPayload.name = model.name || "";
    initialValuesPayload.refugee_name = model.refugee_name || "";
    initialValuesPayload.name_en = model.name_en || "";
    initialValuesPayload.postal_code_1 = model.zip_code != "000-0000" && model.zip_code
      ? model.zip_code.split("-")[0]
      : "";
    initialValuesPayload.postal_code_2 = model.zip_code != "000-0000" && model.zip_code
      ? model.zip_code.split("-")[1]
      : "";
    initialValuesPayload.prefecture_id = model.prefecture_id || null;
    initialValuesPayload.address = model.address || "";
    initialValuesPayload.prefecture_en_id = model.prefecture_en_id || null;
    initialValuesPayload.address_en = model.address_en || "";
    initialValuesPayload.postal_code_default_1 = model.zip_code_default != "000-0000" && model.zip_code_default
      ? model.zip_code_default.split("-")[0]
      : "";
    initialValuesPayload.postal_code_default_2 = model.zip_code_default != "000-0000" && model.zip_code_default
      ? model.zip_code_default.split("-")[1]
      : "";
    initialValuesPayload.prefecture_id_default = model.prefecture_id_default || null;
    initialValuesPayload.address_default = model.address_default || "";
    initialValuesPayload.prefecture_default_en_id =
      model.prefecture_default_en_id || null;
    initialValuesPayload.address_default_en = model.address_default_en || "";
    initialValuesPayload.total_place = model.total_place || "";
    initialValuesPayload.tel = model.tel || "";
    initialValuesPayload.longitude = model?.map?.longitude || "";
    initialValuesPayload.latitude = model?.map?.latitude || "";
    initialValuesPayload.altitude = model.altitude || "";
    initialValuesPayload.opening_date = openingDate;
    initialValuesPayload.closing_date = closingDate;
    initialValuesPayload.public_availability = model.public_availability == 1;
    initialValuesPayload.active_flg = model.active_flg == 1;
    initialValuesPayload.remarks = model.remarks || "";
    setInitialValues(initialValuesPayload);
    setLoader(false);
    setApiResponse(model);
    setCurrentlatitude(parseFloat(model?.map?.latitude));
    setCurrentlongitude(parseFloat(model?.map?.longitude));
    setPostalCodePrefectureId(model?.prefecture_id);
    setPostalCodeDefaultPrefectureId(model?.prefecture_id_default);
    setActiveFlagValue(Boolean(model.active_flg))
    setPublicAvailabilityFlagValue(Boolean(model.public_availability))
  }

  // map search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const handleSearch = (setFieldValue) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === "OK" && results[0]) {
        const { location } = results[0].geometry;
        setFieldValue("latitude", location.lat());
        setFieldValue("longitude", location.lng());
        setSearchResult({
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        toastDisplay(translate(localeJson, 'loc_not_found'), '', '', "error");
      }
    });
  };

  const updatePlace = (response) => {
    if (response) {
      router.push("/admin/place");
    } else {
      setActiveFlagValue(true);
    }
  };

  return (
    <>
      <Formik
        innerRef={formikRef}
        validationSchema={schema}
        initialValues={initialValues}
        enableReinitialize={true}
        onSubmit={(values, error) => {
          if (values.opening_date) {
            const openingDate = new Date(values.opening_date);

            const sourceDate = new Date(values.opening_time);
            if (!isNaN(sourceDate)) {
              const minutes = sourceDate.getMinutes();
              const hours = sourceDate.getHours();
              const openingDateMinute = openingDate.getMinutes();
              const openingDateHours = openingDate.getHours();
              if (openingDateMinute == minutes && openingDateHours == hours) {
                openingDate.setMinutes(minutes);
                openingDate.setHours(hours);
              }
            }
            values.opening_date_time = values.opening_date
              ? getGeneralDateTimeDisplayFormat(openingDate)
              : "";
          }
          if (values.closing_date) {
            const closingDate = new Date(values.closing_date);
            const sourceDate2 = new Date(values.closing_time);
            if (!isNaN(sourceDate2)) {
              const ClosingMinutes = sourceDate2.getMinutes();
              const ClosingHours = sourceDate2.getHours();
              const closingDateMinute = closingDate.getMinutes();
              const closingDateHours = closingDate.getHours();
              if (
                closingDateMinute != ClosingMinutes &&
                closingDateHours != ClosingHours
              ) {
                closingDate.setMinutes(ClosingMinutes);
                closingDate.setHours(ClosingHours);
              }
            }

            values.closing_date_time = values.opening_date
              ? getGeneralDateTimeDisplayFormat(closingDate)
              : "";
          }
          values.postal_code_1 = convertToSingleByte(values.postal_code_1);
          values.postal_code_2 = convertToSingleByte(values.postal_code_2);
          values.postal_code_default_1 = convertToSingleByte(values.postal_code_default_1);
          values.postal_code_default_2 = convertToSingleByte(values.postal_code_default_2);
          values.total_place = convertToSingleByte(values.total_place);
          values.tel = convertToSingleByte(values.tel);
          values.public_availability = Number(publicAvailabilityFlagValue)
          values.active_flg = Number(activeFlagValue)
          update(values, updatePlace);
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
          validateForm
        }) => (
          <div className="grid">
            <div className="col-12">
              <div className="card">
                {/* Header */}
                <div>
                  <CustomHeader headerClass={"page-header1"} header={translate(localeJson, "edit_place")} />
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="col-12 lg:flex p-0">
                    <div className="col-12 lg:col-6 p-0">
                      <div>
                        <div className="modal-field-top-space modal-field-bottom-space">
                          <Input
                            inputProps={{
                              inputParentClassName: `custom_input ${errors.name && touched.name && "p-invalid pb-1"}`,
                              labelProps: {
                                text: translate(localeJson, 'evacuation_location'),
                                inputLabelClassName: "block",
                                inputLabelSpanClassName: "p-error",
                                spanText: "*",
                              },
                              inputClassName: "w-full",
                              value: values.name,
                              onChange: handleChange,
                              onBlur: handleBlur,
                              name: "name",
                            }}
                          />
                          <ValidationError
                            errorBlock={
                              errors.name && touched.name && errors.name
                            }
                          />
                        </div>
                        <div className="modal-field-top-space modal-field-bottom-space">
                          <Input
                            inputProps={{
                              inputParentClassName: `custom_input ${errors.refugee_name && touched.refugee_name && "p-invalid pb-1"}`,
                              labelProps: {
                                text: translate(localeJson, 'evacuation_location_furigana'),
                                inputLabelClassName: "block",
                              },
                              inputClassName: "w-full",
                              value: values.refugee_name,
                              onChange: handleChange,
                              onBlur: handleBlur,
                              id: "refugee_name",
                              name: "refugee_name",
                            }}
                          />
                          <ValidationError
                            errorBlock={
                              errors.refugee_name &&
                              touched.refugee_name &&
                              errors.refugee_name
                            }
                          />
                        </div>
                        <div className="modal-field-top-space modal-field-bottom-space">
                          <Input
                            inputProps={{
                              inputParentClassName: `custom_input ${errors.name_en && touched.name_en && "p-invalid pb-1"}`,
                              labelProps: {
                                text: translate(localeJson, 'evacuation_location_english'),
                                inputLabelClassName: "block",
                              },
                              inputClassName: "w-full",
                              value: values.name_en,
                              onChange: handleChange,
                              onBlur: handleBlur,
                              id: "name_en",
                              name: "name_en",
                            }}
                          />
                          <ValidationError
                            errorBlock={
                              errors.name_en &&
                              touched.name_en &&
                              errors.name_en
                            }
                          />
                        </div>
                        <div className="lg:flex modal-field-top-space modal-field-bottom-space">
                          <div className="lg:col-6 pt-0 pb-0 lg:pl-0 mb-2 mt-2 mb-2 lg:mt-0 lg:mb-0">
                            <Input
                              inputProps={{
                                inputParentClassName: `custom_input ${errors.postal_code_1 && touched.postal_code_1 && "p-invalid pb-1"}`,
                                labelProps: {
                                  text: translate(localeJson, 'postal_code'),
                                  inputLabelClassName: "block",
                                  inputLabelSpanClassName: "p-error",
                                  spanText: "*",
                                },
                                inputClassName: "w-full",
                                value: values.postal_code_1,
                                onChange: (evt) => {
                                  const re = /^[0-9-]+$/;
                                  if (evt.target.value == "") {
                                    setFieldValue(
                                      "postal_code_1",
                                      evt.target.value
                                    );
                                    return
                                  }
                                  if (re.test(convertToSingleByte(evt.target.value)) && evt.target.value.length <= 3) {
                                    setFieldValue(
                                      "postal_code_1",
                                      evt.target.value
                                    );
                                  }
                                  let val = evt.target.value;
                                  let val2 = values.postal_code_2;
                                  if (
                                    val !== undefined &&
                                    val !== null &&
                                    val2 !== undefined &&
                                    val2 !== null &&
                                    re.test(convertToSingleByte(evt.target.value)) &&
                                    re.test(convertToSingleByte(val2))
                                  ) {
                                    if (
                                      val.length == 3 &&
                                      val2.length == 4
                                    ) {
                                      let payload = convertToSingleByte(evt.target.value) + convertToSingleByte(values.postal_code_2);
                                      getAddressFromZipCode(
                                        payload,
                                        (response) => {
                                          if (response) {
                                            let address = response;
                                            const selectedPrefecture =
                                              prefectures.find(
                                                (prefecture) =>
                                                  prefecture.value ==
                                                  address.prefcode
                                              );
                                            setFieldValue(
                                              "prefecture_id",
                                              selectedPrefecture?.value
                                            );
                                            setFieldValue(
                                              "address",
                                              address.address2 + (address.address3 || "")
                                            );
                                            setPostalCodePrefectureId(selectedPrefecture?.value);
                                            setPrefCount(prefCount + 1)
                                          } else {
                                            setFieldValue(
                                              "prefecture_id",
                                              ""
                                            );
                                            setFieldValue("address", "");
                                          }
                                        }
                                      );
                                    }
                                  }
                                },
                                onBlur: handleBlur,
                                id: "postal_code_1",
                                name: "postal_code_1",
                              }}
                            />
                            <ValidationError
                              errorBlock={
                                errors.postal_code_1 &&
                                touched.postal_code_1 &&
                                errors.postal_code_1
                              }
                            />
                          </div>
                          <div className="lg:col-6 pt-0 pb-0 lg:pr-0 mt-2 mb-2 lg:mt-0 lg:mb-0">
                            <Input
                              inputProps={{
                                inputParentClassName: `custom_input ${errors.postal_code_2 && touched.postal_code_2 && "p-invalid pb-1"}`,
                                labelProps: {
                                  text: translate(localeJson, 'postal_code'),
                                  inputLabelClassName: "block",
                                  inputLabelSpanClassName: "p-error",
                                  spanText: "*",
                                },
                                inputClassName: "w-full",
                                value: values.postal_code_2,
                                onChange: (evt) => {
                                  const re = /^[0-9-]+$/;
                                  if (evt.target.value == "") {
                                    setFieldValue(
                                      "postal_code_2",
                                      evt.target.value
                                    );
                                    return;
                                  }
                                  if (re.test(convertToSingleByte(evt.target.value)) && evt.target.value.length <= 4) {
                                    setFieldValue(
                                      "postal_code_2",
                                      evt.target.value
                                    );
                                  }
                                  let val = evt.target.value;
                                  let val2 = values.postal_code_1;
                                  if (
                                    val !== undefined &&
                                    val !== null &&
                                    val2 !== undefined &&
                                    val2 !== null &&
                                    re.test(convertToSingleByte(evt.target.value)) &&
                                    re.test(convertToSingleByte(val2))
                                  ) {
                                    if (val.length == 4 && val2.length == 3) {
                                      let payload = convertToSingleByte(values.postal_code_1) + convertToSingleByte(evt.target.value);
                                      getAddressFromZipCode(
                                        payload,
                                        (response) => {
                                          if (response) {
                                            let address = response;
                                            const selectedPrefecture =
                                              prefectures.find(
                                                (prefecture) =>
                                                  prefecture.value ==
                                                  address.prefcode
                                              );

                                            setFieldValue(
                                              "prefecture_id",
                                              selectedPrefecture?.value
                                            );
                                            setFieldValue(
                                              "address",
                                              address.address2 + (address.address3 || "")
                                            );
                                            setPostalCodePrefectureId(selectedPrefecture?.value);
                                            setPrefCount(prefCount + 1)
                                          } else {
                                            setFieldValue(
                                              "prefecture_id",
                                              ""
                                            );
                                            setFieldValue("address", "");
                                          }
                                        }
                                      );
                                    }
                                  }
                                },
                                onBlur: handleBlur,
                                id: "postal_code_2",
                                name: "postal_code_2",
                              }}
                            />
                            <ValidationError
                              errorBlock={
                                errors.postal_code_2 &&
                                touched.postal_code_2 &&
                                errors.postal_code_2
                              }
                            />
                          </div>
                        </div>
                        <div className="lg:flex modal-field-top-space modal-field-bottom-space">
                          <div className="lg:col-6 pt-0 pb-0 lg:pl-0 mb-2 mt-2 mb-2 lg:mt-0 lg:mb-0">
                            <InputDropdown inputDropdownProps={{
                              inputDropdownParentClassName: `${errors.prefecture_id && touched.prefecture_id && "p-invalid pb-1"}`,
                              labelProps: {
                                text: translate(localeJson, 'prefecture_places'),
                                inputDropdownLabelClassName: "block",
                                spanText: "*",
                                inputDropdownLabelSpanClassName: "p-error"
                              },
                              inputDropdownClassName: "w-full",
                              name: "prefecture_id",
                              value: values.prefecture_id,
                              options: prefectures,
                              optionLabel: "name",
                              onChange: (e) => {
                                setFieldValue("prefecture_id", e.target.value);
                                if (values.postal_code_1 && values.postal_code_2) {
                                  let payload = convertToSingleByte(values.postal_code_1) + convertToSingleByte(values.postal_code_2);
                                  getAddressFromZipCode(
                                    payload, (res) => {
                                      if (res && res.prefcode) {
                                        setPostalCodePrefectureId(res.prefcode);
                                        setPrefCount(prefCount + 1)
                                      }
                                      validateForm();
                                    })
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
                          </div>
                          <div className="lg:col-6 pt-0 pb-0 lg:pr-0 mt-2 mb-2 lg:mt-0 lg:mb-0">
                            <Input
                              inputProps={{
                                inputParentClassName: `custom_input ${errors.address && touched.address && "p-invalid pb-1"}`,
                                labelProps: {
                                  text: translate(localeJson, 'address'),
                                  inputLabelClassName: "block",
                                  spanText: "*",
                                  inputLabelSpanClassName: "p-error"
                                },
                                inputClassName: "w-full",
                                value: values.address,
                                onChange: handleChange,
                                onBlur: handleBlur,
                                id: "address",
                                name: "address",
                              }}
                            />
                            <ValidationError
                              errorBlock={
                                errors.address &&
                                touched.address &&
                                errors.address
                              }
                            />
                          </div>
                        </div>
                        <div className="lg:flex modal-field-top-space modal-field-bottom-space">
                          <div className="lg:col-6 mb-2 mt-2 pt-0 pb-0 lg:mb-0 lg:mt-0 lg:pl-0">
                            <InputDropdown inputDropdownProps={{
                              inputDropdownParentClassName: `${errors.prefecture_en_id && touched.prefecture_en_id && "p-invalid pb-1"}`,
                              labelProps: {
                                text: translate(localeJson, 'prefecture_places_en'),
                                inputDropdownLabelClassName: "block"
                              },
                              inputDropdownClassName: "w-full",
                              name: "prefecture_en_id",
                              value: values.prefecture_en_id,
                              options: prefectures_en,
                              optionLabel: "name",
                              onChange: handleChange,
                              onBlur: handleBlur,
                              emptyMessage: translate(localeJson, "data_not_found"),
                            }}
                            />
                            <ValidationError
                              errorBlock={
                                errors.prefecture_en_id &&
                                touched.prefecture_en_id &&
                                errors.prefecture_en_id
                              }
                            />
                          </div>
                          <div className="lg:col-6 pt-0 pb-0 lg:pr-0 mt-2 mb-2 lg:mt-0 mb=mt-0">
                            <Input
                              inputProps={{
                                inputParentClassName: `custom_input ${errors.address_en && touched.address_en && "p-invalid pb-1"}`,
                                labelProps: {
                                  text: translate(localeJson, 'address_en'),
                                  inputLabelClassName: "block",
                                },
                                inputClassName: "w-full",
                                value: values.address_en,
                                onChange: handleChange,
                                onBlur: handleBlur,
                                id: "address_en",
                                name: "address_en",
                              }}
                            />
                            <ValidationError
                              errorBlock={
                                errors.address_en &&
                                touched.address_en &&
                                errors.address_en
                              }
                            />
                          </div>
                        </div>
                        <div className="lg:flex modal-field-top-space modal-field-bottom-space">
                          <div className="lg:col-6 pt-0 pb-0 lg:pl-0 mb-2 mt-2 mb-2 lg:mt-0 lg:mb-0">
                            <Input
                              inputProps={{
                                inputParentClassName: `custom_input ${errors.postal_code_default_1 && touched.postal_code_default_1 && "p-invalid pb-1"}`,
                                labelProps: {
                                  text: translate(localeJson, 'default_postal_code'),
                                  inputLabelClassName: "block",
                                  spanText: "*",
                                  inputLabelSpanClassName: "p-error"
                                },
                                inputClassName: "w-full",
                                value: values.postal_code_default_1,
                                onChange: (evt) => {
                                  const re = /^[0-9-]+$/;
                                  if (evt.target.value == "") {
                                    setFieldValue(
                                      "postal_code_default_1",
                                      evt.target.value
                                    );
                                    return
                                  }
                                  if (re.test(convertToSingleByte(evt.target.value)) && evt.target.value.length <= 3) {
                                    setFieldValue(
                                      "postal_code_default_1",
                                      evt.target.value
                                    );
                                  }
                                  let val = evt.target.value;
                                  let val2 = values.postal_code_default_2;
                                  if (
                                    val !== undefined &&
                                    val !== null &&
                                    val2 !== undefined &&
                                    val2 !== null &&
                                    re.test(convertToSingleByte(evt.target.value)) &&
                                    re.test(convertToSingleByte(val2))
                                  ) {
                                    if (
                                      val.length == 3 &&
                                      val2.length == 4
                                    ) {
                                      let payload = convertToSingleByte(evt.target.value) + convertToSingleByte(values.postal_code_default_2);
                                      getAddressFromZipCode(
                                        payload,
                                        (response) => {
                                          if (response) {
                                            let address = response;
                                            const selectedPrefecture =
                                              prefectures.find(
                                                (prefecture) =>
                                                  prefecture.value ==
                                                  address.prefcode
                                              );
                                            setFieldValue(
                                              "prefecture_id_default",
                                              selectedPrefecture?.value
                                            );
                                            setFieldValue(
                                              "address_default",
                                              address.address2 + (address.address3 || "")
                                            );
                                            setPostalCodeDefaultPrefectureId(selectedPrefecture?.value);
                                            setPrefCount(prefCount + 1)
                                          } else {
                                            setFieldValue(
                                              "prefecture_id_default",
                                              ""
                                            );
                                            setFieldValue(
                                              "address_default",
                                              ""
                                            );
                                          }
                                        }
                                      );
                                    }
                                  }
                                },
                                onBlur: handleBlur,
                                id: "postal_code_default_1",
                                name: "postal_code_default_1",
                              }}
                            />
                            <ValidationError
                              errorBlock={
                                errors.postal_code_default_1 &&
                                touched.postal_code_default_1 &&
                                errors.postal_code_default_1
                              }
                            />
                          </div>
                          <div className="lg:col-6 pt-0 pb-0 lg:pr-0 mt-2 mb-2 lg:mt-0 lg:mb-0">
                            <Input
                              inputProps={{
                                inputParentClassName: `custom_input ${errors.postal_code_default_2 && touched.postal_code_default_2 && "p-invalid pb-1"}`,
                                labelProps: {
                                  text: translate(localeJson, 'default_postal_code'),
                                  inputLabelClassName: "block",
                                  spanText: "*",
                                  inputLabelSpanClassName: "p-error"
                                },
                                inputClassName: "w-full",
                                value: values.postal_code_default_2,
                                onChange: (evt) => {
                                  const re = /^[0-9-]+$/;
                                  if (evt.target.value == "") {
                                    setFieldValue(
                                      "postal_code_default_2",
                                      evt.target.value
                                    );
                                    return;
                                  }
                                  if (re.test(convertToSingleByte(evt.target.value)) && evt.target.value.length <= 4) {
                                    setFieldValue(
                                      "postal_code_default_2",
                                      evt.target.value
                                    );
                                  }
                                  let val2 = evt.target.value;
                                  let val = values.postal_code_default_1;
                                  if (
                                    val !== undefined &&
                                    val !== null &&
                                    val2 !== undefined &&
                                    val2 !== null &&
                                    re.test(convertToSingleByte(evt.target.value)) &&
                                    re.test(convertToSingleByte(val2))
                                  ) {
                                    if (val.length == 3 && val2.length == 4) {
                                      let payload = convertToSingleByte(values.postal_code_default_1) + convertToSingleByte(evt.target.value);
                                      getAddressFromZipCode(
                                        payload,
                                        (response) => {
                                          if (response) {
                                            let address = response;
                                            const selectedPrefecture =
                                              prefectures.find(
                                                (prefecture) =>
                                                  prefecture.value ==
                                                  address.prefcode
                                              );
                                            setFieldValue(
                                              "prefecture_id_default",
                                              selectedPrefecture?.value
                                            );
                                            setFieldValue(
                                              "address_default",
                                              address.address2 + (address.address3 || "")
                                            );
                                            setPostalCodeDefaultPrefectureId(selectedPrefecture?.value);
                                            setPrefCount(prefCount + 1)
                                          } else {
                                            setFieldValue(
                                              "prefecture_id_default",
                                              ""
                                            );
                                            setFieldValue(
                                              "address_default",
                                              ""
                                            );
                                          }
                                        }
                                      );
                                    }
                                  }
                                },
                                onBlur: handleBlur,
                                id: "postal_code_default_2",
                                name: "postal_code_default_2",
                              }}
                            />
                            <ValidationError
                              errorBlock={
                                errors.postal_code_default_2 &&
                                touched.postal_code_default_2 &&
                                errors.postal_code_default_2
                              }
                            />
                          </div>
                        </div>
                        <div className="lg:flex modal-field-top-space modal-field-bottom-space">
                          <div className="lg:col-6 pt-0 mt-2 lg:mt-0 mb-2 lg:mb-0 pb-0 lg:pl-0">
                            <InputDropdown inputDropdownProps={{
                              inputDropdownParentClassName: `${errors.prefecture_id_default && touched.prefecture_id_default && "p-invalid pb-1"}`,
                              labelProps: {
                                text: translate(localeJson, 'default_prefecture_place'),
                                inputDropdownLabelClassName: "block",
                                spanText: "*",
                                inputDropdownLabelSpanClassName: "p-error"
                              },
                              inputDropdownClassName: "w-full",
                              name: "prefecture_id_default",
                              value: values.prefecture_id_default,
                              options: prefectures,
                              optionLabel: "name",
                              onChange: (e) => {
                                setFieldValue("prefecture_id_default", e.target.value);
                                if (values.postal_code_default_1 && values.postal_code_default_2) {
                                  let payload = convertToSingleByte(values.postal_code_default_1) + convertToSingleByte(values.postal_code_default_2);
                                  getAddressFromZipCode(
                                    payload, (res) => {
                                      if (res && res.prefcode != e.target.value) {
                                        setPostalCodeDefaultPrefectureId(res.prefcode);
                                        setPrefCount(prefCount + 1)
                                      }
                                      validateForm();
                                    })
                                }
                              },
                              emptyMessage: translate(localeJson, "data_not_found"),
                            }}
                            />
                            <ValidationError
                              errorBlock={
                                errors.prefecture_id_default &&
                                touched.prefecture_id_default &&
                                errors.prefecture_id_default
                              }
                            />
                          </div>
                          <div className="lg:col-6 pt-0 pb-0 lg:pr-0 mt-2 mb-2 lg:mb-0 lg:mt-0">
                            <Input
                              inputProps={{
                                inputParentClassName: `custom_input ${errors.address_default && touched.address_default && "p-invalid pb-1"}`,
                                labelProps: {
                                  text: translate(localeJson, 'default_address'),
                                  inputLabelClassName: "block",
                                  spanText: "*",
                                  inputLabelSpanClassName: "p-error"
                                },
                                inputClassName: "w-full",
                                value: values.address_default,
                                onChange: handleChange,
                                onBlur: handleBlur,
                                id: "address_default",
                                name: "address_default",
                              }}
                            />
                            <ValidationError
                              errorBlock={
                                errors.address_default &&
                                touched.address_default &&
                                errors.address_default
                              }
                            />
                          </div>
                        </div>
                        <div className="lg:flex modal-field-top-space modal-field-bottom-space">
                          <div className="lg:col-6 pt-0 pb-0 mt-2 mb-2 lg:mt-0 lg:mb-0 lg:pl-0">
                            <InputDropdown inputDropdownProps={{
                              inputDropdownParentClassName: `${errors.prefecture_default_en_id && touched.prefecture_default_en_id && "p-invalid pb-1"}`,
                              labelProps: {
                                text: translate(localeJson, 'default_prefecture_place_en'),
                                inputDropdownLabelClassName: "block",
                              },
                              inputDropdownClassName: "w-full",
                              name: "prefecture_default_en_id",
                              value: values.prefecture_default_en_id,
                              options: prefectures_en,
                              optionLabel: "name",
                              onChange: handleChange,
                              onBlur: handleBlur,
                              emptyMessage: translate(localeJson, "data_not_found"),
                            }}
                            />
                            <ValidationError
                              errorBlock={
                                errors.prefecture_default_en_id &&
                                touched.prefecture_default_en_id &&
                                errors.prefecture_default_en_id
                              }
                            />
                          </div>
                          <div className="lg:col-6 pt-0 pb-0 lg:pr-0 mt-2 mb-2 lg:mt-0 lg:mb-0">
                            <Input
                              inputProps={{
                                inputParentClassName: `custom_input ${errors.address_default_en && touched.address_default_en && "p-invalid pb-1"}`,
                                labelProps: {
                                  text: translate(localeJson, 'default_address_en'),
                                  inputLabelClassName: "block",
                                },
                                inputClassName: "w-full",
                                value: values.address_default_en,
                                onChange: handleChange,
                                onBlur: handleBlur,
                                id: "address_default_en",
                                name: "address_default_en",
                              }}
                            />
                            <ValidationError
                              errorBlock={
                                errors.address_default_en &&
                                touched.address_default_en &&
                                errors.address_default_en
                              }
                            />
                          </div>
                        </div>
                        <div className="modal-field-top-space modal-field-bottom-space">
                          <Input inputProps={{
                            inputParentClassName: `custom_input ${errors.total_place &&
                              touched.total_place &&
                              "p-invalid pb-1"
                              }`,
                            labelProps: {
                              text: translate(localeJson, "capacity"),
                              inputLabelClassName: "block",
                              spanText: "*",
                              inputLabelSpanClassName: "p-error"
                            },
                            inputClassName: "w-full",
                            id: "total_place",
                            name: "total_place",
                            value: values.total_place,
                            onChange: (evt) => {
                              const re = /^[0-9-]+$/;
                              if (re.test(convertToSingleByte(evt.target.value)) || evt.target.value == "") {
                                setFieldValue("total_place", evt.target.value);
                              }
                            },
                            onBlur: handleBlur,
                          }} />
                          <ValidationError
                            errorBlock={
                              errors.total_place &&
                              touched.total_place &&
                              errors.total_place
                            }
                          />
                        </div>
                        <div className="modal-field-top-space modal-field-bottom-space">
                          <Input
                            inputProps={{
                              inputParentClassName: `w-full custom_input ${errors.tel && touched.tel && "p-invalid"
                                }`,
                              labelProps: {
                                text: translate(localeJson, "phone_number"),
                                spanText: "*",
                                inputLabelClassName: "block font-bold",
                                inputLabelSpanClassName: "p-error",
                                labelMainClassName: "pb-1",
                              },
                              inputClassName: "w-full",
                              id: "tel",
                              name: "tel",
                              value: values.tel,
                              inputMode: "numeric",
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
                                display: false,
                                audio: {
                                  display: false,
                                },
                                icon: "",
                              },
                            }}
                          />
                          <ValidationError
                            errorBlock={errors.tel && touched.tel && errors.tel}
                          />
                        </div>
                        <div className="lg:flex modal-field-top-space modal-field-bottom-space">
                          <div className="lg:col-6 pt-0 pb-0 mb-2 lg:mb-0 lg:pl-0 ">
                            <InputNumber inputNumberProps={{
                              inputNumberParentClassName: `custom_input ${errors.latitude &&
                                touched.latitude &&
                                "p-invalid pb-1"
                                }`,
                              labelProps: {
                                text: translate(localeJson, "latitude"),
                                inputNumberLabelClassName: "block",
                                spanText: "*",
                                inputNumberLabelSpanClassName: "p-error"
                              },
                              inputNumberClassName: "w-full",
                              id: "latitude",
                              name: "latitude",
                              mode: "decimal",
                              maxFractionDigits: "10",
                              value: values.latitude,
                              onChange: (evt) => {
                                setFieldValue("latitude", evt.value);
                              },
                              onValueChange: (evt) => {
                                evt.value && setFieldValue("latitude", evt.value);
                              },
                              onBlur: handleBlur,
                            }} />
                            <ValidationError
                              errorBlock={
                                errors.latitude &&
                                touched.latitude &&
                                errors.latitude
                              }
                            />
                          </div>
                          <div className="lg:col-6 pt-0 pb-0 lg:pr-0 mt-2 mb-2 lg:mb-0 lg:mt-0 ">
                            <InputNumber inputNumberProps={{
                              inputNumberParentClassName: `${errors.longitude &&
                                touched.longitude &&
                                "p-invalid pb-1"
                                }`,
                              labelProps: {
                                text: translate(localeJson, "longitude"),
                                inputNumberLabelClassName: "block",
                                spanText: "*",
                                inputNumberLabelSpanClassName: "p-error"
                              },
                              inputNumberClassName: "w-full",
                              id: "longitude",
                              name: "longitude",
                              mode: "decimal",
                              maxFractionDigits: "10",
                              value: values.longitude,
                              onChange: (evt) => {
                                setFieldValue("longitude", evt.value);
                              },
                              onValueChange: (evt) => {
                                evt.value && setFieldValue("longitude", evt.value);
                              },
                              onBlur: handleBlur,
                            }} />
                            <ValidationError
                              errorBlock={
                                errors.longitude &&
                                touched.longitude &&
                                errors.longitude
                              }
                            />
                          </div>
                        </div>
                        <div className="modal-field-top-space modal-field-bottom-space">
                          <InputNumber inputNumberProps={{
                            inputNumberParentClassName: `${errors.altitude &&
                              touched.altitude &&
                              "p-invalid pb-1"
                              }`,
                            labelProps: {
                              text: translate(localeJson, "altitude"),
                              inputNumberLabelClassName: "block",
                              spanText: "*",
                              inputNumberLabelSpanClassName: "p-error"
                            },
                            inputNumberClassName: "w-full",
                            id: "altitude",
                            name: "altitude",
                            value: values.altitude,
                            mode: "decimal",
                            maxFractionDigits: "10",
                            onChange: (evt) => {
                              setFieldValue("altitude", evt.value);
                            },
                            onValueChange: (evt) => {
                              evt.value && setFieldValue("altitude", evt.value);
                            },
                            onBlur: handleBlur,
                          }} />
                          <ValidationError
                            errorBlock={
                              errors.altitude &&
                              touched.altitude &&
                              errors.altitude
                            }
                          />
                        </div>
                        <div className="lg:flex modal-field-top-space modal-field-bottom-space">
                          <div className="lg:col-7 pt-0 pb-0 mb-2 mt-2 lg:mb-0 lg:pl-0">
                            <Calendar calendarProps={{
                              calendarParentClassName: `${errors.opening_date &&
                                touched.opening_date &&
                                "p-invalid"
                                }`,
                              labelProps: {
                                text: translate(localeJson, 'opening_date_time'),
                                calendarLabelClassName: "block"
                              },
                              disabledDates: invalidDates,
                              date: values.opening_date,
                              calendarClassName: "w-full",
                              name: "opening_date",
                              dateClass: "w-full",
                              placeholder: "yyyy-mm-dd",
                              onChange: (evt) => {
                                setFieldValue(
                                  "opening_date",
                                  evt.target.value
                                );
                              },
                              onClearButtonClick: () => {
                                setFieldValue(
                                  "opening_date",
                                  null
                                );
                              },
                              onBlur: handleBlur,
                            }}
                            />
                          </div>
                          <div className="lg:col-5 mt-1 mb-2 lg:mt-0 lg:mb-0 pt-0 pb-0 lg:pr-0 flex align-items-end">
                            <Calendar calendarProps={{
                              calendarParentClassName: `lg:w-full ${errors.opening_time &&
                                touched.opening_time &&
                                "p-invalid"
                                }`,

                              date: values.opening_date,
                              calendarClassName: "w-full",
                              name: "opening_time",
                              onChange: handleChange,
                              onBlur: handleBlur,
                              disabled: !values.opening_date,
                              placeholder: "hh-mm",
                              timeOnly: true,
                              hourFormat: "24"
                            }}
                            />
                          </div>
                        </div>
                        <div className="lg:flex modal-field-top-space modal-field-bottom-space">
                          <div className="lg:col-7 pt-0 pb-0 mb-2 mt-0 lg:mb-0 lg:pl-0">
                            <ValidationError
                              errorBlock={
                                errors.opening_date &&
                                touched.opening_date &&
                                errors.opening_date
                              }
                            />
                          </div>
                          <div className="lg:col-5 mt-0 mb-2 lg:mt-0 lg:mb-0 pt-0 pb-0 lg:pr-0 flex align-items-end">
                            <ValidationError
                              errorBlock={
                                errors.opening_time &&
                                touched.opening_time &&
                                errors.opening_time
                              }
                            />
                          </div>
                        </div>
                        <div className="lg:flex modal-field-top-space modal-field-bottom-space">
                          <div className="lg:col-7 pt-0 pb-0 mb-2 mt-2 lg:mb-0 lg:pl-0">
                            <Calendar calendarProps={{
                              calendarParentClassName: `${errors.closing_date &&
                                touched.closing_date &&
                                "p-invalid "
                                }`,
                              labelProps: {
                                text: translate(localeJson, 'closing_date_time'),
                                calendarLabelClassName: "block"
                              },
                              disabledDates: invalidDates,
                              date: values.closing_date,
                              calendarClassName: "w-full",
                              name: "opening_date",
                              onChange: (evt) => {
                                setFieldValue(
                                  "closing_date",
                                  evt.target.value ? evt.target.value : ""
                                );
                              },
                              onClearButtonClick: () => {
                                setFieldValue(
                                  "closing_date",
                                  null
                                );
                              },
                              placeholder: "yyyy-mm-dd",
                              onBlur: handleBlur,
                            }}
                            />
                          </div>
                          <div className="lg:col-5 mt-1 mb-2 lg:mt-0 lg:mb-0 pt-0 pb-0 lg:pr-0 flex align-items-end">
                            <Calendar calendarProps={{
                              calendarParentClassName: `lg:w-full ${errors.closing_time &&
                                touched.closing_time &&
                                "p-invalid"
                                }`,
                              date: values.closing_date,
                              calendarClassName: "w-full",
                              name: "closing_time",
                              onChange: handleChange,
                              onBlur: handleBlur,
                              disabled: !values.closing_date,
                              placeholder: "hh-mm",
                              timeOnly: true,
                              hourFormat: "24"
                            }}
                            />
                          </div>
                        </div>
                        <div className="lg:flex modal-field-top-space modal-field-bottom-space">
                          <div className="lg:col-7 pt-0 pb-0 mb-2 mt-0 lg:mb-0 lg:pl-0">
                            <ValidationError
                              errorBlock={
                                errors.closing_date &&
                                touched.closing_date &&
                                errors.closing_date
                              }
                            />
                          </div>
                          <div className="lg:col-5 mt-0 mb-2 lg:mt-0 lg:mb-0 pt-0 pb-0 lg:pr-0 flex align-items-end">
                            <ValidationError
                              errorBlock={
                                errors.closing_time &&
                                touched.closing_time &&
                                errors.closing_time
                              }
                            />
                          </div>
                        </div>
                        <div className="modal-field-top-space modal-field-bottom-space">
                          <div className="lg:col-12">
                            <NormalLabel
                              text={translate(
                                localeJson,
                                "foreign_publication"
                              )}
                            />
                          </div>
                          <div className="lg:col-12">
                            <InputSwitch
                              inputSwitchProps={{
                                name: "public_availability",
                                checked: publicAvailabilityFlagValue,
                                switchClass: "",
                                onChange: (e) => {
                                  setPublicAvailabilityFlagValue(e.target.value);
                                  setFieldValue('public_availability', e.target.value);
                                },
                              }}
                              parentClass={`custom-switch ${errors.public_availability &&
                                touched.public_availability &&
                                "p-invalid pb-1"
                                }`}
                            />
                            <ValidationError
                              errorBlock={
                                errors.public_availability &&
                                touched.public_availability &&
                                errors.public_availability
                              }
                            />
                          </div>
                        </div>
                        <div className="modal-field-top-space modal-field-bottom-space">
                          <div className="pb-1 lg:col-12">
                            <NormalLabel
                              text={translate(localeJson, "status")}
                            />
                          </div>
                          <div className="lg:col-12">
                            <InputSwitch
                              inputSwitchProps={{
                                name: "active_flg",
                                checked: activeFlagValue,
                                switchClass: "",
                                disabled: default_place_id.includes(initialValues.place_id),
                                onChange: (e) => {
                                  setActiveFlagValue(e.target.value);
                                  setFieldValue('active_flg', e.target.value);
                                },
                              }}
                              parentClass={`custom-switch ${errors.active_flg &&
                                touched.active_flg &&
                                "p-invalid pb-1"
                                }`}
                            />
                          </div>
                        </div>
                        <div className="modal-field-top-space modal-field-bottom-space">
                          <Input
                            inputProps={{
                              inputParentClassName: `${errors.remarks && touched.remarks && "p-invalid pb-1"}`,
                              labelProps: {
                                text: translate(localeJson, 'remarks'),
                                inputLabelClassName: "block",
                              },
                              inputClassName: "w-full",
                              value: values.remarks,
                              onChange: handleChange,
                              onBlur: handleBlur,
                              id: "remarks",
                              name: "remarks",
                            }}
                          />
                          <ValidationError
                            errorBlock={
                              errors.remarks &&
                              touched.remarks &&
                              errors.remarks
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-12 lg:col-6 p-0 lg:pl-5 mt-5">
                      <GoogleMapComponent
                        height={"450px"}
                        initialPosition={{
                          lat: currentLattitude,
                          lng: currentLongitude,
                        }}
                        searchResult={searchResult}
                        mapScale={settings_data?.map_scale}
                      />
                      <div className="modal-field-top-space modal-field-bottom-space lg:flex">
                        <div className="lg:col-9 lg:pl-0 mb-3 lg:mb-0">
                          <Input
                            inputProps={{
                              inputParentClassName: 'custom_input',
                              labelProps: {
                                text: translate(localeJson, 'place_search'),
                                inputLabelClassName: "block",
                              },
                              inputClassName: "w-full",
                              value: searchQuery,
                              onChange: (e) => {
                                setSearchQuery(e.target.value);
                              },
                              onBlur: handleBlur,
                              id: "searchQuery",
                              name: "searchQuery",
                            }}
                          />
                        </div>
                        <div className="lg:col-3 lg:pr-0 flex align-items-end">
                          <Button
                            buttonProps={{
                              buttonClass:
                                "evacuation_button_height lg:search-button  lg:w-full mobile-input",
                              text: translate(localeJson, "search_text"),
                              icon: "pi pi-search",
                              severity: "primary",
                              type: "button",
                              onClick: (evt) => {
                                evt.preventDefault();
                                handleSearch(setFieldValue);
                              },
                            }} parentClass={"search-button"}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex pt-3 justify-content-start flex-wrap gap-3">
                    <div className="">
                      <Button
                        buttonProps={{
                          buttonClass: "w-8rem update-button",
                          type: "submit",
                          text: translate(localeJson, "update"),
                          rounded: "true",
                        }} parentClass={"update-button"}
                      />
                    </div>
                    <div className="">
                      <Button
                        buttonProps={{
                          buttonClass:
                            "w-8rem back-button",
                          type: "button",
                          text: translate(localeJson, "cancel"),
                          rounded: "true",
                          onClick: () => {
                            router.push("/admin/place");
                          },
                        }} parentClass={"back-button"}
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div >
        )
        }
      </Formik >
    </>
  );
}