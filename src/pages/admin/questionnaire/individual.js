import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';

import { LayoutContext } from '@/layout/context/layoutcontext';
import { getValueByKeyRecursively as translate } from '@/helper'
import { BaseTemplate } from '@/components/questionarrie';
import { AiOutlineDrag } from 'react-icons/ai';
import { Button, DND } from '@/components';

export default function IndividualQuestionnaire() {
    const { localeJson, setLoader } = useContext(LayoutContext);
    const [questionnaires, setQuestionnaires] = useState([{
        "title": "ROW1",
        "questiontitle": "現在の滞在場所",
        "questiontitle_en": "current place of stay",
        "option": ["避難所"],
        "option_en": [" refuge"]
    }, {
        "title": "ROW2",
        "questiontitle": "selcti",
        "questiontitle_en": "san",
        "option": ["selection", "dragNdrop", " "],
        "option_en": [" a"]
    }]);

    const router = useRouter();

    const [newItem, setNewItem] = useState({
        "title": "",
        "questiontitle": "",
        "questiontitle_en": "",
        "option": [" "],
        "option_en": [" "]
    });

    const dragProps = {
        onDragEnd(fromIndex, toIndex) {
            const prepareData = [...questionnaires];
            const item = prepareData.splice(fromIndex, 1)[0];
            prepareData.splice(toIndex, 0, item);
            setQuestionnaires(prepareData);
        },
        nodeSelector: 'li',
        handleSelector: 'a'
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoader(false);
        };
        fetchData();
    }, []);

    const map = (
        <ol>
            {questionnaires.map((item, index) => (
                <li key={index}>
                    <div className='ml-1 mr-1' style={{ width: "95%" }}>
                        <BaseTemplate item={item}
                        />
                    </div>
                    <a className='mr-10'>
                        <AiOutlineDrag />
                    </a>
                </li>

            ))}
        </ol>
    )

    const handleAddNewItem = () => {
        // Add the new item to the questionnaires state
        setQuestionnaires([...questionnaires, newItem]);
        // Clear the newItem state for the next addition
        setNewItem({
            "title": "",
            "questiontitle": "",
            "questiontitle_en": "",
            "option": [""],
            "option_en": [""]
        });

    };
    return (
        <>
            <div className="grid">
                <div className="col-12">
                    <div className='card'>
                        <h5 className='page-header1'>{translate(localeJson, 'individual_questionaries')}</h5>
                        <hr />
                        <div className='w-full'>
                            <DND dragProps={dragProps}>
                                {map}
                            </DND>
                        </div>
                        <div className='flex pt-3 pb-3' style={{ justifyContent: "center", flexWrap: "wrap" }}>
                            <Button buttonProps={{
                                type: 'submit',
                                rounded: "true",
                                bg: "bg-white",
                                onClick: () => {
                                    router.push("/admin/questionnaire")
                                },
                                hoverBg: "hover:surface-500 hover:text-white",
                                buttonClass: "text-600 evacuation_button_height",
                                text: translate(localeJson, 'back'),
                            }} parentClass={"mr-1 mt-1"} />
                            <Button buttonProps={{
                                type: 'submit',
                                rounded: "true",
                                buttonClass: "evacuation_button_height",
                                text: translate(localeJson, 'submit'),
                                severity: "primary",
                            }} parentClass={"mr-1 mt-1"} />

                            <Button buttonProps={{
                                type: 'submit',
                                rounded: "true",
                                buttonClass: "evacuation_button_height",
                                text: translate(localeJson, 'add_item'),
                                severity: "success",
                                onClick: handleAddNewItem
                            }} parentClass={"mr-1 mt-1"} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}