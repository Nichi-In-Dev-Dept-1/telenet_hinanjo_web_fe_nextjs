import React, { useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import * as Yup from "yup";
import { Formik } from "formik";

import { LayoutContext } from "@/layout/context/layoutcontext";
import {
  getValueByKeyRecursively as translate,
  getJapaneseDateDisplayYYYYMMDDFormat,
  hideOverFlow,
  showOverFlow,
  convertToSingleByte,
  splitJapaneseAddress
} from "@/helper";
import {
  Button,
  ToggleSwitch,
  NormalTable,
  ValidationError,
  CustomHeader,
  Input,
  InputDropdown,
  External
} from "@/components";
import { prefectures, prefectures_en, gender_jp, gender_en } from "@/utils/constant";
import { ExternalServices, CommonServices } from "@/services";

export default function PublicExternal() {
  const { locale, localeJson, setLoader } = useContext(LayoutContext);
  const router = useRouter();

  const [evacuee, setEvacuee] = useState([]);
  const [sortable, setSortable] = useState(false);
  const [registerModalAction, setRegisterModalAction] = useState("create");
  const [specialCareEditOpen, setSpecialCareEditOpen] = useState(false);
  const [evacueeValues, setEvacueeValues] = useState("");
  const [shelterData, setShelterData] = useState([]);
  const [toggleSwitchShelterComponents, setToggleSwitchShelterComponents] = useState([]);
  const [editObj, setEditObj] = useState({});
  const [invalidCounter, setInvalidCounter] = useState(100000000)
  const formikRef = useRef();

  /* Services */
  const { getActivePlaceList, create } = ExternalServices;
  const { getAddressFromZipCode, getZipCodeFromAddress } = CommonServices;

  // Getting storage data with help of reducers
  const [buttonStates, setButtonStates] = useState(Array(3).fill(false));
  const [foodButtonStates, setFoodButtonStates] = useState(
    Array(2).fill(false)
  );
  const [placeButtonStates, setPlaceButtonStates] = useState();
  const [addressCount, setAddressCount] = useState(0);
  const [fetchZipCode, setFetchedZipCode] = useState("");
  const [zipAddress, setZipAddress] = useState("");
  const [postalCodePrefectureId, setPostalCodePrefectureId] = useState(null);
  const [prefCount, setPrefCount] = useState(1)

  useEffect(() => {
    if( formikRef.current.values.postalCode != "" && formikRef.current.values.postalCode != null)
      {
    formikRef.current.setFieldValue(
      "postalCode",
      formikRef.current.values.postalCode
    );
    formikRef.current.setFieldTouched("postalCode", true);
    formikRef.current.validateField("postalCode");
  }
  }, [prefCount])

  useEffect(() => {
    if (evacueeValues !== "") {
      setEvacuee((prevEvacuee) => {
        const evacueeIndex = prevEvacuee.findIndex((evacuee) => evacuee.id === evacueeValues.id);

        if (evacueeIndex !== -1) {
          // Update existing evacuee
          const updatedEvacuee = [...prevEvacuee];
          updatedEvacuee[evacueeIndex] = evacueeValues;
          formikRef.current?.setFieldValue("evacuee", updatedEvacuee);
          return updatedEvacuee;
        } else {
          // Add new evacuee
          formikRef.current?.setFieldValue("evacuee", [...prevEvacuee, evacueeValues]);
          return [...prevEvacuee, evacueeValues];
        }
      });
    }
  }, [evacueeValues, setEvacuee]);

  useEffect(() => {
    getDataOnMount()
  }, [locale]);

  useEffect(() => {
    const newToggleSwitchComponents = shelterData.map((shelter, index) => {
      const onLabel = locale == 'ja' ? shelter.name : (shelter.name_en ?? shelter.name);
      const sliceLimit = locale == 'ja' ? 10 : 30;
      const offLabel = onLabel.length > sliceLimit ? (onLabel.slice(0, sliceLimit) + " ...") : onLabel;
      return (
        <ToggleSwitch
          key={shelter.id}
          className={"external-selector-button"}
          checked={placeButtonStates[index]} // Assuming placeButtonStates is an array of booleans
          onLabel={onLabel}
          offLabel={offLabel}
          parentClass={"w-15rem white-space-nowrap overflow-hidden text-overflow-ellipsis eli_button"}
          onChange={() => handlePlaceButtonClick(index)} // Assuming handleFoodButtonClick is your click handler
        />
      );
    });
    setToggleSwitchShelterComponents(newToggleSwitchComponents);
  }, [shelterData, placeButtonStates]); // Include other dependencies as needed


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

  useEffect(() => {
    formikRef.current.validateField("postalCode");
  }, [fetchZipCode])

  const initialValues = {
    evacuee: [],
    postalCode: "",
    prefecture_id: null,
    address: "",
    address2: "",
    email: "",
    specific_location:"",
    toggleSwitches: Array(3).fill(false),
    toggleFoodSwitches: Array(2).fill(false),
    togglePlaceSwitches: "",
  };

  const validationSchema = (localeJson) =>
    Yup.object().shape({
      toggleSwitches: Yup.array()
        .of(Yup.boolean())
        .test(
          "at-least-one-checked",
          translate(localeJson, "c_required"),
          (value) => value.includes(true)
        ),
      toggleFoodSwitches: Yup.array().test(
        "at-least-one-checked",
        translate(localeJson, "c_required"),
        (value, parent) => {
          if (parent.parent.toggleSwitches[0] === true) {
            return value.some((item) => item === true);
          } else {
            return true;
          }
        }
      ),
      togglePlaceSwitches: Yup.array().test(
        "at-least-one-checked",
        translate(localeJson, "c_required"),
        (value, parent) => {
          if (parent.parent.toggleSwitches[0] === true && parent.parent.toggleFoodSwitches[0] === true) {
            return value.some((item) => item === true);
          } else {
            return true;
          }
        }
      ),
      postalCode: Yup.string().nullable()
      .test("testPostalCode", translate(localeJson, "zip_code_mis_match"), 
      (value, context) => {
      const { prefecture_id } = context.parent;
      if (postalCodePrefectureId != null && prefecture_id != null) {
        return postalCodePrefectureId == prefecture_id
      }
      else return true
    
  })
        .min(7, translate(localeJson, "postal_code_length"))
        .max(7, translate(localeJson, "postal_code_length")),
      address: Yup.string().required(translate(localeJson, "address_required"))
        .max(190, translate(localeJson, "address_max_length")),
      address2: Yup.string()
        .nullable()
        .max(190, translate(localeJson, "address_max_length")),
      prefecture_id: Yup.string().nullable(),
      email: Yup.string()
        .test(
          "required-when-toggleSwitches-true",
          translate(localeJson, "email_required"),
          (value, parent) => {
            if (parent.parent.toggleSwitches[0] === true) {
              return !!value;
            } else {
              return true;
            }
          }
        )
        .email(translate(localeJson, "email_valid"))
        .matches(
          /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
          translate(localeJson, "email_valid")
        ),
      evacuee: Yup.array()
        .test(
          "evacuee-required-when-toggleSwitches-true",
          translate(localeJson, "c_required"),
          (value, parent) => {
            if (parent.parent.toggleSwitches[0] === true) {
              return value.length > 0;
            } else {
              return true;
            }
          }
        )
        .test(
          "evacuee-max-length",
          translate(localeJson, "table_count_max"), // Change this message as needed
          (value, parent) => {
            if (parent.parent.toggleSwitches[0] === true) {
              return value.length <= 20;
            } else {
              return true;
            }
          }
        ),
        specific_location: Yup.string().nullable().test(
          "required-when-toggleSwitches-true",
          translate(localeJson, "c_required"),
          (value, parent) => {
            if (parent.parent.toggleSwitches[1] === true || parent.parent.toggleSwitches[2] === true) {
              return !!value;
            } else {
              return true;
            }
          }
        ).max(255, translate(localeJson, "specified_loc_max_len")),
    });


  const handleFoodButtonClick = (index) => {
    const newButtonStates = [...foodButtonStates];
    newButtonStates.fill(false); // Uncheck all buttons
    newButtonStates[index] = true; // Check the clicked button
    formikRef.current?.setFieldValue("toggleFoodSwitches", newButtonStates);

    setFoodButtonStates(newButtonStates);
  };

  const handleButtonClick = (index) => {
    // formikRef.current.setTouched({});
    const newButtonStates = [...buttonStates];
    newButtonStates.fill(false); // Uncheck all buttons
    newButtonStates[index] = true; // Check the clicked button
    formikRef.current.setFieldValue("toggleSwitches", newButtonStates);
    setButtonStates(newButtonStates);
  };

  const handlePlaceButtonClick = (index) => {
    const newButtonStates = [...placeButtonStates];
    newButtonStates.fill(false); // Uncheck all buttons
    newButtonStates[index] = true; // Check the clicked button
    formikRef.current.setFieldValue("togglePlaceSwitches", newButtonStates);
    setPlaceButtonStates(newButtonStates);
  }

  const toggleSwitchComponents = buttonStates.map((checked, index) => {
    const offLabel =
      index === 0
        ? translate(localeJson, "within_city")
        : index === 1
          ? translate(localeJson, "city_outskirts")
          : translate(localeJson, "outside_prefecture");
    return (
      <ToggleSwitch
        key={index}
        className={"external-selector-button"}
        checked={checked}
        onLabel={offLabel}
        offLabel={offLabel}
        parentClass={"w-15rem"}
        onChange={() => handleButtonClick(index)}
      />
    );
  });

  const toggleSwitchFoodComponents = foodButtonStates.map((checked, index) => {
    const offLabel =
      index === 0
        ? translate(localeJson, "c_yes")
        : translate(localeJson, "c_no");
    return (
      <ToggleSwitch
        key={index}
        className={"external-selector-button"}
        checked={checked}
        onLabel={offLabel}
        style={{ fontSize: "16px" }}
        offLabel={offLabel}
        parentClass={"w-15rem"}
        onChange={() => handleFoodButtonClick(index)}
      />
    );
  });

  const cols = [
    {
      field: "id",
      header: translate(localeJson, "supplies_slno"),
      headerClassName: "custom-header",
      className: "sno_class",
    },
    {
      field: 'name', header: translate(localeJson, 'c_name'), sortable: true, alignHeader: "left",
      body: (rowData) => {
        return <div className="flex flex-column">
          <div className={"text-highlighter-user-list"}>
            {rowData.name_kanji}
          </div>
          <div className={"clickable-row"}>
            {rowData.name}
          </div>
        </div>
      },
      minWidth: locale === "ja" ? "5rem" : "5rem",
      width: "5rem",
    },
    {
      field: "dob",
      header: translate(localeJson, "c_dob"),
      headerClassName: "custom-header",
      body: (rowData) => {
        const date = locale === 'ja' ? getJapaneseDateDisplayYYYYMMDDFormat(new Date(rowData.dob)) : rowData.dob;

        return <span>{date}</span>;
      },
      minWidth: "3rem",
      maxWidth: "3rem",
      width: "3rem",
    },
    {
      field: "age",
      header: translate(localeJson, "c_age"),
      headerClassName: "custom-header",
      textAlign: "center",
      alignHeader: "center",
      minWidth: "3rem",
      maxWidth: "3rem",
      width: "3rem",
    },
    {
      field: "gender",
      header: translate(localeJson, "c_gender"),
      minWidth: "3rem",
      maxWidth: "3rem",
      width: "3rem",
      headerClassName: "custom-header",
      body: (rowData) => {
        const genderOptions = locale === 'ja' ? gender_jp : gender_en;
        const selectedGenderOption = genderOptions.find(option => option.value === rowData.gender);
        const displayedGenderName = selectedGenderOption ? selectedGenderOption.name : 'Unknown';

        return <span>{displayedGenderName}</span>;
      },
    },
    {
      field: "actions",
      header: translate(localeJson, "common_action"),
      textAlign: "center",
      className: "action_class",
      body: (rowData) => (
        <div>
          <Button
            parentStyle={{ display: "inline" }}
            buttonProps={{
              type: "button",
              text: translate(localeJson, "edit"),
              buttonClass: "edit-button",
              onClick: () => {
                setRegisterModalAction("edit");
                setSpecialCareEditOpen(true);
                hideOverFlow();
                let dob = new Date(rowData.dob)
                let currentData = {
                  id: rowData.id,
                  name: rowData.name,
                  name_kanji: rowData.name_kanji,
                  dob: dob,
                  age: rowData.age,
                  gender: rowData.gender
                }
                setEditObj(currentData)
              },
            }} parentClass={"edit-button"}
          />
          <Button
            parentStyle={{ display: "inline" }}
            buttonProps={{
              type: "button",
              text: translate(localeJson, "delete"),
              buttonClass: "ml-2 delete-button",
              onClick: () => {
                setEvacuee((prevEvacuee) => {
                  let updated = prevEvacuee.filter((evacuee) => evacuee.id !== rowData.id)
                  formikRef.current?.setFieldValue("evacuee", updated);
                  return updated
                });
              }
            }}
            parentClass={"delete-button"}

          />
        </div>
      ),
    },
  ];

  const getDataOnMount = () => {
    getActivePlaceList(isActivePlaces)
  }

  const isActivePlaces = (res) => {
    const data = res.data.model.list
    const filteredData = data.filter(item => item.active_flg == 1);
    formikRef.current.setFieldValue("togglePlaceSwitches", Array(filteredData.length).fill(false));
    setShelterData(filteredData)
    setPlaceButtonStates(Array(filteredData.length).fill(false))
  }

  const isCreated = (res) => {
    if (res) {
      router.push('/user/external/success');
    }
    setLoader(false)
  }

  return (
    <div>
      <External
        open={specialCareEditOpen}
        header={translate(
          localeJson,
          registerModalAction == "create"
            ? "enter_evacuee_event_registration"
            : "enter_evacuee_event_info_edit"
        )}
        close={() => {
          setSpecialCareEditOpen(false)
          showOverFlow();
        }}
        editObj={editObj}
        buttonText={translate(
          localeJson,
          registerModalAction == "create" ? "submit" : "update"
        )}
        setEvacueeValues={setEvacueeValues}
        evacuee={evacuee}
        registerModalAction={registerModalAction}
      />
      <Formik
        innerRef={formikRef}
        validationSchema={validationSchema(localeJson)}
        initialValues={initialValues}
        enableReinitialize
        onSubmit={(values) => {
          let data = values
          let getTrueIndex = (toggleArray) => {
            for (let i = 0; i < toggleArray.length; i++) {
              if (toggleArray[i]) {
                return i + 1;
              }
            }
            return 0; // Default value if no true found
          };
          let placeCategory = getTrueIndex(data.toggleSwitches);
          let hinan_obj = {};
          if (getTrueIndex(data.toggleFoodSwitches) == 1) {
            hinan_obj = { hinan_id: shelterData[getTrueIndex(data.togglePlaceSwitches) - 1].id };
          }
          let postal_code = data.postalCode ? convertToSingleByte(data.postalCode) : "";
          let fullPayload = {
            "place_category": placeCategory,
            "postal_code": postal_code ? postal_code.replace(/-/g, '') : "",
            "prefecture_id": data.prefecture_id,
            "address": data.address+data?.address2,
            "address_default": data.address2,
            "email": data.email,
            "place_detail": data.specific_location,
            "person": data.evacuee.map((evacuee) => ({
              "name": evacuee.name,
              "name_kanji": evacuee.name_kanji,
              "dob": evacuee.dob.replace(/-/g, '/'),
              "age": evacuee.age,
              "gender": evacuee.gender
            }))
          }
          let convertedPayload = placeCategory === 1 ? {
            ...fullPayload,
            //on backend they are accepting food_not_required 0 and food_required 1
            "food_required": (getTrueIndex(data.toggleFoodSwitches) == 2) ? 0 : 1,
            ...hinan_obj,
          } :
            {
              ...fullPayload,
            };
          setLoader(true)
          create(convertedPayload, isCreated)
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
          <div className="grid justify-content-center">
            <div className="col-12  sm:col-12 md:col-10 lg:col-10  mdScreenMaxWidth xlScreenMaxWidth mt-3">
              <div className="card">
                <div style={{ fontSize: "21px", fontWeight: "bold" }}>
                  {translate(localeJson, "public_external")}
                </div>
                <div className="mt-4">
                  <CustomHeader headerClass="font-bold" header={translate(localeJson, "not_visiting_the_shelter")} />
                  <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                      <div className="custom-label pb-1">
                        <label className="font-bold">
                          {translate(localeJson, "which_place_Are_you_planning_to_evacuate")}
                          <span className="p-error">
                            *
                          </span>
                        </label>
                      </div>
                      <div className=" flex flex-wrap justify-content-start gap-3">
                        {toggleSwitchComponents}
                      </div>
                      <ValidationError
                        errorBlock={
                          errors.toggleSwitches &&
                          touched.toggleSwitches &&
                          errors.toggleSwitches
                        }
                      />
                    </div>
                    {values.toggleSwitches[0] == true && (
                      <div className="mt-4">
                        <div className="custom-label pb-1">
                          <label className="font-bold">
                            {translate(localeJson, "assistance_respect_food")}
                            <span className="p-error">
                              *
                            </span>
                          </label>
                        </div>
                        <div className=" flex flex-wrap justify-content-start gap-3 mb-3">
                          {toggleSwitchFoodComponents}
                        </div>
                        <ValidationError
                          errorBlock={
                            errors.toggleFoodSwitches &&
                            touched.toggleFoodSwitches &&
                            errors.toggleFoodSwitches
                          }
                        />
                        {values.toggleFoodSwitches[0] && (
                          <div className="mt-4">
                            <CustomHeader headerClass={"font-bold"} header={translate(localeJson, "shelter_question")} requiredSymbol={true} />
                            <div className=" flex flex-wrap justify-content-start gap-3">
                              {toggleSwitchShelterComponents}
                            </div>
                            <ValidationError
                              errorBlock={
                                errors.togglePlaceSwitches &&
                                touched.togglePlaceSwitches &&
                                errors.togglePlaceSwitches
                              }
                            />
                          </div>
                        )}
                      </div>
                    )}
                     {(values.toggleSwitches[1] == true ||
                      values.toggleSwitches[2] == true) && (
                        <div className="mt-4">
                            <Input
                              inputProps={{
                                spanText: "*",
                                name: "specific_location",
                                spanClass: "p-error",
                                value: values.specific_location,
                                onChange: handleChange,
                                onBlur: handleBlur,
                                labelProps: {
                                  text: translate(
                                    localeJson,
                                    "out_side_city_question"
                                  ),
                                  spanText: "*",
                                  inputLabelClassName: "block font-bold",
                                  inputLabelSpanClassName: "p-error",
                                  labelMainClassName: "pb-2",
                                },
                                inputClassName: "w-full",
                                inputClass:
                                  "w-full lg:w-25rem md:w-23rem sm:w-21rem ",
                              }}
                              
                              parentClass={`${
                                errors.specific_location &&
                                touched.specific_location &&
                                "p-invalid pb-1"
                              }`}
                            />
                            <ValidationError
                              errorBlock={
                                errors.specific_location &&
                                touched.specific_location &&
                                errors.specific_location
                              }
                            />
                          </div>
                    )}
                    {/* Common part start */}
                    {
                      (values.toggleSwitches[0] ||
                        values.toggleSwitches[1] ||
                        values.toggleSwitches[2]) && (
                        <div>
                          <div className="pb-3 mt-5">
                            <NormalTable
                              lazy
                              onSort={(data) => {
                                setSortable(!sortable);
                                if (data.sortField == 'name') {
                                  let ind = 1;
                                  setEvacuee(evacuee.sort((a, b) => {
                                    if (sortable) {
                                      return a.name.localeCompare(b.name)
                                    }
                                    return b.name.localeCompare(a.name)
                                  }).map((obj, index) => ({ ...obj, id: index + 1 })));
                                }
                              }}
                              totalRecords={5}
                              stripedRows={true}
                              className={"custom-table-cell"}
                              tableStyle={{ width: "100%" }}
                              showGridlines={"true"}
                              value={evacuee}
                              columns={cols}
                              paginator={false}
                              paginatorLeft={false}
                              emptyMessage={translate(localeJson, "external_table_count_message")}
                            />
                            <ValidationError
                              errorBlock={
                                errors.evacuee &&
                                touched.evacuee &&
                                errors.evacuee
                              }
                            />
                          </div>
                          <div
                            className="mb-5"
                          >
                            <Button
                              buttonProps={{
                                type: "button",
                                rounded: "true",
                                buttonClass: "update-button-white w-full",
                                text: translate(
                                  localeJson,
                                  "external_add_evacuee"
                                ),
                                icon: "pi pi-plus",
                                onClick: () => {
                                  setRegisterModalAction("create");
                                  setSpecialCareEditOpen(true);
                                  hideOverFlow();
                                },
                              }}
                              parentClass={"mr-1 mt-1 update-button-white"}
                            />
                          </div>
                          <div className="my-1">
                            <div className="mb-3">
                              <label className="font-bold">
                                {translate(localeJson, "enter_current_address")}
                              </label>
                            </div>
                          </div>
                          <div className="mt-1 grid">
                            <div className="col-12 md:col-4">
                              <Input
                                inputProps={{
                                  inputParentClassName: `w-full custom_input ${errors.postalCode && touched.postalCode && 'p-invalid pb-1'}`,
                                  labelProps: {
                                    text: translate(localeJson, 'c_postal_code'),
                                    inputLabelClassName: "block",
                                    spanText: "",
                                    inputLabelSpanClassName: "p-error"
                                  },
                                  maxLength: 7,
                                  inputClassName: "w-full",
                                  id: "postalCode",
                                  name: "postalCode",
                                  inputMode: "numeric",
                                  value: values.postalCode,
                                  onChange: (evt) => {
                                    const re = /^[0-9-]+$/;
                                    let val;
                                    if (
                                      evt.target.value === "" ||
                                      re.test(convertToSingleByte(evt.target.value))
                                    ) {
                                      val = evt.target.value.replace(/-/g, ""); // Remove any existing hyphens
                                      if (val.length > 3) {
                                        val =
                                          val.slice(0, 3) + val.slice(3);
                                      }
                                      setFieldValue("postalCode", val);
                                      setFetchedZipCode(val)
                                    }
                                    if (val.length >= 7) {
                                      let payload = convertToSingleByte(val.slice(0, 3) + val.slice(3));
                                      getAddressFromZipCode(payload, (response) => {
                                        if (response) {
                                          let address = response;
                                          setZipAddress(response);
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
                                          setPostalCodePrefectureId(selectedPrefecture?.value);
                                          setFieldValue(
                                            "address",
                                            address.address2 +
                                            (address.address3 || "")
                                          );
                                        } else {
                                          setFieldValue("prefecture_id", "");
                                          setFieldValue("address", "");
                                          setPostalCodePrefectureId("");
                                        }
                                      });
                                    }
                                  },
                                  onBlur: handleBlur,
                                }}
                              />
                              <ValidationError
                                errorBlock={
                                  errors.postalCode &&
                                  touched.postalCode &&
                                  errors.postalCode
                                }
                              />
                            </div>
                            <div className="col-12 md:col-4">
                              <InputDropdown inputDropdownProps={{
                                inputDropdownParenClassName: `custom_input ${errors.prefecture_id && touched.prefecture_id && 'p-invalid pb-1'}`,
                                labelProps: {
                                  text: translate(localeJson, 'prefecture_places'),
                                  inputDropdownLabelClassName: "block",
                                  inputDropdownLabelSpanClassName: "p-error",
                                  spanText: ""
                                },
                                inputDropdownClassName: "w-full",
                                className: "w-full",
                                name: "prefecture_id",
                                value: values.prefecture_id,
                                options: locale == "ja" ? prefectures : prefectures_en,
                                optionLabel: "name",
                                onBlur: handleBlur,
                                emptyMessage: translate(localeJson, "data_not_found"),
                                onChange: (evt) => {
                                  setFieldValue("prefecture_id", evt.target.value);
                                  if (values.postalCode) {
                                    let payload = convertToSingleByte(values.postalCode);
                                    getAddressFromZipCode(
                                      payload, (res) => {
                                        if (res && res.prefcode != evt.target.value) {
                                          setPostalCodePrefectureId(res.prefcode);
                                          setFieldValue("prefecture_id", res.prefcode);
                                          // setPrefCount(prefCount+1)
                                          // setErrors({ ...errors, postal_code: translate(localeJson, "zip_code_mis_match"), });
                                        }
                                        // validateForm();
                                      })
                                  }
                                },
                                // onChange: (evt) => {
                                //   setFieldValue("prefecture_id", evt.target.value);
                                //   if (values.address) {
                                //     setAddressCount(addressCount + 1)
                                //   }
                                // },
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
                            <div className="col-12 md:col-4">
                              <Input
                                inputProps={{
                                  inputParentClassName: `w-full custom_input ${errors.address && touched.address && 'p-invalid pb-1'}`,
                                  labelProps: {
                                    text: translate(localeJson, 'address'),
                                    inputLabelClassName: "block",
                                    spanText: "*",
                                    inputLabelSpanClassName: "p-error"
                                  },
                                  inputClassName: "w-full",
                                  id: "address",
                                  name: "address",
                                  value: values.address,
                                  onBlur: handleBlur,
                                  onChange: (evt) => {
                                    setFieldValue("address", evt.target.value)
                                    // setAddressCount(addressCount + 1)
                                  },
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
                            <div className="col-12 mb-2">
                              <Input
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
                                  placeholder: translate(
                                    localeJson,
                                    "house_name_number"
                                  ),
                                  onChange: (evt) => {
                                    setFieldValue("address2", evt.target.value)
                                    // setAddressCount(addressCount + 1)
                                  },
                                  onBlur: handleBlur,
                                }}
                              />
                              <ValidationError
                                errorBlock={
                                  errors.address2 &&
                                  touched.address2 &&
                                  errors.address2
                                }
                              />
                            </div>
                          </div>
                          <div className="mb-2 grid">
                            <div className="col-12">
                              <Input
                                inputProps={{
                                  inputParentClassName: `${errors.email && touched.email && 'p-invalid pb-1'}`,
                                  labelProps: {
                                    text: translate(localeJson, 'mail_address_for_reference'),
                                    inputLabelClassName: "block",
                                    spanText: "*",
                                    inputLabelSpanClassName: "p-error"
                                  },
                                  inputClassName: "w-full ",
                                  id: "email",
                                  name: "email",
                                  value: values.email,
                                  onChange: handleChange,
                                  onBlur: handleBlur,
                                }}
                              />
                              <ValidationError
                                errorBlock={
                                  errors.email && touched.email && errors.email
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )
                    }
                    {/* Common part end */}
                    <div className="mt-3">
                      <Button
                        buttonProps={{
                          type: "submit",
                          buttonClass: "primary-button w-full",
                          text: translate(localeJson, "continue"),
                        }} parentClass={"primary-button"}
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </Formik>
    </div>
  );
}