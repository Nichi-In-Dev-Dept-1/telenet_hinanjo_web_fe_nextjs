import { useContext, useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { AiOutlineDrag } from "react-icons/ai";

import { LayoutContext } from "@/layout/context/layoutcontext";
import { convertToSingleByte, hideOverFlow, showOverFlow, getValueByKeyRecursively as translate } from "@/helper";
import {
  Button,
  CustomHeader,
  DND,
  InputFile,
  InputSwitch,
  NormalCheckBox,
  NormalLabel,
  ValidationError,
  Input,
  InputDropdown,
  InputNumber,
} from "@/components";
import { mapScaleRateOptions } from "@/utils/constant";
import { systemSettingServices } from "@/services";
import { setLayout } from "@/redux/layout";
import { useAppDispatch } from "@/redux/hooks";
import DbResetModal from "@/components/modal/dbResetModal";

export default function Setting() {
  const { localeJson, locale, setLoader } = useContext(LayoutContext);
  const dispatch = useAppDispatch();

  const [response, setResponse] = useState({});
  const [data, setData] = useState([]);
    const [deleteOpen, setDeleteOpen] = useState(false);
  const [initialValues, setInitialValues] = useState({
    map_scale: "",
    footer: "",
    type_name_ja: "",
    system_name_ja: "",
    disclosure_info_ja: "",
    type_name_en: "",
    system_name_en: "",
    disclosure_info_en: "",
    latitude: "",
    longitude: "",
    initial_load_status: false,
    default_shelf_life: "",
    scheduler_option: false,
    logo: "",
    logo_name: "",
    stockpile_management_status: false,
  }
  );

  const { getList, update, bulkDelete } = systemSettingServices;

  useEffect(() => {
    const fetchData = async () => {
      await onGetSystemListOnMounting();
      setLoader(false);
    };
    fetchData();
  }, [locale]);

  const public_display_order_data = [
    {
      is_visible: "0",
      column_id: "0",
      column_name: "refugee_name",
      display_order: 1,
    },
    {
      is_visible: "0",
      column_id: "1",
      column_name: "name",
      display_order: 2,
    },
    {
      is_visible: "0",
      column_id: "2",
      column_name: "age",
      display_order: 3,
    },
    {
      is_visible: "0",
      column_id: "3",
      column_name: "gender",
      display_order: 4,
    },
    {
      is_visible: "0",
      column_id: "4",
      column_name: "address",
      display_order: 5,
    },
  ];

  const schema = Yup.object().shape({
    map_scale: Yup.string().required(
      translate(localeJson, "map_scale_required")
    ),
    footer: Yup.string()
      .required(translate(localeJson, "footer_required"))
      .max(
        200,
        translate(localeJson, "footer_display") +
        translate(localeJson, "max_length_200")
      ),
    type_name_ja: Yup.string()
      .required(translate(localeJson, "type_name_jp_required"))
      .max(
        200,
        translate(localeJson, "type_name") +
        translate(localeJson, "max_length_200")
      ),
    system_name_ja: Yup.string()
      .required(translate(localeJson, "system_name_jp_required"))
      .max(
        200,
        translate(localeJson, "system_name") +
        translate(localeJson, "max_length_200")
      ),
    disclosure_info_ja: Yup.string()
      .nullable()
      .max(
        255,
        translate(localeJson, "disclosure_information") +
        translate(localeJson, "max_length_255")
      ),
    type_name_en: Yup.string()
      .required(translate(localeJson, "type_name_en_required"))
      .max(
        200,
        translate(localeJson, "type_name") +
        translate(localeJson, "max_length_200")
      ),
    system_name_en: Yup.string()
      .required(translate(localeJson, "system_name_en_required"))
      .max(
        200,
        translate(localeJson, "system_name") +
        translate(localeJson, "max_length_200")
      ),
    disclosure_info_en: Yup.string()
      .nullable()
      .max(
        255,
        translate(localeJson, "disclosure_information") +
        translate(localeJson, "max_length_255")
      ),
    latitude: Yup.number().required(translate(localeJson, "latitude_required")),
    default_shelf_life: Yup.string()
      .required(translate(localeJson, "default_shell_life_days_required"))
      .min(1, translate(localeJson, "default_shelf_life_min_length"))
      .max(3, translate(localeJson, "default_shelf_life_max_length")),
    longitude: Yup.number().required(
      translate(localeJson, "longitude_required")
    ),
    logo: Yup.mixed()
      .nullable()
      .test(
        "is-image",
        translate(localeJson, "logo_img_correct_format"),
        (value) => {
          if (!value) return true; // If no file is selected, the validation passes.
          const fileName = value.name;
          const fileExtension = fileName.split(".").pop().toLowerCase();
          const allowedExtensions = ["jpg", "jpeg", "png"];
          if (allowedExtensions.includes(fileExtension)) {
            // Check image size not exceeding 3MB
            return true
          }
          return false; // Return false for invalid input.
        }
      )
      .test(
        "is-image",
        translate(localeJson, "logo_img_not_greater_than_3mb"),
        (value) => {
          if (!value) return true; // If no file is selected, the validation passes.
          const fileName = value.name;
          const fileExtension = fileName.split(".").pop().toLowerCase();
          const allowedExtensions = ["jpg", "jpeg", "png"];
          if (allowedExtensions.includes(fileExtension)) {
            // Check image size not exceeding 3MB
            if (value.size <= 3 * 1024 * 1024) {
              return true; // Pass validation
            } else {
              // Custom error message for image size exceeded
              return false
            }
          }
          return false; // Return false for invalid input.
        }
      ),
  });

  const dragProps = {
    onDragEnd(fromIndex, toIndex) {
      const prepareData = [...data];
      const item = prepareData.splice(fromIndex, 1)[0];
      prepareData.splice(toIndex, 0, item);
      // Update display_order based on the new order
      prepareData.forEach((item, index) => {
        item.display_order = index + 1;
        item.column_id = index;
      });

      setData(prepareData);
    },
    nodeSelector: "li",
    handleSelector: "a",
  };

  const onGetSystemListOnMounting = async () => {
    getList(fetchData);
  };

  function fetchData(res) {
    if (res) {
      setLoader(true);
      const data = res.data.model;
      let url = data.image_logo_path;
      let initialValuesPayload = {};

      // Check if URL exists
      if (url) {
        const parts = url.split("/");
        const filename = parts[parts.length - 1]; // Extract filename from URL
        // Set the filename to initialValues.logo
        initialValuesPayload.logo_name = filename;
      }
      dispatch(setLayout(data));
      initialValuesPayload.map_scale = data?.map_scale + "" || "";
      initialValuesPayload.footer = data?.footer || "";
      initialValuesPayload.type_name_ja = data?.type_name_ja || "";
      initialValuesPayload.disclosure_info_ja = data?.disclosure_info_ja || "";
      initialValuesPayload.system_name_ja = data?.system_name_ja || "";
      initialValuesPayload.type_name_en = data?.type_name_en || "";
      initialValuesPayload.disclosure_info_en = data?.disclosure_info_en || "";
      initialValuesPayload.system_name_en = data?.system_name_en || "";
      initialValuesPayload.latitude = data?.latitude || "";
      initialValuesPayload.longitude = data?.longitude || "";
      initialValuesPayload.initial_load_status =
        data?.initial_load_status == "1" ? true : false || "";
      initialValuesPayload.stockpile_management_status = 
      data?.stockpile_management_status == "1" ? true : false || "";
      (initialValuesPayload.default_shelf_life = data?.default_shelf_life || ""),
        (initialValuesPayload.scheduler_option =
          data?.scheduler_option == "1" ? true : false || "");
      setInitialValues(initialValuesPayload);
      setLoader(false);
      let public_data = data?.public_display_order || public_display_order_data;
      const PublicData = public_data.map((item) => {
        let namePublic;
        if (item.column_name == "name") {
          namePublic = "name_kanji";
        } else if (item.column_name == "refuge_name") {
          namePublic = "name_phonetic";
        } else {
          namePublic = item.column_name;
        }
        return {
          title: translate(localeJson, namePublic),
          is_visible: item.is_visible,
          column_id: item.column_id,
          column_name: item.column_name,
          display_order: item.display_order,
        };
      });
      setData(PublicData);
      setResponse(data);
    }
  }

  const handleChange = (e, index) => {
    const newData = [...data]; // Create a copy of the data array
    newData[index].is_visible = e.checked; // Update the is_visible property in the copy
    setData(newData); // Update state with the modified data
  };

  const map = (
    <ol>
      {data?.map((item, index) => (
        <li key={index}>
          <NormalCheckBox
            checkBoxProps={{
              checked: item?.is_visible == 1 ? true : false,
              onChange: (e) => handleChange(e, index),
            }}
          />
          <div className="ml-1 mr-1">{item?.title}</div>
          <a href="#" className="ml-2 dragger-setting">
            <AiOutlineDrag />
          </a>
        </li>
      ))}
    </ol>
  );

  const isUpdated = (res) => {
    if (res) {
      onGetSystemListOnMounting();
    }
    setLoader(false);
  };

      const onConfirmDeleteRegisteredEvacuees = async () => {
          bulkDelete((res) => {
              if (res) {
                  setLoader(false);
              }
              else {
                  setLoader(false);
              }
  
          });
      }
    
    const openDeleteDialog = () => {
          setDeleteOpen(true);
          hideOverFlow();
      }
  
      const onDeleteClose = (status = '') => {
          if (status == 'confirm') {
              onConfirmDeleteRegisteredEvacuees();
          }
          setDeleteOpen(false);
          showOverFlow();
      };
  

  return (
    <>
     <DbResetModal
                    open={deleteOpen}
                    close={onDeleteClose}
                />
      <Formik
        validationSchema={schema}
        initialValues={initialValues}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          setLoader(true);
          values.default_shelf_life = convertToSingleByte(values.default_shelf_life);
          values.disclosure_info_ja = values.disclosure_info_ja ? values.disclosure_info_ja : null;
          values.disclosure_info_en = values.disclosure_info_en ? values.disclosure_info_en : null;
          const formData = new FormData();
          // Assuming values.initial_load_status and values.scheduler_option are boolean
          formData.append(
            "initial_load_status",
            values.initial_load_status ? "1" : "0"
          );
          formData.append(
            "stockpile_management_status",
            values.stockpile_management_status ? "1" : "0"
          );  
          formData.append(
            "scheduler_option",
            values.scheduler_option ? "1" : "0"
          );
          formData.append(
            "disclosure_info_ja",
            values.disclosure_info_ja ? values.disclosure_info_ja : ""
          );
          formData.append(
            "disclosure_info_en",
            values.disclosure_info_en ? values.disclosure_info_en : ""
          );

          for (const key in values) {
            if (
              values[key] &&
              key !== "disclosure_info_ja" &&
              key !== "disclosure_info_en" &&
              key !== "initial_load_status" &&
              key !== "scheduler_option" &&
              key !== "scheduler_option" &&
              key !== "logo_name" &&
              key !== "stockpile_management_status"
            ) {
              formData.append(key, values[key]);
            }
          }
          data.forEach((item, index) => {
            for (const key in item) {
              item.is_visible = item.is_visible == true ? "1" : "0";
              if (key !== "title") {
                formData.append(
                  `public_display_order[${index}][${key}]`,
                  item[key]
                );
              }
            }
          });

          update(formData, isUpdated);
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
          <div className="grid">
            <div className="col-12">
              <div className="card">
                <CustomHeader
                  headerClass={"page-header1"}
                  header={translate(localeJson, "setting_systems")}
                />
                <form onSubmit={handleSubmit}>
                  <div className="">
                    <div className="pb-1 pt-2">
                      <CustomHeader header={translate(localeJson, "general")} />
                    </div>
                    <div className="w-8 modal-field-top-space modal-field-bottom-space pl-5">
                      <div>
                        <InputDropdown
                          inputDropdownProps={{
                            inputDropdownParentClassName: `w-full ${errors.map_scale &&
                              touched.map_scale &&
                              "p-invalid pb-1"
                              }`,
                            labelProps: {
                              text: translate(
                                localeJson,
                                "overall_map_size_setting"
                              ),
                              inputDropdownLabelClassName: "block",
                            },
                            inputDropdownClassName: "w-full",
                            id: "map_scale",
                            name: "map_scale",
                            optionLabel: "name",
                            options: mapScaleRateOptions,
                            value: values.map_scale,
                            onChange: (e) => {
                              setFieldValue("map_scale", e.value || "");
                            },
                            onBlur: handleBlur,
                            emptyMessage: translate(
                              localeJson,
                              "data_not_found"
                            ),
                          }}
                        />
                        <ValidationError
                          errorBlock={
                            errors.map_scale &&
                            touched.map_scale &&
                            errors.map_scale
                          }
                        />
                      </div>
                      <div className="modal-field-top-space modal-field-bottom-space">
                        <Input
                          inputProps={{
                            inputParentClassName: `w-full ${errors.footer &&
                              touched.footer &&
                              "p-invalid pb-1"
                              }`,
                            labelProps: {
                              text: translate(localeJson, "footer_display"),
                              inputLabelClassName: "block",
                            },
                            inputClassName: "w-full",
                            value: values.footer,
                            onChange: handleChange,
                            onBlur: handleBlur,
                            name: "footer",
                          }}
                        />
                        <ValidationError
                          errorBlock={
                            errors.footer && touched.footer && errors.footer
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div>
                    <div className="pb-1">
                      <CustomHeader
                        header={translate(localeJson, "japanese_notation")}
                      />
                    </div>
                    <div className="w-8 modal-field-top-space modal-field-bottom-space pl-5">
                      <div className="">
                        <Input
                          inputProps={{
                            inputParentClassName: `w-full ${errors.type_name_ja &&
                              touched.type_name_ja &&
                              "p-invalid pb-1"
                              }`,
                            labelProps: {
                              text: translate(localeJson, "type_name"),
                              inputLabelClassName: "block",
                            },
                            inputClassName: "w-full",
                            onChange: handleChange,
                            onBlur: handleBlur,
                            name: "type_name_ja",
                            value: values.type_name_ja,
                          }}
                        />
                        <ValidationError
                          errorBlock={
                            errors.type_name_ja &&
                            touched.type_name_ja &&
                            errors.type_name_ja
                          }
                        />
                      </div>
                      <div className="modal-field-top-space modal-field-bottom-space">
                        <Input
                          inputProps={{
                            inputParentClassName: `w-full ${errors.system_name_ja &&
                              touched.system_name_ja &&
                              "p-invalid pb-1"
                              }`,
                            labelProps: {
                              text: translate(localeJson, "system_name"),
                              inputLabelClassName: "block",
                            },
                            inputClassName: "w-full",
                            onChange: handleChange,
                            onBlur: handleBlur,
                            name: "system_name_ja",
                            value: values.system_name_ja,
                          }}
                        />
                        <ValidationError
                          errorBlock={
                            errors.system_name_ja &&
                            touched.system_name_ja &&
                            errors.system_name_ja
                          }
                        />
                      </div>
                      <div className="modal-field-top-space modal-field-bottom-space">
                        <Input
                          inputProps={{
                            inputParentClassName: `w-full ${errors.disclosure_info_ja &&
                              touched.disclosure_info_ja &&
                              "p-invalid pb-1"
                              }`,
                            labelProps: {
                              text: translate(
                                localeJson,
                                "disclosure_information"
                              ),
                              inputLabelClassName: "block",
                            },
                            inputClassName: "w-full",
                            onChange: handleChange,
                            onBlur: handleBlur,
                            name: "disclosure_info_ja",
                            value: values.disclosure_info_ja,
                          }}
                        />
                        <ValidationError
                          errorBlock={
                            errors.disclosure_info_ja &&
                            touched.disclosure_info_ja &&
                            errors.disclosure_info_ja
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="">
                    <div className="pb-1">
                      <CustomHeader
                        header={translate(localeJson, "english_notation")}
                      />
                    </div>
                    <div className="w-8 modal-field-top-space modal-field-bottom-space pl-5">
                      <div>
                        <Input
                          inputProps={{
                            inputParentClassName: `w-full ${errors.type_name_en &&
                              touched.type_name_en &&
                              "p-invalid pb-1"
                              }`,
                            labelProps: {
                              text: translate(localeJson, "type_name"),
                              inputLabelClassName: "block",
                            },
                            inputClassName: "w-full",
                            onChange: handleChange,
                            onBlur: handleBlur,
                            name: "type_name_en",
                            value: values.type_name_en,
                          }}
                        />
                        <ValidationError
                          errorBlock={
                            errors.type_name_en &&
                            touched.type_name_en &&
                            errors.type_name_en
                          }
                        />
                      </div>
                      <div className="modal-field-top-space modal-field-bottom-space">
                        <Input
                          inputProps={{
                            inputParentClassName: `w-full ${errors.system_name_en &&
                              touched.system_name_en &&
                              "p-invalid pb-1"
                              }`,
                            labelProps: {
                              text: translate(localeJson, "system_name"),
                              inputLabelClassName: "block",
                            },
                            inputClassName: "w-full",
                            onChange: handleChange,
                            onBlur: handleBlur,
                            name: "system_name_en",
                            value: values.system_name_en,
                          }}
                        />
                        <ValidationError
                          errorBlock={
                            errors.system_name_en &&
                            touched.system_name_en &&
                            errors.system_name_en
                          }
                        />
                      </div>
                      <div className="modal-field-top-space modal-field-bottom-space">
                        <Input
                          inputProps={{
                            inputParentClassName: `w-full ${errors.disclosure_info_en &&
                              touched.disclosure_info_en &&
                              "p-invalid pb-1"
                              }`,
                            labelProps: {
                              text: translate(
                                localeJson,
                                "disclosure_information"
                              ),
                              inputLabelClassName: "block",
                            },
                            inputClassName: "w-full",
                            onChange: handleChange,
                            onBlur: handleBlur,
                            name: "disclosure_info_en",
                            value: values.disclosure_info_en,
                          }}
                        />
                        <ValidationError
                          errorBlock={
                            errors.disclosure_info_en &&
                            touched.disclosure_info_en &&
                            errors.disclosure_info_en
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="">
                    <div className="pb-1">
                      <CustomHeader
                        header={translate(localeJson, "map_center_coordinates")}
                      />
                    </div>
                    <div className="w-8 modal-field-top-space modal-field-bottom-space pl-5">
                      <div>
                        <InputNumber
                          inputNumberProps={{
                            inputNumberParentClassName: ` ${errors.latitude &&
                              touched.latitude &&
                              "p-invalid pb-1"
                              }`,
                            labelProps: {
                              text: translate(localeJson, "latitude"),
                              inputNumberLabelClassName: "block",
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
                          }}
                        />
                        <ValidationError
                          errorBlock={
                            errors.latitude &&
                            touched.latitude &&
                            errors.latitude
                          }
                        />
                      </div>
                      <div className="modal-field-top-space modal-field-bottom-space">
                        <InputNumber
                          inputNumberProps={{
                            inputNumberParentClassName: ` ${errors.longitude &&
                              touched.longitude &&
                              "p-invalid pb-1"
                              }`,
                            labelProps: {
                              text: translate(localeJson, "longitude"),
                              inputNumberLabelClassName: "block",
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
                              evt.value &&
                                setFieldValue("longitude", evt.value);
                            },
                            onBlur: handleBlur,
                          }}
                        />
                        <ValidationError
                          errorBlock={
                            errors.longitude &&
                            touched.longitude &&
                            errors.longitude
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="">
                    <div className="pb-3">
                      <CustomHeader
                        header={translate(
                          localeJson,
                          "public_information_display_list"
                        )}
                      />
                    </div>
                    <div className="w-8 pl-5">
                      <div className="flex">
                        <div className="pr-2">
                          <NormalLabel
                            text={translate(localeJson, "display_by_default")}
                          />
                        </div>
                        <div className="mt-0">
                          <InputSwitch
                            inputSwitchProps={{
                              name: "initial_load_status",
                              checked: values.initial_load_status,
                              onChange: handleChange,
                              switchClass: "",
                            }}
                            parentClass={"custom-switch"}
                          />
                        </div>
                      </div>
                      <div className="modal-field-top-space modal-field-bottom-space">
                        <div className="pb-1">
                          <NormalLabel
                            text={translate(
                              localeJson,
                              "display_items_setting"
                            )}
                          />
                        </div>
                        <div className="w-full">
                          <DND dragProps={dragProps}>{map}</DND>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="">
                    <div className="pb-1">
                      <CustomHeader
                        header={translate(localeJson, "stockPile_management")}
                      />
                    </div>
                    <div className="w-8 modal-field-top-space modal-field-bottom-space pl-5">
                    <div className="flex modal-field-bottom-space">
                        <div className="pr-2">
                          <NormalLabel
                            text={translate(localeJson, "display_by_default")}
                          />
                        </div>
                        <div className="mt-0">
                          <InputSwitch
                            inputSwitchProps={{
                              name: "stockpile_management_status",
                              checked: values.stockpile_management_status,
                              onChange: handleChange,
                              switchClass: "",
                            }}
                            parentClass={"custom-switch"}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex align-items-center">
                          <div style={{
                            flex: "1 1 50%"
                          }}>
                            <Input
                              inputProps={{
                                inputParentClassName: ` ${errors.default_shelf_life &&
                                  touched.default_shelf_life &&
                                  "p-invalid pb-1"
                                  }`,
                                labelProps: {
                                  text: translate(
                                    localeJson,
                                    "default_shelf_life_days"
                                  ),
                                  inputLabelClassName: "block",
                                },
                                inputClassName: "w-full",
                                id: "default_shelf_life",
                                name: "default_shelf_life",
                                maxFractionDigits: "1",
                                value: values.default_shelf_life,
                                onChange: (evt) => {
                                  if (evt.target.value == "") {
                                    setFieldValue("default_shelf_life", "");
                                    return
                                  }
                                  const re = /^[0-9-]+$/;
                                  if (re.test(convertToSingleByte(evt.target.value)))
                                    setFieldValue("default_shelf_life", evt.target.value);
                                },
                                onValueChange: (evt) => {
                                  if (evt.target.value == "") {
                                    setFieldValue("default_shelf_life", "");
                                    return
                                  }
                                  const re = /^[0-9-]+$/;
                                  if (re.test(convertToSingleByte(evt.target.value)))
                                    setFieldValue("default_shelf_life", evt.target.value);
                                },
                                onBlur: handleBlur,
                              }}
                            />
                          </div>
                          <div className="ml-2 mt-3" style={{
                            flex: "1 1 50%"
                          }}>
                            {translate(localeJson, "days_before")}
                          </div>
                        </div>
                        <ValidationError
                          errorBlock={
                            errors.default_shelf_life &&
                            touched.default_shelf_life &&
                            errors.default_shelf_life
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="">
                    <div className="pb-1">
                      <CustomHeader header={translate(localeJson, "logo")} />
                    </div>
                    <div className="w-8 modal-field-top-space modal-field-bottom-space pl-5">
                      <div className="pb-1">
                        <NormalLabel
                          text={translate(localeJson, "logo_image")}
                        />
                      </div>
                      <div>
                        <InputFile
                          inputFileProps={{
                            onChange: (event) => {
                              setFieldValue(
                                "logo",
                                event.currentTarget.files[0]
                              );
                            },
                            name: "logo",
                            accept: ".jpg,.png,.jpeg",
                            onBlur: handleBlur,
                            placeholder: values.logo_name
                          }}
                          parentClass={`${errors.logo && touched.logo && "p-invalid mb-1"
                            }`}
                        />
                        <ValidationError
                          errorBlock={
                            errors.logo && touched.logo && errors.logo
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="">
                    <div className="pb-2">
                      <CustomHeader
                        header={translate(
                          localeJson,
                          "evacuation_history_download"
                        )}
                      />
                    </div>
                    <div className="w-8 modal-field-top-space modal-field-bottom-space pl-5">
                      <div>
                        <InputSwitch
                          inputSwitchProps={{
                            name: "scheduler_option",
                            checked: values.scheduler_option,
                            onChange: handleChange,
                            switchClass: "",
                          }}
                          parentClass={"custom-switch"}
                        />
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className='flex flex-column mt-3 mb-2 justify-content-center align-items-center' style={{ justifyContent: "center", flexWrap: "wrap" }}>
                    <Button
                      buttonProps={{
                        buttonClass: "w-10rem update-button",
                        type: "submit",
                        text: translate(localeJson, "save"),
                      }}
                      parentClass={"inline update-button"}
                    />
                     <Button buttonProps={{
                                                                type: "button",
                                                                rounded: "true",
                                                                delete: true,
                                                                buttonClass: "w-10rem update-button",
                                                                text: translate(localeJson, 'db_reset'),
                                                                severity: "primary",
                                                                onClick: () => openDeleteDialog()
                                                            }} parentClass={"inline mt-3 update-button"} />
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </Formik>
    </>
  );
}