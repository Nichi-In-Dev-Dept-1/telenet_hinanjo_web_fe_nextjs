import React, { useState, useContext, useEffect, useRef } from 'react';
import { Chart } from 'primereact/chart';
import { useRouter } from 'next/router';
import _ from 'lodash';

import { LayoutContext } from '@/layout/context/layoutcontext';
import { getValueByKeyRecursively as translate } from '@/helper'
import { Button, CustomHeader, NotFound } from '@/components';
import { ExternalEvacuationServices } from '@/services';
import { IoIosArrowBack } from 'react-icons/io';

export default function ExternalEvacuees() {
    const { localeJson, setLoader } = useContext(LayoutContext);
    const router = useRouter();

    const [chartData, setChartData] = useState(null);
    const [chartOptions, setChartOptions] = useState({});
    const [pieChartPlaceCategoryData, setPieChartPlaceCategoryData] = useState(null);
    const [pieChartPlaceCategoryOptions, setPieChartPlaceCategoryOptions] = useState({});
    const [pieChartFoodSupportData, setPieChartFoodSupportData] = useState(null);
    const [pieChartFoodSupportOptions, setPieChartFoodSupportOptions] = useState({});
    const [foodSupportCount, setFoodSupportCount] = useState(0);
    const [chartDataFound, setChartDataFound] = useState(0);
    const chartRef = useRef();

    /* Services */
    const { getChartScreenData } = ExternalEvacuationServices;

    useEffect(() => {
        setLoader(true);
        const fetchData = async () => {
            await onGetExternalEvacueesChartScreenData();
        };
        fetchData();
    }, []);

    const chartBackgroundColor = [
        {
            backgroundColor: 'rgba(31, 119, 180, 1)',
            borderColor: 'rgb(31, 119, 180)',
        },
        {
            backgroundColor: 'rgba(255, 127, 14, 1)',
            borderColor: 'rgb(255, 127, 14)',
        },
        {
            backgroundColor: 'rgba(44, 160, 44, 1)',
            borderColor: 'rgb(44, 160, 44)',
        },
        {
            backgroundColor: 'rgba(214, 39, 40, 1)',
            borderColor: 'rgb(214, 39, 40)',
        }
    ];

    const externalEvacueesTallyChartOptions = {
        scales: {
            x: {
                title: {
                    display: true,
                    text: translate(localeJson, 'shelter_place'),
                    align: "end"
                },
                gridLines: {
                    display: false
                },
                grid: {
                    display: false,
                },
                offset: true
            },
            y: {
                title: {
                    display: true,
                    text: translate(localeJson, 'people_count'),
                    align: "end"
                },
                ticks: {
                    beginAtZero: true,
                    stepSize: 1,
                    maxTicksLimit: 7, 
                },
                grid: {
                    display: false,
                },
                gridLines: {
                    display: false
                }
            },
        },
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    title: () => null,
                }
            },
            datalabels: {
                color: 'black',
                anchor: 'end',
                align: 'top',
                offset: 5,
                formatter: function (value, context) {
                    return context.chart.data.labels[context.dataIndex];
                },
            },
            legend: {
                position: "bottom",
                textAlign: "start",
                labels: {
                    usePointStyle: true,
                    pointStyle: "rect",
                },
            },
            beforeLayout: chart => chart.chart.options.scales.xAxes[1].labels = chart.chart.data.datasets.filter(ds => !ds._meta[0].hidden).map(ds => ds.label),
        }
    };

    const externalEvacueesPieChartOptions = {
        plugins: {
            datalabels: {
                color: 'black',
                anchor: 'end',
                align: 'top',
                offset: 5,
                formatter: function (value, context) {
                    return context.chart.data.labels[context.dataIndex];
                },
            },
            legend: {
                position: "bottom",
                labels: {
                    usePointStyle: true
                }
            },
            tooltip: {
                callbacks: {
                    title: () => null,
                    label: function (context) {
                        const dataset = context.dataset;
                        const index = context.dataIndex;
                        const value = dataset.data[index];
                        const total = dataset.data.reduce((acc, val) => acc + val, 0);
                        const percentage = (((value / total) * 100)).toFixed(1) + '%'; //  const percentage = (Math.round((value / total) * 100)).toFixed(1) + '%';
                        return " " + context.label + ': ' + percentage;
                    },
                },
            },
            subtitle: {
                position: "bottom",
                display: true,
                text: translate(localeJson, 'evacuation_location_aggregation'),
                fontWeight: "light"
            }
        },
        maintainAspectRatio: false
    };

    const externalEvacueesPieChartQuestionOptions = {
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    usePointStyle: true
                },
            },
            tooltip: {
                callbacks: {
                    title: () => null,
                    label: function (context) {
                        const dataset = context.dataset;
                        const index = context.dataIndex;
                        const value = dataset.data[index];
                        const total = dataset.data.reduce((acc, val) => acc + val, 0);
                        const percentage = (((value / total) * 100)).toFixed(1) + '%'; //(Math.round((value / total) * 100)).toFixed(1) + '%';
                        return " " + context.label + ': ' + percentage;
                    },
                },
            },
            subtitle: {
                position: "bottom",
                display: true,
                text: translate(localeJson, 'food_support_calculation')
            }
        },
        maintainAspectRatio: false
    };

    const personCountCategory_jp = [
        {
            "市内": 0,
        },
        {
            "市外": 0
        },
        {
            "県外": 0
        },
    ];

    const personCountFoodSupport_jp = [
        {
            "いいえ": 0,
        },
        {
            "はい": 0
        }
    ];


    const personCountCategory_en = [
        {
            "Within City": 0,
        },
        {
            "City Outskirts": 0
        },
        {
            "Outside Prefecture": 0
        },
    ];

    const personCountFoodSupport_en = [
        {
            "No": 0,
        },
        {
            "Yes": 0
        }
    ];

    const onGetExternalEvacueesChartScreenData = () => {
        getChartScreenData({}, getChartScreenViewData);
    }

    const getChartScreenViewData = (response) => {
        if (response && response.success && !_.isEmpty(response.aggregations)) {
            let personCountByCenter = response.aggregations.personCountByCenter;
            let personCountByFoodRequire = response.aggregations.personCountByFoodRequire;
            let personCountByCategory = response.aggregations.personsCountByCategory;
            setFoodSupportCount(response.aggregations.externalPersonCountOptedFood);
            let personCountCenter = [];
            personCountByCenter.map((item, index) => {
                let personDataSet = {
                    label: item[0],
                    data: [{ x: 1, y: item[1] }],
                    backgroundColor: chartBackgroundColor[(index % chartBackgroundColor.length)].backgroundColor,
                    borderColor: chartBackgroundColor[(index % chartBackgroundColor.length)].borderColor,
                    borderWidth: 1,
                    barPercentage: 0.8,
                    categoryPercentage: 1,
                };
                personCountCenter.push(personDataSet);
            });
            let personCountDataset = {
                datasets: personCountCenter
            };
            setChartData(personCountDataset);
            setChartOptions(externalEvacueesTallyChartOptions);
            let personCountCategory = response.locale == 'ja' ? personCountCategory_jp : personCountCategory_en;
            let personCountFoodSupport = response.locale == 'ja' ? personCountFoodSupport_jp : personCountFoodSupport_en;
            personCountByCategory.map((item, index) => {
                let foundObject = personCountCategory.filter(obj => Object.prototype.hasOwnProperty.call(obj, item[0]));
                if (foundObject) {
                    personCountCategory[index][`${item[0]}`] = item[1];
                }
            });
            personCountByFoodRequire.map((item, index) => {
                let foundObject = personCountFoodSupport.filter(obj => Object.prototype.hasOwnProperty.call(obj, item[0]));
                if (foundObject) {
                    personCountFoodSupport[index][`${item[0]}`] = item[1];
                }
            });
            let getData = [];
            personCountCategory.forEach(obj => {
                for (const key in obj) {
                    getData.push(obj[key])
                }
            });
            let foodData = [];
            personCountFoodSupport.forEach(obj => {
                for (const key in obj) {
                    foodData.push(obj[key])
                }
            });
            console.log(getData);
            let placeCategoryDataSet = {
                labels: [translate(localeJson, 'city_in'), translate(localeJson, 'city_out'), translate(localeJson, 'pref_out')],
                datasets: [
                    {
                        data: getData,
                        backgroundColor: [
                            'rgba(31, 119, 180, 1)',
                            'rgba(255, 127, 14, 1)',
                            'rgba(44, 160, 44, 1)',
                        ],
                        hoverBackgroundColor: [
                            'rgba(31, 119, 180, 0.6)',
                            'rgba(255, 127, 14, 0.6)',
                            'rgba(44, 160, 44, 0.6)',
                        ]
                    }
                ]
            };
            setPieChartPlaceCategoryData(placeCategoryDataSet);
            setPieChartPlaceCategoryOptions(externalEvacueesPieChartOptions);
            let personFoodSupportDataSet = {
                labels: [translate(localeJson, 'yes'), translate(localeJson, 'no')],
                datasets: [
                    {
                        data: foodData,
                        backgroundColor: [
                            'rgba(31, 119, 180, 1)',
                            'rgba(255, 127, 14, 1)',
                            'rgba(44, 160, 44, 1)',
                        ],
                        hoverBackgroundColor: [
                            'rgba(31, 119, 180, 0.6)',
                            'rgba(255, 127, 14, 0.6)',
                            'rgba(44, 160, 44, 0.6)',
                        ]
                    }
                ]
            };
            setPieChartFoodSupportData(personFoodSupportDataSet);
            setPieChartFoodSupportOptions(externalEvacueesPieChartQuestionOptions);
            setLoader(false);
            setChartDataFound(true);
        } else {
            setLoader(false);
            setChartDataFound(false);
        }
    }

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                <Button buttonProps={{
                            buttonClass: "w-auto back-button-transparent mb-2 p-0",
                            text: translate(localeJson, "external_evacuees_list_detail_back"),
                            icon: <div className='mt-1'><i><IoIosArrowBack size={25} /></i></div>,
                            onClick: () => router.push('/admin/external/family/list'),
                        }} parentClass={"inline back-button-transparent"} />
                    <div className="flex align-items-center justify-content-between pb-2">
                        <div className='flex align-items-center gap-2 mb-2'>
                            <CustomHeader
                                headerClass={"page-header1"}
                                customParentClassName={"mb-0"}
                                header={translate(localeJson, "external_evacuees_tally")}
                            />
                            <div className="hitachi_header_container mb-2">
                                <div className="hitachi_header_bg hidden"></div>
                                <div className="page-header1-sub"> {foodSupportCount ? "(" + foodSupportCount + translate(localeJson, "people") + ")" : ""}</div>
                            </div>
                        </div>
                        {/* <div className='mb-2 flex align-items-center'>
                            <Button
                                buttonProps={{
                                    text: translate(localeJson, "external_evacuee_details"),
                                    onClick: () => router.push("/admin/external/family/list"),
                                }}
                            />
                        </div> */}
                    </div>
                    {chartDataFound ? (
                        <div className="bg-white p-3">
                            <div className="mb-2 mt-2">
                                <Chart
                                    type="bar"
                                    ref={chartRef}
                                    data={chartData}
                                    options={chartOptions}
                                    style={{ height: "400px" }}
                                />
                            </div>
                            <div className="mt-4 mb-2 flex flex-column sm:flex-row md:flex-row justify-content-around">
                                <Chart
                                    type="pie"
                                    data={pieChartPlaceCategoryData}
                                    options={pieChartPlaceCategoryOptions}
                                />
                                <Chart
                                    type="pie"
                                    data={pieChartFoodSupportData}
                                    options={pieChartFoodSupportOptions}
                                />
                            </div>
                        </div>
                    ) : (
                        <NotFound message={translate(localeJson, "no_data_available")} />
                    )}
                </div>
            </div>
        </div>
    );
}