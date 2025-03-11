import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router'
import _ from 'lodash';
import { IoIosArrowBack } from "react-icons/io";

import {
    getValueByKeyRecursively as translate,
    getJapaneseDateDisplayYYYYMMDDFormat,
    getEnglishDateDisplayFormat,
    showOverFlow,
    hideOverFlow
} from '@/helper'
import { LayoutContext } from '@/layout/context/layoutcontext';
import { AdminManagementDeleteModal, Button, CustomHeader, NormalTable } from '@/components';
import { useAppSelector } from "@/redux/hooks";
import { ExternalEvacuationServices } from '@/services';
import { prefectures } from '@/utils/constant';

export default function EventFamilyDetail() {
    const { locale, localeJson,setLoader } = useContext(LayoutContext);
    const router = useRouter();
    const param = useAppSelector((state) => state.familyReducer.externalFamily);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [externalDataset, setExternalDataset] = useState(null);
    const [externalEvacuee,setExternalEvacuee] = useState(null);

    const externalColumns = [
        { field: "si_no", header: translate(localeJson, 'number'), sortable: false, className: "sno_class", textAlign: "left", alignHeader: "left" },
        {
            field: 'name', header: translate(localeJson, 'name_public_evacuee'), sortable: false, alignHeader: "left",
            body: (rowData) => {
                return <div className="flex flex-column">
                    <div className="text-highlighter-user-list">{rowData.name_kanji}</div>
                    <div>{rowData.name_furigana}</div>
                </div>
            },
        },
        { field: "gender", header: translate(localeJson, 'gender'), sortable: false, textAlign: 'left', alignHeader: "left", minWidth: '3rem', maxWidth: '3rem' },
        { field: "dob", header: translate(localeJson, 'dob'), sortable: false, textAlign: 'left', alignHeader: "left", minWidth: '3rem', maxWidth: '3rem' },
        { field: "age", header: translate(localeJson, 'age'), sortable: false, textAlign: 'center', alignHeader: "center", minWidth: '3rem', maxWidth: '3rem' },
    ];

    /* Services */
    const { getExternalEvacueesDetail,bulkDelete} = ExternalEvacuationServices;

    useEffect(() => {
        setTableLoading(true);
        const fetchData = async () => {
            await onGetEvacueesFamilyAttendeesDetailOnMounting();
        };
        fetchData();
    }, [locale]);

    const onGetEvacueesFamilyAttendeesDetailOnMounting = () => {
        getExternalEvacueesDetail(param, getEvacueesFamilyAttendeesDetail);
    }

    const getEvacueesFamilyAttendeesDetail = (response) => {
        var externalArray = [];
        if (response?.success && !_.isEmpty(response?.data) && response?.data?.model?.list.length > 0) {
            const data = response.data.model.list;
            setExternalEvacuee(data[0].external_family);
            data.map((item, index) => {
                let preparedData = {
                    ...item,
                    si_no: index + 1,
                    dob: locale == "ja" ? getJapaneseDateDisplayYYYYMMDDFormat(item.dob) : getEnglishDateDisplayFormat(item.dob),
                };
                externalArray.push(preparedData);
            })
        }
        setTableLoading(false);
        
        setExternalDataset(externalArray);
    }

    const getPrefectureName = (id) => {
        if (id) {
          let p_name = prefectures.find((item) => item.value === id);
          return p_name?.name;
        }
        return "";
      };

      const onConfirmDeleteRegisteredEvacuees = async () => {
        let payload = {
          evacuee_id:param.evacuee_id,
        }
        bulkDelete(payload, (res) => {
            if (res) {
                setLoader(false);
                router.push('/admin/external/family/list');
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
         <AdminManagementDeleteModal
                open={deleteOpen}
                close={onDeleteClose}
            />
            <div className="grid">
                <div className="col-12">
                    <div className='card'>
                        <Button buttonProps={{
                            buttonClass: "w-auto back-button-transparent mb-2 p-0",
                            text: translate(localeJson, "external_evacuees_list_detail_back"),
                            icon: <div className='mt-1'><i><IoIosArrowBack size={25} /></i></div>,
                            onClick: () => router.push('/admin/external/family/list'),
                        }} parentClass={"inline back-button-transparent"} />
                        <CustomHeader headerClass={"page-header1"} header={translate(localeJson, "external_evacuee_details")} />
                        <div className='section-space'>
                        <div className='custom-card-info my-3'>
                        <div className="">
                                        <div className=" flex_row_space_between">
                                          <label className="header_table">
                                            {translate(
                                              localeJson,
                                              "shelter_site_type"
                                            )}
                                          </label>
                                        </div>
                                        <div className="body_table">
                                          {externalEvacuee?.place_category == 1
        ? translate(localeJson, "within_city")
        : externalEvacuee?.place_category == 2
          ? translate(localeJson, "city_outskirts")
          : translate(localeJson, "outside_prefecture")}
                                        </div>
                                      </div>
                                      {externalEvacuee?.place_category == 1 && <>
                                        <div className="">
                                        <div className=" flex_row_space_between">
                                          <label className="header_table">
                                            {translate(
                                              localeJson,
                                              "need_food_support"
                                            )}
                                          </label>
                                        </div>
                                        <div className="body_table">
                                          {externalEvacuee?.food_required == 1
        ? translate(localeJson, "c_yes")
        : translate(localeJson, "c_no")}
                                        </div>
                                      </div>
                                      {externalEvacuee?.food_required == 1 && 
                                <>
                                  <div className="">
                                        <div className=" flex_row_space_between">
                                          <label className="header_table">
                                            {translate(
                                              localeJson,
                                              "receiving_shelter"
                                            )}
                                          </label>
                                        </div>
                                        <div className="body_table">
                                          {externalEvacuee?.hinan_id ?param.external_place:"" }
                                        </div>
                                      </div>
                                </> }        
                                    
                                      </>}
                                      {
                                        (externalEvacuee?.place_category == 2 || externalEvacuee?.place_category == 3) &&
                                        <>
                                         <div className="">
                                        <div className=" flex_row_space_between">
                                          <label className="header_table">
                                            {translate(
                                              localeJson,
                                              "place_detail"
                                            )}
                                          </label>
                                        </div>
                                        <div className="body_table">
                                          {externalEvacuee?.place_detail ||"-" }
                                        </div>
                                      </div>
                                        </>
                                      }
                        <div className="">
                                        <div className=" flex_row_space_between">
                                          <label className="header_table">
                                            {translate(localeJson, "c_address")}
                                          </label>
                                        </div>
                                        <div className="body_table">
                                          {externalEvacuee?.zipcode
                                            ? translate(
                                              localeJson,
                                              "post_letter"
                                            ) + externalEvacuee?.zipcode
                                            : ""}
                                        </div>
                                        <div className="body_table">
                                          {getPrefectureName(
                                            parseInt(externalEvacuee?.prefecture_id)
                                          )}
                                          {externalEvacuee?.address}
                                        </div>
                                      </div> 
                                      <div className="">
                                        <div className=" flex_row_space_between">
                                          <label className="header_table">
                                            {translate(
                                              localeJson,
                                              "mail_address"
                                            )}
                                          </label>
                                        </div>
                                        <div className="body_table">
                                          {externalEvacuee?.email}
                                        </div>
                                      </div>
                        </div>
                        </div>
                        <NormalTable
                            size={"small"}
                            loading={tableLoading}
                            emptyMessage={translate(localeJson, "data_not_found")}
                            stripedRows={true}
                            paginator={false}
                            showGridlines={true}
                            value={externalDataset}
                            columns={externalColumns}
                        />
                         <div className="flex mt-3 gap-2 justify-content-center">
                                                                    <Button buttonProps={{
                                            type: "button",
                                            rounded: "true",
                                            delete: true,
                                            buttonClass: "export-button",
                                            // disabled:isReg,
                                            text: translate(localeJson, 'delete_confirm'),
                                            severity: "primary",
                                            onClick: () => openDeleteDialog()
                                        }} parentClass={"mt-3 export-button"} />

                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}