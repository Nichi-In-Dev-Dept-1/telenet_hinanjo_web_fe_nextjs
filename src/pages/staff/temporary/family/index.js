import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import _ from "lodash";
import { LayoutContext } from "@/layout/context/layoutcontext";
import { Button, CustomHeader, NormalTable, Input } from "@/components";
import {
  convertToSingleByte,
  getEnglishDateDisplayFormat,
  getJapaneseDateDisplayYYYYMMDDFormat,
  getValueByKeyRecursively as translate,
  getSpecialCareName,
} from "@/helper";
import { setStaffTempFamily } from "@/redux/family";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { clearExceptPlaceId, reset, setSuccessData } from "@/redux/tempRegister";
import { TemporaryStaffRegistrantServices } from "@/services";

function TemporaryRegistrants() {
  const { locale, localeJson } = useContext(LayoutContext);
  const router = useRouter();
  const dispatch = useAppDispatch();
  // Getting storage data with help of reducers
  const layoutReducer = useAppSelector((state) => state.layoutReducer);
  const [placeID, setPlaceID] = useState(
    !_.isNull(layoutReducer?.user?.place?.id)
      ? layoutReducer?.user?.place?.id
      : ""
  );
  const [familyCount, setFamilyCount] = useState(0);
  const [evacueesDataList, setEvacueesDataList] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [familyCode, setFamilyCode] = useState(null);
  const [refugeeName, setRefugeeName] = useState(null);
  const [evacuationTableFields, setEvacuationTableFields] = useState([]);
  const [getListPayload, setGetListPayload] = useState({
    filters: {
      start: 0,
      limit: 10,
      sort_by: "",
      order_by: "desc",
      family_code: "",
      refugee_name: "",
    },
    place_id: placeID,
  });

  const temporaryRegistrantsColumns = [
    {
      field: "number",
      header: translate(localeJson, "si_no"),
      sortable: false,
      textAlign: "center",
      minWidth: "3rem",
      alignHeader: "left",
      className: "sno_class",
    },
    {
      field: "id",
      header: "ID",
      sortable: false,
      textAlign: "left",
      minWidth: "3rem",
      display: "none",
    },
    {
      field: "person_refugee_name",
      header: translate(localeJson, "name_public_evacuee"),
      minWidth: "7rem",
      sortable: true,
      textAlign: "left",
      alignHeader: "left",
      body: (rowData) => {
        return (
          <div className="flex flex-column cursor-pointer">
            <div className="custom-header text-highlighter-user-list">
              {rowData.name}
            </div>
            <div className="table-body-sub">{rowData.person_refugee_name}</div>
          </div>
        );
      },
    },
    {
      field: "family_code",
      header: translate(localeJson, "family_code"),
      minWidth: "6rem",
      sortable: true,
      textAlign: "left",
      alignHeader: "left",
    },
    {
      field: "person_dob",
      header: translate(localeJson, "dob"),
      minWidth: "11rem",
      maxWidth: "11rem",
      sortable: true,
      textAlign: "left",
      alignHeader: "left",
    },
    {
      field: "person_age",
      header: translate(localeJson, "age"),
      sortable: true,
      textAlign: "left",
      alignHeader: "left",
      minWidth: "5rem",
    },
    {
      field: "person_gender",
      header: translate(localeJson, "gender"),
      sortable: true,
      textAlign: "left",
      alignHeader: "left",
      minWidth: "8rem",
    },
    {
      field: "special_care_name",
      header: translate(localeJson, "special_care_name"),
      minWidth: "8rem",
      textAlign: "left",
    },
    {
      field: "family_count",
      header: translate(localeJson, "family_count"),
      sortable: true,
      textAlign: "center",
      alignHeader: "left",
      minWidth: "6rem",
      display: "none",
    },
    {
      field: "age_month",
      header: translate(localeJson, "age_month"),
      sortable: true,
      textAlign: "left",
      minWidth: "7rem",
      display: "none",
    },
    {
      field: "connecting_code",
      header: translate(localeJson, "connecting_code"),
      minWidth: "7rem",
      sortable: true,
      textAlign: "left",
      display: "none",
    },
    {
      field: "remarks",
      header: translate(localeJson, "remarks"),
      sortable: true,
      textAlign: "left",
      minWidth: "8rem",
      display: "none",
    },
    {
      field: "place",
      header: translate(localeJson, "shelter_place"),
      sortable: true,
      textAlign: "left",
      minWidth: "12rem",
      display: "none",
    },
    {
      field: "out_date",
      header: translate(localeJson, "out_date"),
      sortable: true,
      textAlign: "left",
      minWidth: "9rem",
      display: "none",
    },
    {
      field: "actions",
      header: "",
      textAlign: "left",
      alignHeader: "left",
      minWidth: "10rem",
      body: (rowData) => (
        <div>
          <Button
            buttonProps={{
              text: translate(localeJson, "check_in"),
              buttonClass: "search-button",
              onClick: () => updateCheckInStatus(rowData),
            }}
            parentClass={"search-button"}
          />
        </div>
      ),
    },
  ];

  /* Services */
  const { getList, updateCheckInDetail } = TemporaryStaffRegistrantServices;
  useEffect(() => {
    setTableLoading(true);
    const fetchData = async () => {
      await getTemporaryRegistrantList();
    };
    fetchData();
  }, [locale, getListPayload]);

  /**
   * Get temporary registrant list
   */
  const getTemporaryRegistrantList = () => {
    getList(getListPayload, onGetTemporaryRegistrantListSuccess);
  };

  /**
   * Get temporary registrant list / Success
   */
  const onGetTemporaryRegistrantListSuccess = async (response) => {
    var evacuationColumns = [...temporaryRegistrantsColumns];
    var evacueesList = [];
    var totalFamilyCount = 0;
    var listTotalCount = 0;
    let placeIdObj = {};

    if (
      response.success &&
      !_.isEmpty(response.data) &&
      response.data.list.length > 0
    ) {
      response.places.forEach((place, index) => {
        placeIdObj[place.id] =
          locale == "ja" ? place.name : place.name_en ?? place.name;
      });
      const data = response.data.list;
      data.map((item, i) => {
        let evacuees = {
          number: i + getListPayload.filters.start + 1,
          id: item.f_id,
          yapple_id: item.yapple_id,
          place_name: placeIdObj[item.place_id],
          family_count: response.data.total_family,
          family_code: item.family_code,
          person_is_owner:
            item.person_is_owner == 0
              ? translate(localeJson, "representative")
              : "",
          person_refugee_name: item.person_refugee_name,
          name: item.person_name,
          person_gender: getGenderValue(item.person_gender),
          person_age: item.person_age,
          age_month: item.person_month,
          special_care_name: item.person_special_cares
            ? getSpecialCareName(item.person_special_cares, locale)
            : "-", // Assuming you want to display a comma-separated list of special cares
          connecting_code: item.person_connecting_code,
          remarks: item.person_note,
          place: item.place_id, // You might need to fetch the actual place name based on place_id from your response data
          out_date: item.family_out_date,
          person_dob:
            locale == "ja"
              ? getJapaneseDateDisplayYYYYMMDDFormat(item.person_dob)
              : getEnglishDateDisplayFormat(item.person_dob),
        };
        evacueesList.push(evacuees);
      });
      totalFamilyCount = response.data.total_family;
      listTotalCount = response.data.total;
    }
    setTableLoading(false);
    setEvacuationTableFields(evacuationColumns);
    setEvacueesDataList(evacueesList);
    setTotalCount(listTotalCount);
    setFamilyCount(totalFamilyCount);
  };

  const handleFamilyCode = (e) => {
    const re = /^[0-9-]+$/;
    if (e.target.value.length <= 0) {
      setFamilyCode("");
      return;
    }
    if (re.test(convertToSingleByte(e.target.value))) {
      if (e.target.value.length == 4) {
        const newValue = e.target.value;
        if (newValue.indexOf("-") !== -1) {
          setFamilyCode(e.target.value);
        } else {
          setFamilyCode(newValue);
        }
      } else if (e.target.value.length == 3) {
        const newValue = e.target.value;
        const formattedValue = newValue.substring(0, 3);
        setFamilyCode(formattedValue);
      } else {
        setFamilyCode(e.target.value);
      }
    } else {
      setFamilyCode("");
    }
  };

  const updateCheckInStatus = (rowData) => {
    let param = {
      family_id: rowData.id,
      place_id: getListPayload.place_id,
    };
    updateCheckInDetail(param, (response) => {
      if (response.success) {
        dispatch(clearExceptPlaceId())
        localStorage.setItem("personCountTemp",null)
        localStorage.setItem('refreshing', "false");
        localStorage.setItem('deletedFromStaff',"true")
        localStorage.setItem("showDelete","false")
        getList(getListPayload, onGetTemporaryRegistrantListSuccess);
      }
    });
  };

  const getGenderValue = (gender) => {
    if (gender == 1) {
      return translate(localeJson, "male");
    } else if (gender == 2) {
      return translate(localeJson, "female");
    } else if (gender == 3) {
      return translate(localeJson, "others_count");
    }
  };

  const searchListWithCriteria = () => {
    let payload = {
      filters: {
        start: 0,
        limit: getListPayload.filters.limit,
        sort_by: "",
        order_by: "desc",
        family_code: convertToSingleByte(familyCode),
        refugee_name: refugeeName,
      },
      place_id: getListPayload.place_id,
    };
    getList(payload, onGetTemporaryRegistrantListSuccess);
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
      await setGetListPayload((prevState) => ({
        ...prevState,
        filters: {
          ...prevState.filters,
          start: newStartValue,
          limit: newLimitValue,
        },
      }));
    }
  };

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div style={{ display: "flex", alignItems: "center" }}>
            <CustomHeader
              headerClass={"page-header1"}
              header={translate(localeJson, "temporary_registrants")}
            />
            <span className="pl-2 text-lg pb-2">
              {"(" + totalCount + translate(localeJson, "people") + ")"}
            </span>
          </div>
          <div>
            <div>
              <form>
                <div className="modal-field-top-space modal-field-bottom-space flex flex-wrap float-right justify-content-end gap-3 lg:gap-2 md:gap-2 sm:gap-2 mobile-input">
                  <Input
                    inputProps={{
                      inputParentClassName:
                        "w-full lg:w-13rem md:w-14rem sm:w-10rem",
                      labelProps: {
                        text: translate(localeJson, "family_code"),
                        inputLabelClassName: "block",
                      },
                      inputClassName: "w-full lg:w-13rem md:w-14rem sm:w-10rem",
                      id: "familyCode",
                      name: "familyCode",
                      placeholder: translate(localeJson, "family_code"),
                      value: familyCode,
                      onChange: (e) => handleFamilyCode(e),
                    }}
                  />
                  <Input
                    inputProps={{
                      inputParentClassName:
                        "w-full lg:w-13rem md:w-14rem sm:w-10rem",
                      labelProps: {
                        text: translate(localeJson, "name"),
                        inputLabelClassName: "block",
                      },
                      placeholder: translate(localeJson, "name"),
                      inputClassName: "w-full lg:w-13rem md:w-14rem sm:w-10rem",
                      value: refugeeName,
                      onChange: (e) => setRefugeeName(e.target.value),
                    }}
                  />
                  <div className="flex align-items-end">
                    <Button
                      buttonProps={{
                        buttonClass: "w-12 search-button",
                        text: translate(localeJson, "search_text"),
                        icon: "pi pi-search",
                        type: "button",
                        onClick: () => searchListWithCriteria(),
                      }}
                      parentClass="inline pr-2 search-button"
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="mt-3">
              <NormalTable
                customActionsField="actions"
                lazy
                id="evacuation-list"
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
                selectionMode="single"
                onSort={(data) => {
                  setGetListPayload({
                    ...getListPayload,
                    filters: {
                      ...getListPayload.filters,
                      sort_by: data.sortField,
                      order_by:
                        getListPayload.filters.order_by === "desc"
                          ? "asc"
                          : "desc",
                    },
                  });
                }}
                onSelectionChange={(e) => {
                  dispatch(setStaffTempFamily({ family_id: e.value.id }));
                  router.push({
                    pathname: "/staff/temporary/family-detail",
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemporaryRegistrants;
