import React, { useContext, useEffect } from "react";
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import _ from 'lodash';

import { LayoutContext } from "@/layout/context/layoutcontext";
import { getValueByKeyRecursively as translate } from "@/helper";
import { Button, ButtonRounded } from "@/components";
import { AuthenticationAuthorizationService, UserDashboardServices, CommonServices } from '@/services';
import { useAppDispatch } from '@/redux/hooks';
import { setUserDetails } from '@/redux/layout';
import CustomHeader from "@/components/customHeader";

export default function PublicDashboard() {
    const { locale, localeJson } = useContext(LayoutContext);
    const router = useRouter();
    const dispatch = useAppDispatch();
    // Getting storage data with help of reducers
    const layoutReducer = useSelector((state) => state.layoutReducer);

    /* Services */
    const { getListByID } = UserDashboardServices;
    const { decrypt } = CommonServices;

    useEffect(() => {
        updatePlaceDetails();
    }, []);

    /**
     * Update place details in redux / Place ID
     */
    const updatePlaceDetails = () => {
        // Get the URLSearchParams object from the window location
        const queryParams = new URLSearchParams(window.location.search);
        let key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        let decryptedData = decrypt(queryParams.get('hinan'), key);
        if (decryptedData) {
            let payload = {
                id: decryptedData
            }
            getListByID(payload, (response) => {
                if (response && response.data) {
                    let obj = response.data.model;
                    let payload = Object.assign({}, layoutReducer?.user);
                    payload['place'] = obj;
                    dispatch(setUserDetails(payload));
                }
            })
        }
    }

    return (
        <div>
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <CustomHeader headerClass={"page-header1 white-space-nowrap overflow-hidden text-overflow-ellipsis"} header={locale === "en" && !_.isNull(layoutReducer?.user?.place?.name_en) ? layoutReducer?.user?.place?.name_en : layoutReducer?.user?.place?.name} />
                        {/* <h5 className="page-header1 white-space-nowrap overflow-hidden text-overflow-ellipsis">{locale === "en" && !_.isNull(layoutReducer?.user?.place?.name_en) ? layoutReducer?.user?.place?.name_en : layoutReducer?.user?.place?.name}</h5> */}
                        <div>
                            <div className="mt-3">
                                <div className='flex' style={{ justifyContent: "center", flexWrap: "wrap" }}>
                                    <ButtonRounded buttonProps={{
                                        type: "button",
                                        rounded: "true",
                                        custom: "userDashboard",
                                        buttonClass: "evacuation_button_height update-button",
                                        text: translate(localeJson, 'admission'),
                                        onClick: () => {
                                            router.push({
                                                pathname: 'register/member',
                                            })
                                        },
                                    }} parentClass={"ml-3 mr-3 mt-1 userParentDashboard update-button"} />
                                    <ButtonRounded buttonProps={{
                                        type: 'button',
                                        rounded: "true",
                                        custom: "userDashboard",
                                        buttonClass: "back-button",
                                        text: translate(localeJson, 'exit'),
                                        onClick: () => {
                                            router.push({
                                                pathname: '/user/checkout',
                                            })
                                        },
                                    }} parentClass={"ml-3 mr-3 mt-1 userParentDashboard back-button"} />
                                </div>
                                <p className="p-error mt-3 flex justify-content-center" style={{ fontWeight: "bold" }}>
                                    {translate(localeJson, 'user_dashboard_note')}
                                </p>
                                <div className="mt-3 flex justify-content-end text-higlight clickable-row" onClick={() => {
                                    if (_.isNull(AuthenticationAuthorizationService.staffValue)) {
                                        router.push({
                                            pathname: '/staff/login',
                                        });
                                    } else {
                                        router.push({
                                            pathname: '/staff/dashboard',
                                        });
                                    }
                                }}>
                                    {translate(localeJson, 'go_to_staff_screen')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}