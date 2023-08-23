import React, { useState } from 'react';
import InputGroup from '../input/inputGroup';

export default function Counter(props) {
    const [value, setValue] = useState(props.value);
    const handleIncrement = () => {
        setValue(value + 1);
    };
    const handleDecrement = () => {
        setValue(value - 1);
    };

    return (

        <InputGroup inputGroupProps={{
            inputClass: "text-center",
            value: value,
            onChange: (e) => setValue(parseInt(e.target.value)),
            onRightClick: handleIncrement,
            onLeftClick: handleDecrement,
            rightIcon: "pi pi-plus",
            leftIcon: "pi pi-minus"
        }} parentClass={props.parentClass}

        />

    )
}