import React, { useState, useEffect, useContext } from 'react';
import { AiFillEye } from 'react-icons/ai';
import _ from 'lodash';

import { RowExpansionTable, Button, InputSwitch } from '@/components';
import { getGeneralDateTimeDisplayFormat, getYYYYMMDDHHSSSSDateTimeFormat, getValueByKeyRecursively as translate } from '@/helper'
import { LayoutContext } from '@/layout/context/layoutcontext';
import { InputSelectFloatLabel } from '@/components/dropdown';
import { StockPileSummaryMailSettingsModal, StockpileSummaryImageModal } from '@/components/modal';

import { StockPileSummaryServices } from '@/services/stockpile_summary.services';
import Link from 'next/link';

function AdminStockpileSummary() {
    const { locale, localeJson, setLoader } = useContext(LayoutContext);
    const [emailModal, setEmailModal] = useState(false);
    const [imageModal, setImageModal] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [stockpileSummaryList, setStockpileSummaryList] = useState([]);
    const [placeListOptions, setPlaceListOptions] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [tableLoading, setTableLoading] = useState(false);
    const [selectedPlaceName, setSelectedPlaceName] = useState({
        name: "--",
        id: 0
    });
    const [emailSettingValues, setEmailSettingValues] = useState({
        email: "",
        place_name: "",
        place_id: ""
    });
    const [showExpiryProducts, setShowExpiryProducts] = useState(false);
    const [getListPayload, setGetListPayload] = useState({
        filters: {
            start: 0,
            limit: 10,
            order_by: "asc",
            sort_by: "created_at"
        },
        search: ""
    });
    const stockPilerMainRow = [
        { field: "place_id", header: translate(localeJson, 'id'), display: 'none' },
        {
            field: 'shelter_place', header: translate(localeJson, 'shelter_place'), minWidth: "10rem", textAlign: "left",
            body: (rowData) => (
                <div className='text-link'>
                    <a className='text-decoration' style={{ color: "grren" }} onClick={() => bindEmailDataConfig(rowData)}>
                        {rowData['shelter_place']}
                    </a>
                </div>
            )
        },
        { field: "notification_email", header: translate(localeJson, 'notification_email') },
    ]
    const stockPileRowExpansionColumn = [
        { field: "type", header: translate(localeJson, 'type') },
        { field: "stock_pile_name", header: translate(localeJson, 'stockpile_item_name') },
        { field: "quantity", header: translate(localeJson, 'quantity') },
        { field: "expiration_date", header: translate(localeJson, 'expiration_date') },
        { field: "stock_pile_image", header: "", display: 'none' },
        {
            field: 'actions',
            header: translate(localeJson, 'image'),
            textAlign: "center",
            minWidth: "5rem",
            body: (rowData) => (
                <div>
                    <AiFillEye style={{ fontSize: '20px' }} onClick={() => bindImageModalData(rowData)} />
                </div>
            ),
        },
    ];

    const bindImageModalData = (rowData) => {
        setImageUrl(rowData.stock_pile_image);
        setImageModal(true);
    }

    useEffect(() => {
        const fetchData = async () => {
            setTableLoading(true);
            await onGetStockPileSummaryListOnMounting();
            await onGetPlaceDropdownListOnMounting();
            setLoader(false);
        };
        fetchData();
    }, [locale, getListPayload, showExpiryProducts]);

    const onGetStockPileSummaryListOnMounting = () => {
        getSummaryList(getListPayload, onGetStockPileSummaryList)
    }

    /**
     * Get Place Dropdown list on mounting
     */
    const onGetPlaceDropdownListOnMounting = () => {
        getPlaceDropdownList({}, onGetPlaceDropdownList);
    }

    const onGetPlaceDropdownList = (response) => {
        let placeList = [{
            name: "--",
            id: 0
        }];
        if (response.success && !_.isEmpty(response.data)) {
            const data = response.data.model;
            data.map((obj, i) => {
                let placeDropdownList = {
                    name: response.locale == 'ja' ? obj.name : obj.name,
                    id: obj.id
                }
                placeList.push(placeDropdownList)
            })
            setPlaceListOptions(placeList);
        }
    }

    const bindEmailDataConfig = (rowData) => {
        let payload = {
            place_id : rowData.place_id
        }
        getStockPileEmailData(payload, (response) => {
            if (response.success && !_.isEmpty(response.data)) {
                const data = response.data.model;
                let emailData = {
                    email: data.email,
                    place_name: rowData.shelter_place,
                    place_id: rowData.place_id
                }
                setEmailSettingValues(emailData);
            }
        });
        let emailData = {
            email: "",
            place_name: rowData.shelter_place.props.children,
            place_id: rowData.place_id
        };
        setEmailSettingValues(emailData);
        setEmailModal(true);
    };


    /**
    * Image setting modal close
   */
    const onImageModalClose = () => {
        setImageModal(!imageModal);
    };
    /**
    * Email setting modal close
   */
    const onEmailModalClose = () => {
        setEmailModal(!emailModal);
    };
    /**
     * 
     * @param {*} values 
     */
    const onRegister = (values) => {
        const emailList = values.email.split(",");
        if (Object.keys(values.errors).length == 0 && values.email.length > 0) {
            let payload = {
                email: emailList,
                place_id: emailSettingValues.place_id
            }
            let emailData = {
                email: emailList,
                place_name: values.place_name,
                place_id: emailSettingValues.place_id
            }
            getStockPileEmailUpdate(payload);
            setEmailSettingValues(emailData);
            setEmailModal(false);
        }
    };

    const searchListWithCriteria = () => {
        let payload = {
            filters: {
                start: getListPayload.filters.start,
                limit: getListPayload.filters.limit,
                order_by: "asc",
                sort_by: "created_at"
            },
            search: selectedPlaceName.id != 0 ? selectedPlaceName.name : ""
        };
        getSummaryList(payload, onGetStockPileSummaryList);
    }

    const onGetStockPileSummaryList = (response) => {
        if (response.success && !_.isEmpty(response.data) && response.data.model.list.length > 0) {
            const data = response.data.model.list;
            let stockPileList = [];
            data.map((item, index) => {
                let summaryList = {
                    place_id: item.place_id,
                    shelter_place: <Link href="">{item.name}</Link>,
                    notification_email: item.email,
                    orders: [{
                        type: item.category,
                        stock_pile_name: item.product_name,
                        quantity: item.after_count,
                        expiration_date: item.expiry_date,
                        stock_pile_image: item.stockpile_image
                    }],
                };
                stockPileList.push(summaryList);
            });
            setStockpileSummaryList(stockPileList);
            setTotalCount(response.data.model.total);
            setTableLoading(false);
        }
        else {
            setTotalCount(0);
            setTableLoading(false);
            setStockpileSummaryList([]);
        }
    }

    const downloadStockPileSummaryCSV = () => {
        let payload = {
            filters: {
                start: 0,
                limit: 50,
                order_by: "asc",
                sort_by: "created_at"
            },
            search: selectedPlaceName.id != 0 ? selectedPlaceName.name : ""
        }
        exportStockPileSummaryCSVList(payload, exportStockPileSummary);
    }

    const updatedTableExpansion = (e) => {
        setShowExpiryProducts(e.value);
    }

    const exportStockPileSummary = (response) => {
        if (response.success) {
            const downloadLink = document.createElement("a");
            const fileName = "StockPileSummaryExport" + getYYYYMMDDHHSSSSDateTimeFormat(new Date()) + ".csv";
            downloadLink.href = response.result.filePath;
            downloadLink.download = fileName;
            downloadLink.click();
        }
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
                },
                search: selectedPlaceName.id != 0 ? selectedPlaceName.name : ""
            }));
        }
    }

    /* Services */
    const { getSummaryList, exportStockPileSummaryCSVList, getPlaceDropdownList,
        getStockPileEmailUpdate, getStockPileEmailData } = StockPileSummaryServices;

    return (
        <React.Fragment>
            <StockpileSummaryImageModal
                open={imageModal}
                close={onImageModalClose}
                imageUrl={imageUrl}
            />
            <StockPileSummaryMailSettingsModal
                open={emailModal}
                close={onEmailModalClose}
                register={onRegister}
                emailSettingValues={emailSettingValues}
            />
            <div className="grid">
                <div className="col-12">
                    <div className='card'>
                        <h5 className='page-header1'>
                            {translate(localeJson, 'stockpile_summary')}
                        </h5>
                        <hr />
                        <div >
                            <div class="mb-3" >
                                <div class="summary_flex">
                                    {translate(localeJson, 'show_expiring_products')}<InputSwitch inputSwitchProps={{
                                        checked: showExpiryProducts,
                                        onChange: (e) => updatedTableExpansion(e)
                                    }}
                                        parentClass={"custom-switch"} />
                                </div>
                                <div>
                                    <form>
                                        <div class="summary_flex_search float-right mt-5" >
                                            <div class="flex flex-row justify-content-end" >
                                                <InputSelectFloatLabel dropdownFloatLabelProps={{
                                                    text: translate(localeJson, 'shelter_place'),
                                                    inputId: "float label",
                                                    optionLabel: "name",
                                                    options: placeListOptions,
                                                    value: selectedPlaceName,
                                                    onChange: (e) => setSelectedPlaceName(e.value),
                                                    inputSelectClass: "w-full lg:w-13rem md:w-20rem sm:w-14rem"
                                                }} parentClass={"w-full xl:20rem lg:w-13rem md:w-14rem sm:w-14rem"}
                                                />

                                            </div>
                                            <div>
                                                <Button buttonProps={{
                                                    buttonClass: "w-12 search-button",
                                                    text: translate(localeJson, "search_text"),
                                                    icon: "pi pi-search",
                                                    severity: "primary",
                                                    type: "button",
                                                    onClick: () => searchListWithCriteria()
                                                }} />
                                            </div>
                                            <div class="flex justify-content-end">
                                                <Button buttonProps={{
                                                    type: "button",
                                                    rounded: "true",
                                                    buttonClass: "",
                                                    text: translate(localeJson, 'export'),
                                                    severity: "primary",
                                                    onClick: () => downloadStockPileSummaryCSV()
                                                }} parentClass={"mr-1 mt-2 mb-2"} />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div>
                            <RowExpansionTable
                                columnStyle={{ textAlign: 'left' }}
                                paginator="true"
                                totalRecords={totalCount}
                                loading={tableLoading}
                                customRowExpansionActionsField="actions"
                                value={stockpileSummaryList}
                                innerColumn={stockPileRowExpansionColumn}
                                outerColumn={stockPilerMainRow}
                                expandAllTrigger={showExpiryProducts}
                                rowExpansionField1="orders1"
                                rowExpansionField="orders"
                                emptyMessage={translate(localeJson, "data_not_found")}
                                first={getListPayload.filters.start}
                                rows={getListPayload.filters.limit}
                                paginatorLeft={true}
                                onPageHandler={(e) => onPaginationChange(e)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default AdminStockpileSummary;