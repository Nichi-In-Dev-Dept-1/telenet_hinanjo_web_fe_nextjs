import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import _ from 'lodash';

import {
    getValueByKeyRecursively as translate,
    getYYYYMMDDHHSSSSDateTimeFormat,
} from '@/helper';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { Button, CustomHeader, NormalTable, InputDropdown } from '@/components';
import { useAppDispatch } from '@/redux/hooks';
import { setExternalFamily } from '@/redux/family';
import { ExternalEvacuationServices } from '@/services';

export default function ExternalEvacuationPage() {
    const { locale, localeJson } = useContext(LayoutContext);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const [selectedOption, setSelectedOption] = useState({
        name: "--",
        id: 0
    });
    const [selectedSiteType, setSelectedSiteType] = useState({
        name: "--",
        id: 0
    });
    const [selectedFoodSupport, setSelectedFoodSupport] = useState({
        name: "--",
        id: 2
    });
    const [externalEvacueesList, setExternalEvacueesList] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPersonCount, setTotalPersonCount] = useState(0);
    const [evacuationStatusOptions, setEvacuationStatusOptions] = useState([]);
    const [getListPayload, setGetListPayload] = useState({
        filters: {
            start: 0,
            limit: 10,
            sort_by: "",
            order_by: ""
        },
        food_required: "",
        evacuationCenter: "",
        place_category: ""
    });

    const evacuationFoodSupport = [
        { name: "--", id: 2 },
        { name: translate(localeJson, 'yes'), id: 1 },
        { name: translate(localeJson, 'no'), id: 0 },
    ];

    const evacuationSiteType = [
        { name: "--", id: 0 },
        { name: translate(localeJson, 'city_in'), id: 1 },
        { name: translate(localeJson, 'city_out'), id: 2 },
        { name: translate(localeJson, 'pref_out'), id: 3 },
    ];

    const externalEvacueesListColumns = [
        { field: "si_no", header: translate(localeJson, 'si_no'), className: "sno_class", textAlign: "center", sortable: false },
        { field: "place_category", header: translate(localeJson, 'shelter_site_type'), minWidth: "10rem", sortable: false },
        { field: "place_detail", header: translate(localeJson, 'place_detail'), minWidth: "10rem", maxWidth: "15rem", sortable: false },
        { field: "external_person_count", header: translate(localeJson, 'people_count'), minWidth: "10rem", sortable: false },
        { field: "hinan_id", header: translate(localeJson, 'receiving_shelter'), minWidth: "10rem", sortable: false },
        { field: "food_required", header: translate(localeJson, 'need_food_support'), minWidth: "10rem", sortable: false },
        { field: "email", header: translate(localeJson, 'mail_address'), minWidth: "10rem", sortable: false },
        { field: "address", header: translate(localeJson, 'address'), minWidth: "10rem", sortable: false },
    ];

    /* Services */
    const { getList, exportExternalEvacueesCSVList, getPlaceDropdownList } = ExternalEvacuationServices;

    useEffect(() => {
        setTableLoading(true);
        const fetchData = async () => {
            await onGetExternalEvacueesListOnMounting();
            await onGetPlaceDropdownListOnMounting();
        };
        fetchData();
    }, [locale, getListPayload]);

    const downloadExternalEvacueesListCSV = () => {
        exportExternalEvacueesCSVList(getListPayload, exportExternalEvacueesCSV);
    }

    const exportExternalEvacueesCSV = (response) => {
        if (response.success) {
            const downloadLink = document.createElement("a");
            const fileName = "ExternalEvacuation_" + getYYYYMMDDHHSSSSDateTimeFormat(new Date()) + ".csv";
            downloadLink.href = response.result.filePath;
            downloadLink.download = fileName;
            downloadLink.click();
        }
    };

    const onGetExternalEvacueesListOnMounting = () => {
        getList(getListPayload, getExternalEvacueesList);
    }

    const onGetPlaceDropdownListOnMounting = () => {
        getPlaceDropdownList({}, updatePlaceDropdownList)
    }

    const updatePlaceDropdownList = (response) => {
        let placeDropdownList = [{
            name: "--",
            id: 0
        }]
        if (response.success && !_.isEmpty(response.data) && response.data.model.length > 0) {
            const data = response.data.model;
            data.map((item) => {
                let option = {
                    name: locale === "en" && !_.isNull(item.name_en) ? item.name_en : item.name,
                    id: item.id
                };
                placeDropdownList.push(option);
            });
            setEvacuationStatusOptions(placeDropdownList);
        }
    }

    const getExternalEvacueesList = (response) => {
        var externalEvacueesList = [];
        var listTotalCount = 0;
        var listTotalPersonCount = 0;
        if (response?.success && !_.isEmpty(response?.data) && response?.data?.model?.list.length > 0) {
            const data = response.data.model.list;
            data.map((item, index) => {
                let evacuees = {
                    ...item,
                    si_no: index + parseInt(getListPayload.filters.start) + 1,
                    address: translate(localeJson, 'post_letter') + (item.zipcode ? item.zipcode : "") + " " + (item.prefecture_name ? item.prefecture_name : "") + " " + (item.address ? item.address : "") + " " + (item.address_default ? item.address_default : ""),
                    food_required: item.food_required ? item.food_required : translate(localeJson, 'no')
                };
                externalEvacueesList.push(evacuees);
            })
            setTableLoading(false);
            listTotalCount = response.data.model.total;
            listTotalPersonCount = response.data.model.external_person_count;
        }
        setTableLoading(false);
        setExternalEvacueesList(externalEvacueesList);
        setTotalCount(listTotalCount);
        setTotalPersonCount(listTotalPersonCount);
    }

    const searchListWithCriteria = () => {
        let payload = {
            filters: {
                start: 0,
                limit: getListPayload.filters.limit,
                sort_by: "",
                order_by: "desc"
            },
            food_required: selectedFoodSupport && selectedFoodSupport.id != 2 ? selectedFoodSupport.id : "",
            evacuationCenter: selectedOption.id != 0 ? selectedOption.id : "",
            place_category: selectedSiteType.id != 0 ? selectedSiteType.id : ""
        }
        getList(payload, getExternalEvacueesList);
        setGetListPayload(payload);
    };

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
        <div className="grid">
            <div className="col-12">
                <div className='card'>
                    <div className="flex gap-2 align-items-center ">
                        <CustomHeader headerClass={"page-header1"} header={translate(localeJson, "external_evacuee_details")} />
                        <div className='page-header1-sub mb-2'>{`(${totalPersonCount ?? "0"}${translate(localeJson, "people")})`}</div>
                    </div>
                    <div className='flex justify-content-end'>
                        <div className='flex' style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
                        <Button
                                buttonProps={{
                                    text: translate(localeJson, "external_evacuees_tally"),
                                    onClick: () => router.push("/admin/external/family"),
                                }}
                            />
                            <Button buttonProps={{
                                type: 'submit',
                                rounded: "true",
                                export: true,
                                buttonClass: "ml-2 evacuation_button_height export-button",
                                text: translate(localeJson, 'export'),
                                onClick: () => downloadExternalEvacueesListCSV()
                            }} parentClass={"mb-0 export-button"} />
                        </div>
                    </div>
                    <div>
                        <div>
                            <form>
                                <div className='modal-field-top-space modal-field-bottom-space flex flex-wrap float-right justify-content-end align-items-end gap-3 lg:gap-2 md:gap-2 sm:gap-2 mobile-input'>
                                    <InputDropdown inputDropdownProps={{
                                        inputDropdownParentClassName: "w-full lg:w-14rem md:w-14rem sm:w-10rem",
                                        labelProps: {
                                            text: translate(localeJson, 'evacuation_site_type'),
                                            inputDropdownLabelClassName: "block"
                                        },
                                        inputDropdownClassName: "w-full lg:w-14rem md:w-14rem sm:w-10rem",
                                        value: selectedSiteType,
                                        options: evacuationSiteType,
                                        optionLabel: "name",
                                        onChange: (e) => {
                                            setSelectedSiteType(e.value)
                                            if (e.value.id == 2 || e.value.id == 3) {
                                                setSelectedOption({
                                                    name: '--',
                                                    id: 0
                                                })
                                                setSelectedFoodSupport({
                                                    name: '--',
                                                    id: 2
                                                })
                                            }
                                        },
                                        emptyMessage: translate(localeJson, "data_not_found"),
                                    }}
                                    />
                                    <InputDropdown inputDropdownProps={{
                                        inputDropdownParentClassName: "w-full lg:w-14rem md:w-14rem sm:w-10rem",
                                        labelProps: {
                                            text: translate(localeJson, 'receiving_shelter'),
                                            inputDropdownLabelClassName: "block"
                                        },
                                        inputDropdownClassName: "w-full lg:w-14rem md:w-14rem sm:w-10rem",
                                        customPanelDropdownClassName: "w-10rem",
                                        value: selectedOption,
                                        options: evacuationStatusOptions,
                                        optionLabel: "name",
                                        onChange: (e) => setSelectedOption(e.value),
                                        disabled: selectedSiteType.id == 2 || selectedSiteType.id == 3,
                                        emptyMessage: translate(localeJson, "data_not_found"),
                                    }}
                                    />
                                    <InputDropdown inputDropdownProps={{
                                        inputDropdownParentClassName: "w-full lg:w-14rem md:w-14rem sm:w-10rem",
                                        labelProps: {
                                            text: translate(localeJson, 'need_food_support'),
                                            inputDropdownLabelClassName: "block",
                                            parentStyle: { lineHeight: "20px" }
                                        },
                                        inputDropdownClassName: "w-full lg:w-14rem md:w-14rem sm:w-10rem",
                                        value: selectedFoodSupport,
                                        options: evacuationFoodSupport,
                                        optionLabel: "name",
                                        onChange: (e) => setSelectedFoodSupport(e.value),
                                        disabled: selectedSiteType.id == 2 || selectedSiteType.id == 3,
                                        emptyMessage: translate(localeJson, "data_not_found"),
                                    }}
                                    />
                                    <div className='flex align-items-end'>
                                        <Button buttonProps={{
                                            buttonClass: "w-12 search-button",
                                            text: translate(localeJson, "search_text"),
                                            icon: "pi pi-search",
                                            type: "button",
                                            onClick: () => searchListWithCriteria()
                                        }} parentClass={"search-button"} />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <NormalTable
                        lazy
                        id={"external-evacuation-list"}
                        totalRecords={totalCount}
                        loading={tableLoading}
                        size={"small"}
                        stripedRows={true}
                        paginator={"true"}
                        showGridlines={"true"}
                        value={externalEvacueesList}
                        columns={externalEvacueesListColumns}
                        emptyMessage={translate(localeJson, "data_not_found")}
                        first={getListPayload.filters.start}
                        rows={getListPayload.filters.limit}
                        paginatorLeft={true}
                        onPageHandler={(e) => onPaginationChange(e)}
                        selectionMode="single"
                        onSelectionChange={
                            (e) => {
                                if (e.value.external_person_count != 0) {
                                    dispatch(setExternalFamily({ evacuee_id: e.value.id, external_place:e.value.hinan_id}));
                                    router.push({
                                        pathname: '/admin/external/family/list/family-detail',
                                    });
                                }
                            }
                        }
                    />
                    <div className='mt-3 flex justify-content-center'>
                        <div className='flex' style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
                            <Button buttonProps={{
                                buttonClass: "w-8rem back-button",
                                text: translate(localeJson, 'back'),
                                onClick: () => router.push('/admin/external/family'),
                            }} parentClass={"mb-3 back-button"} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}