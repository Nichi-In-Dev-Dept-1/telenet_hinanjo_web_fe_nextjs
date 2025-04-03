import React, { useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useEventListener, useMountEffect, useUnmountEffect } from 'primereact/hooks';
import { classNames, DomHandler } from 'primereact/utils';
import PrimeReact from 'primereact/api';
import { ProgressSpinner } from 'primereact/progressspinner';

import AppFooter from '@/layout/AppFooter';
import AppSidebar from '@/layout/AppSidebar';
import AppTopbar from '@/layout/AppTopbar';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { zipDownloadWithURL, getValueByKeyRecursively as translate, } from '@/helper';
import { QRCodeCreateServices } from '@/services';
import toast from 'react-hot-toast';
import Head from 'next/head'; // Import Head for SEO-friendly title updates

const Layout = (props) => {
    const { layoutConfig, layoutState, setLayoutState, loader, localeJson, locale } = useContext(LayoutContext);
    const topbarRef = useRef(null);
    const sidebarRef = useRef(null);
    const router = useRouter();
    const windowURL = window.location.pathname;
    const path = router.asPath.split('?')[0];
    const pageTitles_en = {
        // Admin URLs  
        "/admin/login": "Admin - Login",
        "/admin/dashboard": "Admin - Dashboard",
        "/admin/settings": "Admin - Settings",
        "/admin/event-status-list": "Admin - Event-Status-List",
        "/admin/event-attendees-list": "Admin - Event-Attendees-List",
        "/admin/history/place": "Admin - History Place",
        "/admin/evacuation": "Admin - Evacuation",
        "/admin/temp-registration": "Admin - Temp Registration",
        "/admin/external/family/list": "Admin - External Family List",
        "/admin/shortage-supplies": "Admin - Shortage Supplies",
        "/admin/stockpile/summary": "Admin - Stockpile Summary",
        "/admin/statistics": "Admin - Statistics",
        "/admin/qrcode/csv/import": "Admin - QR Code CSV Import",
        "/admin/staff-management": "Admin - Staff Management",
        "/admin/hq-staff-management": "Admin - HQ Staff Management",
        "/admin/admin-management": "Admin - Admin Management",
        "/admin/event": "Admin - Event",
        "/admin/questionnaire": "Admin- Questionnaire",
        "/admin/place": "Admin - Place",
        "/admin/material": "Admin - Material",
        "/admin/stockpile/master": "Admin - Stockpile Master",
        "/admin/special/care": "Admin - Special Care",
        "/admin/setting": "Admin - Setting",
        "/admin/event-attendees-list/family-detail": "Admin - Event Attendees Family Detail",
        "/admin/evacuation/family-detail": "Admin - Evacuation Family Detail",
        "/admin/temp-registration/family-detail": "Admin - Temporary Registration Family Detail",
        "/admin/external/family/list/family-detail": "Admin - External Family List Detail",
        "/admin/place/create": "Admin- Create Place",
        "/admin/place/detail": "Admin - Place Detail",
        "/admin/place/edit": "Admin - Place Edit",
        "/admin/external/family": "Admin-External Evacuee Summary",
        "/admin/questionnaire/master": "Admin-Master Questionnaires",
        "/admin/questionnaire/individual": "Admin-Individual Questionnaires",

        // User URLs  
        "/user/list": "Place List",
        "/user/dashboard": "User Dashboard",
        "/user/register/member": "Register Member",
        "/user/register/member/details": "Register Member Details",
        "/user/checkout": "Checkout",
        "/user/checkout/details": "Checkout Details",
        "/user/external": "External",
        "/user/public-evacuees/": "Public Evacuees",
        "/user/temp-register": "Temporary Registration",
        "//user/temp-edit/confirm": "Temporary Details Confirmation",
        "/user/temp-register/success": "Temporary Registration Success",
        "/user/temp-edit": "Temporary Edit",
        "/user/person-count": "Person Count",
        "/user/event-list": "Event List",
        "/user/event-list/": "Event List",
        "/user/event/dashboard": "Event Dashboard",
        "/user/event/register": "Event Register",
        "/user/event/register/member": "Event Register Member",
        "/user/event/register/member/details": "Event Register Member Details",
        "/user/event/checkout": "Event Checkout",
        "/user/event-checkout/details": "Event Checkout Details",
        "/user/qr/app": "QRCode Scan",
        "/event/register/member/success": "Event Register Member Success",
        "/user/event/register/member/success" : "Event Registration Success",
        "/user/qr/app/place-list": "Place List",
        "/user/temp-edit/confirm" : "Pre-evacuation Evacuee Edit Confirmation",


        // Staff URLs  
        "/staff/login": "Staff - Login",
        "/staff/dashboard": "Staff - Staff Dashboard",
        "/staff/family": "Staff - Staff Family",
        "/staff/family/family-detail": "Staff - Family Detail",
        "/staff/temporary/family-detail": "Staff - Temporary Family Detail",
        "/staff/external/family-list/family-detail": "Staff - External Family List Detail",
        "/staff/temporary/family": "Staff - Temporary Family",
        "/staff/external/family-list": "Staff - External Family List",
        "/staff/stockpile/dashboard": "Staff - Stockpile Dashboard",
        "/staff/stockpile/history": "Staff - Stockpile History",
        "/staff/supplies": "Staff - Supplies",
        "/staff/register/check-in": "Staff - Register Check-in",
        "/staff/event-staff/dashboard": "Staff - Event Dashboard",
        "/staff/event-staff/family": "Staff - Event Family",
        "/staff/event-staff/family/family-detail": "Staff - Event Family Detail",

        // HQ Staff URLs  
        "/hq-staff/login": "HQ Staff - Login",
        "/hq-staff/dashboard": "HQ Staff - Dashboard",
        "/hq-staff/history/place": "HQ Staff - History Place",
        "/hq-staff/evacuation": "HQ Staff- Evacuation",
        "/hq-staff/temp-registration": "HQ Staff- Temp Registration",
        "/hq-staff/external/family/list": "HQ Staff - External Family List",
        "/hq-staff/shortage-supplies": "HQ Staff - Shortage Supplies",
        "/hq-staff/stockpile/summary": "HQ Staff - Stockpile Summary",
        "/hq-staff/statistics": "HQ Staff - Statistics",
        "/hq-staff/place": "HQ Staff - Place",
        "/hq-staff/material": "HQ Staff - Material",
        "/hq-staff/evacuation/family-detail": "HQ Staff - Evacuation Family Detail",
        "/hq-staff/temp-registration/family-detail": "HQ Staff - Temporary Registration Family Detail",
        "/hq-staff/external/family/list/family-detail": "HQ Staff - External Family List Detail",
        "/hq-staff/place/detail": "HQ Staff - Place Detail",
    };

    const pageTitles_ja = {
    // Admin URLs  
    "/admin/login": "管理｜ログイン",
    "/admin/dashboard": "管理｜避難所状況一覧",
    "/admin/settings": "管理｜環境設定",
    "/admin/event-status-list": "管理｜イベント状況一覧",
    "/admin/event-attendees-list": "管理｜出席者一覧",
    "/admin/history/place": "管理｜避難所状況履歴",
    "/admin/evacuation": "管理｜避難者一覧",
    "/admin/temp-registration": "管理｜避難前登録者一覧",
    "/admin/external/family/list": "管理｜外部避難者一覧",
    "/admin/shortage-supplies": "管理｜不足物資一覧",
    "/admin/stockpile/summary": "管理｜備蓄品集計",
    "/admin/statistics": "管理｜統計",
    "/admin/qrcode/csv/import": "管理｜QRコード作成",
    "/admin/staff-management": "管理｜スタッフ管理",
    "/admin/hq-staff-management": "管理｜本部スタッフ管理",
    "/admin/admin-management": "管理｜管理者管理",
    "/admin/event": "管理｜イベントマスタ管理",
    "/admin/questionnaire": "管理｜問診マスタ管理",
    "/admin/place": "管理｜避難所マスタ管理",
    "/admin/material": "管理｜物資マスタ管理",
    "/admin/stockpile/master": "管理｜備蓄品マスタ管理",
    "/admin/special/care": "管理｜要配慮者事項",
    "/admin/setting": "管理｜環境設定",
    "/admin/event-attendees-list/family-detail": "管理｜出席者詳細",
    "/admin/evacuation/family-detail": "管理｜避難者詳細",
    "/admin/temp-registration/family-detail": "管理｜避難前登録者詳細",
    "/admin/external/family/list/family-detail": "管理｜外部避難者詳細",
    "/admin/place/create": "管理｜避難所新規",
    "/admin/place/detail": "管理｜避難所詳細",
    "/admin/place/edit": "管理｜避難所編集",
    "/admin/external/family": "管理｜外部避難者集計",
    "/admin/questionnaire/master": "管理｜全体の個別項目",
    "/admin/questionnaire/individual": "管理｜個人ごとの個別項目",

    // User URLs  
    "/user/list": "避難所一覧",
    "/user/dashboard": "ダッシュボード",
    "/user/register/member": "入所手続き",
    "/user/register/member/details": "入所世帯情報",
    "/user/register": "入所手続き",
    "/user/register/confirm": "入所手続き確認",
    "/user/register/success": "入所手続き成功",
    "/user/checkout": "退所手続き",
    "/user/checkout/details": "退所世帯情報",
    "/user/external": "外部避難者登録",
    "/user/public-evacuees/": "公共避難者登録",
    "/user/person-count": "家族(数)",
    "/user/temp-register": "避難前登録",
    "/user/temp-register/confirm": "避難前登録確認",
    "/user/temp-person-count": "家族(数)",
    "/user/temp-register/success": "避難前登録手続き",
    "/user/temp-edit": "避難前登録編集",
    "/user/event-list": "イベント一覧",
    "/user/event-list/": "イベント一覧",
    "/user/event/dashboard": "イベントダッシュボード",
    "/user/event/register": "イベント登録",
    "/user/event/register/member": "入場手続き",
    "/user/event/checkout": "退場手続き",
    "user/qr/app": "QRコード登録",
    "/event/register/member/success": "登録完了",
    "/user/event/register/member/success" : "イベント登録済み",
    "/user/qr/app/place-list": "避難所一覧", 
    "/user/qr/app" : "QRコードスキャン",
    "/user/temp-edit/confirm" : "避難前登録者編集",

    // Staff URLs  
    "/staff/login": "スタッフ｜ログイン",
    "/staff/dashboard": "スタッフ｜避難所の状況",
    "/staff/family": "スタッフ｜避難者一覧",
    "/staff/family/family-detail": "スタッフ｜避難者詳細",
    "/staff/temporary/family": "スタッフ｜避難前登録者一覧",
    "/staff/external/family-list": "スタッフ｜外部避難者一覧",
    "/staff/stockpile/dashboard": "スタッフ｜備蓄品一覧",
    "/staff/stockpile/history": "スタッフ｜備蓄品履歴",
    "/staff/supplies": "スタッフ｜必要物資登録",
    "/staff/register/check-in": "スタッフ｜入所者数登録",
    "/staff/temporary/family-detail": "スタッフ｜避難前登録者詳細",
    "/staff/external/family-list/family-detail": "スタッフ｜外部避難者詳細",
    "/staff/event-staff/dashboard": "スタッフ｜イベントの状況",
    "/staff/event-staff/family": "スタッフ｜出席者一覧",
    "/staff/event-staff/family/family-detail": "スタッフ｜出席者詳細",

    // HQ Staff URLs  
    "/hq-staff/login": "本部スタッフ｜ログイン",
    "/hq-staff/dashboard": "本部スタッフ｜避難所の状況",
    "/hq-staff/history/place": "本部スタッフ｜避難所状況履歴",
    "/hq-staff/evacuation": "本部スタッフ｜避難者一覧",
    "/hq-staff/temp-registration": "本部スタッフ｜避難前登録者一覧",
    "/hq-staff/external/family/list": "本部スタッフ｜外部避難者一覧",
    "/hq-staff/shortage-supplies": "本部スタッフ｜必要物資登録",
    "/hq-staff/stockpile/summary": "本部スタッフ｜備蓄品集計",
    "/hq-staff/statistics": "本部スタッフ｜統計",
    "/hq-staff/place": "本部スタッフ｜避難所マスタ管理",
    "/hq-staff/material": "本部スタッフ｜物資マスタ管理",
    "/hq-staff/evacuation/family-detail": "本部スタッフ｜避難者詳細",
    "/hq-staff/temp-registration/family-detail": "本部スタッフ｜避難前登録者詳細",
    "/hq-staff/external/family/list/family-detail": "本部スタッフ｜外部避難者詳細",
    "/hq-staff/place/detail": "本部スタッフ｜避難所詳細"
};      


    const [bindMenuOutsideClickListener, unbindMenuOutsideClickListener] = useEventListener({
        type: 'click',
        listener: (event) => {
            const isOutsideClicked = !(sidebarRef.current.isSameNode(event.target) || sidebarRef.current.contains(event.target) || topbarRef.current.menubutton.isSameNode(event.target) || topbarRef.current.menubutton.contains(event.target));
            if (isOutsideClicked) {
                hideMenu();
            }
        }
    });

    const [bindProfileMenuOutsideClickListener, unbindProfileMenuOutsideClickListener] = useEventListener({
        type: 'click',
        listener: (event) => {
            const isOutsideClicked = !(
                topbarRef.current.topbarmenu.isSameNode(event.target) ||
                topbarRef.current.topbarmenu.contains(event.target) ||
                topbarRef.current.topbarmenubutton.isSameNode(event.target) ||
                topbarRef.current.topbarmenubutton.contains(event.target)
            );

            if (isOutsideClicked) {
                hideProfileMenu();
            }
        }
    });

    const hideMenu = () => {
        setLayoutState((prevLayoutState) => ({ ...prevLayoutState, overlayMenuActive: false, staticMenuMobileActive: false, menuHoverActive: false }));
        unbindMenuOutsideClickListener();
        unblockBodyScroll();
    };

    const hideProfileMenu = () => {
        setLayoutState((prevLayoutState) => ({ ...prevLayoutState, profileSidebarVisible: false }));
        unbindProfileMenuOutsideClickListener();
    };

    const blockBodyScroll = () => {
        DomHandler.addClass('blocked-scroll');
    };

    const unblockBodyScroll = () => {
        DomHandler.removeClass('blocked-scroll');
    };

    useMountEffect(() => {
        PrimeReact.ripple = true;
    })

    useEffect(() => {
        if (layoutState.overlayMenuActive || layoutState.staticMenuMobileActive) {
            bindMenuOutsideClickListener();
        }

        layoutState.staticMenuMobileActive && blockBodyScroll();
    }, [layoutState.overlayMenuActive, layoutState.staticMenuMobileActive]);

    useEffect(() => {
        if (layoutState.profileSidebarVisible) {
            bindProfileMenuOutsideClickListener();
        }
    }, [layoutState.profileSidebarVisible]);

    useEffect(() => {
        router.events.on('routeChangeComplete', () => {
            hideMenu();
            hideProfileMenu();
        });
    }, []);
    useEffect(() => {

        const interval = setInterval(() => {
            const currentValue = localStorage.getItem("batch_id") || "";

            if (currentValue) {
                const payload = { batch_id: currentValue };

                // Call the service to download the zip file
                QRCodeCreateServices.callBatchDownload(payload, onZipDownloadSuccess);
            }
        }, 15000); // 15000 ms = 15 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(interval);

    }, [localStorage.getItem("batch_id")]);



    useUnmountEffect(() => {
        unbindMenuOutsideClickListener();
        unbindProfileMenuOutsideClickListener();
    });

    const onZipDownloadSuccess = async (response) => {
        if (response && response.data.data.download_link) {
            toast.success(translate(localeJson, 'qr_success'), {
                position: "top-right",
            });
            await zipDownloadWithURL(response.data.data.download_link);
            localStorage.setItem('batch_id', '');
        }
    };

    const containerClass = classNames('layout-wrapper', {
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive,
        'p-input-filled': layoutConfig.inputStyle === 'filled',
        'p-ripple-disabled': !layoutConfig.ripple
    });

    const URLS = [
        '/admin/login',
        '/admin/login/',
        '/admin/forgot-password',
        '/admin/forgot-password/',
        '/admin/reset-password',
        '/admin/reset-password/',
        '/staff/login',
        '/staff/login/',
        '/staff/forgot-password',
        '/staff/forgot-password/',
        '/staff/reset-password',
        '/staff/reset-password/',
        '/hq-staff/login',
        '/hq-staff/login/',
        '/hq-staff/forgot-password',
        '/hq-staff/forgot-password/',
        '/hq-staff/reset-password',
        '/hq-staff/reset-password/'
    ]

    return (
        <React.Fragment>
                <Head>
                    <title>{locale == "ja" ? (pageTitles_ja[path.replace(/\/$/, '')] || 'テレネット') : pageTitles_en[path.replace(/\/$/, '')] || 'Telenet'}</title>
                     <link rel="icon" href={`/layout/images/favicon.ico`} type="image/x-icon"></link>
                </Head>
            <div className={containerClass}>
                <AppTopbar ref={topbarRef} />
                {!URLS.includes(path) && (
                    <div className="layout-sidebar">
                        <div ref={sidebarRef} className='layout_sidebar_scroll' style={{
                            height: windowURL.startsWith('/staff') && "calc(100vh - 7rem)",
                        }}>
                            <AppSidebar />
                        </div>
                    </div>
                )}
                <div className="layout-main-container">
                    <div className="layout-main">
                        {props.children}
                    </div>
                    {!URLS.includes(path) && (
                        <AppFooter />
                    )}
                </div>
                {loader && (
                    <div className="layout-mask-loader">
                        <ProgressSpinner className='progress-spinner' strokeWidth="8" fill="transparent" animationDuration=".5s" />
                    </div>
                )}
            </div>
        </React.Fragment >
    );
};

export default Layout;