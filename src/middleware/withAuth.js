import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import _ from 'lodash';

import { CommonServices, AuthenticationAuthorizationService } from '@/services';

const adminPublicPaths = [
    '/admin/login',
    '/admin/login/',
    '/admin/forgot-password',
    '/admin/forgot-password/',
    '/admin/reset-password',
    '/admin/reset-password/'
];
const staffPublicPathsWithoutLogin = [
    '/staff/forgot-password',
    '/staff/forgot-password/',
    '/staff/reset-password',
    '/staff/reset-password/'
];
const staffPublicPathsWithLogin = [
    '/staff/login',
    '/staff/login/',
    '/staff/forgot-password',
    '/staff/forgot-password/',
    '/staff/reset-password',
    '/staff/reset-password/'
];
const hqStaffPublicPaths = [
    '/hq-staff/login',
    '/hq-staff/login/',
    '/hq-staff/forgot-password',
    '/hq-staff/forgot-password/',
    '/hq-staff/reset-password',
    '/hq-staff/reset-password/'
];

/**
 * Function to delete the current theme link
 */
const deleteCurrentTheme = () => {
    const themeLink = document.getElementById('theme-css');
    if (themeLink) {
        themeLink.parentNode.removeChild(themeLink);
    }
};

/**
 * Function to load a new theme
 */
const loadNewTheme = (url) => {
    const path = url.split('?')[0];
    const role = path.startsWith('/admin') ? 'admin' : path.startsWith('/staff') ? 'staff' : path.startsWith('/hq-staff') ? 'hq-staff' : 'default';
    const themeLink = document.getElementById('theme-css');
    const getThemeApplied = themeLink.href.split('/')[4];
    const getURLPresent = url.split('/')[1];
    if (getURLPresent != 'user' && getURLPresent != getThemeApplied) {
        deleteCurrentTheme(); // Delete the current theme first
        const link = document.createElement('link');
        link.id = 'theme-css';
        link.rel = 'stylesheet';
        link.href = `/themes/${role}/theme.css`;
        document.head.appendChild(link); // Append the new theme link to the head
    } else if (getURLPresent == 'user') {
        if (getThemeApplied != 'default') {
            deleteCurrentTheme(); // Delete the current theme first
            const link = document.createElement('link');
            link.id = 'theme-css';
            link.rel = 'stylesheet';
            link.href = `/themes/${role}/theme.css`;
            document.head.appendChild(link); // Append the new theme link to the head
        }
    }
};

/**
 * Function to check authenticated
 * @param {*} router 
 * @returns 
 */
const checkIfAuthenticated = (router) => {
    const path = router?.asPath.split('?')[0];
    if (path.startsWith('/admin') && !_.isNull(AuthenticationAuthorizationService.adminValue)) {
        return true;
    } else if (path.startsWith('/staff') && !_.isNull(AuthenticationAuthorizationService.staffValue)) {
        return true;
    } else if (path.startsWith('/hq-staff') && !_.isNull(AuthenticationAuthorizationService.hqStaffValue)) {
        return true;
    }
    return false;
};

/**
 * Function to standardize route paths by removing trailing slashes
 * @param {*} path 
 * @returns 
 */
function normalizePath(path) {
    return path.replace(/\/+$/, ""); // Remove trailing slashes
}

/**
 * Function to check accessability
 * @param {*} layoutReducer 
 * @returns 
 */
const checkAccess = (layoutReducer) => {
    const routeBooleanMap = {
        "/admin/event-status-list": layoutReducer?.config?.ADMIN_EVENT_STATUS_LIST,
        "/admin/event-attendees-list": layoutReducer?.config?.ADMIN_EVENT_ATTENDEES_LIST,
        '/admin/event': layoutReducer?.config?.ADMIN_EVENT,
        '/user/event-list': layoutReducer?.config?.USER_EVENT_LIST,
    };
    const currentRoute = normalizePath(window.location.pathname);
    for (const route in routeBooleanMap) {
        if (normalizePath(route) === currentRoute) {
            return routeBooleanMap[route];
        }
    }
    return true;
};

const withAuth = (WrappedComponent) => {
    const Wrapper = (props) => {
        const router = useRouter();

        const [authorized, setAuthorized] = useState(false);

        /* Services */
        const { getSystemSettingDetails } = CommonServices;

        useEffect(() => {
            // Load theme
            loadNewTheme(router.asPath); // Load the initial theme on component mount

            // Fetch system settings details
            getSystemSettingDetails((response) => {
                const data = response.data.model;
                const hasAccess = checkAccess(data);
                const isAuthenticated = checkIfAuthenticated(router);
                const path = router?.asPath.split('?')[0];
                const queryString = router?.asPath.split('?')[1];
                if (!hasAccess) {
                    router.push('/404');
                } else if (isAuthenticated) {
                    if (path.startsWith('/admin')) {
                        if(path.includes('/admin/stockpile') && !data?.stockpile_management_status){
                            router.push({
                                pathname: '/admin/dashboard',
                            });
                        }
                        if (adminPublicPaths.includes(path)) {
                            router.push({
                                pathname: '/admin/dashboard',
                            });
                        } else {
                            router.push({
                                pathname: path,
                                query: queryString
                            });
                        }
                    } else if (path.startsWith('/staff')) {
                        if(path.includes('/staff/stockpile') && !data?.stockpile_management_status){
                            router.push({
                                pathname: '/staff/dashboard',
                            });
                        }
                        if (staffPublicPathsWithLogin.includes(path)) {
                            router.push({
                                pathname: '/user/list',
                            });
                        } else {
                            router.push({
                                pathname: path,
                                query: queryString
                            });
                        }
                    } else if (path.startsWith('/hq-staff')) {
                        if(path.includes('/hq-staff/stockpile') && !data?.stockpile_management_status){
                            router.push({
                                pathname: '/hq-staff/dashboard',
                            });
                        }
                        if (hqStaffPublicPaths.includes(path)) {
                            router.push({
                                pathname: '/hq-staff/dashboard',
                            });
                        } else {
                            router.push({
                                pathname: path,
                                query: queryString
                            });
                        }
                    }
                } else if (!isAuthenticated) {
                    if (path.startsWith('/admin')) {
                        if (!adminPublicPaths.includes(path)) {
                            router.push({
                                pathname: '/admin/login',
                                query: queryString
                            });
                        } else {
                            router.push({
                                pathname: path,
                                query: queryString
                            });
                        }
                    } else if (path.startsWith('/staff')) {
                        if (!staffPublicPathsWithoutLogin.includes(path)) {
                            router.push('/user/list');
                        } else {
                            router.push({
                                pathname: path,
                                query: queryString
                            });
                        }
                    } else if (path.startsWith('/hq-staff')) {
                        if (!hqStaffPublicPaths.includes(path)) {
                            router.push('/hq-staff/login');
                        } else {
                            router.push({
                                pathname: path,
                                query: queryString
                            });
                        }
                    } else if (path == '/user' || path == '/user/') {
                        router.push('/user/list');
                    } else {
                        setAuthorized(true);
                    }
                }
            });
            router.events.on('routeChangeComplete', (url) => {
                loadNewTheme(url);
                setAuthorized(true);
            })
        }, []);

        return <WrappedComponent
            {...props}
            {...{
                authorizedStatus: authorized
            }}
        />
    }
    return Wrapper;
};

export default withAuth;




