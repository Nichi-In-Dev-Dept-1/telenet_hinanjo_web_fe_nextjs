import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';

import { NormalTable, Button, CustomHeader, InputDropdown } from '@/components';
import { getEnglishDateTimeDisplayActualFormat, getJapaneseDateTimeDayDisplayActualFormat, getValueByKeyRecursively as translate } from '@/helper'
import { LayoutContext } from '@/layout/context/layoutcontext';
import { AdminEventStatusServices, CommonServices } from '@/services';

function EventStatusList() {
    const { locale, localeJson } = useContext(LayoutContext);

    const [selectedOption, setSelectedOption] = useState({
        name: "--",
        id: 0
    });
    const [eventDropdownList, setEventDropdownList] = useState([]);
    const [listPayload, setListPayload] = useState(
        {
            "filters": {
                "start": 0,
                "limit": 10,
                "sort_by": "",
                "order_by": ""
            }
        }
    );
    const [columnValues, setColumnValues] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [frozenArray, setFrozenArray] = useState([]);

    const columnNames = [
        { field: 'number', header: translate(localeJson, 'number'), headerClassName: "custom-header", className: "sno_class", textAlign: 'center', alignHeader: "left" },
        { field: 'name', header: translate(localeJson, 'questionnaire_name'), minWidth: '15rem', maxWidth: "15rem", headerClassName: "custom-header" },
        { field: 'total_person', header: translate(localeJson, 'number_of_evacuees_event_status_list'), minWidth: '10rem', headerClassName: "custom-header", fontWeight: "bold", textAlign: "center", alignHeader: "center" },
        { field: 'maleCount', header: translate(localeJson, 'male'), minWidth: '6rem', headerClassName: "custom-header", textAlign: "center", alignHeader: "center" },
        { field: 'femaleCount', header: translate(localeJson, 'female'), minWidth: "7rem", headerClassName: "custom-header", textAlign: "center", alignHeader: "center" },
        { field: 'othersCount', header: translate(localeJson, 'others_count'), minWidth: "10rem", headerClassName: "custom-header", textAlign: "center", alignHeader: "center" },
        {
              field: "event_opening_date_time",
              header: translate(localeJson, "opened_date_time"),
              minWidth: "10rem",
              sortable: false,
            },
            {
              field: "event_closing_date_time",
              header: translate(localeJson, "closed_date_time"),
              minWidth: "10rem",
              sortable: false,
            },
    ];

    const rowClassName = (rowData) => {
        return (rowData.name === '合計' || rowData.evacuation_place == 'Total') ? 'common_table_bg' : "";
    }

    const listApiCall = async () => {
        await AdminEventStatusServices.getEventStatusList(listPayload, (response) => {
            var tempList = [];
            var frozenObj = [];
            var listTotalCount = 0;
            if (response && response?.success) {
                let actualList = response.data.model.list;
                let totalCountList = response.data.model.totalCounts;
                actualList.forEach((element, index) => {
                    let tempObj = {
                        number: index + parseInt(listPayload.filters.start) + 1,
                        name: `${element.name}`,
                        total_person: `${element.total_person}${translate(localeJson, 'people')}`,
                        maleCount: `${element.maleCount}${translate(localeJson, 'people')}`,
                        femaleCount: `${element.femaleCount}${translate(localeJson, 'people')}`,
                        othersCount: `${element.othersCount}${translate(localeJson, 'people')}`,
                            event_opening_date_time: element.start_date
                                    ? locale == "ja"
                                      ? getJapaneseDateTimeDayDisplayActualFormat(
                                        element.start_date
                                      )
                                      : getEnglishDateTimeDisplayActualFormat(
                                        element.start_date
                                      )
                                    : "",
                                  event_closing_date_time: element.end_date
                                    ? locale == "ja"
                                      ? getJapaneseDateTimeDayDisplayActualFormat(
                                        element.end_date
                                      )
                                      : getEnglishDateTimeDisplayActualFormat(
                                        element.end_date
                                      )
                                    : "",
                    };
                    tempList.push(tempObj);
                });
                // Update frozen data
                let preparedFrozenObj = {
                    number: "",
                    name: translate(localeJson, 'total'),
                    total_person: `${totalCountList.totalPeopleCount}${translate(localeJson, 'people')}`,
                    maleCount: `${totalCountList.totalMale}${translate(localeJson, 'people')}`,
                    femaleCount: `${totalCountList.totalFemale}${translate(localeJson, 'people')}`,
                    othersCount: `${totalCountList.totalOther}${translate(localeJson, 'people')}`,
                    event_opening_date_time: "",
                    event_closing_date_time: "",
                };
                frozenObj = [preparedFrozenObj];
                listTotalCount = response.data.model.total;
            }
            setTableLoading(false);
            setColumnValues(tempList);
            setFrozenArray(frozenObj);
            setTotalCount(listTotalCount);
        });
    }

    const eventListApiCall = () => {
        CommonServices.getEventList({}, (response) => {
            if (response && response?.success) {
                let tempResponse = response.data.model;
                let tempList = [{
                    id: 0,
                    name: '--'
                }];
                tempResponse.forEach((val, index) => {
                    tempList.push(val);
                })
                setEventDropdownList(tempList);
            }
        })
    }

    useEffect(() => {
        setTableLoading(true);
        const fetchData = async () => {
            eventListApiCall()
            await listApiCall();
        };
        fetchData();
    }, [locale, listPayload]);

    const searchListWithCriteria = () => {
        setListPayload({
            "filters": { ...listPayload.filters },
            "event_id": selectedOption.id == 0 ? "" : selectedOption.id,
        }
        )
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

    return (
        <div className="grid">
            <div className="col-12">
                <div className='card'>
                    <CustomHeader headerClass={"page-header1"} header={translate(localeJson, "event_status_list")} />
                    <div>
                        <div>
                            <form>
                                <div className='modal-field-top-space modal-field-bottom-space flex flex-wrap float-right gap-3 lg:gap-2 md:gap-2 sm:gap-2 justify-content-end'>
                                    <InputDropdown inputDropdownProps={{
                                        inputDropdownParentClassName: "w-full lg:w-14rem md:w-14rem sm:w-10rem",
                                        labelProps: {
                                            text: translate(localeJson, 'questionnaire_name'),
                                            inputDropdownLabelClassName: "block"
                                        },
                                        inputDropdownClassName: "w-full lg:w-14rem md:w-14rem sm:w-10rem",
                                        customPanelDropdownClassName: "w-10rem",
                                        value: selectedOption,
                                        options: eventDropdownList,
                                        optionLabel: "name",
                                        onChange: (e) => {
                                            setSelectedOption(e.value)
                                        },
                                        emptyMessage: translate(localeJson, "data_not_found"),
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
                        <div className='mt-3'>
                            <NormalTable
                                stripedRows={true}
                                className={"custom-table-cell"}
                                showGridlines={"true"}
                                columns={columnNames}
                                value={columnValues}
                                rowClassName={rowClassName}
                                frozenValue={_.size(columnValues) > 0 && frozenArray}
                                filterDisplay="menu"
                                emptyMessage={translate(localeJson, "data_not_found")}
                                paginator={true}
                                paginatorLeft={true}
                                parentClass={"custom-table-dashboard"}
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
    );
}

export default EventStatusList;