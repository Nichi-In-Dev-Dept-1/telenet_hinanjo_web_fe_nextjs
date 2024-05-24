import React, { useContext, useEffect } from 'react';
import { Formik } from "formik";
import * as Yup from "yup";
import { classNames } from 'primereact/utils';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import { LayoutContext } from '@/layout/context/layoutcontext';
import { AuthenticationAuthorizationService } from '@/services';
import { toastDisplay, getValueByKeyRecursively as translate } from '@/helper'
import { useAppDispatch } from '@/redux/hooks';
import { setStaffValue } from '@/redux/auth';
import { Button, CustomHeader, ValidationError, Password, InputGroup } from '@/components';
import { setForgetPassword } from '@/redux/fwd_password';

const LoginPage = () => {
    const { layoutConfig, localeJson } = useContext(LayoutContext);
    const router = useRouter();
    const dispatch = useAppDispatch();
    // Getting storage data with help of reducers
    const layoutReducer = useSelector((state) => state.layoutReducer);

    const containerClassName = classNames('auth_surface_ground flex align-items-start justify-content-center overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });
    const schema = Yup.object().shape({
        username: Yup.string()
            .required(translate(localeJson, 'user_id_required'))
            .max(100, translate(localeJson, 'user_id_max')),
        password: Yup.string()
            .required(translate(localeJson, 'password_required'))
            .min(8, translate(localeJson, 'password_atLeast_8_characters'))
            .max(15, translate(localeJson, 'password_max_15_characters')),
    });

    /* Services */
    const { login } = AuthenticationAuthorizationService;
    
    useEffect(() => {
        dispatch(setForgetPassword({
            username: ''
        }));
    }, []);

    const onLoginSuccess = (values) => {
        if (AuthenticationAuthorizationService.staffValue) {
            localStorage.setItem('staff', JSON.stringify(values.data));
            dispatch(setStaffValue({
                staff: values.data
            }));
            if (layoutReducer?.user?.place?.type === "place") {
                router.push("/staff/dashboard");
            } else {
                router.push("/staff/event-staff/dashboard");
            }
        }
    };

    const validateUserIData = (inputData) => {
        const regexExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!inputData.username || regexExp.test(inputData.username)) {
            dispatch(setForgetPassword({
                username: inputData.username
            }));
            router.push('/staff/forgot-password')
        } else {
            toastDisplay(translate(localeJson, 'contact_admin'), '', '', "error");
        }
    }

    return (
        <>
            <Formik
                validationSchema={schema}
                initialValues={{ username: "", password: "" }}
                onSubmit={(values) => {
                    let preparedPayload = values;
                    let prepareKey = layoutReducer?.user?.place?.type == "place" ? "place_id" : "event_id";
                    preparedPayload[prepareKey] = layoutReducer?.user?.place?.id;
                    preparedPayload['username'] = preparedPayload.username.trim();
                    login('staff', preparedPayload, onLoginSuccess, prepareKey);
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
                    <div className={containerClassName}>
                        <div className="flex flex-column align-items-center justify-content-center">
                            <div className="w-full py-2 px-2" >
                                <div className='auth_view py-4 px-4'>
                                    <form onSubmit={handleSubmit}>
                                        <div className="flex justify-content-start w-100 mb-5 auth-header">
                                            <CustomHeader headerClass={"page-header1"} header={translate(localeJson, "staff_login")} />
                                        </div>
                                        <div>
                                            <div className="field custom_inputText">
                                                <InputGroup inpuGroupProps={{
                                                    inputGroupParentClassName: `w-full ${errors.username && touched.username && 'p-invalid'}`,
                                                    name: 'username',
                                                    onChange: handleChange,
                                                    onBlur: handleBlur,
                                                    value: values.username,
                                                    labelProps: {
                                                        text: translate(localeJson, 'userId'),
                                                        spanText: "*",
                                                        inputGroupLabelClassName: "mb-2",
                                                        inputGroupLabelSpanClassName: "p-error"
                                                    },
                                                }} />
                                                <ValidationError errorBlock={errors.username && touched.username && errors.username} />
                                            </div>
                                            <div className="field custom_inputText">
                                                <Password
                                                    passwordProps={{
                                                        passwordParentClassName: `w-full password-form-field ${errors.password && touched.password && 'p-invalid'}`,
                                                        labelProps: {
                                                            text: translate(localeJson, 'password'),
                                                            spanText: "*",
                                                            passwordLabelSpanClassName: "p-error",
                                                            passwordLabelClassName: "block",
                                                        },
                                                        name: 'password',
                                                        value: values.password,
                                                        onChange: handleChange,
                                                        onBlur: handleBlur,
                                                        passwordClass: "w-full"
                                                    }}
                                                />
                                                <ValidationError errorBlock={errors.password && touched.password && errors.password} />
                                            </div>
                                            <div className='flex justify-content-center mt-5'>
                                                <Button buttonProps={{
                                                    type: 'submit',
                                                    text: translate(localeJson, 'login'),
                                                    buttonClass: "custom_radiusBtn update-button w-full",
                                                }} parentClass={"update-button w-full"} />
                                            </div>
                                            <div className='w-full flex justify-content-center mt-3'>
                                                <Button buttonProps={{
                                                    type: 'button',
                                                    text: translate(localeJson, 'forgot_password_caption'),
                                                    link: "true",
                                                    onClick: () => validateUserIData(values),
                                                }} />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Formik>
        </>
    );
};

export default LoginPage;