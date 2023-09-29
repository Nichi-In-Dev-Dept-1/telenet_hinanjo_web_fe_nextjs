import { DeleteModal } from "@/components";

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
    { field: 'ID', header: 'No', sortable: true, textAlign: 'left', minWidth: "5rem" },
    { field: '世帯人数', header: '世帯人数', sortable: true, textAlign: 'left', minWidth: "7rem" },
    { field: '世帯番号', header: '世帯番号', minWidth: "8rem", sortable: true, textAlign: 'left' },
    { field: '代表者', header: '代表者', sortable: true, textAlign: 'left', minWidth: '7rem' },
    { field: '氏名 (フリガナ)', header: '避難所名 (フリガナ)', minWidth: "12rem", sortable: true, textAlign: 'left' },
    { field: "氏名 (漢字)", header: "氏名 (漢字)", sortable: true, textAlign: 'left', minWidth: "8rem" },
    { field: "性別", header: "性別", sortable: true, textAlign: 'left', minWidth: "5rem" },
    { field: "生年月日", header: "生年月日", minWidth: "10rem", sortable: true, textAlign: 'left' },
    { field: "年齢", header: "年齢", sortable: true, textAlign: 'left', minWidth: "5rem" },
    { field: "年齢_月", header: "年齢_月", sortable: true, textAlign: 'left', minWidth: "7rem" },
    { field: "要配慮者番号", header: "要配慮者番号", minWidth: "10rem", sortable: true, textAlign: 'left' },
    { field: "紐付コード", header: "紐付コード", minWidth: "8rem", sortable: true, textAlign: 'left' },
    { field: "備考", header: "備考", sortable: true, textAlign: 'left', minWidth: "5rem" },
    { field: "避難所", header: "避難所", sortable: true, textAlign: 'left', minWidth: "8rem" },
    { field: "退所日時", header: "退所日時", sortable: true, textAlign: 'left', minWidth: "9rem" },
    { field: "現在の滞在場所", header: "現在の滞在場所", sortable: "true", minWidth: "10rem", textAlign: 'left' },

];

const evacueeFamilyDetailColumns = [
    { field: "id", header: "番号", minWidth: "5rem" },
    { field: "代表者", header: "代表者", minWidth: "10rem" },
    { field: "氏名 (フリガナ)", header: "氏名 (フリガナ)", minWidth: "10rem" },
    { field: "氏名 (漢字)", header: "氏名 (フリガナ)", minWidth: "10rem" },
    { field: "生年月日", header: "生年月日", minWidth: "10rem" },
    { field: "年齢", header: "年齢", minWidth: "10rem" },
    { field: "年齢_月", header: "年齢_月", minWidth: "5rem" },
    { field: "性別", header: "性別", minWidth: "5rem" },
    { field: "性別", header: "性別", minWidth: "5rem" },
    { field: "作成日", header: "作成日", minWidth: "12rem" },
    { field: "更新日", header: "更新日", minWidth: "12rem" },

]
const evacueeFamilyDetailRowExpansionColumns = [
    { field: "住所", header: "種別", minWidth: "10rem" },
    { field: "要配慮者番号", header: "要配慮者番号", minWidth: "5rem" },
    { field: "紐付コード", header: "紐付コード" },
    { field: "備考", header: "紐付コード" },
    { field: "現在の滞在場所 *", header: "現在の滞在場所 *" },


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
    { field: '町内会名 *', header: '町内会名 *', minWidth: "10rem" },
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

const historyTableColumns = [
    { field: 'Sl No', header: '番号', minWidth: "8rem", sortable: true, textAlign: 'left' },
    { field: '報告日時', header: '報告日時', minWidth: "15rem", sortable: true },
    { field: '地区', header: '地区', minWidth: "6rem", sortable: true },
    { field: '避難所名', header: '避難所名', minWidth: "12rem", sortable: true },
    { field: '避難所名 (フリガナ)', header: '避難所名 (フリガナ)', minWidth: "12rem", sortable: true },
    { field: "所在地（経度）", header: "所在地（経度）", minWidth: "10rem", sortable: true },
    { field: "所在地（緯度）", header: "所在地（緯度）", minWidth: "10rem", sortable: true },
    { field: "所在地（経度1）", header: "所在地（経度）", minWidth: "10rem", sortable: true },
    { field: "外部公開", header: "外部公開", minWidth: "8rem", sortable: true },
    { field: "開設状況", header: "開設状況", minWidth: "8rem", sortable: true },
    { field: "避難者数", header: "避難者数", minWidth: "7rem", sortable: true },
    { field: "満空状況", header: "満空状況", minWidth: "7rem", sortable: true },
    { field: "開設日時", header: "開設日時", minWidth: "15rem", sortable: true },
    { field: "閉鎖日時", header: "閉鎖日時", minWidth: "15rem", sortable: true },
    { field: "備考", header: "備考", minWidth: "5rem" }
];

const dashboardTableColumns = [
    { field: '番号', header: '番号', minWidth: '6rem', headerClassName: "custom-header", sortable: true, textAlign: 'left' },
    { field: '避難所', header: '避難所', minWidth: '20rem', sortable: true, headerClassName: "custom-header" },
    { field: '避難可能人数', header: '避難可能人数', sortable: true, minWidth: '9rem', headerClassName: "custom-header" },
    { field: '現在の避難者数', header: '現在の避難者数', sortable: true, minWidth: '10rem', headerClassName: "custom-header" },
    { field: '避難者数', header: '避難者数', minWidth: '7rem', sortable: true, headerClassName: "custom-header" },
    { field: '避難中の世帯数', header: '避難中の世帯数', minWidth: '10rem', sortable: true, headerClassName: "custom-header" },
    { field: '個人情報なしの避難者数', header: '個人情報なしの避難者数', minWidth: '15rem', sortable: true, headerClassName: "custom-header" },
    { field: '男', header: '男', minWidth: '5rem', sortable: true, headerClassName: "custom-header" },
    {
        field: 'actions',
        header: '満員切替',
        minWidth: "7rem",
        headerClassName: "custom-header",
        textAlign: 'center',
        sortable: true,
        body: (rowData) => (
            <div className='input-switch-dashboard'>
                <DeleteModal
                    modalClass="w-50rem"
                    header="確認情報"
                    position="top"
                    content={"避難所の運営状態を変更しますか？"}
                    checked={false}
                    parentClass={"custom-switch"}
                />
            </div>
        ),
    }
];

const MailSettingsOption1 = [
    { name: 'なし' },
    { name: '2時間毎' },
    { name: '3時間毎' },
    { name: '4時間毎' },
    { name: '6時間毎' },
    { name: '毎日' },
    { name: '毎日2回' },

];

const MailSettingsOption2 = [
    { name: '--' },
    { name: '北海道' },
    { name: '福島県' },
    { name: '千葉県' },
    { name: '東京都' },

];

export {
    profiles,
    evacuationStatusOptions,
    evacuationTableColumns,
    evacueeFamilyDetailColumns,
    familyDetailColumns,
    evacueeFamilyDetailRowExpansionColumns,
    familyDetailColumns1,
    familyDetailData1,
    familyDetailData,
    townAssociationColumn,
    townAssociationData,
    suppliesShortageData,
    suppliesShortageHeaderColumn,
    historyTableColumns,
    historyPageCities,
    dashboardTableColumns,
    MailSettingsOption1,
    MailSettingsOption2,
}