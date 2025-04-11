import React, { useContext } from "react";
import { Dialog } from "primereact/dialog";
import { useRouter } from "next/router";
import { LayoutContext } from "@/layout/context/layoutcontext";
import { getValueByKeyRecursively as translate } from "@/helper";
import { Button, CustomHeader } from "@/components";

const IvuConfirmDialog = (props) => {
  const { localeJson } = useContext(LayoutContext);
  const router = useRouter();
  return (
    <Dialog
      className="custom-modal w-10 sm:w-8 md:w-6 lg:w-5"
      header={<div>
        <CustomHeader
          headerClass={"page-header1"}
          customParentClassName={"mb-0"}
          header={translate(localeJson,"c_card_reg_ivu")}
        />
      </div>}
      visible={props.visible}
      draggable={false}
      blockScroll={true}
      onHide={() => props.setIvuVisible(false)}
      style={{ width: "375px" }}
      // footer={footer()}
    >
      <div className="col flex justify-content-center mt-4">
        <div className="">
          <h6>{translate(localeJson, "select_card_Option")}</h6>
        </div>
      </div>

      <div className="col mt-4">
        <div className="p-2 flex justify-content-center flex-wrap">
          <Button
            buttonProps={{
              type: "button",
              text: translate(localeJson, "my_number_button"),
              buttonClass: "multi-form-submit w-12",
              rounded: true,
              onClick: () => {
                localStorage.setItem("myNumber", "true");
                localStorage.setItem("driverLicense", "false");
                props.onCardSelected();
                props.setIvuVisible(false);
              },
            }}
            parentClass={"p-2 w-12 sm:w-6 md:w-6 lg:w-6"}
          />
          <Button
            buttonProps={{
              type: "button",
              text: translate(localeJson, "driver_license_button"),
              buttonClass: "multi-form-submit return w-12",
              rounded: true,
              onClick: () => {
                localStorage.setItem("myNumber", "false");
                localStorage.setItem("driverLicense", "true");
                props.setIvuVisible(false);
                props.onCardSelected();
              }, 
            }}
            parentClass={"p-2 w-12 sm:w-6 md:w-6 lg:w-6"}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default IvuConfirmDialog;
