import React, { useContext, useEffect } from 'react'

import { LayoutContext } from '@/layout/context/layoutcontext';

function StaffDashboard() {
    const { locale, localeJson, setLoader } = useContext(LayoutContext);

    useEffect(() => {
        const fetchData = async () => {
            setLoader(false);
        };
        fetchData();
    }, [locale]);

    return (
        <div>
            Dashboard
        </div>
    )
}

export default StaffDashboard;

