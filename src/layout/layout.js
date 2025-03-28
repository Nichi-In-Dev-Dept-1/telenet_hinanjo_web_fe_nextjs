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
        "/admin/login": "Telenet - Admin Login",
        "/admin/dashboard": "Telenet - Dashboard",
        "/admin/settings": "Telenet - Settings",
        "/admin/event-status-list": "Telenet - Event-Status-List",
        "/admin/event-attendees-list": "Telenet - Event-Attendees-List",
        "/admin/history/place": "Telenet - History Place",
        "/admin/evacuation": "Telenet - Evacuation",
        "/admin/temp-registration": "Telenet - Temp Registration",
        "/admin/external/family/list": "Telenet - External Family List",
        "/admin/shortage-supplies": "Telenet - Shortage Supplies",
        "/admin/stockpile/summary": "Telenet - Stockpile Summary",
        "/admin/statistics": "Telenet - Statistics",
        "/admin/qrcode/csv/import": "Telenet - QR Code CSV Import",
        "/admin/staff-management": "Telenet - Staff Management",
        "/admin/hq-staff-management": "Telenet - HQ Staff Management",
        "/admin/admin-management": "Telenet - Admin Management",
        "/admin/event": "Telenet - Event",
        "/admin/questionnaire": "Telenet - Questionnaire",
        "/admin/place": "Telenet - Place",
        "/admin/material": "Telenet - Material",
        "/admin/stockpile/master": "Telenet - Stockpile Master",
        "/admin/special/care": "Telenet - Special Care",
        "/admin/setting": "Telenet - Setting",
        "/admin/event-attendees-list/family-detail": "Telenet - Event Attendees Family Detail",
        "/admin/evacuation/family-detail": "Telenet - Evacuation Family Detail",
        "/admin/temp-registration/family-detail": "Telenet - Temporary Registration Family Detail",
        "/admin/external/family/list/family-detail": "Telenet - External Family List Detail",
        "/admin/place/create": "Telenet - Create Place",
        "/admin/place/detail": "Telenet - Place Detail",
        "/admin/place/edit": "Telenet - Place Edit",

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


        // Staff URLs  
        "/staff/login": "Telenet - Staff Login",
        "/staff/dashboard": "Telenet - Staff Dashboard",
        "/staff/family": "Telenet - Staff Family",
        "/staff/family/family-detail": "Telenet - Family Detail",
        "/staff/temporary/family-detail": "Telenet - Temporary Family Detail",
        "/staff/external/family-list/family-detail": "Telenet - External Family List Detail",
        "/staff/temporary/family": "Telenet - Temporary Family",
        "/staff/external/family-list": "Telenet - External Family List",
        "/staff/stockpile/dashboard": "Telenet - Stockpile Dashboard",
        "/staff/stockpile/history": "Telenet - Stockpile History",
        "/staff/supplies": "Telenet - Supplies",
        "/staff/register/check-in": "Telenet - Register Check-in",
        "/staff/event-staff/dashboard": "Telenet - Event Staff Dashboard",
        "/staff/event-staff/family": "Telenet - Event Staff Family",
        "/staff/event-staff/family/family-detail": "Telenet - Event Staff Family Detail",

        // HQ Staff URLs  
        "/hq-staff/login": "Telenet - HQ Staff Login",
        "/hq-staff/dashboard": "Telenet - HQ Staff Dashboard",
        "/hq-staff/history/place": "Telenet - HQ History Place",
        "/hq-staff/evacuation": "Telenet - HQ Evacuation",
        "/hq-staff/temp-registration": "Telenet - HQ Temp Registration",
        "/hq-staff/external/family/list": "Telenet - HQ External Family List",
        "/hq-staff/shortage-supplies": "Telenet - HQ Shortage Supplies",
        "/hq-staff/stockpile/summary": "Telenet - HQ Stockpile Summary",
        "/hq-staff/statistics": "Telenet - HQ Statistics",
        "/hq-staff/place": "Telenet - HQ Place",
        "/hq-staff/material": "Telenet - HQ Material",
        "/hq-staff/evacuation/family-detail": "Telenet - Evacuation Family Detail",
        "/hq-staff/temp-registration/family-detail": "Telenet - Temporary Registration Family Detail",
        "/hq-staff/external/family/list/family-detail": "Telenet - External Family List Detail",
    };

    const pageTitles_ja = {
        // Admin URLs 
        "/admin/login": "管理システム - ログイン",
        "/admin/dashboard": "管理システム - 避難所状況一覧",
        "/admin/settings": "管理システム - 環境設定",
        "/admin/event-status-list": "管理システム -イベント状況一覧",
        "/admin/event-attendees-list": "管理システム- 出席者一覧",
        "/admin/history/place": "管理システム - 避難所状況履歴",
        "/admin/evacuation": "管理システム - 避難者一覧",
        "/admin/temp-registration": "管理システム - 避難前登録者一覧",
        "/admin/external/family/list": "管理システム - 外部避難者一覧",
        "/admin/shortage-supplies": "管理システム - 不足物資一覧",
        "/admin/stockpile/summary": "管理システム - 備蓄品集計",
        "/admin/statistics": "管理システム - 統計",
        "/admin/qrcode/csv/import": "管理システム -QRコード作成",
        "/admin/staff-management": "管理システム- スタッフ管理",
        "/admin/hq-staff-management": "管理システム - 本部スタッフ管理",
        "/admin/admin-management": "管理システム - 管理者管理",
        "/admin/event": "管理システム -イベントマスタ管理",
        "/admin/questionnaire": "管理システム - 問診マスタ管理",
        "/admin/place": "管理システム - 避難所マスタ管理",
        "/admin/material": "管理システム - 物資マスタ管理",
        "/admin/stockpile/master": "管理システム - 備蓄品マスタ管理",
        "/admin/special/care": "管理システム - 要配慮者事項",
        "/admin/setting": "管理システム - 環境設定",
        "/admin/event-attendees-list/family-detail": " 管理システム- 出席者詳細",
        "/admin/evacuation/family-detail": "管理システム - 避難者詳細",
        "/admin/temp-registration/family-detail": "管理システム - 避難前登録者詳細",
        "/admin/external/family/list/family-detail": "管理システム - 外部避難者詳細",
        "/admin/place/create": "管理システム - 避難所新規",
        "/admin/place/detail": "管理システム - 避難所詳細",
        "/admin/place/edit": "管理システム - 避難所編集",
        // User URLs  
        "/user/list": "ユーザー管理 -避難所管理システム一覧",
        "/user/dashboard": "ユーザー管理 - ダッシュボード",
        "/user/register/member": "ユーザー管理 - 入所手続き",
        "/user/register/member/details": "ユーザー管理 - 入所世帯情報",
        "/user/register": "ユーザー管理 - 入所手続き",
        "/user/register/confirm": "ユーザー管理 - 入所手続き確認",
        "/user/register/success": "ユーザー管理 - 入所手続き成功",
        "/user/checkout": "ユーザー管理 - 退所手続き",
        "/user/checkout/details": "ユーザー管理 - 退所世帯情報",
        "/user/external": "ユーザー管理 - 外部避難者登録",
        "/user/public-evacuees/": "ユーザー管理 - 公共避難者登録",
        "/user/person-count": "ユーザー管理 - 家族(数)",
        "/user/temp-register": "ユーザー管理 - 避難前登録",
        "/user/temp-register/confirm": "ユーザー管理 - 避難前登録確認",
        "/user/temp-person-count": "ユーザー管理 - 家族(数)",
        "/user/temp-register/success": "ユーザー管理 - 避難前登録手続き",
        "/user/temp-edit": "ユーザー管理 - 避難前登録編集",
        "/user/event-list": "ユーザー管理 - イベント一覧",
        "/user/event-list/": "ユーザー管理 - イベント一覧",
        "/user/event/dashboard": "ユーザー管理 - イベントダッシュボード",
        "/user/event/register": "ユーザー管理 - イベント登録",
        "/user/event/register/member": "ユーザー管理 - 入場手続き",
        "/user/event/checkout": "ユーザー管理 - 退場手続き",
        "user/qr/app": "ユーザー管理 - QRコード登録",
        // Staff URLs  
        "/staff/login": "スタッフ管理 - ログイン",
        "/staff/dashboard": "スタッフ管理 - 避難所の状況",
        "/staff/family": "スタッフ管理 - 避難者一覧",
        "/staff/family/family-detail": "スタッフ管理 - 避難者詳細",
        "/staff/temporary/family": "スタッフ管理 -避難前登録者一覧",
        "/staff/external/family-list": "スタッフ管理 -  外部避難者一覧",
        "/staff/stockpile/dashboard": "スタッフ管理 - 備蓄品一覧",
        "/staff/stockpile/history": "スタッフ管理 - 備蓄品履歴",
        "/staff/supplies": "スタッフ管理 - 必要物資登録",
        "/staff/register/check-in": "スタッフ管理 - 入所者数登録",
        "/staff/temporary/family-detail": "スタッフ管理 - 避難前登録者詳細",
        "/staff/external/family-list/family-detail": "スタッフ管理 - 外部避難者詳細",
        "/staff/event-staff/dashboard": "スタッフ管理 - イベントの状況",
        "/staff/event-staff/family": "スタッフ管理 - 出席者一覧",
        "/staff/event-staff/family/family-detail": "スタッフ管理 - 出席者詳細",
        // HQ Staff URLs  
        "/hq-staff/login": "本部スタッフ - ログイン",
        "/hq-staff/dashboard": "本部スタッフ -避難所の状況",
        "/hq-staff/history/place": "本部スタッフ -避難所状況履歴",
        "/hq-staff/evacuation": "本部スタッフ -避難者一覧",
        "/hq-staff/temp-registration": "本部スタッフ - 避難前登録者一覧",
        "/hq-staff/external/family/list": "本部スタッフ - 外部避難者一覧",
        "/hq-staff/shortage-supplies": "本部スタッフ- 必要物資登録",
        "/hq-staff/stockpile/summary": "本部スタッフ - 備蓄品集計",
        "/hq-staff/statistics": "本部スタッフ - 統計",
        "/hq-staff/place": "本部スタッフ -避難所マスタ管理",
        "/hq-staff/material": "本部スタッフ - 物資マスタ管理",
        "/hq-staff/evacuation/family-detail": "本部スタッフ - 避難者詳細",
        "/hq-staff/temp-registration/family-detail": "本部スタッフ - 避難前登録者詳細",
        "/hq-staff/external/family/list/family-detail": "本部スタッフ - 外部避難者詳細",
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