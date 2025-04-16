import React, { useContext } from "react"
import { Dialog } from 'primereact/dialog';

import { Button } from "@/components"; 
import { getValueByKeyRecursively as translate } from "@/helper";
import { LayoutContext } from "@/layout/context/layoutcontext";

export default function DbResetModal(props) {
    const { localeJson } = useContext(LayoutContext);
    const { open, close } = props && props;

    return (
        <div>
            <Dialog
                className="new-custom-modal"
                header={
                    <div className="new-custom-modal text-center">
                        {translate(localeJson, 'db_reset')}
                    </div>
                }
                visible={open}
                draggable={false}
                blockScroll={true}
                onHide={() => close()}
            >
                <div className={`modal-content`} style={{ padding: "0 0" }}>
                    <div className="flex flex-column justify-center">
                        <div className="modal-header">
                            {translate(localeJson, 'db_reset')}
                        </div>
                        <div className="modal-field-bottom-space text-center">
                            <p>{translate(localeJson, 'db_reset_message')}</p>
                        </div>
                        {
                            props.deleteObj &&
                            (<div className="flex justify-center px-4 mt-2">
                                <div>
                                    <div><span className="font-bold modal-label-field-space">{props.deleteObj.firstLabel} : </span>{props.deleteObj.firstValue}</div>
                                    <div><span className="font-bold modal-label-field-space">{props.deleteObj.secondLabel} : </span>{props.deleteObj.secondValue}</div>
                                </div>
                            </div>)
                        }
                        <div className="text-center mt-4">
                            <div className="modal-button-footer-space">
                                <Button buttonProps={{
                                    buttonClass: "w-full del_ok-button",
                                    type: "submit",
                                    text: translate(localeJson, 'continue_button'),
                                    onClick: () => close("confirm"),
                                }} parentClass={"del_ok-button"} />
                            </div>
                            <div >
                                <Button buttonProps={{
                                    buttonClass: "w-full back-button",
                                    text: translate(localeJson, 'cancel'),
                                    onClick: () => close(),
                                }} parentClass={"back-button"} />
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}