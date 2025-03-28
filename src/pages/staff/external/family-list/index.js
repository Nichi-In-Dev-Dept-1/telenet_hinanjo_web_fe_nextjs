import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import { useRouter } from 'next/router';

import { LayoutContext } from '@/layout/context/layoutcontext';
import { getValueByKeyRecursively as translate } from '@/helper'
import { Button, CustomHeader, NormalTable } from '@/components';
import { setStaffExternalFamily } from '@/redux/family';
import { useAppDispatch } from '@/redux/hooks';
import { ExternalEvacueesService } from '@/services';

function ExternalFamilyList() {
    const { locale, localeJson, setLoader } = useContext(LayoutContext);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const layoutReducer = useSelector((state) => state.layoutReducer);

    const [list, setList] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPersonCount, setTotalPersonCount] = useState(0);
    const [tableLoading, setTableLoading] = useState(false);
    const [getListPayload, setGetListPayload] = useState({
        filters: {
            start: 0,
            limit: 10,
            sort_by: "",
            order_by: "desc",
        },
        place_id: layoutReducer?.user?.place?.id,
    });

    const columnsData = [
        { field: 'slno', header: translate(localeJson, 'external_evecuee_list_table_slno'), className: "sno_class", textAlign: "center", sortable: false },
        { field: 'place_category', header: translate(localeJson, 'external_evecuee_list_table_place_category'), minWidth: "10rem", sortable: false, },
        { field: 'external_person_count', header: translate(localeJson, 'external_evecuee_list_table_person_count'), minWidth: "10rem", sortable: false },
        { field: 'hinan_id', header: translate(localeJson, 'external_evecuee_list_table_hinan_id'), minWidth: "10rem", maxWidth: "15rem", sortable: false, },
        {
          field: 'person_refugee_name', header: translate(localeJson, 'representative'), sortable: false, alignHeader: "left",minWidth: "10rem", maxWidth: '10rem',
                  body: (rowData) => {
                                 return <div className="flex flex-column">
                                     <div className="custom-header">{rowData.person_name_kanji}</div>
                                     <div className="table-body-sub">{rowData.person_name_furigana}</div>
                                 </div>
                             },
        },
        { field: 'email', header: translate(localeJson, 'external_evecuee_list_table_email_address'), minWidth: "10rem", sortable: false, },
        { field: 'address', header: translate(localeJson, 'external_evecuee_list_table_address'), minWidth: "10rem", sortable: false, },
    ];

    /* Services */
    const { getList, exportData } = ExternalEvacueesService;

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
        getList(getListPayload, (response) => {
            var preparedList = [];
            var listTotalCount = 0;
            var listTotalPersonCount = 0;
            if (response.success && !_.isEmpty(response.data) && response.data.list.length > 0) {
                const data = response.data.list;
                data.map((obj, i) => {
                    let preparedObj = {
                        ...obj,
                        slno: i + getListPayload.filters.start + 1,
                        address: translate(localeJson, 'post_letter') + (obj.zipcode ? obj.zipcode : "") + " " + (obj.prefecture_name ? obj.prefecture_name : "") + " " + (obj.address ? obj.address : "") + " " + (obj.address_default ? obj.address_default : ""),
                        food_required: obj.food_required ? obj.food_required : translate(localeJson, 'no')
                    }
                    preparedList.push(preparedObj);
                })
                listTotalCount = response.data.total;
                listTotalPersonCount = response.data.total_person_count;
            }
            setTableLoading(false);
            setList(preparedList);
            setTotalCount(listTotalCount);
            setTotalPersonCount(listTotalPersonCount);
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
        <div className="grid">
            <div className="col-12">
                <div className='card'>
                    <div className="flex gap-2 align-items-center ">
                        <CustomHeader headerClass={"page-header1"} header={translate(localeJson, "external_evecuee_list_header")} />
                        <div className='page-header1-sub mb-2'>{`(${totalPersonCount ? totalPersonCount : ""}${translate(localeJson, "people")})`}</div>
                    </div>
                    <div>
                        <div className='flex' style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
                            <Button buttonProps={{
                                type: 'submit',
                                rounded: "true",
                                export: true,
                                buttonClass: "evacuation_button_height export-button",
                                text: translate(localeJson, 'export'),
                                onClick: () => {
                                    exportData(getListPayload)
                                }
                            }} parentClass={"mr-1 mt-1 export-button"} />
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
                                columns={columnsData}
                                filterDisplay="menu"
                                emptyMessage={translate(localeJson, "data_not_found")}
                                paginator={true}
                                first={getListPayload.filters.start}
                                rows={getListPayload.filters.limit}
                                paginatorLeft={true}
                                onPageHandler={(e) => onPaginationChange(e)}
                                selectionMode="single"
                                onSelectionChange={
                                    (e) => {
                                        dispatch(setStaffExternalFamily({
                                            evacuee_id: e.value.id,
                                            place_id: layoutReducer?.user?.place?.id,
                                        }));
                                        router.push({
                                            pathname: '/staff/external/family-list/family-detail',
                                        });
                                    }
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExternalFamilyList;