import React, { useState, useEffect } from 'react';

function DateTimePicker(props) {
    const { fontsize, bgColor, fontWeight, parentClass } = props
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 60000); // Update every minute

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Tokyo'
    };

    const formattedDateTime = currentDateTime.toLocaleString('ja-JP', options);

    return (
        <div className={`${fontsize} ${bgColor} ${fontWeight} ${parentClass}`}>
            {formattedDateTime.replace(/(\d+)年(\d+)月(\d+)日,/, '$1年$2月$3日 ')}
        </div>
    );
}

export default DateTimePicker;