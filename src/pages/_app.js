import React, { useState, useEffect } from 'react';
import { OpenCvProvider } from 'opencv-react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useRouter } from 'next/router';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from '@/redux/store';
import { Providers } from "@/redux/provider";
import { LayoutProvider } from '../layout/context/layoutcontext';
import Layout from '../layout/layout';
import { AuthenticationAuthorizationService } from '@/services';
import _ from 'lodash';

/**
 * Import global CSS for entire application
*/
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '@/styles/layout/layout.scss';
import '@/styles/components/components.scss';
import '@/styles/pages/pages.scss';

function MyApp({ Component, pageProps }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    /**
     * Check authorization & authentication
    */
    useEffect(() => {
        authCheck(router.asPath);
        router.events.on('routeChangeComplete', () => {
            setAuthorized(true);
        })
    }, []);

    /**
     * Function will help to redirect specific location
     * @param {*} url 
    */
    function authCheck(url) {
        const adminPublicPaths = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];
        const path = url.split('?')[0];
        const queryString = url.split('?')[1];
        if (path.startsWith('/admin')) {
            if (_.isNull(AuthenticationAuthorizationService.adminValue)) {
                router.push({
                    pathname: path,
                    query: queryString
                });
            } else {
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
            }
        }
    }

    return (
        <OpenCvProvider>
            <Providers>
                <PersistGate loading={null} persistor={persistor}>
                    <LayoutProvider>
                        {authorized ? (
                            Component.getLayout ? (
                                <>
                                    {Component.getLayout(<Component {...pageProps} />)}
                                </>
                            ) : (
                                <Layout>
                                    <Component {...pageProps} />
                                </Layout>
                            )
                        ) : (
                            <div style={{
                                height: '100vh',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
                            </div>
                        )}
                    </LayoutProvider>
                </PersistGate>
            </Providers>
        </OpenCvProvider>
    );
}

export default MyApp;