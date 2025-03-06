import React, { useState, useEffect, useContext } from "react";
import _ from "lodash";

import {
  getDefaultTodayDateTimeFormat,
  getEnglishDateTimeDisplayActualFormat,
  getGeneralDateTimeDisplayFormat,
  getJapaneseDateTimeDayDisplayActualFormat,
  getJapaneseDateTimeDisplayActualFormat,
  getYYYYMMDDHHSSSSDateTimeFormat,
  hideOverFlow,
  showOverFlow,
  getValueByKeyRecursively as translate,
} from "@/helper";
import { LayoutContext } from "@/layout/context/layoutcontext";
import { Button, CustomHeader, DateTime, NormalTable, InputDropdown, EmailSettings } from "@/components";
import { MailSettingsOption1 } from "@/utils/constant";
import { HistoryServices } from "@/services";

export default function AdminHistoryPlacePage() {
  const { localeJson, locale } = useContext(LayoutContext);

  const [historyPlaceList, setHistoryPlaceList] = useState([]);
  const [emailSettingsOpen, setEmailSettingsOpen] = useState(false);
  const [historyPlaceDropdown, setHistoryPlaceDropdown] = useState([]);
  const [prefectureListDropdown, setprefectureListDropdown] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [emailSettingValues, setEmailSettingValues] = useState({
    email: "",
    transmissionInterval: 0,
    outputTargetArea: 0,
  });
  const [getListPayload, setGetListPayload] = useState({
    filters: {
      start: 0,
      limit: 10,
      sort_by: "place_refugee_name",
      order_by: "asc",
    },
    start_date: getGeneralDateTimeDisplayFormat(
      getDefaultTodayDateTimeFormat("00", "00")
    ),
    end_date: getGeneralDateTimeDisplayFormat(
      getDefaultTodayDateTimeFormat("23", "59")
    ),
    place_name: "",
  });

  const historyTableColumns = [
    {
      field: "si_no",
      header: translate(localeJson, "si_no"),
      sortable: false,
      textAlign: "center",
      className: "sno_class",
    },
    {
      field: "created_at",
      header: translate(localeJson, "report_date_time"),
      minWidth: "10rem",
      sortable: false,
    },
    {
      field: "place_name",
      header: translate(localeJson, "place_name"),
      minWidth: "12rem",
      maxWidth: "12rem",
      sortable: false,
    },
    {
      field: "place_refugee_name",
      header: translate(localeJson, "place_name_furigana"),
      minWidth: "12rem",
      maxWidth: "12rem",
      sortable: false,
    },
    {
      field: "prefecture_name",
      header: translate(localeJson, "prefecture"),
      minWidth: "6rem",
      sortable: false,
    },
    {
      field: "place_address",
      header: translate(localeJson, "location_name"),
      minWidth: "10rem",
      sortable: false,
    },
    {
      field: "place_latitude",
      header: translate(localeJson, "location_latitude"),
      minWidth: "10rem",
      sortable: false,
      textAlign: "center",
      alignHeader: "center",
    },
    {
      field: "place_longitude",
      header: translate(localeJson, "location_longitude"),
      minWidth: "10rem",
      sortable: false,
      textAlign: "center",
      alignHeader: "center",
    },
    {
      field: "place_public_availability",
      header: translate(localeJson, "place_public_availability"),
      minWidth: "8rem",
      sortable: false,
    },
    {
      field: "place_opened_status",
      header: translate(localeJson, "opened_status"),
      minWidth: "8rem",
      sortable: false,
    },
    {
      field: "place_evacuees_count",
      header: translate(localeJson, "evacuees_count"),
      minWidth: "7rem",
      sortable: false,
      textAlign: "center",
      alignHeader: "center",
    },
    {
      field: "place_full_status",
      header: translate(localeJson, "availability_status"),
      minWidth: "7rem",
      sortable: false,
    },
    {
      field: "place_opening_date_time",
      header: translate(localeJson, "opened_date_time"),
      minWidth: "10rem",
      sortable: false,
    },
    {
      field: "place_closing_date_time",
      header: translate(localeJson, "closed_date_time"),
      minWidth: "10rem",
      sortable: false,
    },
    {
      field: "place_remarks",
      header: translate(localeJson, "remarks"),
      minWidth: "10rem",
    },
  ];

  /* Services */
  const {
    getList,
    getPlaceDropdownList,
    exportPlaceHistoryCSVList,
    registerEmailConfiguration,
    getPrefectureList,
    getEmailConfiguration,
  } = HistoryServices;

  useEffect(() => {
    setTableLoading(true);
    const fetchData = async () => {
      await onGetHistoryPlaceListOnMounting();
      await onGetHistoryPlaceDropdownListOnMounting();
      await onGetEmailConfigurationOnMounting();
    };
    fetchData();
  }, [locale, getListPayload]);

  /**
   * Get History Place list on mounting
   */
  const onGetHistoryPlaceListOnMounting = () => {
    let payload = {
      filters: {
        start: getListPayload.filters.start,
        limit: getListPayload.filters.limit,
        sort_by: "place_refugee_name",
        order_by: "asc",
      },
      start_date: getListPayload.start_date,
      end_date: getListPayload.end_date,
      place_name: getListPayload.place_name,
    };
    getList(payload, onGetHistoryPlaceList);
  };

  /**
   * Get History Place Dropdown list on mounting
   */
  const onGetHistoryPlaceDropdownListOnMounting = () => {
    getPlaceDropdownList({}, onGetHistoryPlaceDropdownList);
  };

  const onGetEmailConfigurationOnMounting = () => {
    getEmailConfiguration({}, getEmailConfig);
  };

  const searchListWithCriteria = () => {
    let payload = {
      filters: {
        start: 0,
        limit: getListPayload.filters.limit,
        sort_by: "place_refugee_name",
        order_by: "asc",
      },
      start_date: selectedDate
        ? getGeneralDateTimeDisplayFormat(selectedDate[0])
        : "",
      end_date: selectedDate
        ? selectedDate[1]
          ? getGeneralDateTimeDisplayFormat(selectedDate[1])
          : getGeneralDateTimeDisplayFormat(new Date())
        : "",
      place_name: selectedCity && selectedCity.code ? selectedCity.name : "",
    };
    getList(payload, onGetHistoryPlaceList);
  };

  /**
   * Function will get data & update History Place list
   * @param {*} data
   */
  const onGetHistoryPlaceDropdownList = (response) => {
    let historyPlaceCities = [
      {
        name: "--",
        code: null,
      },
    ];
    if (response.success && !_.isEmpty(response.data)) {
      const data = response.data.model;
      data.map((obj, i) => {
        let placeDropdownList = {
          name: response.locale == "ja" ? obj.name : obj.name,
          code: obj.id,
        };
        historyPlaceCities.push(placeDropdownList);
      });
      setHistoryPlaceDropdown(historyPlaceCities);
    }
  };
  /**
   * Function will get data & update History Place list
   * @param {*} data
   */
  const onGetHistoryPlaceList = (response) => {
    var historyPlaceList = [];
    var listTotalCount = 0;
    if (
      response.success &&
      !_.isEmpty(response.data) &&
      response.data.model.total > 0
    ) {
      const data = response.data.model.list;
      let historyPlaceListData = [];
      let index = getListPayload.filters.start + 1;
      data.map((obj, i) => {
        let historyData = {
          si_no: index,
          created_at: obj.created_at
            ? locale == "ja"
              ? getJapaneseDateTimeDisplayActualFormat(obj.created_at)
              : getEnglishDateTimeDisplayActualFormat(obj.created_at)
            : "",
          prefecture_name: obj.prefecture_name,
          place_name: locale === "en" && !_.isNull(obj.place_name_en) ? obj.place_name_en : obj.place_name,
          place_name_en: obj.place_name_en,
          place_refugee_name: obj.place_refugee_name,
          place_address: obj.place_address,
          place_latitude: obj.place_latitude,
          place_longitude: obj.place_longitude,
          place_public_availability: obj.place_public_availability,
          place_opened_status: obj.place_opened_status,
          place_evacuees_count: obj.place_evacuees_count,
          place_full_status: obj.place_full_status,
          place_opening_date_time: obj.place_opening_date_time
            ? locale == "ja"
              ? getJapaneseDateTimeDayDisplayActualFormat(
                obj.place_opening_date_time
              )
              : getEnglishDateTimeDisplayActualFormat(
                obj.place_opening_date_time
              )
            : "",
          place_closing_date_time: obj.place_closing_date_time
            ? locale == "ja"
              ? getJapaneseDateTimeDayDisplayActualFormat(
                obj.place_closing_date_time
              )
              : getEnglishDateTimeDisplayActualFormat(
                obj.place_closing_date_time
              )
            : "",
          place_remarks: obj.place_remarks,
        };
        historyPlaceListData.push(historyData);
        index = index + 1;
      });
      historyPlaceList = historyPlaceListData;
      listTotalCount = response.data.model.total;
    }
    setTableLoading(false);
    setHistoryPlaceList(historyPlaceList);
    setTotalCount(listTotalCount);
  };

  const downloadPlaceHistoryCSV = () => {
    let payload = {
      filters: {
        start: getListPayload.filters.start,
        limit: getListPayload.filters.limit,
        sort_by: "place_refugee_name",
        order_by: "asc",
      },
      start_date: selectedDate
        ? getGeneralDateTimeDisplayFormat(selectedDate[0])
        : "",
      end_date: selectedDate
        ? selectedDate[1]
          ? getGeneralDateTimeDisplayFormat(selectedDate[1])
          : getGeneralDateTimeDisplayFormat(new Date())
        : "",
      place_name: selectedCity && selectedCity.code ? selectedCity.name : "",
    };
    exportPlaceHistoryCSVList(payload, exportPlaceHistoryCSV);
  };

  const exportPlaceHistoryCSV = (response) => {
    if (response.success) {
      const downloadLink = document.createElement("a");
      const fileName =
        "Place_history" + getYYYYMMDDHHSSSSDateTimeFormat(new Date()) + ".csv";
      downloadLink.href = response.result.filePath;
      downloadLink.download = fileName;
      downloadLink.click();
    }
  };

  /**
   * Email setting modal close
   */
  const onEmailSettingsClose = () => {
    setEmailSettingsOpen(!emailSettingsOpen);
    showOverFlow();
  };

  /**
   * Register email related information
   * @param {*} values
   */
  const onRegister = (values) => {
    var emailList;
    if (typeof values.email === "string") {
      emailList = values.email.split(",");
    } else {
      emailList = values.email;
    }
    if (Object.keys(values.errors).length == 0 && values.email.length > 0) {
      let payload = {
        email: emailList,
        frequency:
          values.transmissionInterval == 0 ? 0 : values.transmissionInterval,
        prefecture_id:
          values.outputTargetArea == 0 ? null : values.outputTargetArea,
      };
      let emailData = {
        email: emailList,
        transmissionInterval: values.transmissionInterval,
        outputTargetArea: values.outputTargetArea,
      };
      registerEmailConfiguration(payload, (response) => {
        getEmailConfiguration({}, getEmailConfig);
        setEmailSettingsOpen(false);
        showOverFlow();
      });
    }
  };

  const mailSettingModel = () => {
    getPrefectureList({}, loadPrefectureDropdownList);
    getEmailConfiguration({}, getEmailConfig);
    setEmailSettingsOpen(true);
    hideOverFlow();
  };

  const getEmailConfig = (response) => {
    if (response.success && !_.isEmpty(response.data)) {
      const data = response.data.model;
      let emailData = {
        email: data.email,
        transmissionInterval: data.frequency ? data.frequency : 0,
        outputTargetArea: data.prefecture_id ? data.prefecture_id : 0,
      };
      setEmailSettingValues(emailData);
    }
  };

  const loadPrefectureDropdownList = (response) => {
    let prefectureList = [
      {
        name: "--",
        value: 0,
      },
    ];
    if (response.success && !_.isEmpty(response.data)) {
      const data = response.data.list;
      data.map((obj) => {
        let option = {
          name: obj.name,
          value: obj.id,
        };
        prefectureList.push(option);
      });
      setprefectureListDropdown(prefectureList);
    }
  };

  const getDefaultTodayDateTime = () => {
    let startDateTime = getDefaultTodayDateTimeFormat("00", "00");
    let endDateTime = getDefaultTodayDateTimeFormat("23", "59");
    setSelectedDate([startDateTime, endDateTime]);
    return [startDateTime, endDateTime];
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
        start_date: selectedDate
          ? getGeneralDateTimeDisplayFormat(selectedDate[0])
          : "",
        end_date: selectedDate
          ? selectedDate[1]
            ? getGeneralDateTimeDisplayFormat(selectedDate[1])
            : getGeneralDateTimeDisplayFormat(new Date())
          : "",
        place_name: selectedCity && selectedCity.code ? selectedCity.name : "",
      }));
    }
  };

  return (
    <React.Fragment>
      <EmailSettings
        open={emailSettingsOpen}
        close={onEmailSettingsClose}
        register={onRegister}
        intervalFrequency={MailSettingsOption1}
        prefectureList={prefectureListDropdown}
        emailSettingValues={emailSettingValues}
      />
      <div className="grid">
        <div className="col-12">
          <div className="card">
            <div className="w-full flex flex-wrap sm:flex-no-wrap align-items-center justify-content-between gap-2">
              <div className="flex justify-content-center align-items-center gap-2">
                <CustomHeader
                  headerClass={"page-header1"}
                  header={translate(localeJson, "history_place")}
                />
              </div>
            </div>
            <div>
              <div>
                <div className="w-full md:w-auto flex flex-grow flex-wrap justify-content-end align-items-center gap-2">
                  <Button
                    buttonProps={{
                      type: "submit",
                      rounded: "true",
                      buttonClass: "evacuation_button_height export-button",
                      export: true,
                      text: translate(localeJson, "export"),
                      onClick: () => downloadPlaceHistoryCSV(),
                    }}
                    parentClass={"export-button"}
                  />
                  <Button
                    buttonProps={{
                      type: "submit",
                      rounded: "true",
                      create: true,
                      buttonClass: "evacuation_button_height create-button",
                      text: translate(localeJson, "mail_setting"),
                      onClick: () => mailSettingModel(),
                    }}
                    parentClass={"create-button"}
                  />
                </div>
                <form>
                  <div className="modal-field-top-space modal-field-bottom-space flex md:flex-no-wrap md:w-auto flex-wrap flex-grow float-right align-items-end justify-content-end gap-3 lg:gap-2 md:gap-2 sm:gap-2 mobile-input ">
                    <DateTime
                      callOnActionFlag={true}
                      callOnCancel={() => setSelectedDate(null)}
                      dateTimeProps={{
                        dateTimeParentClassName:
                          "w-full lg:w-27rem md:w-27rem",
                        labelProps: {
                          text: translate(localeJson, "report_date_time"),
                          inputDropdownLabelClassName: "block",
                          htmlFor: "historyDateSearch",
                        },
                        inputId: "historyDateSearch",
                        dateTimeClass:
                          "w-full lg:w-27rem md:w-27rem",
                        selectionMode: "range",
                        panelStyle: { marginTop: "0px" },
                        date: getDefaultTodayDateTime,
                        onChange: (e) => setSelectedDate(e.value),
                      }}
                    />
                    <InputDropdown
                      inputDropdownProps={{
                        inputDropdownParentClassName:
                          "w-full lg:w-13rem md:w-14rem",
                        labelProps: {
                          text: translate(localeJson, "shelter_place_name"),
                          inputDropdownLabelClassName: "block",
                        },
                        inputDropdownClassName:
                          "w-full lg:w-13rem md:w-14rem",
                        customPanelDropdownClassName: "w-10rem",
                        value: selectedCity,
                        options: historyPlaceDropdown,
                        optionLabel: "name",
                        onChange: (e) => setSelectedCity(e.value),
                        emptyMessage: translate(localeJson, "data_not_found"),
                      }}
                    />
                    <div className="flex align-items-end">
                      <Button
                        buttonProps={{
                          buttonClass: "w-12 search-button",
                          text: translate(localeJson, "search_text"),
                          icon: "pi pi-search",
                          onClick: () => searchListWithCriteria(),
                          type: "button",
                        }}
                        parentClass={"search-button"}
                      />
                    </div>
                  </div>
                </form>
              </div>
              <NormalTable
                lazy
                id={"history-list"}
                className="history-list"
                totalRecords={totalCount}
                loading={tableLoading}
                size={"small"}
                stripedRows={true}
                paginator={"true"}
                showGridlines={"true"}
                value={historyPlaceList}
                columns={historyTableColumns}
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