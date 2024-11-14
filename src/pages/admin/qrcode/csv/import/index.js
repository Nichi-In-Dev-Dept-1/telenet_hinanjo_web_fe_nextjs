import React, { useContext, useState, useRef, useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { getValueByKeyRecursively as translate, zipDownloadWithURL } from '@/helper'
import { LayoutContext } from '@/layout/context/layoutcontext';
import { Button, InputFile, ValidationError, CommonDialog, CustomHeader, AdminManagementDeleteModal } from '@/components';
import { QRCodeCreateServices } from '@/services';

export default function AdminQrCodeCreatePage() {
    const { localeJson, setLoader } = useContext(LayoutContext);

    const [initialValues, setInitialValues] = useState({
        file: null,
        updateFile:null,
    })
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [importFileData, setImportFileData] = useState("");
    const [qrCodeCreateDialogVisible, setQrCodeCreateDialogVisible] = useState(false);
    const [deleteObj, setDeleteObj] = useState(null);
    const [uploadFile,setUploadFile] = useState(null);
    const [disableBtn,setDisableBtn] = useState(false);
    const fileInputRef = useRef(null);
    const formRef = useRef(null);

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
            callImport(importFileData,(res)=>{
                onImportSuccess(res);
            // Reset the form after submission
            resetForm({ values: initialValues });
            } );
        }
    }

    /**
     * Import on success callback function
     * @param {*} response 
     */
    const onImportSuccess = (response) => {
        if (response) {
            if (window.location.origin === "https://rakuraku.nichi.in" || window.location.origin === "http://localhost:3000") {
            localStorage.setItem('batch_id', response.data.data.batch_id);
            }
            else {         
            setQrCodeCreateDialogVisible(true);
            }
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

    useEffect(()=>{
        let currentValue = localStorage.getItem("batch_id") || "";
        if(currentValue){
           setDisableBtn(true);
        }
        else {
            setDisableBtn(false);
        }
    },[localStorage.getItem("batch_id")])

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
                                                <div className='flex pb-2' style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
                                                    <Button buttonProps={{
                                                        type: 'button',
                                                        rounded: "true",
                                                        export: true,
                                                        text: translate(localeJson, 'download_sample_csv'),
                                                        onClick: () => callExport(),
                                                    }} parentClass={"export-button"} />
                                                </div>
                                            </div>
                                            <div>
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