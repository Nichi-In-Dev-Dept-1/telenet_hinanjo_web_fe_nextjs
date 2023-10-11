const profiles = [
    {
        profile: 'admin',
        email: 'admin@gmail.com',
        password: 'admin@123'
    },
    {
        profile: 'staff',
        email: 'staff@gmail.com',
        password: 'staff@123'
    },
];

const evacuationStatusOptions = [
    { name: "Vacant Test", code: "VT" },
    { name: "Starting To get Crowded", code: "SGT" },
    { name: "InActiveClosedDateNotPresent", code: "ICDP" },
    { name: "Crowded", code: "CD" },
    { name: "Closed", code: "CLD" },
    { name: "Nara", code: "NR" }
];

const evacuationTableColumns = [
    { field: 'ID', header: 'No', sortable: false, textAlign: 'left', minWidth: "5rem" },
    { field: '世帯人数', header: '世帯人数', sortable: false, textAlign: 'left', minWidth: "7rem" },
    { field: '世帯番号', header: '世帯番号', minWidth: "8rem", sortable: false, textAlign: 'left' },
    { field: '代表者', header: '代表者', sortable: false, textAlign: 'left', minWidth: '7rem' },
    { field: '氏名 (フリガナ)', header: '氏名 (フリガナ)', minWidth: "12rem", sortable: false, textAlign: 'left' },
    { field: "氏名 (漢字)", header: "氏名 (漢字)", sortable: false, textAlign: 'left', minWidth: "8rem" },
    { field: "性別", header: "性別", sortable: false, textAlign: 'left', minWidth: "5rem" },
    { field: "生年月日", header: "生年月日", minWidth: "10rem", sortable: false, textAlign: 'left' },
    { field: "年齢", header: "年齢", sortable: false, textAlign: 'left', minWidth: "5rem" },
    { field: "年齢_月", header: "年齢_月", sortable: false, textAlign: 'left', minWidth: "7rem" },
    { field: "要配慮者番号", header: "要配慮者番号", minWidth: "10rem", sortable: false, textAlign: 'left' },
    { field: "紐付コード", header: "紐付コード", minWidth: "8rem", sortable: false, textAlign: 'left' },
    { field: "備考", header: "備考", sortable: false, textAlign: 'left', minWidth: "5rem" },
    { field: "避難所", header: "避難所", sortable: false, textAlign: 'left', minWidth: "8rem" },
    { field: "退所日時", header: "退所日時", sortable: false, textAlign: 'left', minWidth: "9rem" },
    { field: "現在の滞在場所", header: "現在の滞在場所", sortable: false, minWidth: "10rem", textAlign: 'left' },

];

const evacueeFamilyDetailColumns = [
    { field: "id", header: "番号", minWidth: "5rem" },
    { field: "代表者", header: "代表者", minWidth: "10rem" },
    { field: "氏名 (フリガナ)", header: "氏名 (フリガナ)", minWidth: "10rem" },
    { field: "氏名 (漢字)", header: "氏名 (漢字)", minWidth: "10rem" },
    { field: "生年月日", header: "生年月日", minWidth: "10rem" },
    { field: "年齢", header: "年齢", minWidth: "4rem" },
    { field: "年齢_月", header: "年齢_月", minWidth: "5rem" },
    { field: "性別", header: "性別", minWidth: "5rem" },


]

const externalEvacueesListColumns = [
    { field: "Sl No", header: "Sl No", minWidth: "7rem", sortable: true },
    { field: "避難場所種別", header: "避難場所種別", minWidth: "10rem", sortable: true },
    { field: "場所", header: "場所", minWidth: "7rem", sortable: true },
    { field: "食料等の支援", header: "食料等の支援", minWidth: "10rem", sortable: true },
    { field: "人数", header: "人数", minWidth: "5rem", sortable: true },
    { field: "避難所", header: "避難所", minWidth: "10rem", sortable: true },
    { field: "メールアドレス", header: "メールアドレス", minWidth: "10rem", sortable: true },
    { field: "郵便番号", header: "郵便番号", minWidth: "8rem", sortable: true },
    { field: "県", header: "県", minWidth: "5rem", sortable: true },
    { field: "住所", header: "住所", minWidth: "12rem", sortable: true }
]

const externalEvacueesDetailColumns = [
    { field: "Sl No", header: "Sl No", minWidth: "7rem", sortable: true },
    { field: "氏名 (フリガナ)", header: "氏名 (フリガナ)", minWidth: "10rem", sortable: true },
    { field: "生年月日", header: "生年月日", minWidth: "7rem", sortable: true },
    { field: "年齢", header: "年齢", minWidth: "10rem", sortable: true },
    { field: "性別", header: "性別", minWidth: "5rem", sortable: true }
]

const evacueeFamilyDetailRowExpansionColumns = [
    { field: "住所", header: "住所", minWidth: "10rem" },
    { field: "要配慮者番号", header: "要配慮者番号", minWidth: "8rem" },
    { field: "紐付コード", header: "紐付コード", minWidth: "7rem" },
    { field: "備考", header: "備考", minWidth: "7rem" },
    { field: "現在の滞在場所 *", header: "現在の滞在場所", minWidth: "9rem"},
    { field: "作成日", header: "作成日", minWidth: "10rem" },
    { field: "更新日", header: "更新日", minWidth: "10rem" },
]

const familyDetailColumns = [
    { field: '避難日時', header: '避難日時', minWidth: "10rem", textAlign: 'left' },
    { field: '住所', header: '住所', minWidth: "10rem", textAlign: 'left' },
    { field: '電話番号(代表者)', header: '電話番号(代表者)', minWidth: "10rem", textAlign: 'left' },
    { field: '登録言語環境', header: '登録言語環境', minWidth: "10rem", textAlign: 'left' },
];

const familyDetailData = [
    {
        "避難日時": "2023年09月14日 (木) 22:17",
        "住所": "〒100-0001 東京都 千代田区千代田",
        "電話番号(代表者)": "0994872377",
        "登録言語環境": "日本語"
    }
];

const familyDetailColumns1 = [
    { field: '避難所', header: '避難日時', minWidth: "10rem" },
    { field: '入所日時', header: '入所日時', minWidth: "10rem", textAlign: 'left' },
    { field: '退所日時', header: '退所日時', minWidth: "10rem", textAlign: 'left' },

];

const familyDetailData1 = [
    {
        "避難所": "Vacant test",
        "入所日時": "2023/09/14 22:17",
        "退所日時": "2023/09/15 17:02"
    }
];
const townAssociationColumn = [
    { field: '町内会名 *', header: '町内会名', minWidth: "10rem"},
];

const townAssociationData = [
    {
        "町内会名 *": "----",
    }
];


const suppliesShortageData = [
    { "避難所": "Vacant Test", "Test1(2)": "505", "Test2(2)": "3" },
    { "避難所": "Starting to get Crowded", "Test1(2)": "201", "Test2(2)": "16" },
    { "避難所": "crowded", "Test1(2)": "2999993", "Test2(2)": "6" },
    { "避難所": "避難所B", "Test1(2)": "980766", "Test2(2)": "1" },
    { "避難所": "Nara", "Test1(2)": "3981574", "Test2(2)": "33" }
];

const suppliesShortageHeaderColumn = [
    { field: '避難所', header: '避難所', minWidth: '10rem', textAlign: "left" },
    { field: 'Test1(2)', header: 'Test1(2)', minWidth: '10rem', textAlign: "left" },
    { field: 'Test2(2)', header: 'Test2(2)', minWidth: '10rem', textAlign: "left" }
];

const historyPageCities = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
];

const evacuationSiteType = [
    { name: '市内', code: 'CITY_IN' },
    { name: '市外', code: 'CITY_OUT' },
    { name: '県外', code: 'PREF_OUT' }
];

const evacuationFoodSupport = [
    { name: 'はい', code: '1' },
    { name: 'いいえ', code: '0' },
];

const dashboardTableColumns = [
    { field: 'id', header: '番号', minWidth: '5rem', headerClassName: "custom-header", sortable: true, textAlign: 'left' },
    { field: '避難所', header: '避難所', minWidth: '20rem', sortable: true, headerClassName: "custom-header" },
    { field: '避難可能人数', header: '避難可能人数', sortable: true, minWidth: '9rem', headerClassName: "custom-header" },
    { field: '現在の避難者数', header: '現在の避難者数', sortable: true, minWidth: '10rem', headerClassName: "custom-header" },
    { field: '避難者数', header: '避難者数', minWidth: '7rem', sortable: true, headerClassName: "custom-header" },
    { field: '避難中の世帯数', header: '避難中の世帯数', minWidth: '10rem', sortable: true, headerClassName: "custom-header" },
    { field: '個人情報なしの避難者数', header: '個人情報なしの避難者数', minWidth: '15rem', sortable: true, headerClassName: "custom-header" },
    { field: '男', header: '男', minWidth: '5rem', sortable: true, headerClassName: "custom-header" },
    { field: 'actions', header: '満員切替', minWidth: "7rem", headerClassName: "custom-header", textAlign: 'center', sortable: true }
];

const MailSettingsOption1 = [
    { name: 'なし' , value: null},
    { name: '1時間毎', value: 1 },
    { name: '2時間毎', value: 2},
    { name: '3時間毎', value: 3 },
    { name: '4時間毎', value: 4 },
    { name: '6時間毎', value: 6 },
    { name: '毎日', value: 8 },
    { name: '毎日2回', value: 16 },
];

const MailSettingsOption2 = [
    { name: '--', value: null },
    { name: '北海道', value: 1 },
    { name: '福島県', value: 2 },
    { name: '千葉県', value: 3 },
    { name: '東京都', value: 4 },
    { name: '大阪府', value: 5}
];

const externalEvacueesTallyChartData = {
    datasets: [{
        label: 'Vacant test',
        data: [{ x: 1, y: 32 }],
        backgroundColor: 'rgba(31, 119, 180, 1)',
        borderColor: 'rgb(31, 119, 180)',
        borderWidth: 1,
        categoryPercentage: 1
    },
    {
        label: 'Starting To get crowded',
        data: [{ x: 2, y: 2 }],
        backgroundColor: 'rgba(255, 127, 14, 1)',
        borderColor: 'rgb(255, 127, 14)',
        borderWidth: 1,
        categoryPercentage: 1
    },
    {
        label: 'Crowded',
        data: [{ x: 3, y: 1 }],
        backgroundColor: 'rgba(44, 160, 44, 1)',
        borderColor: 'rgb(44, 160, 44)',
        borderWidth: 1,
        categoryPercentage: 1
    },
    {
        label: 'Nara',
        data: [{ x: 4, y: 1 }],
        backgroundColor: 'rgba(214, 39, 40, 0.2)',
        borderColor: 'rgb(214, 39, 40)',
        borderWidth: 1,
        categoryPercentage: 1
    }]
};

const externalEvacueesPieChartData = {
    labels: ['市内', '市外', '県外'],
    datasets: [
        {
            data: [29, 2, 2],
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

const externalEvacueesPieChartQuestionData = {
    labels: ['はい', 'いいえ'],
    datasets: [
        {
            data: [35, 2],
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

const externalEvacueesTallyChartOptions = {
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero: true
            },
            gridLines: {
                display: false
            }
        }],
        xAxes: [{
            display: false,
            gridLines: {
                display: false
            }
        },
        {
            offset: true,
            gridLines: {
                display: false
            }
        }],
        x: {
            title: {
                display: true,
                text: "避難所",
                align: "end"
            }
        },
        y: {
            title: {
                display: true,
                text: "人数",
                align: "end"
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
                    const percentage = ((value / total) * 100).toFixed(2) + '%';
                    return " " + context.label + ': ' + percentage;
                },
            },
        },
        subtitle: {
            position: "bottom",
            display: true,
            text: '(避難している場所ごとの集計)',
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
                    const percentage = ((value / total) * 100).toFixed(2) + '%';
                    return " " + context.label + ': ' + percentage;
                },
            },
        },
        subtitle: {
            position: "bottom",
            display: true,
            text: '(食糧等支援の有無集計)'
        }
    },
    maintainAspectRatio: false
};

const summaryShelterOptions = [
    { name: "--" },
    { name: "Vacant test" },
    { name: "Starting to get crowded" },
    { name: "Crowded" },
    { name: "Nara" }
];

const loginHistory = [
    { field: 'No', header: 'No.', minWidth: "3rem" },
    { field: '避難所', header: '避難所', minWidth: "5rem" },
    { field: "ログイン日時", header: "ログイン日時", minWidth: "5rem" }
];

const staffDetailData = [
    {
        field: '氏名',
        header: '氏名',
        minWidth: "5rem"
    },
    { field: '電話番号', header: '電話番号', minWidth: "5rem" },
];

const evacueesShelterOptions = [
    { name: '現在の避難者数', value: 'NY' },
    { name: '避難所の混雑率', value: 'RM' },
    { name: '要配慮者の避難者数', value: 'LDN' },
];

const currentEvacueesCountData = {
    labels: ['Vacant Test', 'Starting to get Crowded', 'crowded', 'Nara', 'テスト確認', 'Manual Register'],
    datasets: [
        {
            type: 'bar',
            label: '男',
            backgroundColor: 'rgb(31, 119, 180)',
            data: [65, 59, 80, 81, 56, 55]
        },
        {
            type: 'bar',
            label: '女',
            backgroundColor: 'rgb(44, 160, 44)',
            data: [28, 48, 40, 19, 86, 27]
        },
        {
            type: 'bar',
            label: '答えくない',
            backgroundColor: 'rgb(255, 127, 14)',
            data: [28, 48, 40, 19]
        }
    ]
};

const evacuationCenterCrowdingRateData = {
    labels: ['Vacant Test', 'Starting to get Crowded', 'crowded', 'Nara', 'テスト確認', 'Manual Register'],
    datasets: [
        {
            type: 'bar',
            backgroundColor: 'rgb(31, 119, 180)',
            data: [65, 45, 36, 67, 0, 23]
        }
    ]
};

const considerationEvacueesCountData = {
    labels: ['Vacant Test', 'Starting to get Crowded', 'crowded', 'Nara', 'テスト確認', 'Manual Register'],
    datasets: [
        {
            type: 'bar',
            label: '妊産婦',
            backgroundColor: 'rgb(31, 119, 180)',
            data: [15, 22, 28, 35, 0, 25]
        },
        {
            type: 'bar',
            label: '乳幼児',
            backgroundColor: 'rgb(255, 127, 14)',
            data: [28, 35, 80]
        },
        {
            type: 'bar',
            label: '障がい者',
            backgroundColor: 'rgb(44, 160, 44)',
            data: [28, 48, 40, 19]
        },
        {
            type: 'bar',
            label: '要介護者',
            backgroundColor: 'rgb(214, 39, 40)',
            data: [65, 59]
        },
        {
            type: 'bar',
            label: '医療機器利用者',
            backgroundColor: 'rgb(148, 103, 189)',
            data: [28, 48, 40]
        },
        {
            type: 'bar',
            label: 'アレルギー',
            backgroundColor: 'rgb(140, 86, 75)',
            data: [28, 48, 40, 19]
        },
        {
            type: 'bar',
            label: '外国籍',
            backgroundColor: 'rgb(227, 119, 194)',
            data: []
        },
        {
            type: 'bar',
            label: '新生児',
            backgroundColor: 'rgb(127, 127, 127)',
            data: []
        },
        {
            type: 'bar',
            label: 'その他',
            backgroundColor: 'rgb(188, 189, 34)',
            data: []
        }
    ]
};

const currentEvacueesCountOptions = {
    maintainAspectRatio: false,
    indexAxis: 'y',
    aspectRatio: 0.8,
    plugins: {
        tooltip: {
            callbacks: {
                label: function (context) {
                    const dataset = context.dataset;
                    const index = context.dataIndex;
                    const value = dataset.data[index];
                    return dataset.label + " : " + value + "人";
                },
            }
        },
        legend: {
            position: "bottom",
            align: "center",
            labels: {
                usePointStyle: true,
                pointStyle: "rect",
                color: '#495057'
            }
        }
    },
    scales: {
        x: {
            min: 0,
            max: 300,
            stacked: true,
            grid: {
                display: false
            }
        },
        y: {
            stacked: true,
            grid: {
                display: false
            }
        }
    }
};

const evacuationCenterCrowdingRateOptions = {
    maintainAspectRatio: false,
    indexAxis: 'y',
    aspectRatio: 0.8,
    plugins: {
        tooltip: {
            displayColors: false,
            callbacks: {
                title: () => null,
                label: function (context) {
                    const dataset = context.dataset;
                    const index = context.dataIndex;
                    const value = dataset.data[index];
                    const percentage = value + '%';
                    return " " + percentage;
                },
            }
        },
        legend: {
            display: false
        }
    },
    scales: {
        x: {
            min: 0,
            max: 300,
            stacked: true,
            ticks: {
                callback: function (val) {
                    return val + "%";
                },
            },
            grid: {
                display: false
            }
        },
        y: {
            stacked: true,
            grid: {
                display: false
            }
        }
    }
}

const considerationEvacueesCountOptions = {
    maintainAspectRatio: false,
    indexAxis: 'y',
    aspectRatio: 0.8,
    plugins: {
        tooltip: {
            callbacks: {
                label: function (context) {
                    const dataset = context.dataset;
                    const index = context.dataIndex;
                    const value = dataset.data[index];
                    return dataset.label + " : " + value + "人";
                },
            }
        },
        legend: {
            position: "bottom",
            align: "center",
            labels: {
                usePointStyle: true,
                pointStyle: "rect",
                color: '#495057'
            }
        }
    },
    scales: {
        x: {
            min: 0,
            max: 300,
            stacked: true,
            grid: {
                display: false
            }
        },
        y: {
            stacked: true,
            grid: {
                display: false
            }
        }
    }
};

export {
    profiles,
    evacuationStatusOptions,
    evacuationTableColumns,
    evacueeFamilyDetailColumns,
    familyDetailColumns,
    evacueeFamilyDetailRowExpansionColumns,
    externalEvacueesListColumns,
    externalEvacueesDetailColumns,
    evacuationSiteType,
    evacuationFoodSupport,
    familyDetailColumns1,
    familyDetailData1,
    familyDetailData,
    townAssociationColumn,
    townAssociationData,
    suppliesShortageData,
    suppliesShortageHeaderColumn,
    historyPageCities,
    dashboardTableColumns,
    MailSettingsOption1,
    MailSettingsOption2,
    externalEvacueesTallyChartData,
    externalEvacueesPieChartData,
    externalEvacueesPieChartQuestionData,
    externalEvacueesTallyChartOptions,
    externalEvacueesPieChartOptions,
    externalEvacueesPieChartQuestionOptions,
    summaryShelterOptions,
    loginHistory,
    staffDetailData,
    evacueesShelterOptions,
    currentEvacueesCountData,
    evacuationCenterCrowdingRateData,
    considerationEvacueesCountData,
    currentEvacueesCountOptions,
    evacuationCenterCrowdingRateOptions,
    considerationEvacueesCountOptions
}