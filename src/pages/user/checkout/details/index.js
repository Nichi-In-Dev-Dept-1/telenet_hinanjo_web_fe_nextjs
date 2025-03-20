import React, { useContext, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import { toastDisplay, getValueByKeyRecursively as translate } from "@/helper";
import { LayoutContext } from "@/layout/context/layoutcontext";
import { ButtonRounded, FamilyListComponent } from "@/components";
import { useAppDispatch } from "@/redux/hooks";
import { reset } from "@/redux/checkout";
import { CheckInOutServices } from "@/services";
import EvacueeFamilyDetailHistory from "@/components/familySearchDetailsHistory";

const CheckOutDetails = () => {
  const { localeJson, setLoader } = useContext(LayoutContext);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const checkOutReducer = useSelector((state) => state.checkOutReducer);

  let data = checkOutReducer?.checkOutData || [];

  let family_id = data?.data?.length > 0 ? data?.data[0]?.family_id : "";

  const [familyCode, setFamilyCode] = useState(family_id);

  const { checkOut } = CheckInOutServices;
  
  const isCheckedOut = (res) => {
    setLoader(false)
    if (res.success) {
      router.push('/user/dashboard');
    }
  }

  const doCheckout = (placeID) => {
    let payload = {
      "family_id": familyCode,
      "place_id": placeID
    }
    if (placeID) {
      setLoader(true)
      checkOut(payload, isCheckedOut)
    }
    else {
      toastDisplay(translate(localeJson, 'already_checked_out'),'','',"error");
    }
  }

  return (
    // <div className="flex justify-content-center">
    //   <div className="m-2 w-12 xlScreenMaxWidth mdScreenMaxWidth">
    <div>
    <div className="grid">
      <div className="col-12">
        <div className="card">
        {data?.data?.length > 0 && (
          <>
            <EvacueeFamilyDetailHistory data={data} header={translate(localeJson, "reg_confirm")} > </EvacueeFamilyDetailHistory>
            {/* <FamilyListComponent data={data} header={translate(localeJson, "checkout_confirm")} /> */}
            <div className="flex flex-column justify-content-center align-items-center">
              <div className="w-12 lg:w-6">
                <ButtonRounded
                  buttonProps={{
                    buttonClass: "w-full h-3rem primary-button ",
                    type: "submit",
                    rounded: "true",
                    text: translate(localeJson, "exit_Button"),
                    onClick: () => {
                      doCheckout(data?.data[0]?.place_id)
                    }
                  }}
                  parentClass={"w-full primary-button"}
                />
                <ButtonRounded
                  buttonProps={{
                    type: "button",
                    rounded: "true",
                    custom: "",
                    buttonClass:
                      "back-button w-full custom-icon-button h-3rem justify-content-center",
                    text: translate(localeJson, "return"),
                    onClick: (() => {
                      router.push('/user/checkout')
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
        </div>
      </div>
    </div>
    </div>
    //   {/* </div>
    // </div> */}
  );
};

export default CheckOutDetails;