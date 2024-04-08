import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';

import { hideOverFlow, showOverFlow, getValueByKeyRecursively as translate } from '@/helper';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { Button, CustomHeader, Input, NormalTable } from '@/components';
import { AdminManagementDeleteModal, AdminManagementDetailModal, AdminManagementImportModal } from '@/components/modal';
import { AdminManagementServices } from '@/services'
import AdminManagementCreateEditModal from '@/components/modal/adminManagementCreateEditModal';
import { CommonServices } from '@/services';
import { useAppSelector } from "@/redux/hooks";

export default function AdminManagementPage() {
    // Global variant
    const { localeJson, locale, setLoader } = useContext(LayoutContext);
    const AuthReducer = useAppSelector((state) => state.authReducer);

    // Local variant
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteObj, setDeleteObj] = useState(null);
    const [editStaffOpen, setEditStaffOpen] = useState(false);
    const [registerModalAction, setRegisterModalAction] = useState('');
    const [detailOpen, setDetailOpen] = useState(false);
    const [currentObj, setCurrentObj] = useState({});
    const [columnValues, setColumnValues] = useState([]);
    const [searchField, setSearchField] = useState('');
    const [detailId, setDetailId] = useState(null);
    const [listPayload, setListPayload] = useState({
        "filters": {
            "start": "0",
            "limit": 10,
            "sort_by": "updated_at",
            "order_by": "desc"
        },
        "search": ""
    });
    const [totalCount, setTotalCount] = useState(0);
    const [tableLoading, setTableLoading] = useState(false);
    const { decryptPassword } = CommonServices;
    const PasswordColumn = ({ rowData }) => {
        const [showPassword, setShowPassword] = useState(false);
        return (
            <span
                onMouseEnter={() => setShowPassword(true)}
                onMouseLeave={() => setShowPassword(false)}
            >
                {showPassword ? rowData.password : "********"}
            </span>
        );
    };

    const columnNames = [
        { field: 'slno', header: translate(localeJson, 'header_slno'), className: "sno_class", textAlign: "center" },
        {
            field: 'name', header: translate(localeJson, 'name'), minWidth: "5rem", maxWidth: "5rem",
            body: (rowData) => (
                <p className='text-link-class clickable-row' onClick={(e) => {
                    e.preventDefault();
                    setDetailId(rowData['id']);
                    setDetailOpen(true);
                    hideOverFlow();
                }}>
                    {rowData['name']}
                </p>
            )
        },
        { field: 'username', header: translate(localeJson, 'userId'), minWidth: "5rem", maxWidth: "5rem" },
        {
            field: 'password',
            header: translate(localeJson, 'password'),
            body: (rowData) => {
                return <PasswordColumn rowData={rowData} />
            },
            minWidth: "5rem", maxWidth: "5rem"
        },
        {
            field: 'actions',
            header: translate(localeJson, 'common_action'),
            textAlign: "center",
            alignHeader: "center",
            className: "action_class",
            body: (rowData) => (
                <div>
                    <Button
                        parentStyle={{ display: "inline" }}
                        buttonProps={{
                            text: translate(localeJson, 'edit'),
                            buttonClass: "edit-button",
                            onClick: () => {
                                setCurrentObj(rowData);
                                setRegisterModalAction("edit")
                                setEditStaffOpen(true);
                                hideOverFlow();
                            }
                        }} parentClass={"edit-button"} />
                    <Button
                        parentStyle={{ display: "inline" }}
                        buttonProps={{
                            text: translate(localeJson, 'delete'),
                            buttonClass: "delete-button ml-2",
                            disabled: rowData?.id == AuthReducer?.admin?.user?.id,
                            onClick: () => {
                                openDeleteDialog(rowData)
                            }
                        }} parentClass={"delete-button"} />
                </div>
            ),
        }
    ];

    const onImportModalClose = () => {
        setImportModalOpen(false);
        showOverFlow();
    };

    const onStaffEditClose = () => {
        setEditStaffOpen(false);
        showOverFlow();
    };

    const onRegister = () => {
        setEditStaffOpen(false);
        hideOverFlow();
    };

    const importFileApi = (file) => {
        const formData = new FormData();
        formData.append('file', file);
        AdminManagementServices.importData(formData, (response) => {
            if (response) {
                setTableLoading(true);
                listApiCall();
            }
        });
        onImportModalClose();
    }

    useEffect(() => {
        setTableLoading(true);
        const fetchData = async () => {
            await listApiCall();
        };
        fetchData();
    }, [locale, listPayload]);

    const listApiCall = async () => {
        setTableLoading(true);
        await AdminManagementServices.getList(listPayload, (response) => {
            var tempList = [];
            var listTotalCount = 0;
            if (response && response?.success && !_.isEmpty(response?.data) && response?.data?.model?.total > 0) {
                let actualList = response.data.model.list;
                actualList.forEach((element, index) => {
                    let key = process.env.NEXT_PUBLIC_PASSWORD_ENCRYPTION_KEY;
                    let decryptedData = decryptPassword(element.passwordfe, key);
                    let tempObj = { ...element, password: decryptedData, slno: index + parseInt(listPayload.filters.start) + 1 };
                    tempList.push(tempObj);
                });
                listTotalCount = response.data.model.total;
            }
            setLoader(false);
            setTableLoading(false);
            setColumnValues(tempList);
            setTotalCount(listTotalCount);
        });
    }

    /**
     * Pagination handler
     * @param {*} e 
     */
    const onPaginationChange = async (e) => {
        setTableLoading(true);
        if (!_.isEmpty(e)) {
            const newStartValue = e.first; // Replace with your desired page value
            const newLimitValue = e.rows; // Replace with your desired limit value
            await setListPayload(prevState => ({
                ...prevState,
                filters: {
                    ...prevState.filters,
                    start: newStartValue,
                    limit: newLimitValue
                }
            }));
        }
    }

    const openDeleteDialog = (rowdata) => {
        setDeleteId(rowdata.id);
        setDeleteObj({
            firstLabel: translate(localeJson, 'name'),
            firstValue: rowdata.name,
            secondLabel: translate(localeJson, 'userId'),
            secondValue: rowdata.username
        });
        setDeleteOpen(true);
        hideOverFlow();
    }

    const onDeleteClose = (status = '') => {
        setLoader
        if (status == 'confirm') {
            setTableLoading(true);
            AdminManagementServices.delete(deleteId, () => {
                listApiCall();
            })
        }
        setDeleteOpen(false);
        showOverFlow();
    };

    return (
        <React.Fragment>
            <AdminManagementImportModal
                open={importModalOpen}
                close={onImportModalClose}
                importFile={importFileApi}
                modalHeaderText={translate(localeJson, "admin_management_import")}
            />
            <AdminManagementDeleteModal
                open={deleteOpen}
                close={onDeleteClose}
                refreshList={listApiCall}
                deleteObj={deleteObj}
            />
            <AdminManagementCreateEditModal
                open={editStaffOpen}
                close={onStaffEditClose}
                register={onRegister}
                currentObj={currentObj}
                registerModalAction={registerModalAction}
                refreshList={listApiCall}
            />
            {detailId && <AdminManagementDetailModal
                open={detailOpen}
                close={() => {
                    setDetailOpen(false);
                    showOverFlow();
                    setDetailId(null);
                }}
                detailId={detailId}
            />}
            <div className="grid">
                <div className="col-12">
                    <div className='card'>
                        <CustomHeader headerClass={"page-header1"} header={translate(localeJson, "admin_management")} />
                        <div>
                            <div className='flex' style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
                                <Button buttonProps={{
                                    type: 'submit',
                                    rounded: "true",
                                    import: true,
                                    onClick: () => {
                                        setImportModalOpen(true);
                                        hideOverFlow();
                                    },
                                    buttonClass: "evacuation_button_height import-button",
                                    text: translate(localeJson, 'import'),
                                }} parentClass={"mr-1 mt-1 import-button"} />
                                <Button buttonProps={{
                                    type: 'submit',
                                    rounded: "true",
                                    export: true,
                                    buttonClass: "evacuation_button_height export-button",
                                    text: translate(localeJson, 'export'),
                                    onClick: () => {
                                        AdminManagementServices.exportData(listPayload);
                                    }
                                }} parentClass={"mr-1 mt-1 export-button"} />
                                <Button buttonProps={{
                                    type: 'submit',
                                    rounded: "true",
                                    create: true,
                                    buttonClass: "evacuation_button_height create-button",
                                    text: translate(localeJson, 'create_admin'),
                                    onClick: () => {
                                        setCurrentObj({ username: "", name: "", password: "", tel: "" });
                                        setRegisterModalAction("create")
                                        setEditStaffOpen(true);
                                        hideOverFlow();
                                    },
                                }} parentClass={"mt-1 create-button"} />
                            </div>
                        </div>
                        <div>
                            <div>
                                <div>
                                    <div class="flex justify-content-end gap-3 lg:gap-2 md:gap-2 sm:gap-2 flex-wrap float-right modal-field-top-space modal-field-bottom-space" >
                                        <Input
                                            inputProps={{
                                                inputParentClassName: "w-full lg:w-17rem md:w-20rem sm:w-14rem",
                                                labelProps: {
                                                    text: translate(localeJson, 'name'),
                                                    inputLabelClassName: "block",
                                                },
                                                inputClassName: "w-full lg:w-17rem md:w-20rem sm:w-14rem",
                                                id: 'householdNumber',
                                                onChange: (e) => { setSearchField(e.target.value) },
                                            }}
                                        />
                                        <div className='flex align-items-end'>
                                            <Button buttonProps={{
                                                buttonClass: "w-12 search-button",
                                                text: translate(localeJson, "search_text"),
                                                icon: "pi pi-search",
                                                onClick: () => {
                                                    setListPayload({
                                                        ...listPayload,
                                                        search: searchField
                                                    });
                                                }
                                            }} parentClass={"search-button"} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='mt-3'>
                                <NormalTable
                                    stripedRows={true}
                                    className={"custom-table-cell"}
                                    showGridlines={"true"}
                                    columns={columnNames}
                                    value={columnValues}
                                    filterDisplay="menu"
                                    emptyMessage={translate(localeJson, "data_not_found")}
                                    paginator={true}
                                    paginatorLeft={true}
                                    lazy
                                    totalRecords={totalCount}
                                    loading={tableLoading}
                                    first={listPayload.filters.start}
                                    rows={listPayload.filters.limit}
                                    onPageHandler={(e) => onPaginationChange(e)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}