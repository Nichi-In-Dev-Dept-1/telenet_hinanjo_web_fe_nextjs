import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import { Button, PreRegisterConfirmDialog, QrScannerModal } from "@/components";
import { getValueByKeyRecursively as translate } from '@/helper'
import { LayoutContext } from '@/layout/context/layoutcontext';
import { UserQrService } from "@/services"
import { setCheckInData } from "@/redux/qr_app"
import QrAppConfirmDialog from "@/components/modal/qrAppConfirmationModal";
import _ from "lodash";

export default function App() {
    const { localeJson,locale } = useContext(LayoutContext);
    const router = useRouter()
    const dispatch = useDispatch();
    const placeId = localStorage.getItem("evacuationPlace");
    const placeName = localStorage.getItem("evacuationPlaceName");
    const placeName_En = localStorage.getItem("evacuationPlaceNameEnglish");
    const [openQrPopup, setOpenQrPopup] = useState(false);
    const [openBarcodeConfirmDialog, setOpenBarcodeConfirmDialog] = useState(false);
    const [regData, setRegData] = useState([]);

    const closeQrPopup = () => {
        setOpenQrPopup(false);
    }
    const { register } = UserQrService;

    const qrResult = (res) => {
        let formData = new FormData();
        formData.append("content", res)
        register(formData, (result) => {
            if(result)
            {
            let place_id = result.data?.data[0]?.place_id 
            if(place_id!=placeId) {
                closeQrPopup()
                let data = result.data?.data;
                data[0].place_id = placeId;
                data[0].place_name = placeName;
                setRegData(data);
                setOpenBarcodeConfirmDialog(true);
                return;
            }
            dispatch(setCheckInData(result.data?.data))
            router.push('/user/qr/app/register')
            }
            else {
                closeQrPopup()
            }
        })
    }

    useEffect(()=>{
        if(!placeId) {
            router.push('/user/qr/app/place-list');
        }
    })

    useEffect(() => {
        const handlePopstate = () => {
          // Clear localStorage when the back button is clicked
          localStorage.removeItem("evacuationPlace");
          localStorage.removeItem("evacuationPlaceName");
          localStorage.removeItem("evacuationPlaceNameEnglish");
          
        };
    
        const handleBeforeUnload = () => {
          // Clear localStorage when the page is about to be unloaded
          localStorage.removeItem("evacuationPlace");
          localStorage.removeItem("evacuationPlaceName");
          localStorage.removeItem("evacuationPlaceNameEnglish");
        };
    
        // Attach the event listeners when the component mounts
        window.addEventListener("popstate", handlePopstate);
        window.addEventListener("beforeunload", handleBeforeUnload);
    
        // Clean up the event listeners when the component unmounts
        return () => {
          window.removeEventListener("popstate", handlePopstate);
          window.removeEventListener("beforeunload", handleBeforeUnload);
        };
      }, [locale]);

    return (
        <div className='grid flex-1'>
            <div className='col-12 flex-1'>
                <div className='card flex flex-column h-full align-items-center justify-content-center'>
                    <div className=" w-9">
                        <QrScannerModal
                            open={openQrPopup}
                            close={closeQrPopup}
                            callback={qrResult}>
                        </QrScannerModal>
                        <QrAppConfirmDialog header={translate(localeJson, "confirmation")}
                    visible={openBarcodeConfirmDialog}
                    setVisible={setOpenBarcodeConfirmDialog}
                    doAutoCheckout={()=>{
                        setOpenBarcodeConfirmDialog(false);
                        dispatch(setCheckInData(regData));
                        router.push('/user/qr/app/register');
                    }}
                />
                        <div className="flex flex-column justify-content-center align-item-center w-full">
                                <h5 className="text-center  user-dashboard-header"> {translate(localeJson, "user_dashboard_1")}</h5>
                                <div className="flex justify-content-center">
                                    <h5 className="user-dashboard-header" style={{ lineHeight: "32px" }}></h5>
                                    <h5 className="text-center header_clr user-dashboard-header white-space-nowrap overflow-hidden text-overflow-ellipsis">
                                        {locale == 'ja' ? placeName : !_.isNull(placeName_En)?placeName_En:placeName}
                                    </h5>
                                    <h5 className="user-dashboard-header" style={{ lineHeight: "32px" }}></h5>
                                </div>
                            </div>
                        <div className="h-full" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Button buttonProps={{
                                type: 'submit',
                                rounded: "true",
                                style:{fontSize:"20px",height:"54px"},
                                buttonClass: "qr-button flex align-items-center justify-content-center",
                                text:" "+translate(localeJson, 'qr_scanner_popup_btn'),
                                className:"pi pi-qrcode flex align-items-center justify-content-center",   
                                onClick: () => { setOpenQrPopup(true) },
                            }} parentClass={"flex qr-button"} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}