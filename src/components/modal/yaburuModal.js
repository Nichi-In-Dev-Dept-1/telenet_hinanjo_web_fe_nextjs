import React, { useContext, useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { LayoutContext } from "@/layout/context/layoutcontext";
import { getValueByKeyRecursively as translate } from "@/helper";
import Image from "next/image";
import BarcodeReader from "react-barcode-reader";

export default function YaburuModal(props) {
  const { localeJson, setLoader } = useContext(LayoutContext);

  const { open, close,callBack } = props;

  const handleBarcode = (data) => {
    setLoader(true);
    if(data)
    {
        callBack(data)
    }
    else {
        setLoader(false);
    }
    
  };



  return (
    <div>
      <Dialog
        className="custom-modal yappleid-popup w-10 sm:w-8 md:w-4 lg:w-4"
        visible={open}
        header={translate(localeJson, "yapple_modal_start_icon_div")}
        draggable={false}
        blockScroll={true}
        onHide={() => {
          close();
        }}
      >
        <div className="flex justify-content-center">
          <StartIconDiv />
          <BarcodeReader onScan={handleBarcode} />
        </div>
      </Dialog>
    </div>
  );
}

function StartIconDiv() {
  return (
    <div>
      <div className="text-center my-3">
        <div>
          <Image
            src="/layout/images/mapplescan.svg"
            width={80}
            height={80}
            alt="Your SVG Image"
          />
        </div>
      </div>
    </div>
  );
}

