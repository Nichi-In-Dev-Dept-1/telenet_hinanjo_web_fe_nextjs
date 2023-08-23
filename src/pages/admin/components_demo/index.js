import React, { useState, useEffect } from 'react';
import { Divider } from 'primereact/divider';
import { CustomerService } from '@/helper/datatableservice';
import ImageCropper from '@/pages/POC/CROP';
import {
    NormalTable, Counter, Linker, NormalLabel, DeleteModal,
    ImageComponent, DateCalendar, TimeCalendar, DateTimeCalendar,
    DateTimePicker, NormalCheckBox, InputSwitch, ToggleSwitch, DividerComponent,
    Btn, InputSelect, Select, AvatarComponent, RadioBtn, BarcodeScanner, FileUpload,
    InputIcon, InputLeftRightGroup, InputGroup, TextArea
} from '@/components';

export default function ComponentsDemo() {
    const [checked1, setChecked1] = useState(false);

    const [selectedCity, setSelectedCity] = useState(null);

    const cities = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];

    const [ingredient, setIngredient] = useState('');

    const [value, setValue] = useState(501);

    const handleIncrement = () => {
        setValue(value + 1);
    };

    const handleDecrement = () => {
        setValue(value - 1);
    };

    const [ingredients, setIngredients] = useState([]);

    const onIngredientsChange = (e) => {
        let _ingredients = [...ingredients];

        if (e.checked)
            _ingredients.push(e.value);
        else
            _ingredients.splice(_ingredients.indexOf(e.value), 1);

        setIngredients(_ingredients);
    }

    const options = [
        { label: '現在の避難者数', value: 'NY' },
        { label: '避難所の混雑率', value: 'RM' },
        { label: '要配慮者の避難者数', value: 'LDN' },
    ];

    const [data, setData] = useState(options[0].value);

    const [customers, setCustomers] = useState([]);

    let today = new Date();

    let invalidDates = [today];

    const columns = [
        { field: '避難所', header: '避難所' },
        { field: 'Test1(2)', header: 'Test1(2)' },
        { field: 'Test2(2)', header: 'Test2(2)' },
        { field: 'test3(3)', header: 'test3(3)' },
        { field: 'test6(5)', header: 'test6(5)' },
        {
            field: 'actions',
            header: 'Edit Actions',
            body: (rowData) => (
                <div>
                    <Btn btnProps={{ text: "Edit" }} />
                </div>
            ),
        }, {
            field: 'actions',
            header: 'Delete Actions',
            body: (rowData) => (
                <div>
                    <Btn btnProps={{
                        severity: "danger", text: "delete"
                    }} />
                </div>
            ),
        },
    ];

    const footer = (
        <div className="text-center">
            <Btn btnProps={{
                buttonClass: "h-3rem",
                text: "cancel"
            }} parentClass={"inline"} />
            <Btn btnProps={{
                buttonClass: "h-3rem",
                text: "delete",
                severity: "danger"
            }} parentClass={"inline"} />
        </div>
    );

    useEffect(() => {
        CustomerService.getCustomersMedium().then((data) => setCustomers(data));

    }, []);

    return (
        <div className="grid">
            <div className="col-12">
                <div className='card'>
                    <section className='col-12'>
                        {/* Header */}
                        <h5 className={"page_header"}
                        // borderBottom: "1px solid black",
                        >
                            不足物資一覧
                        </h5>
                        <Divider />
                        <div className="card ">
                            <h2> Buttons Component </h2>
                            <div>
                                <Btn btnProps={{
                                    icon: "pi pi-star-fill",
                                }}
                                    parentClass={"mb-1 border-round-lg"} />
                                <Btn btnProps={{
                                    text: "避難者状況一覧"
                                }}
                                    parentClass={"mb-1"} />
                                <Btn parentClass={"mb-1 border-round-lg"}
                                    btnProps={{
                                        text: "避難者状況一覧",
                                        icon: "pi pi-star-fill",
                                        iconPos: "right"
                                    }} />
                                <Btn parentClass={"mb-1"} btnProps={{
                                    text: "避難者状況一覧",
                                    icon: "pi pi-star-fill",
                                    iconPos: "left",
                                    rounded: "true"
                                }}
                                />
                            </div>
                        </div>

                        < div class="card ">
                            <h2> Date Components</h2>
                            <h6>Current date and time component</h6>
                            <DateTimePicker />
                            <h6>Date Picker</h6>
                            <DateCalendar dateProps={{
                                placeholder: "yy-mm-dd"
                            }} parentClass={"xl:w-4 sm:w-full"} />
                            <h6>Time Picker</h6>
                            <TimeCalendar parentClass={"xl:w-4 sm:w-full"} timeProps={{
                                placeholder: "time"
                            }} />
                            <h6>Disabled days </h6>
                            <DateCalendar parentClass={"xl:w-4 sm:w-full"} dateProps={{
                                disabledDates: invalidDates,
                                disabledDays: [0, 6],
                                placeholder: "yy-mm-dd"
                            }} />
                            <h6>Date and Time with range</h6>
                            <DateTimeCalendar dateTimeProps={{
                                selectionMode: "range"
                            }} parentClass={"xl:w-6 sm:w-full"} />

                        </div>
                        < div class="card ">
                            <h2>input icons</h2>
                            <InputIcon parentClass={"w-3"} inputIconProps={{
                                placeholder: "input-left-icon",
                                icon: "pi pi-search",
                                iconPos: "p-input-icon-left"
                            }} /><br />
                            <InputIcon parentClass={"w-3"} inputIconProps={{
                                placeholder: "input-right-icon",
                                icon: "pi pi-search",
                                iconPos: "p-input-icon-right"
                            }} />
                            <InputIcon parentClass={"mt-3  "} inputIconProps={{
                                inputClass: "xl:w-3 sm:w-full",
                                placeholder: "input"
                            }} />
                            <InputIcon parentClass={"mt-3 "} inputIconProps={{
                                inputClass: "xl:w-3 sm:w-full"
                            }} />
                            <InputIcon parentClass={"mt-3"} inputIconProps={{
                                inputClass: "xl:w-3 sm:w-full",
                                readOnly: "true",
                                value: 30
                            }} />
                            <div class="pt-3">
                                <h2>input group</h2>
                                <InputLeftRightGroup inputLrGroupProps={{
                                    rightIcon: "pi pi-user",
                                    placeholder: "username",
                                }}
                                    parentClass={"xl:w-4 pb-2 "}
                                />
                                <InputLeftRightGroup
                                    inputLrGroupProps={{
                                        type: "password",
                                        leftIcon: "pi pi-user",
                                        placeholder: "password",
                                    }}
                                    parentClass={"xl:w-4 pb-2 "}
                                />
                                <InputGroup inputGroupProps={{
                                    type: "number",
                                    value: value,
                                    onChange: (e) => setValue(e.target.value),
                                    onRightClick: handleIncrement,
                                    onLeftClick: handleDecrement,
                                    rightIcon: "pi pi-plus",
                                    leftIcon: "pi pi-minus"
                                }}
                                    parentClass={"xl:w-4 sm:w-full"} />
                            </div>
                            <div class="pt-3">
                                <h2>TextArea</h2>
                                <TextArea textAreaProps={{
                                    textAreaClass: "w-full",
                                    row: 5,
                                    cols: 10
                                }} />
                            </div>
                            <div class="pt-3">
                                <h2>Input and Dropdown</h2>
                                <InputSelect dropdownProps={{
                                    value: selectedCity,
                                    onChange: (e) => setSelectedCity(e.value),
                                    options: cities,
                                    optionLabel: "name"
                                }}
                                />
                            </div>
                            <div class="pt-3">
                                <h2>Select</h2>
                                <Select selectProps={{
                                    selectClass: "custom_dropdown_items",
                                    value: data,
                                    options: options,
                                    onChange: (e) => setData(e.value),
                                    placeholder: "Select a City"
                                }}
                                    parentClass={"custom_select"}
                                />
                            </div>
                            <div class="pt-3">
                                <h2>Label</h2>
                                <NormalLabel htmlFor="email" text={"email"} labelClass={"font-18 text-primary pr-2"} />
                                <NormalLabel labelClass="w-full font-18 font-bold pt-0" text={"種別"} spanClass={"text-red-500"} spanText={"*"} />
                            </div>
                            <div class="pt-3">
                                <h2>Radio button</h2>
                                <RadioBtn radioBtnProps={{
                                    radioClass: "mr-1",
                                    inputId: "ingredient1",
                                    name: "chk",
                                    value: "Cake",
                                    onChange: (e) => setIngredient(e.value),
                                    checked: ingredient === 'Cake'
                                }}
                                />
                            </div>
                            <div class="pt-3">
                                <h2> Checkbox</h2>
                                {/* <CheckBox checkboxClass={"pr-1"} inputId="ingredient2" name="pizza" value="Mushroom" onChange={onIngredientsChange} checked={ingredients.includes('Mushroom')} /> */}
                                <NormalCheckBox checkBoxProps={{
                                    checkboxClass: "pr-1 h-10",
                                    inputId: "ingredient1",
                                    name: "pizza",
                                    value: "Cheese",
                                    onChange: onIngredientsChange,
                                    checked: ingredients.includes('Cheese')
                                }}
                                    parentClass={"pt-1 custom_checkbox"} />
                            </div>
                            <div class="pt-3">
                                <h2> upload</h2>
                                <FileUpload auto="true" />
                            </div>
                        </div>
                        <div class="card">
                            <h2>Increment Decrment</h2>
                            <Counter value={5} parentClass={"xl:w-10 sm:w-full"} />
                        </div>
                        <div class="card" >
                            <h2>Switch Component</h2>
                            <InputSwitch parentClass={"custom-switch"}
                                inputSwitchProps={{
                                    checked: checked1,
                                    onChange: (e) => setChecked1(e.value)
                                }}
                            />
                            <ToggleSwitch togglProps={{
                                checked: checked1,
                                onLabel: "on",
                                offLabel: "off",
                                onChange: (e) => setChecked1(e.value)
                            }}
                            />
                        </div>
                        <div class="card">
                            <h2>DataTable with pagination</h2>
                            <NormalTable customActionsField="actions" paginator="true" value={customers} columns={columns} />
                            <h2>DataTable without pagination</h2>
                            <NormalTable customActionsField="actions" value={customers} columns={columns} />
                        </div>
                        <div class="card" >
                            <h2>Modal</h2>
                            <h4>Delete Modal with switch</h4>
                            <DeleteModal
                                modalClass="w-50rem"
                                header="確認情報"
                                position="top"
                                content={"避難所の満員状態を切り替えてもよろしいでしょうか？"}
                                checked={checked1}
                                onChange={(e) => setChecked1(e.value)}
                                parentClass={"mb-3 custom-switch"}
                            />
                            <h4>Delete Modal with Button</h4>
                            <DeleteModal
                                modalClass="w-50rem"
                                header="確認情報"
                                text="delete"
                                content={"避難所の満員状態を切り替えてもよろしいでしょうか？"}
                                checked={checked1}
                                onChange={(e) => setChecked1(e.value)}
                                parentClass={"mt-3"}
                            />
                        </div>
                        <div class="card">
                            <h2> Link</h2>
                            <Linker linkProps={{
                                linkClass: "text-primary-600",
                                textWithUnderline: "PRIME",
                                href: "https://primereact.org/"
                            }}
                            />
                            <Linker linkProps={{
                                text: "PRIME",
                                href: "https://primereact.org/"
                            }}
                            />
                        </div>
                        <div class="card">
                            <h2> Image</h2>
                            <ImageComponent
                                imageProps={{
                                    width: "200",
                                    height: "200",
                                    src: "/layout/images/perspective1.jpg"
                                }}
                            />
                            <h2>avatar with image</h2>
                            <AvatarComponent
                                avatarProps={{
                                    // parentClass: "bg-orange-500",
                                    avatarClass: "mr-3",
                                    size: "xlarge",
                                    image: "/layout/images/perspective1.jpg",
                                    shape: "circle",
                                    style: { backgroundColor: "#2196F3" }
                                }}
                            />
                        </div>
                        <div class="card">
                            <h2>Qr</h2>
                            <BarcodeScanner />
                        </div>
                        <div class="card">
                            <h2> Divider Component </h2>
                            <DividerComponent dividerProps={{
                                width: "w-full"
                            }} />
                            <DividerComponent dividerProps={{
                                align: "top",
                                width: "w-2",
                                layout: "vertical"
                            }}
                            />&nbsp;
                            <DividerComponent dividerProps={{ align: "center", width: "w-25rem" }} />
                        </div>
                        <ImageCropper />
                    </section>
                </div>
            </div>
        </div>
    );
}

