import React, { useContext, useState, useRef, useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { getValueByKeyRecursively as translate, zipDownloadWithURL } from '@/helper'
import { LayoutContext } from '@/layout/context/layoutcontext';
import { Button, InputFile, ValidationError, CommonDialog, CustomHeader, AdminManagementDeleteModal, MultiSelect, Input } from '@/components';
import { QRCodeCreateServices } from '@/services';

export default function AdminQrCodeCreatePage() {
    const { localeJson, setLoader } = useContext(LayoutContext);

    const [initialValues, setInitialValues] = useState({
        file: null,
        updateFile:null,
        selectedBasicInfo:["name","address","tel","dob"],
        project_name:"らくらく避難所くん",
        name:"テレネット株式会社"
    })
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [importFileData, setImportFileData] = useState("");
    const [qrCodeCreateDialogVisible, setQrCodeCreateDialogVisible] = useState(false);
    const [deleteObj, setDeleteObj] = useState(null);
    const [uploadFile,setUploadFile] = useState(null);
    const [disableBtn,setDisableBtn] = useState(false);
    const fileInputRef = useRef(null);
    const formRef = useRef(null);
    const [batchId, setBatchId] = useState(localStorage.getItem("batch_id") || "");
    const translationOptions = [
        { label: translate(localeJson, "name"), value: 'name',disabled: true},
        { label: translate(localeJson, "address"), value: 'address' },
        { label: translate(localeJson, "tel"), value: 'tel' },
        { label: translate(localeJson, "dob"), value: 'dob' },
      ];

    const schema = Yup.object().shape({
        file: Yup.mixed()
            .required(translate(localeJson, 'file_csv_required'))
            .test('is-csv', translate(localeJson, 'select_csv_format'), (value) => {
                if (!value) return true; // If no file is selected, the validation passes.
                const allowedExtensions = ['csv']; // Define the allowed file extensions (in this case, just 'csv').
                const fileExtension = value.split('.').pop(); // Get the file extension from the file name.
                // Check if the file extension is in the list of allowed extensions.
                return allowedExtensions.includes(fileExtension.toLowerCase());
            })
            .test('record-limit', translate(localeJson,'file_max_records_check'), async (value) => {
                if (!value) return true; // If no file is selected, the validation passes.
            
                let updateFile = uploadFile;
                if (!updateFile) return true; // If no file is selected, the validation passes.
            
                if (!(updateFile instanceof File)) {
                    return false; // Reject if the value is not a file
                }
            
                const fileReader = new FileReader();
                return new Promise((resolve, reject) => {
                    fileReader.onload = (e) => {
                        const content = e.target.result;
                        const rows = content.split('\n').filter(row => row.trim() !== ''); // Ignore empty rows
                        if (rows.length > 1000) {
                            resolve(false)
                            reject('The file contains more than 1000 records.'); // Reject with error message
                        } else {
                            console.log('The file contains')
                            resolve(true); // Resolve the promise when the validation passes
                        }
                    };
                    fileReader.onerror = () => reject('File reading failed'); // In case of read error
                    fileReader.readAsText(updateFile);
                });
            }),
            name:Yup.string().max(25, translate(localeJson, "company_name_max_length")),
            project_name:Yup.string().max(25, translate(localeJson, "project_name_max_length")),
            
    });

    /* Services */
    const { callExport, callImport, callDelete, callZipDownload } = QRCodeCreateServices;

    /**
     * Import file
     * @param {*} e 
     */
    const onImportFile = (e,setFieldValue) => {
        
        if (e.currentTarget.files[0]) {
            const payload = new FormData();
            payload.append('csv_file', e.currentTarget.files[0]);
            setImportFileData(payload);
            setUploadFile(e.currentTarget.files[0])
            
        }
    }

    /**
     * Form on submit
     * @param {*} values 
     */
    const handleFormSubmit = async (values, { resetForm, setFieldValue }) => {
        if (importFileData) {
            setLoader(true);
        const updatedSelection = values.selectedBasicInfo.includes("name")
        ? values.selectedBasicInfo
        : ["name", ...values.selectedBasicInfo];
        updatedSelection.forEach((basicInfo) => {
            importFileData.append(`check_box[]`, basicInfo);
        });
           importFileData.append("project_name", values.project_name || "");
            importFileData.append("company_name", values.name || ""); // Append title_name (default to empty string if null)
            callImport(importFileData,(res)=>{
                onImportSuccess(res);
                let val = {
                    file: null,
                    updateFile:null,
                    selectedBasicInfo:["name","address","tel","dob"],
                    project_name:"らくらく避難所くん",
                    name:"テレネット株式会社"
                }
            // Reset the form after submission
            resetForm({ values: val });
            formRef?.current.setFieldValue("selectedBasicInfo",val.selectedBasicInfo)
            // setInitialValues(val);
            } );
        }
    }

    /**
     * Import on success callback function
     * @param {*} response 
     */
    const onImportSuccess = (response) => {
        if (response) {
            //if (window.location.origin === "https://rakuraku.nichi.in" || window.location.origin === "http://localhost:3000") {
            localStorage.setItem('batch_id', response.data.data.batch_id);
            // }
            // else {         
            // setQrCodeCreateDialogVisible(true);
            // }
        }
        setImportFileData("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setLoader(false);
    }

    /**
     * Close functionality
     * @param {*} response 
    */
    const onDeleteSuccess = (response) => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setLoader(false);
    };

    /**
     * Download functionality
    */
    const onZipDownloadSuccess = async (response) => {
        if (response && response.data.data.file) {
            await zipDownloadWithURL(response.data.data.file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setLoader(false);
    };

    const openDeleteDialog = (rowdata) => {
        setDeleteOpen(true);
    }

    const onDeleteClose = (status = '') => {
        if (status == 'confirm') {
            setLoader(true);
            callDelete(onDeleteSuccess)
        }
        setDeleteOpen(false);
    };

    useEffect(()=>{
       if(uploadFile) { 
        formRef.current.setTouched({ file: true });
        formRef.current.validateField("file");
       }
    },[uploadFile]);

    useEffect(() => {
        const interval = setInterval(() => {
            const currentBatchId = localStorage.getItem("batch_id");
            if (batchId !== currentBatchId) {
                setBatchId(currentBatchId);
                setDisableBtn(!!currentBatchId);
            }
        }, 500);
    
        return () => clearInterval(interval);
    }, [batchId]);

    return (
        <>
            {/* QR code create success modal */}
            <CommonDialog
                open={qrCodeCreateDialogVisible}
                dialogBodyClassName="p-3 text-center"
                header={translate(localeJson, 'qr_code_create')}
                content={translate(localeJson, 'create_qr_codes_successfully')}
                position={"center"}
                footerParentClassName={"text-center pt-5"}
                footerButtonsArray={[
                    {
                        buttonProps: {
                            buttonClass: "text-600 w-full",
                            bg: "bg-white",
                            hoverBg: "hover:surface-500 hover:text-white",
                            text: translate(localeJson, "delete"),
                            onClick: () => {
                                setQrCodeCreateDialogVisible(false);
                                openDeleteDialog([]);
                            },
                        },
                        parentClass: "block"
                    },
                    {
                        buttonProps: {
                            buttonClass: "mt-2 w-full",
                            type: "submit",
                            text: translate(localeJson, "download"),
                            severity: "danger",
                            onClick: () => {
                                setQrCodeCreateDialogVisible(false);
                                setLoader(true);
                                callZipDownload(onZipDownloadSuccess)
                            },
                        },
                        parentClass: "block"
                    }
                ]}
                close={() => {
                    setImportFileData("");
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                    setQrCodeCreateDialogVisible(false);
                }}
            />
            <AdminManagementDeleteModal
                open={deleteOpen}
                close={onDeleteClose}
                refreshList={() => { }}
                deleteObj={deleteObj}
            />
            <Formik
                innerRef={formRef}
                validationSchema={schema}
                initialValues={initialValues}
                onSubmit={handleFormSubmit}
            >
                {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleSubmit,
                    handleBlur,
                    setFieldValue
                }) => (
                    <div className="grid">
                        <div className="col-12">
                            <div className='card'>
                                <div className=''>
                                    <CustomHeader headerClass={"page-header1"} header={translate(localeJson, "qr_code_create")} />
                                </div>
                                <div>
                                    <div>
                                        <div>
                                            <div>
                                                <div className='flex pb-3' style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
                                                    <Button buttonProps={{
                                                        type: 'button',
                                                        rounded: "true",
                                                        export: true,
                                                        text: translate(localeJson, 'download_sample_csv'),
                                                        onClick: () => callExport(),
                                                    }} parentClass={"export-button"} />
                                                </div>
                                            </div>
                                            <div className='pb-3'>
                                                <InputFile inputFileProps={{
                                                    name: 'file',
                                                    inputFileStyle: { fontSize: "12px" },
                                                    onChange: (e) => {
                                                        handleChange(e);
                                                        onImportFile(e,setFieldValue);
                                                    },
                                                    value: values.file,
                                                    accept: '.csv',
                                                    ref: fileInputRef,
                                                    placeholder: translate(localeJson, 'default_csv_file_placeholder'),
                                                    handleBlur:handleBlur
                                                }} parentClass={`w-full bg-white ${errors.file && touched.file && 'p-invalid '}`} />
                                                <div className=''>
                                                    <ValidationError errorBlock={errors.file && touched.file && errors.file} />
                                                </div>
                                            </div>
                                            <div className='w-full flex lg:flex-row flex-column'>
                                            <div className='xl:w-5 lg:w-6 w-full'>
                                            <div className='pb-3'>
                                                 <MultiSelect
                                                                  multiSelectProps={{
                                                                    labelProps: {
                                                                      text: translate(localeJson, "qr_output_items"),
                                                                      inputMultiSelectLabelClassName: "block",
                                                                      labelMainClassName: "pb-1",
                                                                      spanText: "",
                                                                      inputMultiSelectLabelSpanClassName: " p-error",
                                                                    },
                                                                    multiSelectClassName: "xl:w-22rem lg:w-18rem md:w-full w-full h-40",
                                                                    float: false,
                                                                    floatLabelProps: {},
                                                                    value: values.selectedBasicInfo,
                                                                    options: translationOptions,
                                                                    defaultDisabledOption: "refugee_name", 
                                                                    selectAllLabel: translate(
                                                                      localeJson,
                                                                      "place_event_bulk_checkout_column_name"
                                                                    ),
                                                                    onChange: (e) => {
                                                                        setFieldValue("selectedBasicInfo",e.value);
                                                                    },
                                                                    placeholder: "",
                                                                  }}
                                                                />
                                            </div>
                                            <div className="pb-3">
                                                                      <Input
                                                                        inputProps={{
                                                                          inputParentClassName: `custom_input ${errors.project_name && touched.project_name && "p-invalid pb-1"}`,
                                                                          labelProps: {
                                                                            text: translate(localeJson, 'project_name'),
                                                                            inputLabelClassName: "block",
                                                                          },
                                                                          inputClassName: "xl:w-22rem lg:w-18rem md:w-full w-full h-40",
                                                                          value: values.project_name,
                                                                          onChange: handleChange,
                                                                          onBlur: handleBlur,
                                                                          id: "project_name",
                                                                          name: "project_name",
                                                                        }}
                                                                      />
                                                                      <ValidationError
                                                                        errorBlock={
                                                                          errors.project_name &&
                                                                          touched.project_name &&
                                                                          errors.project_name
                                                                        }
                                                                      />
                                                                    </div>
                                                                    <div className="">
                                                                      <Input
                                                                        inputProps={{
                                                                          inputParentClassName: `custom_input ${errors.name && touched.name && "p-invalid pb-1"}`,
                                                                          labelProps: {
                                                                            text: translate(localeJson, 'company_name'),
                                                                            inputLabelClassName: "block",
                                                                          },
                                                                          inputClassName: "xl:w-22rem lg:w-18rem md:w-full w-full h-40",
                                                                          value: values.name,
                                                                          onChange: handleChange,
                                                                          onBlur: handleBlur,
                                                                          id: "name",
                                                                          name: "name",
                                                                        }}
                                                                      />
                                                                      <ValidationError
                                                                        errorBlock={
                                                                          errors.name &&
                                                                          touched.name &&
                                                                          errors.name
                                                                        }
                                                                      />
                                                                    </div>
                                        
                                            <div className='flex my-3' style={{ justifyContent: "flex-start", flexWrap: "wrap" }}>
                                                <div>
                                                    <Button buttonProps={{
                                                        buttonClass: "evacuation_button_height import-button",
                                                        type: 'submit',
                                                        import: true,
                                                        disabled:disableBtn,
                                                        text: translate(localeJson, 'import'),
                                                        rounded: "true",
                                                        onClick: handleSubmit
                                                    }} parentClass={"import-button"} />
                                                </div>
                                            </div>
                                            </div>
                                            <div className="xl:w-7 lg:w-6 w-full">
                                <CustomHeader headerClass={"page-header1"} header={translate(localeJson, "imp_notes")} />
                                <div>
        {/* Full Name */}
        <div className="col-12 flex flex-wrap align-items-baseline">
          <strong>{translate(localeJson, "fullName_header")}：</strong>
          <p>{translate(localeJson, "fullName_message")}</p>
        </div>

        {/* Postal Code 1 */}
        <div className="col-12 flex flex-wrap align-items-baseline">
          <strong>{translate(localeJson, "postalCode1_header")}：</strong>
          <p>{translate(localeJson, "postalCode1_message")}</p>
        </div>

        {/* Postal Code 2 */}
        <div className="col-12 flex flex-wrap align-items-baseline">
          <strong>{translate(localeJson, "postalCode2_header")}：</strong>
          <p>{translate(localeJson, "postalCode2_message")}</p>
        </div>

        {/* Address */}
        <div className="col-12 flex flex-wrap align-items-baseline">
          <strong>{translate(localeJson, "address_notes_header")}：</strong>
          <p>{translate(localeJson, "address_notes_message")}</p>
        </div>

        {/* Phone Number */}
        <div className="col-12 flex flex-wrap align-items-baseline">
          <strong>{translate(localeJson, "phoneNumber_header")}：</strong>
          <p>{translate(localeJson, "phoneNumber_message")}</p>
        </div>

        {/* Date of Birth */}
        <div className="col-12 flex flex-wrap align-items-baseline">
          <strong>{translate(localeJson, "birthDate_header")}：</strong>
          <p>{translate(localeJson, "birthDate_message")}</p>
        </div>

        {/* Gender */}
        <div className="col-12 flex flex-wrap align-items-baseline">
          <strong>{translate(localeJson, "gender_notes_header")}：</strong>
          <p>{translate(localeJson, "gender_notes_message")}</p>
        </div>
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
    )
}