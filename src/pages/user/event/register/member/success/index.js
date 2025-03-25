import React, { useContext,useState } from "react";
import { useRouter } from "next/router";

import { Button, CommonDialog } from "@/components";
import { LayoutContext } from "@/layout/context/layoutcontext";
import { getValueByKeyRecursively as translate } from "@/helper";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { reset } from "@/redux/register";

const RegisterSuccess = () => {
  const { localeJson } = useContext(LayoutContext);
  const router = useRouter()
  const dispatch = useAppDispatch()
  const checkInReducer = useAppSelector((state) => state.checkInReducer);
    const [confirm, setConfirm] = useState(false);

  const family_code = checkInReducer?.checkInData?.familyCode;

  return (
    <>  <CommonDialog
                        open={confirm}
                        dialogBodyClassName="p-3 text-center"
                        header={translate(localeJson, 'barcode_dialog_btn_label')}
                        content={translate(localeJson, 'return_home_message')}
                        position={"center"}
                        footerParentClassName={"text-center pt-5"}
                        footerButtonsArray={[
                            {
                                buttonProps: {
                                    buttonClass: "back-button w-full",
                                    text: translate(localeJson, "no"),
                                    onClick: () => {
                                      setConfirm(false);
                                    },
                                },
                                parentClass: "back-button block"
                            },
                            {
                                buttonProps: {
                                    buttonClass: "mt-2 w-full",
                                    type: "submit",
                                    text: translate(localeJson, "yes"),
                                    onClick: () => {
                                      setConfirm(false);
                                      dispatch(reset())
                                      router.push('/user/event/dashboard')
                                        
                                    },
                                },
                                parentClass: "block"
                            }
                        ]}
                        close={() => {
                          setConfirm(false);
                        }}
                    />
    <div className='grid flex-1'>
      <div className='col-12 flex-1'>
        <div className='card flex flex-column h-full align-items-center justify-content-center'>
          <div className="mdScreenMaxWidth xlScreenMaxWidth">
            <div className='col-12 pt-8 flex justify-content-center'>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.16675 40.0001C7.16675 21.8762 21.8762 7.16675 40.0001 7.16675C58.1239 7.16675 72.8334 21.8762 72.8334 40.0001C72.8334 58.1239 58.1239 72.8334 40.0001 72.8334C21.8762 72.8334 7.16675 58.1239 7.16675 40.0001ZM18.6465 42.687L30.6132 54.6536C32.1051 56.1455 34.5567 56.153 36.0225 54.6515C36.0233 54.6507 36.0241 54.6498 36.0249 54.649L61.3203 29.3536C62.8156 27.8584 62.8156 25.4418 61.3203 23.9465C59.825 22.4513 57.4085 22.4513 55.9132 23.9465L33.3328 46.5269L24.0536 37.2799C22.5584 35.7846 20.1418 35.7846 18.6465 37.2799C17.1513 38.7751 17.1513 41.1917 18.6465 42.687Z" fill="#2B3D51" stroke="black" />
              </svg>
            </div>
            <p className="text-2xl text-center">{translate(localeJson, "event_reg_success_message")}</p>
            <div className="text-center">
              <p className="text-5xl font-bold">{translate(localeJson, "your_family_code")}</p>
            </div>
            <div className="mb-3 text-center">
              <p className="text-5xl font-bold">{family_code}</p>
            </div>
            <div className="mb-3 text-center block grid col-12 successButtonText">
              <Button buttonProps={{
                type: "button",
                buttonClass: "w-full back-button h-5rem border-radius-5rem",
                text: translate(localeJson, 'return_home'),
                onClick: () => {
                  setConfirm(true);
                },
              }} parentClass={"back-button"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default RegisterSuccess;