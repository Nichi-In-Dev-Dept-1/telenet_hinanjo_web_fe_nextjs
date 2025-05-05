"use client";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import _ from "lodash";

import {
  hideOverFlow,
  showOverFlow,
  getValueByKeyRecursively as translate,
} from "@/helper";
import { LayoutContext } from "@/layout/context/layoutcontext";
import {
  Button,
  DeleteModal,
  NormalTable,
  CommonDialog,
  CustomHeader,
  AdminManagementDeleteModal,
  AdminManagementImportModal,
  PlaceEventBulkCheckOut,
} from "@/components";
import { PlaceServices } from "@/services";
import { setPlace } from "@/redux/place";
import { useAppDispatch } from "@/redux/hooks";
import { default_place_id } from "@/utils/constant";

export default function AdminPlacePage() {
  const { locale, localeJson, setLoader } = useContext(LayoutContext);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [importPlaceOpen, setImportPlaceOpen] = useState(false);
  const [bulkCheckoutOpen, setBulkCheckoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteObj, setDeleteObj] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [placeEditDialogVisible, setPlaceEditDialogVisible] = useState(false);
  const [columns, setColumns] = useState([]);
  const [id, setId] = useState(0);
  const [list, setList] = useState([]);
  const [checkedValue, setCheckedValue] = useState(false);
  const [getPayload, setPayload] = useState({
    filters: {
      start: 0,
      limit: 10,
      sort_by: "refugee_name",
      order_by: "asc",
    },
    search: "",
  });

  const handleRowClick = (rowData) => {
    let id = { id: rowData.ID };
    dispatch(setPlace(id));
    router.push(
      {
        pathname: `/admin/place/detail`,
        query: { id: rowData.ID },
      },
      "/admin/place/detail"
    );
  };

  const columnsData = [
    {
      field: "index",
      header: translate(localeJson, "s_no"),
      className: "sno_class",
      textAlign: "center",
    },
    {
      field: "refugee_name",
      header: translate(localeJson, "evacuation_place"),
      minWidth: "20rem",
      maxWidth: "20rem",
      sortable: true,
      body: (rowData) => {
        return (
          <div className="flex flex-column">
            <div>
              <a
                className="text-link-class cursor-pointer"
                onClick={() => handleRowClick(rowData)}
              >
                {rowData.refugee_name}
              </a>
            </div>
            <div className="table-body-sub">{rowData.furigana_name}</div>
          </div>
        );
      },
    },
    {
      field: "address",
      header: translate(localeJson, "address"),
      minWidth: "10rem",
      sortable: true,
    },
    {
      field: "total_place",
      header: translate(localeJson, "capacity"),
      minWidth: "10rem",
      textAlign: "center",
      alignHeader: "center",
      sortable: true,
    },
    {
      field: "tel",
      header: translate(localeJson, "phone_number"),
      textAlign: "center",
      alignHeader: "center",
      sortable: true,
    },
    {
      field: "status",
      textAlign: "center",
      alignHeader: "center",
      header: translate(localeJson, "status"),
      body: (rowData) => {
        return action(rowData);
      },
    },
    {
      field: "actions",
      header: translate(localeJson, "delete"),
      textAlign: "center",
      alignHeader: "center",
      minWidth: "6rem",
      body: (rowData) => {
        return (
          <div className="">
            <Button
              buttonProps={{
                text: translate(localeJson, "delete"),
                buttonClass: "delete-button",
                disabled:
                  rowData.isActive || default_place_id.includes(rowData.ID),
                onClick: () => {
                  openDeleteDialog(rowData);
                },
              }}
              parentClass={"delete-button"}
            />
          </div>
        );
      },
    },
  ];

  /* Services */
  const { getList, updateStatus, exportData, importData, deletePlace } =
    PlaceServices;

  useEffect(() => {
    setTableLoading(true);
    const fetchData = async () => {
      await onGetPlaceListOnMounting();
    };
    fetchData();
  }, [locale, getPayload]);

  /**
   * Get place list on mounting
   */
  const onGetPlaceListOnMounting = async () => {
    // Get places list
    getList(getPayload, fetchData);
  };

  const onStaffImportClose = () => {
    setImportPlaceOpen(!importPlaceOpen);
    showOverFlow();
  };

  const importFileApi = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    importData(formData, (file) => {
      if (file) {
        onGetPlaceListOnMounting();
      }
    });
    setImportPlaceOpen(false);
    showOverFlow();
  };

  function fetchData(response) {
    var additionalColumnsArrayWithOldData = [...columnsData];
    var preparedList = [];
    var listTotalCount = 0;
    if (
      response.success &&
      !_.isEmpty(response.data) &&
      response.data.model.total > 0
    ) {
      const data = response.data.model.list;
      data.map((obj, i) => {
        let preparedObj = {
          index: getPayload.filters.start + i + 1,
          ID: obj.id,
          refugee_name:locale === "en" && !_.isNull(obj.name_en) ? obj.name_en : obj.name,
          address: obj.address_place.trim() != "000-0000"?"〒" + obj.address_place:"-",
          total_place: obj.total_place,
          tel: obj.tel,
          active_flg: obj.active_flg,
          isActive: obj.is_active,
          furigana_name: obj.refugee_name,
          status:
            obj.is_active || default_place_id.includes(obj.id)
              ? "place-status-cell"
              : "",
        };
        preparedList.push(preparedObj);
      });
      listTotalCount = response.data.model.total;
    }
    setTableLoading(false);
    setColumns(additionalColumnsArrayWithOldData);
    setList(preparedList);
    setTotalCount(listTotalCount);
  }

  /**
   * Action column for dashboard list
   * @param {*} obj
   * @returns
   */
  const action = (obj) => {
    return (
      <div className="input-switch-parent">
        <DeleteModal
          header={translate(localeJson, "toggle_place")}
          content={translate(localeJson, "update_isActive_status")}
          data={obj}
          checked={obj.active_flg == 1 ? true : false}
          parentClass={"custom-switch"}
          cancelButton={true}
          updateButton={true}
          cancelButtonClass="w-full font-bold back-button"
          updateButtonClass="w-full font-bold del_ok-button"
          setCheckedValue={setCheckedValue}
          updateCalBackFunction={(rowDataReceived) =>
            getDataFromRenewButtonOnClick(rowDataReceived)
          }
        />
      </div>
    );
  };

  /**
   * Update full status by row id
   * @param {*} rowDataReceived
   */
  const getDataFromRenewButtonOnClick = (rowDataReceived) => {
    if (rowDataReceived) {
      setTableLoading(true);
      let updateFullStatusPayload = {
        place_id: rowDataReceived.ID,
        active_flg: checkedValue ? 1 : 0,
      };
      updateStatus(updateFullStatusPayload, onGetPlaceListOnMounting);
    }
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
      await setPayload((prevState) => ({
        ...prevState,
        filters: {
          ...prevState.filters,
          start: newStartValue,
          limit: newLimitValue,
        },
      }));
    }
  };

  const cellClassName = (data) =>
    data == "place-status-cell" ? "p-disabled surface-400" : "";

  const isCellSelectable = (event) =>
    !(
      event.data.field === "status" && event.data.value === "place-status-cell"
    );

  const deleteContent = (
    <div className="text-center">
      <div className="mb-3">
        {translate(localeJson, "Place_Delete_Content_1")}
      </div>
      <div>{translate(localeJson, "Place_Delete_Content_2")}</div>
    </div>
  );

  const openDeleteDialog = (rowdata) => {
    console.log(rowdata);
    setDeleteId(rowdata.ID);
    setDeleteObj({
      firstLabel: translate(localeJson, "evacuation_place"),
      firstValue: rowdata.refugee_name,
      secondLabel: translate(localeJson, "phone_number"),
      secondValue: rowdata.tel,
    });
    setDeleteOpen(true);
    hideOverFlow();
  };

  const onDeleteClose = (status = "") => {
    if (status == "confirm") {
      setTableLoading(true);
      deletePlace(deleteId, () => {
        onGetPlaceListOnMounting();
      });
    }
    setDeleteOpen(false);
    showOverFlow();
  };

  const isDeleted = (res) => {
    if (res) {
      setPlaceEditDialogVisible(false);
      onGetPlaceListOnMounting();
    }
  };

  /**Bulk checkout on submit table loading*/
  const handleTableReload = () => {
    setTableLoading(true);
    setTimeout(() => {
      onGetPlaceListOnMounting();
      setTableLoading(false);
    }, 1000);
  };

  return (
    <>
      <CommonDialog
        open={placeEditDialogVisible}
        dialogBodyClassName="p-3"
        header={translate(localeJson, "confirmation")}
        content={deleteContent}
        position={"center"}
        footerParentClassName={"text-center"}
        footerButtonsArray={[
          {
            buttonProps: {
              buttonClass: "w-8rem back-button",
              text: translate(localeJson, "cancel"),
              onClick: () => {
                setPlaceEditDialogVisible(false);
              },
            },
            parentClass: "inline back-button",
          },
          {
            buttonProps: {
              buttonClass: "w-8rem del_ok-button",
              text: translate(localeJson, "ok"),
              onClick: () => {
                setLoader(true);
                deletePlace(id, isDeleted);
                setLoader(false);
              },
            },
            parentClass: "inline del_ok-button",
          },
        ]}
        close={() => {
          setPlaceEditDialogVisible(false);
        }}
      />
      <AdminManagementImportModal
        open={importPlaceOpen}
        close={onStaffImportClose}
        importFile={importFileApi}
        modalHeaderText={translate(localeJson, "place_csv_import")}
      />
      <AdminManagementDeleteModal
        open={deleteOpen}
        close={onDeleteClose}
        refreshList={onGetPlaceListOnMounting}
        deleteObj={deleteObj}
      />
      <PlaceEventBulkCheckOut
        modalHeaderText={translate(localeJson, "place_name")}
        open={bulkCheckoutOpen}
        onBulkCheckoutSuccess={handleTableReload}
        close={() => {
          setBulkCheckoutOpen(false);
          showOverFlow();
        }}
        type={"places"}
      />
      <div className="grid">
        <div className="col-12">
          <div className="card">
            <div>
              <CustomHeader
                headerClass={"page-header1"}
                header={translate(localeJson, "places")}
              />
            </div>
            <div>
              <div
                className="flex"
                style={{ justifyContent: "flex-end", flexWrap: "wrap" }}
              >
                <Button
                  buttonProps={{
                    rounded: "true",
                    buttonClass: "evacuation_button_height",
                    text: translate(localeJson, "bulk_checkout"),
                    onClick: () => {
                      setBulkCheckoutOpen(true);
                      hideOverFlow();
                    },
                  }}
                  parentClass={"mr-1 mt-1"}
                />
                <Button
                  buttonProps={{
                    rounded: "true",
                    buttonClass: "evacuation_button_height import-button",
                    text: translate(localeJson, "import"),
                    import: true,
                    onClick: () => {
                      setImportPlaceOpen(true);
                      hideOverFlow();
                    },
                  }}
                  parentClass={"mr-1 mt-1 import-button"}
                />
                <Button
                  buttonProps={{
                    rounded: "true",
                    buttonClass: "evacuation_button_height export-button",
                    export: true,
                    text: translate(localeJson, "export"),
                    onClick: () => exportData(getPayload),
                  }}
                  parentClass={"mr-1 mt-1 export-button"}
                />
                <Button
                  buttonProps={{
                    rounded: "true",
                    create: true,
                    buttonClass: "evacuation_button_height create-button",
                    text: translate(localeJson, "create_place"),
                    onClick: () => router.push("/admin/place/create"),
                  }}
                  parentClass={"mr-1 mt-1 create-button"}
                />
              </div>
              <div className="mt-3">
                <NormalTable
                  lazy
                  totalRecords={totalCount}
                  loading={tableLoading}
                  showGridlines={"true"}
                  stripedRows={true}
                  paginator={"true"}
                  columnStyle={{ textAlign: "center" }}
                  className={"custom-table-cell"}
                  value={list}
                  columns={columns}
                  cellClassName={cellClassName}
                  emptyMessage={translate(localeJson, "data_not_found")}
                  isDataSelectable={isCellSelectable}
                  first={getPayload.filters.start}
                  rows={getPayload.filters.limit}
                  paginatorLeft={true}
                  onPageHandler={(e) => onPaginationChange(e)}
                  onSort={(data) => {
                    setPayload({
                      ...getPayload,
                      filters: {
                        ...getPayload.filters,
                        order_by:
                          getPayload.filters.order_by === "desc"
                            ? "asc"
                            : "desc",
                        sort_by: data.sortField,
                      },
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}