import React, { useContext, useEffect, useState } from "react"
import { Dialog } from 'primereact/dialog';
import { QrScanner } from '@yudiel/react-qr-scanner';

import { LayoutContext } from "@/layout/context/layoutcontext";
import { getValueByKeyRecursively as translate } from '@/helper'
import { Button } from "@/components";

export default function QrScannerModal(props) {
    const { localeJson } = useContext(LayoutContext);
    const { open, close } = props;

    const [toggleCameraMode, setToggleCameraMode] = useState("environment");
    const [scanned, setScanned] = useState(false);

    useEffect(()=>{
        if (window.innerWidth >= 1024) { setToggleCameraMode("user"); }
    },[window.innerWidth])

    return (
        <div>
            <Dialog
                className="custom-modal fade-in"
                visible={open}
                header={translate(localeJson, 'qr_scanner_popup_dialog')}
                draggable={false}
                blockScroll={true}
                style={{ width: "400px" }}
                onHide={() => close()}
            >
                <div style={{ position: "relative", overflow: "hidden" }}>
                    <QrScanner
                        onDecode={(result) => {
                            if (result && result !== localStorage.getItem('user_qr')) {
                                localStorage.setItem('user_qr', result);
                                props.callback(result);
                                setScanned(true);
                                setTimeout(() => {
                                    localStorage.removeItem('user_qr');
                                    setScanned(false);
                                }, 1000)
                            }
                        }}
                        videoStyle={{
                                     transform: toggleCameraMode == "user" ? 'scaleX(-1)':'inherit', // Flip only for front camera
                                    }}
                        scanDelay={1000}
                        constraints={{
                            facingMode: toggleCameraMode
                        }}
                        onError={(error) => console.error(error?.message)}
                    />
                    {/* Scanning Line Animation */}
                    <div
                        className="scanning-line"
                        style={{
                            position: "absolute",
                            top: 0,
                            left: "18%",
                            width: "65%",
                            height: "5px",
                            background: "rgba(255, 0, 0, 0.5)",
                            animation: "scan 3s linear infinite",
                        }}
                    />

                    {/* Success Blink Effect */}
                    {scanned && (
                        <div
                            className="success-blink"
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                backgroundColor: "rgba(0, 255, 0, 0.3)",
                                animation: "blink 0.5s ease-in-out",
                            }}
                        />
                    )}
                </div>
                <div>
                    <Button buttonProps={
                        {
                            onClick: () => {
                                if (toggleCameraMode == "user") {

                                    setToggleCameraMode("environment");
                                } else {
                                    setToggleCameraMode("user");
                                }
                            },
                            icon: "pi pi-camera",
                            buttonClass: "mt-3 mb-2",
                        }
                    }></Button>

                </div>

                {/* Styles */}
                <style>
                    {`
                    @keyframes scan {
                        0% { top: 10%; }
                        50% { top: 90%; }
                        100% { top: 10%; }
                    }
                    @keyframes blink {
                        0% { opacity: 1; }
                        100% { opacity: 0; }
                    }
                    .fade-in {
                        animation: fadeIn 0.75s ease-in-out;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    `}
                </style>
            </Dialog>
        </div>
    );
}