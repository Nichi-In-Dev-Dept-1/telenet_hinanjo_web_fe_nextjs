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

const Layout = (props) => {
    const { layoutConfig, layoutState, setLayoutState, loader, localeJson, } = useContext(LayoutContext);
    const topbarRef = useRef(null);
    const sidebarRef = useRef(null);
    const router = useRouter();
    const windowURL = window.location.pathname;
    const path = router.asPath.split('?')[0];

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
            toast.success(translate(localeJson,'qr_success'), {
                position: "top-right",
            });
            await zipDownloadWithURL(response.data.data.download_link);
            localStorage.setItem('batch_id','');
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