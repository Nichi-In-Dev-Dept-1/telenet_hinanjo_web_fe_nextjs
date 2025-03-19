import React, { useContext, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import { getValueByKeyRecursively as translate } from "@/helper";
import { LayoutContext } from "@/layout/context/layoutcontext";
import { ButtonRounded, FamilyListComponent } from "@/components";
import { useAppDispatch } from "@/redux/hooks";
import { reset } from "@/redux/check_in";
import { CheckInOutServices } from "@/services";
import EvacueeFamilyDetailHistory from "@/components/familySearchDetailsHistory";

const SearchDetails = () => {
  const { locale, localeJson, setLoader } = useContext(LayoutContext);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const checkInReducer = useSelector((state) => state.checkInReducer);
  const layoutReducer = useSelector((state) => state.layoutReducer);

  let data = checkInReducer?.checkInData || [];

  let family_id = data?.data?.length > 0 ? data?.data[0].family_id : "";

  const [familyCode, setFamilyCode] = useState(family_id);

  const { checkIn } = CheckInOutServices;

  const isCheckedIn = (res) => {
    setLoader(false)
    res && router.push('/user/dashboard')
  }

  return (
    // <div className="flex justify-content-center">
    //   <div className="m-2 w-full xlScreenMaxWidth mdScreenMaxWidth">
    <div>
    <div className="grid">
      <div className="col-12">
        <div className="card">
        {data?.data?.length > 0 && (
          <>
           <EvacueeFamilyDetailHistory data={data} header={translate(localeJson, "reg_confirm")} > </EvacueeFamilyDetailHistory>
            {/* <FamilyListComponent data={data} header={translate(localeJson, "reg_confirm")} /> */}
            <div className="flex flex-column justify-content-center align-items-center">
              <div className="w-12 lg:w-6">
                <ButtonRounded
                  buttonProps={{
                    buttonClass: "w-full h-3rem primary-button",
                    type: "submit",
                    rounded: "true",
                    text: translate(localeJson, "admission_button"),
                    onClick: () => {
                      let payload = {
                        "family_id": familyCode,
                        "place_id": layoutReducer?.user?.place?.id
                      }
                      setLoader(true)
                      checkIn(payload, isCheckedIn)
                    }
                  }}
                  parentClass={"w-full  primary-button"}
                />
                <ButtonRounded
                  buttonProps={{
                    type: "button",
                    rounded: "true",
                    custom: "",
                    buttonClass:
                      "back-button w-full custom-icon-button h-3rem flex justify-content-center",
                    text: translate(localeJson, "return"),
                    onClick: (() => {
                      router.push('/user/register/member')
                      dispatch(reset())
                    })
                  }}
                  parentClass={
                    "back-button w-full flex justify-content-center mt-3  mb-3 lg:mb-0"
                  }
                />
              </div>
            </div>
          </>
        )}
        </div></div>
    </div></div>

    //   </div>
    // </div>
  );
};

export default SearchDetails;
