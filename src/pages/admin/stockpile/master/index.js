import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { FaEyeSlash } from 'react-icons/fa';

import { getValueByKeyRecursively as translate } from '@/helper';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { Button, DeleteModal, DividerComponent, InputSelect, NormalLabel, NormalTable, SelectFloatLabel } from '@/components';
import { AdminStockpileMasterService } from '@/helper/adminStockpileMaster';
import { AdminManagementDeleteModal, AdminManagementImportModal } from '@/components/modal';
import StockpileCreateEditModal from '@/components/modal/stockpileCreateEditModal';
import { StockpileService } from '@/services/stockpilemaster.service';
import { historyPageCities } from '@/utils/constant';

export default function AdminStockPileMaster() {
    const { locale, localeJson, setLoader } = useContext(LayoutContext);
    const [deleteStaffOpen, setDeleteStaffOpen] = useState(false);
    const [emailSettingsOpen, setEmailSettingsOpen] = useState(false);
    const columnsData = [
        { field: 'product_id', header: 'Sl No', minWidth: "5rem" },
        { field: 'category', header: '備蓄品名', minWidth: "10rem" },
        { field: 'product_name', header: '種別', minWidth: "10rem" },
        { field: 'shelf_life', header: '保管期間 (日)', minWidth: "10rem" },
        {
            field: 'stockpile_image',
            header: '画像	',
            minWidth: "5rem",
            body: (rowData) => (
                <div>
                    <FaEyeSlash style={{ fontSize: '20px' }} onClick={() => alert(rowData.stockpile_image)} />
                </div>
            ),
        },
        {
            field: 'actions',
            header: '削除 ',
            minWidth: "10rem",
            body: (rowData) => (
                <>
                <Button parentStyle={{display: "inline"}} buttonProps={{
                        text: translate(localeJson, 'delete'), buttonClass: "text-primary",
                        bg: "bg-white",
                        hoverBg: "hover:bg-primary hover:text-white",
                        onClick: () => openDeleteDialog(rowData.product_id)
                    }} />
               <Button parentStyle={{display: "inline"}}  buttonProps={{
                   text: translate(localeJson, 'edit'), buttonClass: "text-primary ml-2",
                   bg: "bg-white",
                   hoverBg: "hover:bg-primary hover:text-white",
                   onClick: () => {
                       setRegisterModalAction("edit")
                       setCurrentEditObj(rowData)
                       setEmailSettingsOpen(true)
                   },
               }} />
                </>
            ),
        }
    ];

    const [registerModalAction, setRegisterModalAction] = useState('');
    const [currentEditObj, setCurrentEditObj] = useState('');

    const [deleteId, setDeleteId] = useState(null);

    const openDeleteDialog = (id) => {
        setDeleteId(id);
        setDeleteStaffOpen(true)
    }

    const onStaffDeleteClose = (action = "close") => {
        if (action == "confirm") {
            // alert(deleteId)
            StockpileService.delete(deleteId, (resData) => {
                alert(resData);
            });
        }
        setDeleteStaffOpen(!deleteStaffOpen);
    };

    /**
    * Email setting modal close
   */
    const onEmailSettingsClose = () => {
        setEmailSettingsOpen(!emailSettingsOpen);
    };

    /**
     * Register email related information
     * @param {*} values 
     */
    const onRegister = (values) => {
        setEmailSettingsOpen(false);
    };

    const [importPlaceOpen, setImportPlaceOpen] = useState(false);

    const onStaffImportClose = () => {
        setImportPlaceOpen(!importPlaceOpen);
    };

    const onRegisterImport = (values) => {
        values.file && setImportPlaceOpen(false);
    };

    const importFileApi = (file) => {
        console.log(file);
        const formData = new FormData();
        formData.append('file', file);
        StockpileService.importData(formData, () => {

        });
        onStaffImportClose();
    }


    //Listing start

        /**
     * Action column for dashboard list
     * @param {*} obj 
     * @returns 
     */
        const action = (obj) => {
            return (<>
                 <Button parentStyle={{display: "inline"}} buttonProps={{
                         text: translate(localeJson, 'delete'), buttonClass: "text-primary",
                         bg: "bg-white",
                         hoverBg: "hover:bg-primary hover:text-white",
                         onClick: () => openDeleteDialog(obj.product_id)
                     }} />
                <Button parentStyle={{display: "inline"}}  buttonProps={{
                    text: translate(localeJson, 'edit'), buttonClass: "text-primary ml-2",
                    bg: "bg-white",
                    hoverBg: "hover:bg-primary hover:text-white",
                    onClick: () => {
                        setRegisterModalAction("edit")
                        setCurrentEditObj(obj)
                        setEmailSettingsOpen(true)
                    },
                }} />
                 </>
            );
        };
    
        const [getListPayload, setGetListPayload] = useState({
            filters: {
                start: 0,
                limit: 7,
                order_by: "",
                sort_by: ""
            },
            category : "",
            product_name : ""
        });
    
        const [columns, setColumns] = useState([]);
        const [list, setList] = useState([]);
        const [totalCount, setTotalCount] = useState(0);
        const [tableLoading, setTableLoading] = useState(false);
    
    
        /* Services */
        const { getList, exportData } = StockpileService;
    
        useEffect(() => {
            setTableLoading(true);
            const fetchData = async () => {
                await onGetMaterialListOnMounting()
                setLoader(false);
            };
            fetchData();
        }, [locale, getListPayload]);
    
        /**
         * Get dashboard list on mounting
         */
        const onGetMaterialListOnMounting = () => {
            // Get dashboard list
            getList(getListPayload, (response)=> {
                if (response.success && !_.isEmpty(response.data) && response.data.model.total > 0) {
                    const data = response.data.model.list;
                    var additionalColumnsArrayWithOldData = [...columnsData];
                    let  preparedList = [];
                    // Update prepared list to the state
                    // Preparing row data for specific column to display
                    data.map((obj, i) => {
                        let preparedObj = {
                            product_id: obj.product_id ?? "",
                            product_name:  obj.product_name ?? "",
                            category: obj.category ?? "",
                            shelf_life: obj.shelf_life ?? "",
                            stockpile_image: obj.stockpile_image ?? "",
                            // actions: action(obj)
                        }
                        preparedList.push(preparedObj);
                    })    
                    
                    setList(preparedList);
                    setColumns(additionalColumnsArrayWithOldData);
                    setTotalCount(response.data.model.total);
                    setTableLoading(false);
                }
    
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
            await setGetListPayload(prevState => ({
                ...prevState,
                filters: {
                    ...prevState.filters,
                    start: newStartValue,
                    limit: newLimitValue
                }
            }));
        }
    }

    return (
        <>
            <AdminManagementDeleteModal
                open={deleteStaffOpen}
                close={onStaffDeleteClose}
            />

            <StockpileCreateEditModal
                open={emailSettingsOpen}
                close={onEmailSettingsClose}
                register={onRegister}
                refreshList={onGetMaterialListOnMounting} 
                registerModalAction={registerModalAction}
                currentEditObj={{...currentEditObj}}
            />
            <AdminManagementImportModal
                open={importPlaceOpen}
                close={onStaffImportClose}
                importFile={importFileApi}
                register={onRegister}
                modalHeaderText={translate(localeJson, "shelter_csv_import")}
            />

            <div className="grid">
                <div className="col-12">
                    <div className='card'>
                        <section className='col-12'>
                            <h5 className='page_header'>{translate(localeJson, 'places')}</h5>
                            <DividerComponent />
                            <div>
                                <div className='flex' style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
                                    <Button buttonProps={{
                                        rounded: "true",
                                        buttonClass: "evacuation_button_height",
                                        text: translate(localeJson, 'import'),
                                        severity: "primary",
                                        onClick: () => setImportPlaceOpen(true),
                                    }} parentClass={"mr-1 mt-1"} />
                                    <Button buttonProps={{
                                        rounded: "true",
                                        buttonClass: "evacuation_button_height",
                                        text: translate(localeJson, 'export'),
                                        severity: "primary"
                                    }} parentClass={"mr-1 mt-1"} />

                                    <Button buttonProps={{
                                        rounded: "true",
                                        buttonClass: "evacuation_button_height",
                                        text: translate(localeJson, 'signup'),
                                        onClick: () => {
                                            setRegisterModalAction("create");
                                            setCurrentEditObj({ category: "", product_name: "", shelf_life: "" });
                                            setEmailSettingsOpen(true);

                                        },
                                        severity: "success"
                                    }} parentClass={"mr-1 mt-1"} />
                                </div>
                                <div>
                                    <form >
                                    <div className='mt-5 mb-3 flex sm:flex-no-wrap md:w-auto flex-wrap flex-grow align-items-center justify-content-end gap-2 mobile-input ' >
                                        <div>
                                        <SelectFloatLabel selectFloatLabelProps={{
                                            inputId: "shelterCity",
                                            selectClass: "w-full lg:w-13rem md:w-14rem sm:w-14rem",
                                            options: historyPageCities,
                                            optionLabel: "name",
                                            onChange: (e) => setSelectedCity(e.value),
                                            text: translate(localeJson, "shelter_place_name"),
                                            custom: "mobile-input custom-select"
                                        }} parentClass="w-20rem lg:w-13rem md:w-14rem sm:w-14rem" />
                                        </div>
                                        <div >
                                            <SelectFloatLabel selectFloatLabelProps={{
                                            inputId: "shelterCity",
                                            selectClass: "w-full lg:w-13rem md:w-14rem sm:w-14rem",
                                            options: historyPageCities,
                                            optionLabel: "name",
                                            onChange: (e) => setSelectedCity(e.value),
                                            text: translate(localeJson, "shelter_place_name"),
                                            custom: "mobile-input custom-select"
                                        }} parentClass="w-20rem lg:w-13rem md:w-14rem sm:w-14rem" />
                                        </div>
                                        <div className='pb-1'>
                                                <Button buttonProps={{
                                                    buttonClass: "evacuation_button_height",
                                                    type: 'submit',
                                                    text: translate(localeJson, 'update'),
                                                    rounded: "true",
                                                    severity: "primary"
                                                }} parentStyle={{ paddingLeft: "10px" }} />

                                            </div>
                                    </div>
                                    </form>
                                </div>
                                <div className='mt-3'>
                                <NormalTable
                            lazy
                            totalRecords={totalCount}
                            loading={tableLoading}
                            stripedRows={true}
                            className={"custom-table-cell"}
                            showGridlines={"true"}
                            value={list}
                            columns={columns}
                            filterDisplay="menu"
                            emptyMessage="No data found."
                            paginator={true}
                            first={getListPayload.filters.start}
                            rows={getListPayload.filters.limit}
                            paginatorLeft={true}
                            onPageHandler={(e) => onPaginationChange(e)}
                        />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    )
}