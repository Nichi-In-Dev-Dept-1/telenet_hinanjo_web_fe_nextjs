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
        "/user/list": "Telenet - User List",
        "/user/dashboard": "Telenet - User Dashboard",
        "/user/register/member": "Telenet - Register Member",
        "/user/register/member/details": "Telenet - Register Member Details",
        "/user/checkout": "Telenet - Checkout",
        "/user/checkout/details": "Telenet - Checkout Details",
        "/user/external": "Telenet - External",
        "/user/public-evacuees/": "Telenet - Public Evacuees",
        "/user/temp-register": "Telenet - Temporary Registration",
        "//user/temp-edit/confirm": "Telenet - Temporary Details Confirmation",
        "/user/temp-register/success": "Telenet - Temporary Registration Success",
        "/user/temp-edit": "Telenet - Temporary Edit",
        "/user/person-count": "Telenet - Person Count",
        "/user/event-list": "Telenet - Event List",
        "/user/event-list/": "Telenet - Event List",
        "/user/event/dashboard": "Telenet - Event Dashboard",
        "/user/event/register": "Telenet - Event Register",
        "/user/event/register/member": "Telenet - Event Register Member",
        "/user/event/register/member/details": "Telenet - Event Register Member Details",
        "/user/event/checkout": "Telenet - Event Checkout",
        "/user/event-checkout/details": "Telenet - Event Checkout Details",
        "/user/qr/app": "Telenet - QR App",
        "/event/register/member/success": "Telenet - Event Register Member Success",


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
        "/admin/login": "ログイン｜管理システム",
        "/admin/dashboard": "避難所状況一覧｜管理システム",
        "/admin/settings": "環境設定｜管理システム",
        "/admin/event-status-list": "イベント状況一覧｜管理システム",
        "/admin/event-attendees-list": "出席者一覧｜管理システム",
        "/admin/history/place": "避難所状況履歴｜管理システム",
        "/admin/evacuation": "避難者一覧｜管理システム",
        "/admin/temp-registration": "避難前登録者一覧｜管理システム",
        "/admin/external/family/list": "外部避難者一覧｜管理システム",
        "/admin/shortage-supplies": "不足物資一覧｜管理システム",
        "/admin/stockpile/summary": "備蓄品集計｜管理システム",
        "/admin/statistics": "統計｜管理システム",
        "/admin/qrcode/csv/import": "QRコード作成｜管理システム",
        "/admin/staff-management": "スタッフ管理｜管理システム",
        "/admin/hq-staff-management": "本部スタッフ管理｜管理システム",
        "/admin/admin-management": "管理者管理｜管理システム",
        "/admin/event": "イベントマスタ管理｜管理システム",
        "/admin/questionnaire": "問診マスタ管理｜管理システム",
        "/admin/place": "避難所マスタ管理｜管理システム",
        "/admin/material": "物資マスタ管理｜管理システム",
        "/admin/stockpile/master": "備蓄品マスタ管理｜管理システム",
        "/admin/special/care": "要配慮者事項｜管理システム",
        "/admin/setting": "環境設定｜管理システム",
        "/admin/event-attendees-list/family-detail": "出席者詳細｜管理システム",
        "/admin/evacuation/family-detail": "避難者詳細｜管理システム",
        "/admin/temp-registration/family-detail": "避難前登録者詳細｜管理システム",
        "/admin/external/family/list/family-detail": "外部避難者詳細｜管理システム",
        "/admin/place/create": "避難所新規｜管理システム",
        "/admin/place/detail": "避難所詳細｜管理システム",
        "/admin/place/edit": "避難所編集｜管理システム",
        "/admin/external/family": "外部避難者集計｜管理システム",
        "/admin/questionnaire/master": "全体の個別項目｜管理システム",
        "/admin/questionnaire/individual": "個人ごとの個別項目｜管理システム",

        // User URLs  
        "/user/list": "避難所管理システム一覧｜ユーザー管理",
        "/user/dashboard": "ダッシュボード｜ユーザー管理",
        "/user/register/member": "入所手続き｜ユーザー管理",
        "/user/register/member/details": "入所世帯情報｜ユーザー管理",
        "/user/register": "入所手続き｜ユーザー管理",
        "/user/register/confirm": "入所手続き確認｜ユーザー管理",
        "/user/register/success": "入所手続き成功｜ユーザー管理",
        "/user/checkout": "退所手続き｜ユーザー管理",
        "/user/checkout/details": "退所世帯情報｜ユーザー管理",
        "/user/external": "外部避難者登録｜ユーザー管理",
        "/user/public-evacuees/": "公共避難者登録｜ユーザー管理",
        "/user/person-count": "家族(数)｜ユーザー管理",
        "/user/temp-register": "避難前登録｜ユーザー管理",
        "/user/temp-register/confirm": "避難前登録確認｜ユーザー管理",
        "/user/temp-person-count": "家族(数)｜ユーザー管理",
        "/user/temp-register/success": "避難前登録手続き｜ユーザー管理",
        "/user/temp-edit": "避難前登録編集｜ユーザー管理",
        "/user/event-list": "イベント一覧｜ユーザー管理",
        "/user/event-list/": "イベント一覧｜ユーザー管理",
        "/user/event/dashboard": "イベントダッシュボード｜ユーザー管理",
        "/user/event/register": "イベント登録｜ユーザー管理",
        "/user/event/register/member": "入場手続き｜ユーザー管理",
        "/user/event/checkout": "退場手続き｜ユーザー管理",
        "user/qr/app": "QRコード登録｜ユーザー管理",
        "/event/register/member/success": "登録完了｜ユーザー管理",
        // Staff URLs  
        "/staff/login": "ログイン｜スタッフ管理 ",
        "/staff/dashboard": "避難所の状況｜スタッフ管理",
        "/staff/family": "避難者一覧｜スタッフ管理",
        "/staff/family/family-detail": "避難者詳細｜スタッフ管理",
        "/staff/temporary/family": "避難前登録者一覧｜スタッフ管理",
        "/staff/external/family-list": "外部避難者一覧｜スタッフ管理",
        "/staff/stockpile/dashboard": "備蓄品一覧｜スタッフ管理",
        "/staff/stockpile/history": "備蓄品履歴｜スタッフ管理",
        "/staff/supplies": "必要物資登録｜スタッフ管理",
        "/staff/register/check-in": "入所者数登録｜スタッフ管理",
        "/staff/temporary/family-detail": "避難前登録者詳細｜スタッフ管理",
        "/staff/external/family-list/family-detail": "外部避難者詳細｜スタッフ管理",
        "/staff/event-staff/dashboard": "イベントの状況｜スタッフ管理",
        "/staff/event-staff/family": "出席者一覧｜スタッフ管理",
        "/staff/event-staff/family/family-detail": "出席者詳細｜スタッフ管理",
        // HQ Staff URLs  
        "/hq-staff/login": "ログイン｜本部スタッフ",
        "/hq-staff/dashboard": "避難所の状況｜本部スタッフ",
        "/hq-staff/history/place": "避難所状況履歴｜本部スタッフ",
        "/hq-staff/evacuation": "避難者一覧｜本部スタッフ",
        "/hq-staff/temp-registration": "避難前登録者一覧｜本部スタッフ",
        "/hq-staff/external/family/list": "外部避難者一覧｜本部スタッフ",
        "/hq-staff/shortage-supplies": "必要物資登録｜本部スタッフ",
        "/hq-staff/stockpile/summary": "備蓄品集計｜本部スタッフ",
        "/hq-staff/statistics": "統計｜本部スタッフ",
        "/hq-staff/place": "避難所マスタ管理｜本部スタッフ",
        "/hq-staff/material": "物資マスタ管理｜本部スタッフ",
        "/hq-staff/evacuation/family-detail": "避難者詳細｜本部スタッフ",
        "/hq-staff/temp-registration/family-detail": "避難前登録者詳細｜本部スタッフ",
        "/hq-staff/external/family/list/family-detail": "外部避難者詳細｜本部スタッフ",
        "/hq-staff/place/detail": "避難所詳細｜本部スタッフ"
        
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
            {((window.location.origin === "https://rakuraku.nichi.in" || window.location.origin === "http://localhost:3000")) && (
                <Head>
                    <title>{locale == "ja" ? (pageTitles_ja[path.replace(/\/$/, '')] || 'テレネット') : pageTitles_en[path.replace(/\/$/, '')] || 'Telenet'}</title>
                     <link rel="icon" href={`/layout/images/favicon.ico`} type="image/x-icon"></link>
                </Head>
            )}

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