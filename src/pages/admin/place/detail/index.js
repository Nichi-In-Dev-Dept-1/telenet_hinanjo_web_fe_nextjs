"use client";
import React, { useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { IoIosArrowBack } from "react-icons/io";
import { getValueByKeyRecursively as translate } from "@/helper";
import { LayoutContext } from "@/layout/context/layoutcontext";
import { Button, GoogleMapComponent, CardSpinner, CustomHeader } from "@/components";
import { PlaceServices, CommonServices } from "@/services";
import { useAppSelector } from "@/redux/hooks";
import { prefecturesCombined, default_place_id } from "@/utils/constant";

export default function StaffManagementEditPage() {
  const { locale, localeJson, setLoader } = useContext(LayoutContext);
  const router = useRouter();
  const Place = useAppSelector((state) => state.placeReducer.place);
  const settings_data = useAppSelector((state) => state?.layoutReducer?.layout);
  const id = Place?.id;
  const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

  const [apiResponse, setApiResponse] = useState({});
  const [placeName, setPlaceName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address2, setAddress] = useState("");
  const [placeAddress, setPlaceAddress] = useState("");
  const [defaultZipCode, setDefaultZipCode] = useState("");
  const [addressDefault, setAddressDefault] = useState("");
  const [capacity, setCapacity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [url, setUrl] = useState("");
  const [tempUrl, setTempUrl] = useState("")
  const [altitude, setAltitude] = useState("-");
  const [status, setStatus] = useState("");
  const [longitude, setLangitude] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [totalPerson, setTotalPerson] = useState("");
  const [percent, setPercentage] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [prefectureId, setPrefectureId] = useState("");
  const [prefectureDefaultId, setPrefectureDefaultId] = useState("");
  /* Services */
  const { details } = PlaceServices;
  const { encrypt } = CommonServices;

  useEffect(() => {
    localStorage.setItem("refreshing", false)
    const fetchData = async () => {
      await onGetPlaceDetailsOnMounting();
    };
    fetchData();
  }, [locale]);

  useEffect(() => {
    setLangitude(longitude);
    setLatitude(latitude);
  }, [longitude, latitude]);

  /**
   * Get place list on mounting
   */
  const onGetPlaceDetailsOnMounting = async () => {
    // Get places list
    details(id, fetchData);
  };

  function fetchData(response) {
    setTableLoading(true);
    setLoader(true);
    const model = response.data.model;
    setPlaceName(locale=="ja"?model.name:(model.name_en||model.name));
    setZipCode(model.zip_code);
    setAddress(model.address != "000-0000"? (locale=="ja"?model.address:(model.address_en||model.address)): "-");
    setPlaceAddress(model.address_place);
    setDefaultZipCode(model.zip_code_default)
    setAddressDefault(model.address_default != "000-0000"?(locale=="ja"?model.address_default:(model.address_default_en||model.address_default)) : "-");
    setCapacity(`${model.total_place}人`);
    setPhoneNumber(model.tel);
    setCoordinates(`${model.map.latitude} / ${model.map.longitude}`);
    setUrl(`${window?.location?.origin}/user/dashboard?hinan=${encrypt(id, ENCRYPTION_KEY)}`);
    setTempUrl(`${window?.location?.origin}/user/temp-register/member?hinan=${encrypt(id, ENCRYPTION_KEY)}`);
    model.altitude && setAltitude(`${model.altitude}m`);
    setStatus(model.active_flg == 1 ? "有効" : "無効");
    setTotalPerson(model.total_person);
    setPercentage(model.percent);
    setApiResponse(model);
    setLangitude(parseFloat(model.map.longitude));
    setLatitude(parseFloat(model.map.latitude));
    setPrefectureDefaultId(model.prefecture_id_default != 0 ? model.prefecture_id_default : "");
    setPrefectureId(model.prefecture_id==0? "" : model.prefecture_id);
    setTableLoading(false);
    setLoader(false);
  }

  const popoverContent = (
    <div>
      <p>
        <strong>避難所名:</strong> {placeName}
      </p>
      <p>
        <strong>避難所住所:</strong> {zipCode}
        {address2}
      </p>
      <p>
        <strong>収容人数:</strong> {capacity} / {totalPerson}人
      </p>
      <p>
        <strong>避難者数:</strong> {percent}%
      </p>
    </div>
  );

  return (
    <div className="grid">
      <div className="col-12">
        <Button buttonProps={{
          buttonClass: "w-auto back-button-transparent mb-2 p-0",
          text: translate(localeJson, "place_master_list_detail_back"),
          icon: <div className='mt-1'><i><IoIosArrowBack size={25} /></i></div>,
          onClick: () => router.push("/admin/place"),
        }} parentClass={"inline back-button-transparent"} />
        <CustomHeader headerClass={"page-header1"} header={placeName} />
      </div>
      <div className="col-12">
        {tableLoading ? (
          <CardSpinner />
        ) : (
          <div className="custom-card-no-shadow ">
            <div className="grid">
              <div className="col-12 md:col-7">
                <div className="font-bold mt-3">
                  {translate(localeJson, "place_basic_information")}
                </div>
                <div className="mt-1"> {zipCode != "000-0000" && translate(localeJson, 'post_letter') + zipCode}</div>
                <div className="">{prefectureId && prefecturesCombined[prefectureId][locale]} {address2}</div>
                <div className="">{phoneNumber}</div>
                <div className="font-bold mt-3">
                  {translate(localeJson, "place_initial_information")}
                </div>
                <div className="mt-1">{defaultZipCode!= "000-0000" && translate(localeJson, 'post_letter') + defaultZipCode}</div>
                <div className="">{prefectureDefaultId && prefecturesCombined[prefectureDefaultId][locale]} {addressDefault}</div>
                <div className="mt-3">
                  <span className="font-bold">{translate(localeJson, "place_lat_long")}</span> : {coordinates}
                </div>
              </div>
              <div className="col-12 md:col-5">
                <GoogleMapComponent
                  initialPosition={{ lat: latitude, lng: longitude }}
                  height={"300px"}
                  popoverContent={popoverContent}
                  mapScale={settings_data?.map_scale}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="col-12">
        {tableLoading ? (
          <CardSpinner />
        ) : (
          <div className="custom-card-no-shadow ">
            <div className="grid">
              <div className="col-12">
                <div className="font-bold mt-2">
                  {translate(localeJson, "place_center_information")}
                </div>
                <div className="mt-1">
                  {translate(localeJson, "capacity")} : {capacity}
                </div>
                <div className="">
                  {translate(localeJson, "altitude")} : {altitude}
                </div>
                <div className="">
                  {translate(localeJson, "status")} : {status}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {!default_place_id.includes(id) ? (
        <div className="col-12">
          {tableLoading ? (
            <CardSpinner />
          ) : (
            <div className="custom-card-no-shadow ">
              <div className="grid">
                <div className="col-12">
                  <div className="font-bold mt-2">
                    {translate(localeJson, "place_url")}
                  </div>
                  <div className="mt-2">
                    {translate(localeJson, "place_url_url")} :
                    <a
                      className="text-link-class cursor-pointer"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {url}
                    </a>
                  </div>
                  <div className="mt-2 hidden">
                    {translate(localeJson, "smart_phone_register_url")} :
                    <a
                      className="text-link-class cursor-pointer"
                      href={tempUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={()=>{
                        localStorage.setItem('deletedFromStaff',"false")
                      }}
                    >
                      {tempUrl}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>)
        :
        (
        <div className="col-12 hidden">
          {tableLoading ? (
            <CardSpinner />
          ) : (
            <div className="custom-card-no-shadow ">
              <div className="grid">
                <div className="col-12">
                  <div className="mt-2">
                    {translate(localeJson, "smart_phone_register_url")} :
                    <a
                      className="text-link-class cursor-pointer"
                      href={tempUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={()=>{
                        localStorage.setItem('deletedFromStaff',"false")
                      }}
                    >
                      {tempUrl}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="col-12">
        <div
          className="flex pt-3 pb-3 gap-2"
          style={{ justifyContent: "center", flexWrap: "wrap" }}
        >
          <div className="">
            <Button
              buttonProps={{
                buttonClass: "w-8rem update-button",
                type: "button",
                onClick: () =>
                  router.push({
                    pathname: `/admin/place/edit`,
                  }),
                text: translate(localeJson, "edit"),
                rounded: "true",
              }}
              parentClass={"edit-button"}
              parentStyle={{ marginTop: "10px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}