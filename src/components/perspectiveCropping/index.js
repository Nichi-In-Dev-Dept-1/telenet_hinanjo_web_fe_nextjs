'use client'

import React, { useState, useRef, useCallback,useEffect } from 'react';
import Webcam from "react-webcam";
import { Dialog } from 'primereact/dialog';
import { Spin, Upload } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { FaFileUpload } from 'react-icons/fa';
import { IoMdReverseCamera } from 'react-icons/io';
import { AiOutlineCamera, AiOutlineRotateRight } from 'react-icons/ai';
import { MdSettingsBackupRestore } from 'react-icons/md';

import { Button } from "@/components";
import Cropper from '@/components/perspectiveCropping/cropper'

const { Dragger } = Upload

export const PerspectiveCropping = (props) => {
    const webcamRef = useRef(null);
    const cropperRef = useRef();
    const [displayPosition, setDisplayPosition] = useState(false);
    const [position, setPosition] = useState('center');
    const webcamContainerRef = useRef(null);
    const [cropState, setCropState] = useState();
    const [img, setImg] = useState();
    const [loader, setLoader] = useState(false);
    const [selectUtil, setSelectUtil] = useState('camera');
    const [completed, setCompleted] = useState(false);
    const [toggleCameraMode, setToggleCameraMode] = useState("environment");
    const [rotateAngel, setRotateAngel] = useState(0);

    // Detect whether the user is on a mobile device
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  // Set the camera mode on initial render based on the device type
  useEffect(() => {
    if (isMobile) {
      setToggleCameraMode("environment"); // Use front camera for mobile by default
    } else {
      setToggleCameraMode("user"); // Use rear camera for desktop by default
    }
  }, []);

    const onCameraBtnClick = (name) => {
        // setLoader(true);
        setSelectUtil('camera');
    }

    const onCapture = (name) => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImg(imageSrc);
        setCompleted(false)
    }
    // const onCapture = (name) => {
    //     // Capture the screenshot from the webcam
    //     const imageSrc = webcamRef.current.getScreenshot();
    
    //     // Flip image if using the front-facing camera
    //     const canvas = document.createElement("canvas");
    //     const context = canvas.getContext("2d");
    //     const image = new Image();
        
    //     image.onload = () => {
    //       // Set canvas dimensions
    //       canvas.width = image.width;
    //       canvas.height = image.height;
    //         if(toggleCameraMode=='user')
    //       { context.translate(canvas.width, 0); // Move the origin to top-right
    //         context.scale(-1, 1); // Flip horizontally for the front camera
    //       }
    //       // Draw the image onto the canvas (flipped or not based on camera mode)
    //       context.drawImage(image, 0, 0);
    
    //       // Get the flipped (or original) image as a data URL
    //       const correctedImageSrc = canvas.toDataURL("image/jpeg");
    
    //       // Set the corrected image to the state
    //       setImg(correctedImageSrc);
    //       setCompleted(false);
    //     };
    
    //     image.src = imageSrc; // Load the captured image
    //   };

    const onFileSelectionBtnClick = (name) => {
        setSelectUtil('file');
    }

    const renderFooter = (name) => {
        return (
            <div className={`${!cropState && selectUtil == "camera" ? 'footer-view' : 'footer-view1'} `}>
                <div className='mt-2'>
                    {!cropState &&
                        <>
                            {selectUtil == "camera" ? (
                                <>
                                    <Button
                                        parentStyle={{ display: "inline" }}
                                        buttonProps={{
                                            type: "button",
                                            icon: <IoMdReverseCamera className='text-4xl' />,
                                            buttonClass: "px-3",
                                            style: {
                                                backgroundColor: "var(--blue-700)",
                                                borderColor: "var(--blue-700)"
                                            },
                                            onClick: () => {
                                                if (toggleCameraMode == "user") {

                                                    setToggleCameraMode("environment");
                                                } else {
                                                    setToggleCameraMode("user");
                                                }
                                            },
                                        }}

                                    />
                                    <Button
                                        parentStyle={{ display: "inline" }}
                                        buttonProps={{
                                            type: "button",
                                            icon: <FaFileUpload className='text-2xl' />,
                                            buttonClass: "px-3",
                                            style: {
                                                backgroundColor: "var(--yellow-500)",
                                                borderColor: "var(--yellow-500)"
                                            },
                                            onClick: () => onFileSelectionBtnClick(),
                                        }}
                                    />
                                </>
                            ) : (
                                <Button
                                    parentStyle={{ display: "inline" }}
                                    buttonProps={{
                                        type: "button",
                                        icon: <AiOutlineCamera className='text-3xl' />,
                                        buttonClass: "px-3",
                                        style: {
                                            backgroundColor: "var(--orange-500)",
                                            borderColor: "var(--orange-500)"
                                        },
                                        onClick: () => {
                                            onCameraBtnClick()
                                        },
                                    }}
                                />
                            )}
                        </>
                    }
                    <Button
                        parentStyle={{ display: "inline" }}
                        buttonProps={{
                            type: "button",
                            style: {
                                backgroundColor: "var(--red-500)",
                                borderColor: "var(--red-500)"
                            },
                            icon: <MdSettingsBackupRestore className='text-3xl' />,
                            iconPos: 'left',
                            buttonClass: "px-3",
                            onClick: () => {
                                setSelectUtil('camera');
                                setCompleted(false);
                                setImg(undefined);
                                setCropState();
                                setRotateAngel(0);                          
                            },
                        }}
                    />
                </div>
                <div>
                    {!cropState ? (
                        <>
                            <Button
                                parentStyle={{ display: "inline" }}
                                buttonProps={{
                                    type: "button",
                                    text: "撮影する",
                                    buttonClass: "px-3 mt-2",
                                    style: {
                                        backgroundColor: "var(--gray-700)",
                                        borderColor: "var(--gray-700)"
                                    },
                                    onClick: () => {
                                        onCapture()
                                    },
                                }}
                            />
                        </>
                    ) : (
                        <>
                            {(!completed && !baseConvertion) ? (
                                <div>
                                    <Button
                                        parentStyle={{ display: "inline" }}
                                        buttonProps={{
                                            type: "button",
                                            style: {
                                                backgroundColor: "var(--red-500)",
                                                borderColor: "var(--red-500)"
                                            },
                                            icon: <AiOutlineRotateRight className='text-3xl' />,
                                            iconPos: 'left',
                                            buttonClass: "px-3 mt-2",
                                            onClick: () => {
                                                if (rotateAngel == 0) {
                                                    setRotateAngel(-90);
                                                } else if (rotateAngel == -90) {
                                                    setRotateAngel(-180);
                                                } else if (rotateAngel == -180) {
                                                    setRotateAngel(-270);
                                                } else {
                                                    setRotateAngel(0);
                                                }
                                            },
                                        }}
                                    />
                                    <Button
                                        parentStyle={{ display: "inline" }}
                                        buttonProps={{
                                            type: "button",
                                            text: "四角を合わせる",
                                            style: {
                                                backgroundColor: "var(--gray-700)",
                                                borderColor: "var(--gray-700)",
                                                marginBottom: ".2rem",
                                            },
                                            onClick: () => {
                                                doSomething()
                                            },
                                        }}
                                    />
                                </div>
                            ) : (
                                <Button
                                    parentStyle={{ display: "inline" }}
                                    buttonProps={{
                                        type: "button",
                                        text: "OK",
                                        style: {
                                            backgroundColor: "var(--gray-700)",
                                            borderColor: "var(--gray-700)"
                                        },
                                        buttonClass: "mt-2",
                                        onClick: () => {
                                            if(result) 
                                            {
                                            setSelectUtil('camera');
                                            setCompleted(true)
                                            setImg(undefined);
                                            setCropState();
                                            setBaseConvertion(false);
                                            props.callback(result);
                                            }
                                        },
                                    }}
                                />
                            )}
                        </>
                    )}
                </div>
            </div >
        );
    }

    const onDragStop = useCallback((s) => setCropState(s), [])
    const onChange = useCallback((s) => setCropState(s), [])
    const [result, setResult] = useState("");
    const [baseConvertion,setBaseConvertion] = useState(false);

    const doSomething = async () => {
        try {
            const res = await cropperRef.current.done({
                preview: true,
                filterCvParams: {
                    grayScale: false,
                    th: false,
                    thMode: window.cv.ADAPTIVE_THRESH_GAUSSIAN_C
                }
            });

            if (res) {
                const blob = new Blob([res]);
                const reader = new FileReader();

                reader.onload = () => {
                    const base64Data = reader.result;

                    // Create an image element
                    const img = new Image();

                    img.onload = () => {
                        // Create a canvas element
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        // Set the canvas dimensions to the image dimensions
                        canvas.width = img.width;
                        canvas.height = img.height;

                            ctx.drawImage(img, 0, 0);
                        // Draw the image on the canvas


                        // Convert the canvas content to a data URL (PNG format)
                        const pngDataUrl = canvas.toDataURL('image/png');

                        // Set the result with the PNG data URL
                        setResult(pngDataUrl);
                        setBaseConvertion(true);
                    };

                    // Set the image source to the base64 data
                    img.src = base64Data;
                };

                reader.readAsDataURL(blob);
            }

            setCompleted(true);
        } catch (e) {
            console.error('error', e);
        }
    };


    const onImgSelection = async (e) => {
        setLoader(true);
        if (e.file) {
            // It can also be a http or base64 string for example
            setTimeout(() => {
                setImg(e.file.originFileObj);
                setCompleted(false);
                setLoader(false);
            }, 2000);
        }
    }

    const draggerProps = {
        name: 'file',
        multiple: false,
        onChange: onImgSelection
    }

    return (
        <div className="grid">
            <Dialog
                header="身分証明書をスキャンします"
                visible={props.visible}
                position={"top"}
                draggable={false}
                blockScroll={true}
                onHide={() => {
                    props.hide();
                    setSelectUtil("camera");
                    setCompleted(false);
                    setImg(undefined);
                    setCropState();
                    setResult("");
                    setBaseConvertion(false);
                    setRotateAngel(0);
                }}
                footer={renderFooter('displayPosition')}
                className="custom-modal ocr-modal m-0 sm:m-2 lg:m-2 md:m-2"
                modal
                contentStyle={{ overflow: 'hidden' }}
            >
                <div ref={webcamContainerRef}>
                    {loader ? (
                        <div
                            className=''
                            style={{
                                height: "100%",
                                width: "100%",
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                            <Spin />
                        </div>
                    ) : !loader && img ? (
                        <div
                            style={{
                                height: "100%",
                                width: "100%",
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingBottom: '1rem',
                                paddingTop: '1rem',
                            }}
                        >
                            <Cropper
                                ref={cropperRef}
                                image={img}
                                onChange={onChange}
                                onDragStop={onDragStop}
                                maxWidth="300"
                                maxHeight="450"
                                // maxHeight={"100%"}
                                pointBgColor={"var(--primary-color)"}
                                pointBorder={"var(--primary-color)"}
                                lineColor={"var(--primary-color)"}
                                lineWidth={5}
                                pointSize={20}
                                rotateAngel={rotateAngel}
                            />
                        </div>
                    ) : (
                        <>
                            {selectUtil == "camera" ? (
                                <div className="webcam-container">
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef && webcamRef}
                                        screenshotFormat="image/jpeg"
                                        screenshotQuality={1}
                                        className={`webcam-element ${toggleCameraMode=="user"?"video-transform":""}`}
                                        // mirrored={toggleCameraMode=="user"?true:false}
                                        videoConstraints={{
                                            facingMode: toggleCameraMode
                                        }}
                                        // style={{
                                        //     transform: toggleCameraMode == "user" ? 'scaleX(-1)':'inherit', // Flip only for front camera
                                        //   }}
                                    />
                                    <div className="overlay"></div>
                                    <div className="overlay-text">
                                        身分証明書を四角の枠内におさまるようにして撮影するボタンを押してください
                                    </div>
                                </div>
                            ) : !img && !loader ? (
                                <Dragger {...draggerProps} >
                                    <p>
                                        <PlusOutlined />
                                    </p>
                                    <p>Upload</p>
                                </Dragger>
                            ) : null}
                        </>
                    )}
                </div>
            </Dialog >
        </div >
    );
};