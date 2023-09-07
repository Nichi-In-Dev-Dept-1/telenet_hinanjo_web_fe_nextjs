import React, { useState, useContext } from "react"
import { useRouter } from 'next/router'
import { Dialog } from 'primereact/dialog';
import Button from "../button/button";
import { NormalLabel } from "../label";
import { Select } from "../dropdown";
import { InputIcon } from "../input";
import { FileUpload } from "../upload";
import { getValueByKeyRecursively as translate } from '@/helper'
import { LayoutContext } from '@/layout/context/layoutcontext';
import { Formik } from "formik";
import * as Yup from "yup";
import { ValidationError } from "../error";

const StockPileSignupModal = (props) => {
    const { parentMainClass, modalClass, draggable,
        position, contentClass, value, options, onChange, placeholder,
        selectParentClass, onClickTop, OnClickAddition } = props
    const [visible, setVisible] = useState(false);
    const { layoutConfig, localeJson } = useContext(LayoutContext);
    const router = useRouter();

    const schema = Yup.object().shape({
        type: Yup.string()
            .required(translate(localeJson, 'type_required')),
        stockpileItemName: Yup.string()
            .required(translate(localeJson, 'stockpile_name_required'))

    });

    const header = (
        <div>
            <h6 style={{ fontWeight: "600" }} className="page_header">{translate(localeJson, 'signup')}</h6>
        </div>
    )

    return (
        <>
            <Formik
                validationSchema={schema}
                initialValues={{ type: "", stockpileItemName: "" }}
                onSubmit={() => {
                    router.push("/admin/admin-management")
                }}
            >
                {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                }) => (
                    <div className={`${parentMainClass}`}>
                        <Button buttonProps={{
                            text: translate(localeJson, 'signup'),
                            rounded: "true",
                            buttonClass: "border-green-500",
                            bg: "bg-green-500",
                            hoverBg: "hover:bg-green-600",
                            onClick: () => setVisible(true)
                        }} />
                        <Dialog className={`${modalClass}`} draggable={draggable} position={position || "top"} header={header} visible={visible} onHide={() => setVisible(false)} style={{ width: '600px', padding: "10px" }} >

                            <div class={`${contentClass}`}>
                                <form onSubmit={handleSubmit}>
                                    <div className="">
                                        <NormalLabel labelClass="w-full pt-1" text={translate(localeJson, 'type')} spanClass={"p-error"} spanText={"*"} />
                                        <Select selectProps={{
                                            selectClass: "dropdown_select_stock",
                                            value: values.type,
                                            options: options,
                                            name: "type",
                                            onChange: handleChange,
                                            onBlur: handleBlur,
                                            placeholder: placeholder
                                        }} parentClass={`${errors.type && touched.type && 'p-invalid'} selectParentClass`} />
                                        <ValidationError errorBlock={errors.type && touched.type && errors.type} />
                                    </div>
                                    <div className="pt-3">
                                        <NormalLabel labelClass="w-full pt-1" text={translate(localeJson, 'stockpile_item_name')} spanClass={"p-error"} spanText={"*"} />
                                        <Select selectProps={{
                                            selectClass: "dropdown_select_stock",
                                            value: values.stockpileItemName,
                                            options: options,
                                            name: "stockpileItemName",
                                            onChange: handleChange,
                                            onBlur: handleBlur,
                                            placeholder: placeholder
                                        }} parentClass={`${errors.stockpileItemName && touched.stockpileItemName && 'p-invalid'} selectParentClass`} />
                                        <ValidationError errorBlock={errors.stockpileItemName && touched.stockpileItemName && errors.stockpileItemName} />
                                    </div>
                                    <div className="pt-3">
                                        <NormalLabel labelClass="w-full pt-1" text={translate(localeJson, 'storage_period')} spanText={translate(localeJson, 'days')} />
                                        <InputIcon inputIconProps={{
                                            keyfilter: "num",
                                            inputClass: "input_stock"
                                        }} />
                                    </div>
                                    <div className="pt-3">
                                        <NormalLabel labelClass="w-full pt-1" text={translate(localeJson, 'image')} />
                                        <FileUpload />
                                    </div>
                                    <div className="p-dialog-footer pt-3">
                                        <div className="text-center">
                                            <Button buttonProps={{
                                                bg: "surface-500",
                                                hoverBg: "w-50 h-4rem hover:surface-700",
                                                buttonClass: "border-white",
                                                text: translate(localeJson, 'cancel'),
                                                type: "button",
                                                onClick: onClickTop
                                            }} parentClass={"inline"} />
                                            <Button buttonProps={{
                                                buttonClass: "w-50 h-4rem button_stock",
                                                text: translate(localeJson, 'addition'),
                                                type: "submit",
                                                onClick: OnClickAddition
                                            }} parentClass={"inline"} />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </Dialog>
                    </div>
                )}
            </Formik>
        </>
    )
}
export default StockPileSignupModal