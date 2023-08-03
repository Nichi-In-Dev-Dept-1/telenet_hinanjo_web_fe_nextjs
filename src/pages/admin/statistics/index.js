import React, { useState, useContext } from 'react';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import { getValueByKeyRecursively as translate } from '@/utils/functions'
import { LayoutContext } from '@/layout/context/layoutcontext';


const BarChartDemo = () => {
    const options = [
        { label: '現在の避難者数', value: 'NY' },
        { label: '避難所の混雑率', value: 'RM' },
        { label: '要配慮者の避難者数', value: 'LDN' },
    ];
    const { layoutConfig, localeJson } = useContext(LayoutContext);
    const [data, setData] = useState(options[0].value);
    const [basicData] = useState({
        labels: ['日本の避難所', '広島市中区東白島町', 'テスト', 'テスト日本大阪', '避難所B	', '<Test>モバイルアプリ1', 'Gose'],
        datasets: [
            {
                label: '男',
                backgroundColor: '#42A5F5',
                data: [65, 59, 80, 81, 56, 55, 40]
            },
            {
                label: '女',
                backgroundColor: '#66BB6A',
                data: [28, 48, 40, 19, 86, 27, 90]
            },
            {
                label: '答えくない',
                backgroundColor: '#FFA726',
                data: [28, 48, 40, 19, 86, 27, 90]
            }
        ]
    });
    const getLightTheme = () => {


        let horizontalOptions = {
            indexAxis: 'y',
            maintainAspectRatio: false,
            aspectRatio: .8,
            plugins: {
                legend: {
                    labels: {
                        color: '#495057'
                    }
                }
            },
            scales: {
                x: {
                    min: 0,
                    max: 300,
                    ticks: {
                        color: '#495057',

                    },
                    grid: {
                        color: '#ebedef'
                    }
                },
                y: {
                    ticks: {
                        color: '#495057',

                    },
                    grid: {
                        color: '#ebedef'
                    }
                }
            }
        };




        return {

            horizontalOptions


        }
    }


    const { horizontalOptions } = getLightTheme();

    return (
        <div>


            <div className="card">
                <h5 className='page_header'> {translate(localeJson, 'statistics')}</h5>
                <Divider />
                <Dropdown style={{ fontSize: "21px" }} className='' value={data} options={options} onChange={(e) => setData(e.value)} placeholder="Select a City" />

                <Chart type="bar" data={basicData} options={horizontalOptions} />
            </div>
                



        </div>
    )
}
export default BarChartDemo

