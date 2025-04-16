import React, { useState, useContext, useEffect } from 'react';
import _ from 'lodash';
import { useRouter } from 'next/router'

import {
    convertToSingleByte,
    getEnglishDateDisplayFormat,
    getGeneralDateTimeSlashDisplayFormat,
    getJapaneseDateDisplayYYYYMMDDFormat,
    getYYYYMMDDHHSSSSDateTimeFormat,
    getValueByKeyRecursively as translate,
    hideOverFlow,
    showOverFlow
} from '@/helper'
import { LayoutContext } from '@/layout/context/layoutcontext';
import { Button, CustomHeader, Input, InputDropdown, NormalTable, InputSwitch } from '@/components';
import { setFamily } from '@/redux/family';
import { useAppDispatch } from '@/redux/hooks';
import { getSpecialCareName } from "@/helper";
import { EvacuationServices } from '@/services';
import { AdminManagementDeleteModal } from '@/components/modal';
import { Tooltip } from 'primereact/tooltip';

export default function EvacuationPage() {
    const { locale, localeJson } = useContext(LayoutContext);
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [familyCount, setFamilyCount] = useState(0);
    const [selectedOption, setSelectedOption] = useState({
        name: "--",
        id: 0
    });
    const [selectedStatusOption, setSelectedStatusOption] = useState("");
    const [evacueesDataList, setEvacueesDataList] = useState([]);
    const [evacuationPlaceList, setEvacuationPlaceList] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [familyCode, setFamilyCode] = useState(null);
    const [refugeeName, setRefugeeName] = useState(null);
    const [evacuationTableFields, setEvacuationTableFields] = useState([]);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [showRegisteredEvacuees, setShowRegisteredEvacuees] = useState(false);
    const [getListPayload, setGetListPayload] = useState({
        filters: {
            start: 0,
            limit: 10,
            sort_by: "",
            order_by: "desc",
            place_id: "",
            family_code: "",
            refugee_name: "",
            checkout_flg: "",
        }
    });

    const evacuationTableColumns = [
        { field: 'si_no', header: translate(localeJson, 'si_no'), sortable: false, className: "sno_class", textAlign: 'center', alignHeader: "left" },
        {
            field: 'person_refugee_name', header: translate(localeJson, 'name_public_evacuee'), sortable: true, alignHeader: "left", maxWidth: '4rem',
            body: (rowData) => {
                return <div className="flex flex-column">
                    <div className="custom-header">{rowData.person_name}</div>
                    <div className="table-body-sub">{rowData.person_refugee_name}</div>
                </div>
            },
        },
        { field: 'family_is_registered', header: translate(localeJson, 'status_furigana'), sortable: true, alignHeader: "left",minWidth: '3rem', maxWidth: '4rem'},
        { field: 'place_name', header: translate(localeJson, 'place_name'), sortable: false, textAlign: "center", alignHeader: "center", minWidth: '3rem', maxWidth: '3rem' },
        { field: 'family_code', header: translate(localeJson, 'family_code'), sortable: true, textAlign: "center", alignHeader: "center", minWidth: '3rem', maxWidth: '4rem' },
        { field: 'family_count', header: translate(localeJson, 'family_count'), sortable: false, textAlign: "center", alignHeader: "center", minWidth: '3rem', maxWidth: '3rem' },
        { field: "person_dob", header: translate(localeJson, 'dob'), sortable: true, textAlign: 'left', alignHeader: "left", minWidth: '3rem', maxWidth: '4rem' },
        { field: "person_age", header: translate(localeJson, 'age'), sortable: true, textAlign: 'center', alignHeader: "center", minWidth: '3rem', maxWidth: '3rem' },
        { field: "person_gender", header: translate(localeJson, 'gender'), sortable: true, textAlign: 'left', alignHeader: "left", minWidth: '3rem', maxWidth: '3rem' },
        { field: "special_care_name", header: translate(localeJson, 'c_special_care'), sortable: false, textAlign: 'left', alignHeader: "left", minWidth: '3rem', maxWidth: '3rem' },
    ];

    /**
     * Get Evacuees list on mounting
     */
    const onGetEvacueesListOnMounting = () => {
        let payload = {
            filters: {
                start: getListPayload.filters.start,
                limit: getListPayload.filters.limit,
                sort_by: getListPayload.filters.sort_by,
                order_by: getListPayload.filters.order_by,
                place_id: getListPayload.filters.place_id,
                family_code: getListPayload.filters.family_code,
                refugee_name: getListPayload.filters.refugee_name,
                checkout_flg: getListPayload.filters.checkout_flg,
            }
        }
        getList(payload, onGetEvacueesList);
    }

    const getGenderValue = (gender) => {
        if (gender == 1) {
            return translate(localeJson, 'male');
        } else if (gender == 2) {
            return translate(localeJson, 'female');
        } else if (gender == 3) {
            return translate(localeJson, 'others_count');
        }
    }

    const getPlaceName = (id) => {
        let data = evacuationPlaceList.find((obj) => obj.id == id);
        if (data) {
            return data.name
        }
        return ""
    }

    const getOptions = (locale) => {
        if (locale === "ja") {
          return [
            { label: "すべて", value: "" }, // All
            { label: "入所", value: 0 }, // Check-in
            { label: "退所", value: 1 } // Check-out
          ];
        } else {
          return [
            { label: "All", value: "" },
            { label: "Check-in", value: 0 },
            { label: "Check-out", value: 1 }
          ];
        }
      };
      

    const onGetEvacueesList = (response) => {
        var evacuationColumns = [...evacuationTableColumns];
        var evacueesList = [];
        var placesList = [{
            name: "--",
            id: 0
        }];
        var totalFamilyCount = 0;
        var listTotalCount = 0;
        if (response?.success && !_.isEmpty(response.data) && response.data.list.length > 0) {
            const data = response.data.list;
            const questionnaire = response.data?.person_questionnaire;
            const places = response.places;
            let previousItem = null;
            let siNo = getListPayload.filters.start + 1;
            if (questionnaire && questionnaire?.length > 0) {
                questionnaire.map((ques, num) => {
                    let column = {
                        field: "question_" + ques.id,
                        header: (locale == "ja" ? ques.title : ques.title_en),
                        minWidth: "10rem",
                        display: "none"
                    };
                    evacuationColumns.push(column);
                });
            }
            evacuationColumns.push(
                { field: 'person_is_owner', header: translate(localeJson, 'representative'), sortable: true, textAlign: 'left', alignHeader: "left", minWidth: '3.5rem', maxWidth: '3.5rem' }
            )
            let placeIdObj = {};
            places.map((place) => {
                let placeData = {
                    name: locale == 'ja' ? place.name : (place.name_en ? place.name_en : place.name),
                    id: place.id
                }
                placeIdObj[place.id] = locale == 'ja' ? place.name : (place.name_en ? place.name_en : place.name),
                    placesList.push(placeData);
            });
            setEvacuationPlaceList(placesList);
            data.map((item, i) => {
                let evacuees = {
                    "si_no": i + parseInt(getListPayload.filters.start) + 1,
                    "id": item.f_id,
                    "place_name": placeIdObj[item.place_id] ?? "",
                    "family_count": item.persons_count,
                    "family_code": item.family_code,
                    "person_is_owner": item.person_is_owner == 0 ? translate(localeJson, 'representative') : "",
                    "person_refugee_name": <div className={"clickable-row"}>{item.person_refugee_name}</div>,
                    "person_name": <div className={"text-highlighter-user-list clickable-row"}>{item.person_name}</div>,
                    "person_gender": getGenderValue(item.person_gender),
                    "person_dob": locale == "ja" ? getJapaneseDateDisplayYYYYMMDDFormat(item.person_dob) : getEnglishDateDisplayFormat(item.person_dob),
                    "person_age": item.person_age,
                    "age_month": item.person_month,
                    "special_care_name": item.person_special_cares ? getSpecialCareName(item.person_special_cares, locale) : "-",
                    "remarks": item.person_note,
                    "place": item.place_id ? getPlaceName(item.place_id) : "",
                    "connecting_code": item.person_connecting_code,
                    "out_date": item.family_out_date ? getGeneralDateTimeSlashDisplayFormat(item.family_out_date) : "",
                    "family_is_registered": item.family_is_registered == 1 ? translate(localeJson, 'check_in') : translate(localeJson, 'exit'),
                };
                let personAnswers = item.person_answers ? item.person_answers : []
                if (personAnswers.length > 0) {
                    personAnswers.map((ques) => {
                        evacuees[`question_${ques.question_id}`] = (locale == 'ja' ? (ques.answer.length > 0 ? getAnswerData(ques.answer) : "") : (ques.answer_en.length > 0 ? getAnswerData(ques.answer_en) : ""));
                    })
                }
                previousItem = evacuees;
                evacueesList.push(evacuees);
                siNo = siNo + 1;
            });
            totalFamilyCount = response.data.total_family;
            listTotalCount = response.data.total;
        }
        else {
            evacuationColumns.push(
                { field: 'person_is_owner', header: translate(localeJson, 'representative'), sortable: true, textAlign: 'left', alignHeader: "left", minWidth: '3.5rem', maxWidth: '3.5rem' }
            )
        }
        setTableLoading(false);
        setEvacuationTableFields(evacuationColumns);
        setEvacueesDataList(evacueesList);
        setFamilyCount(totalFamilyCount);
        setTotalCount(listTotalCount);
    }

    const getAnswerData = (answer) => {
        let answerData = null;
        answer.map((item) => {
            answerData = answerData ? (answerData + ", " + item) : item
        });
        return answerData;
    }

    /* Services */
    const { getList, exportEvacueesCSVList, bulkDelete } = EvacuationServices;

    useEffect(() => {
        setTableLoading(true);
        const fetchData = async () => {
            await onGetEvacueesListOnMounting();
        };
        fetchData();
    }, [locale, getListPayload]);

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

    const searchListWithCriteria = () => {
        let payload = {
            filters: {
                start: 0,
                limit: getListPayload.filters.limit,
                sort_by: "",
                order_by: "desc",
                place_id: selectedOption && selectedOption.id != 0 ? selectedOption.id : "",
                family_code: convertToSingleByte(familyCode),
                refugee_name: refugeeName,
                checkout_flg: selectedStatusOption,
            }
        }
        getList(payload, onGetEvacueesList);
        setGetListPayload(payload);
    }

    const handleFamilyCode = (e) => {
        const re = /^[0-9-]+$/;
        if (e.target.value.length <= 0) {
            setFamilyCode("");
            return;
        }
        if (re.test(convertToSingleByte(e.target.value))) {
            if ((e.target.value).length == 4) {
                const newValue = e.target.value;
                if (newValue.indexOf("-") !== -1) {
                    setFamilyCode(e.target.value);
                }
                else {
                    setFamilyCode(newValue);
                }
            }
            else if ((e.target.value).length == 3) {
                const newValue = e.target.value;
                const formattedValue = newValue.substring(0, 3);
                setFamilyCode(formattedValue);
            }
            else {
                setFamilyCode(e.target.value)
            }
        }
        else {
            setFamilyCode("")
        }
    }

    const downloadEvacueesListCSV = () => {
        exportEvacueesCSVList(getListPayload, exportEvacueesCSV);
    }

    const exportEvacueesCSV = (response) => {
        if (response.success) {
            const downloadLink = document.createElement("a");
            const fileName = "Evacuation_" + getYYYYMMDDHHSSSSDateTimeFormat(new Date()) + ".csv";
            downloadLink.href = response.result.filePath;
            downloadLink.download = fileName;
            downloadLink.click();
        }
    }

    /**
     * Delete modal open handler
     * @param {*} rowdata 
     */
    const openDeleteDialog = () => {
        setDeleteOpen(true);
        hideOverFlow();
    }

    /**
     * On confirmation delete api call and close modal functionality handler
     * @param {*} status 
     */
    const onDeleteClose = (status = '') => {
        if (status == 'confirm') {
            onConfirmDeleteRegisteredEvacuees();
        }
        setDeleteOpen(false);
        showOverFlow();
    };

    /**
     * Delete registered evacuees
     */
    const onConfirmDeleteRegisteredEvacuees = async () => {
        setTableLoading(true);
        await bulkDelete(getListPayload, () => {
            setGetListPayload(prevState => ({
                ...prevState,
                filters: {
                    ...prevState.filters,
                    checkout_flg: 0
                }
            }));
            setShowRegisteredEvacuees(!showRegisteredEvacuees);
        });
    }

    /**
     * Show only registered evacuees
     */
    const showOnlyRegisteredEvacuees = async () => {
        setShowRegisteredEvacuees(!showRegisteredEvacuees);
        setTableLoading(true);
        await setGetListPayload(prevState => ({
            ...prevState,
            filters: {
                ...prevState.filters,
                checkout_flg: showRegisteredEvacuees ? 0 : 1,
                start: 0
            }
        }));
    }

    return (
        <React.Fragment>
            <AdminManagementDeleteModal
                open={deleteOpen}
                close={onDeleteClose}
            />
            <div className="grid">
                <div className="col-12">
                    <div className='card'>
                        <div className="flex flex-wrap align-items-center justify-content-between">
                            <div className='flex align-items-center gap-2 mb-2'>
                                <CustomHeader
                                    headerClass={"page-header1"}
                                    customParentClassName={"mb-0"}
                                    header={translate(localeJson, "list_of_evacuees")}
                                />
                                <div className='page-header1-sub mb-2'>{`(${totalCount}${translate(localeJson, "people")})`}</div>
                            </div>
                            <div className='flex flex-wrap align-items-center gap-2'>
                                <div className='flex flex-wrap  md:justify-content-end md:align-items-end md:gap-4 gap-2 mb-2'>
                                    {/* <div class="flex gap-2 align-items-center justify-content-center mt-2 md:mt-0 md:mb-2">
                                        <span className='text-sm'>{translate(localeJson, 'show_checked_out_evacuees')}</span><InputSwitch inputSwitchProps={{
                                            checked: showRegisteredEvacuees,
                                            onChange: () => showOnlyRegisteredEvacuees()
                                        }}
                                            parentClass={"custom-switch"} />
                                    </div> */}
                                    <div>
                                        {selectedStatusOption != "1" && (
                                            <Tooltip
                                                target=".custom-target-icon"
                                                position="bottom"
                                                content={translate(localeJson, "status_tooltip")}
                                                className="shadow-none"
                                            />
                                        )}
                                        <Button buttonProps={{
                                            type: "button",
                                            rounded: "true",
                                            delete: true,
                                            buttonClass: "export-button",
                                            text: translate(localeJson, 'bulk_delete'),
                                            severity: "primary",
                                            disabled: selectedStatusOption != "1"||evacueesDataList.length <= 0,
                                            onClick: () => openDeleteDialog()
                                        }} parentClass={`custom-target-icon export-button`} />

                                                                
                                    </div>
                                </div>
                                <div>
                                <Button buttonProps={{
                                    type: 'submit',
                                    rounded: "true",
                                    export: true,
                                    buttonClass: "evacuation_button_height export-button",
                                    text: translate(localeJson, 'export'),
                                    onClick: () => downloadEvacueesListCSV()
                                }} parentClass={"export-button mb-2"} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <div>
                                <form>
                                    <div className='modal-field-top-space modal-field-bottom-space flex flex-wrap float-right justify-content-end gap-3 lg:gap-2 md:gap-2 sm:gap-2 mobile-input'>
                                    <InputDropdown inputDropdownProps={{
                                            inputDropdownParentClassName: "w-full lg:w-14rem md:w-14rem sm:w-10rem",
                                            labelProps: {
                                                text: translate(localeJson, 'status_furigana'),
                                                inputDropdownLabelClassName: "block"
                                            },
                                            inputDropdownClassName: "w-full lg:w-14rem md:w-14rem sm:w-10rem",
                                            customPanelDropdownClassName: "w-10rem",
                                            value: selectedStatusOption,
                                            options: getOptions(locale),
                                            optionLabel: "label",
                                            onChange: (e) => setSelectedStatusOption(e.value),
                                            emptyMessage: translate(localeJson, "data_not_found"),
                                        }}
                                        />
                                        <InputDropdown inputDropdownProps={{
                                            inputDropdownParentClassName: "w-full lg:w-14rem md:w-14rem sm:w-10rem",
                                            labelProps: {
                                                text: translate(localeJson, 'evacuation_site'),
                                                inputDropdownLabelClassName: "block"
                                            },
                                            inputDropdownClassName: "w-full lg:w-14rem md:w-14rem sm:w-10rem",
                                            customPanelDropdownClassName: "w-10rem",
                                            value: selectedOption,
                                            options: evacuationPlaceList,
                                            optionLabel: "name",
                                            onChange: (e) => setSelectedOption(e.value),
                                            emptyMessage: translate(localeJson, "data_not_found"),
                                        }}
                                        />
                                        <Input
                                            inputProps={{
                                                inputParentClassName: "w-full lg:w-13rem md:w-14rem sm:w-10rem",
                                                labelProps: {
                                                    text: translate(localeJson, 'household_number'),
                                                    inputLabelClassName: "block",
                                                },
                                                inputClassName: "w-full lg:w-13rem md:w-14rem sm:w-10rem",
                                                value: familyCode,
                                                onChange: (e) => handleFamilyCode(e)
                                            }}
                                        />
                                        <Input
                                            inputProps={{
                                                inputParentClassName: "w-full lg:w-13rem md:w-14rem sm:w-10rem",
                                                labelProps: {
                                                    text: translate(localeJson, 'name'),
                                                    inputLabelClassName: "block",
                                                },
                                                inputClassName: "w-full lg:w-13rem md:w-14rem sm:w-10rem",
                                                value: refugeeName,
                                                onChange: (e) => setRefugeeName(e.target.value)
                                            }}
                                        />
                                        <div className="flex align-items-end">
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
                            <div className='hidden' style={{ display: "flex", justifyContent: "space-between" }}>
                                <div>
                                    <p className='pt-4 page-header2 font-bold'>{translate(localeJson, "totalSummary")}: {familyCount}</p>
                                </div>
                            </div>
                        </div>
                        <NormalTable
                            lazy
                            id={"evacuation-list"}
                            className="evacuation-list"
                            totalRecords={totalCount}
                            loading={tableLoading}
                            size={"small"}
                            stripedRows={true}
                            paginator={"true"}
                            showGridlines={"true"}
                            value={evacueesDataList}
                            columns={evacuationTableFields}
                            emptyMessage={translate(localeJson, "data_not_found")}
                            first={getListPayload.filters.start}
                            rows={getListPayload.filters.limit}
                            paginatorLeft={true}
                            onPageHandler={(e) => onPaginationChange(e)}
                            onSort={(data) => {
                                setGetListPayload({
                                    ...getListPayload,
                                    filters: {
                                        ...getListPayload.filters,
                                        sort_by: data.sortField,
                                        order_by: getListPayload.filters.order_by === 'desc' ? 'asc' : 'desc'
                                    }
                                }
                                )
                            }}
                            selectionMode="single"
                            onSelectionChange={
                                (e) => {
                                    dispatch(setFamily({ family_id: e.value.id }));
                                    router.push({
                                        pathname: '/admin/evacuation/family-detail',
                                    });
                                }
                            }
                        />
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}