/* eslint-disable no-irregular-whitespace */
import toast from "react-hot-toast";
import { isObject, isArray } from "lodash";
import { Button } from "@/components";
// import _ from 'lodash';
import { prefectures, prefecturesCombined, prefectures_en } from '@/utils/constant';
import { CommonServices, QRCodeCreateServices } from "@/services";


const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

/**
 * 
 * @param {*} data 
 * @param {*} key 
 * @returns value of the key @else undefined
 */
export const getValueByKeyRecursively = (data, key) => {
    // Base case: If data is not an object or data[key] is present, return the value
    if (typeof data !== 'object' || data[key] !== undefined) {
        return data[key];
    }
    // Recursively traverse the nested object
    for (const nestedKey in data) {
        // data.hasOwnProperty(nestedKey)
        if (nestedKey in data) {
            const value = getValueByKeyRecursively(data[nestedKey], key);
            if (value !== undefined) {
                return value;
            }
        }
    }
    // Key not found in the nested object
    return undefined;
};

/**
 * Get japanese date & time with custom format
 * @param {*} dateTime 
 * @returns 
 */
export const getJapaneseDateTimeDisplayFormat = (dateTime) => {
    const options = {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    };
    const formattedJPDateTime = new Date(dateTime).toLocaleString('ja-JP', options);

    formattedJPDateTime.replace(/(\d+)年(\d+)月(\d+)日,/, '$1年$2月$3日 ')
    return formattedJPDateTime;
}

/**
 * Get japanese display format
 * @param {*} dateTime 
 * @returns 
 */
export function getJapaneseDateDisplayYYYYMMDDFormat(dateTimes) {
    let dateTime = getGeneralDateTimeDisplayFormats(dateTimes)
    if (dateTime) {
        // Determine whether the date format uses '-' or '/'
        let dateParts;
        if (dateTime.includes('-')) {
            dateParts = dateTime.split('-'); // Handle format with '-'
        } else if (dateTime.includes('/')) {
            dateParts = dateTime.split('/'); // Handle format with '/'
        } else {
            return ""; // Invalid format
        }

        const year = dateParts[0];
        const month = dateParts[1].padStart(2, '0'); // Ensure two digits for month
        const day = dateParts[2].padStart(2, '0'); // Ensure two digits for day

        const formattedDate = new Date(`${year}-${month}-${day}`);
        if (isNaN(formattedDate.getTime())) {
            return ""; // Invalid date
        }

        const displayDate = formattedDate.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        const [displayYear, displayMonth, displayDay] = displayDate.split('/');
        return `${displayYear}年${displayMonth}月${displayDay}日`;
    }
    return "";
}

export const getGeneralDateTimeDisplayFormats = (dateTime) => {
    if(dateTime) {
        const options = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        };
        let formattedJPDateTime = new Date(dateTime).toLocaleDateString("ja-jp", options);
        return formattedJPDateTime.replaceAll("/", "-"); 
    }
    else {
        return '';
    }
    
}


/**
 * Get English display format
 * @param {*} dateTime 
 * @returns 
 */
export const getEnglishDateDisplayFormat = (dateTime) => {
    if (dateTime) {
        // Safari and other browsers should use the same format
        // Detect if the date is a string and needs reformatting
        if (typeof dateTime === 'string') {
            // Replace '/' with '-' for cross-browser compatibility
            dateTime = dateTime.replace(/\//g, '-');

            // Split the date into parts
            const dateParts = dateTime.split('-');

            // Ensure that month and day are two digits
            if (dateParts[1] && dateParts[1].length === 1) {
                dateParts[1] = '0' + dateParts[1]; // Pad month
            }
            if (dateParts[2] && dateParts[2].length === 1) {
                dateParts[2] = '0' + dateParts[2]; // Pad day
            }

            // Reconstruct the date in the format YYYY-MM-DD
            dateTime = dateParts.join('-');
        }

        // Now create the date object
        const date = new Date(dateTime);

        // Check if the date is valid
        if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = ('0' + (date.getMonth() + 1)).slice(-2); // Ensure two digits for month
            const day = ('0' + date.getDate()).slice(-2); // Ensure two digits for day

            return `${year}-${month}-${day}`;
        } else {
            return ""; // Invalid date
        }
    }
    return "";
}

/**
 * Get Default Today DateTime display format
 * @param {*} hours, minutes 
 * @returns today DateTime
 */
export const getDefaultTodayDateTimeFormat = (hours, minutes) => {
    let constructDate = new Date();
    constructDate.setHours(hours);
    constructDate.setMinutes(minutes);

    const formattedJPDateTime = new Date(constructDate.getFullYear(),
        (constructDate.getMonth()).toString().padStart(2, '0'),
        (constructDate.getDate()).toString().padStart(2, '0'),
        (constructDate.getHours()).toString().padStart(2, '0'),
        (constructDate.getMinutes()).toString().padStart(2, '0'));
    return formattedJPDateTime;
}

/**
 * Get general date & time display format
 * @param {*} dateTime 
 * @returns 
 */
export const getGeneralDateTimeDisplayFormat = (dateTime) => {
    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    };
    let formattedJPDateTime = new Date(dateTime).toLocaleDateString("ja-jp", options);
    return formattedJPDateTime.replaceAll("/", "-");
}

/**
 * Get general display date & time slash display format
 * @param {*} dateTime 
 * @returns 
 */
export const getGeneralDateTimeSlashDisplayFormat = (dateTime) => {
    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    };
    let formattedJPDateTime = new Date(dateTime).toLocaleDateString("ja-jp", options);
    return formattedJPDateTime.replaceAll("-", "/");
}

/**
 * Get general display date & time && second slash display format
 * @param {*} dateTime 
 * @returns 
 */
export const getGeneralDateTimeSecondSlashDisplayFormat = (dateTime) => {
    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    };
    let formattedJPDateTime = new Date(dateTime).toLocaleDateString("ja-jp", options);
    return formattedJPDateTime.replaceAll("-", "/");
}

/**
 * Get current date format
 * @param {*} dateTime 
 * @returns 
 */
export const getYYYYMMDDHHSSSSDateTimeFormat = (dateTime) => {
    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    };
    let formattedJPDateTime = new Date(dateTime).toLocaleDateString("ja-jp", options);
    formattedJPDateTime = formattedJPDateTime.replaceAll("/", "");
    formattedJPDateTime = formattedJPDateTime.replaceAll(":", "");
    return formattedJPDateTime.replaceAll("", "");
}

/**
 * Function to download a base64-encoded file
 * @param {*} base64String 
 * @param {*} fileName 
 */
export const downloadBase64File = (base64String, fileName) => {
    // Decode the Base64 string to a UTF-8 string
    const utf8String = decodeURIComponent(escape(atob(base64String.split('base64,')[1])));
    // Convert the UTF-8 string to a Blob
    const blob = new Blob([utf8String], { type: 'text/csv;charset=utf-8' });
    // Create a download link and trigger a click event to download the file
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

/**
 * Timestamp filename
 * @param {*} fileName 
 */
export const timestampFile = (fileName) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
    const day = String(currentDate.getDate()).padStart(2, '0');
    const random = Math.floor(10000000 + Math.random() * 90000000);
    return `${fileName}${year}${month}${day}${random}.csv`;
};

/**
 * Zip download functionality
 * @param zipURL
 */
export const zipDownloadWithURL = async(zipURL) => {


  // Fetch the PDF as a Blob
  const payload = {
    url: zipURL,
  };
  
  try {
    const response = QRCodeCreateServices.callPdfDownload(payload,(res)=>{
    let date = getYYYYMMDDHHSSSSDateTimeFormat(new Date())
          // Ensure the response is treated as a binary Blob
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
  
    // Create a download link
    const link = document.createElement("a");
    link.href = url;
    link.download = `QR-${date}.pdf`; // Download filename
    document.body.appendChild(link);
    link.click();
  
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    });
  } catch (error) {
    console.error("Axios POST error:", error);
  }
  
 
};


/**
 * Function help to display error messages on toast
 * @param {*} error 
 * @param {*} key 
 * @param {*} position 
 */
export const toastDisplay = (response, key, position = "top-right", rawMsgType) => {
    if (response && response?.data && response?.status) {
        const { status, data } = response;
        if (status != 401 && status != 403) {
            if (data.success) {
                if (key == 'import' && status == 206 && response?.data?.error_path) {
                    toast.success(() => (
                        <div>
                            <a href={response?.data?.error_path} target="_blank" style={{ textDecoration: "underline" }}>
                                {response?.data?.message}
                            </a>
                        </div>
                    ), {
                        position: position,
                    });
                } else {
                    toast.success(data?.message, {
                        position: position,
                    });
                }
            } else {
                if (key == 'import' && status == 422) {
                    if (response?.data?.error_path) {
                        toast.error(() => (
                            <div>
                                <a href={data?.error_path} target="_blank" style={{ textDecoration: "underline" }}>
                                    {data?.message}
                                </a>
                            </div>
                        ), {
                            position: position,
                        });
                    } else {
                        if (!isArray(data?.message)) {
                            toast.error(data?.message, {
                                position: "top-right",
                            });
                        }
                    }
                } else if (status == 422) {
                    if (isObject(data?.message)) {
                        let errorMessages = Object.values(data?.message);
                        let errorString = errorMessages.join('.')
                        let errorArray = errorString.split(".");
                        errorArray = errorArray.filter(message => message.trim() !== "");
                        let formattedErrorMessage = errorArray
                            .map((message, index) => {
                                return `${message.trim()}`;
                            })
                            .join("\n");
                        toast.error(formattedErrorMessage, {
                            position: position,
                        });
                    } else {
                        if (!isArray(data?.message)) {
                            toast.error(data?.message, {
                                position: "top-right",
                            });
                        }
                    }
                } else {
                    if (!isArray(data?.message)) {
                        toast.error(data?.message, {
                            position: "top-right",
                        });
                    }
                }
            }
        }
    } else {
        if (rawMsgType == 'success') {
            toast.success(response, {
                position: "top-right",
            });
        } else {
            toast.error(response, {
                position: "top-right",
            });
        }
    }
}

/**
 * Get number of evacuation days
 * @param {*} createdDate 
 * @returns 
 */
export const getNumberOfEvacuationDays = (createdDate) => {
    let givenDate = new Date(createdDate);
    let todayDate = new Date();
    let timeDifference = todayDate - givenDate;
    return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
}

/**
 * Remove duplicate object from array
 * @param {*} array 
 * @param {*} key 
 * @returns 
 */
export const removeDuplicatesByKey = (array, key) => {
    const uniqueKeys = new Set();
    return array.filter((item) => {
        const itemKey = item[key];
        if (!uniqueKeys.has(itemKey)) {
            uniqueKeys.add(itemKey);
            return true;
        }
        return false;
    });
};

/**
 * Get japanese date & time format
 * @param {*} dateTime 
 * @returns 
 */
export const getJapaneseDateTimeDisplayActualFormat = (dateTime) => {
    const options = {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        // second: '2-digit',
    };
    const formattedJPDateTime = new Date(dateTime).toLocaleString('ja-JP', options);

    formattedJPDateTime.replace(/(\d+)年(\d+)月(\d+)日, (\d+):(\d+):(\d+)/, '$1年$2月$3日 $4:$5');
    return formattedJPDateTime;
};

/**
 * Get english date & time format
 * @param {*} dateTime 
 * @returns 
 */
export const getEnglishDateTimeDisplayActualFormat = (dateTime) => {
    const date = new Date(dateTime);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];

    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} (${dayOfWeek}) ${hour}:${minute}`;
};

/**
 * Get Japanese date & time format
 * @param {*} dateTime 
 * @returns 
 */
export const getJapaneseDateTimeDayDisplayActualFormat = (dateTime) => {
    const date = new Date(dateTime);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${year}年${month}月${day}日  (${dayOfWeek}) ${hour}:${minute}`;
};

/**
 * Get english date & time format
 * @param {*} dateTime 
 * @returns 
 */
export const getEnglishDateTimeDisplayFormat = (dateTime) => {
    if (dateTime != "") {
        const date = new Date(dateTime);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hour}:${minute}`;
    }
    return "";
};

/**
 * Get english slash date format
 * @param {*} dateTime 
 * @returns 
 */
export const getEnglishDateSlashDisplayFormat = (dateTime) => {
    const date = new Date(dateTime);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}/${month}/${day}`;
};

/**
 * Get english slash date time format with seconds
 * @param {*} dateTime 
 * @returns 
 */
export const getEnglishDateTimeSlashDisplayFormatWithSeconds = (dateTime) => {
    const date = new Date(dateTime);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
};

/**
 * Function to convert double-byte number string to single-byte
 * Function to convert full-width alphanumeric characters to single-byte
 * @param {*} fullWidthString 
 * @returns 
 */
export function convertToSingleByte(fullWidthString) {
    var hasFullWidth = /[Ａ-Ｚａ-ｚ０-９]/.test(fullWidthString);
    if (!hasFullWidth) {
        return fullWidthString; // Return input string as it is if it doesn't contain full-width characters
    }

    var output = fullWidthString.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (match) {
        return String.fromCharCode(match.charCodeAt(0) - 65248);
    });
    return output;
}

/**
 * hiding the background scroll when modal is open
 */
export const hideOverFlow = () => {
    document.body.style.overflow = 'hidden';
}

/**
 * enabling the background scroll when modal is closed
 */
export const showOverFlow = () => {
    document.body.style.overflow = 'auto';
}

/**
 * Function to calculate Age with help of date of birth
 * @param {*} year 
 * @param {*} month 
 * @param {*} date 
 * @returns 
 */
export const calculateAge = (year, month, date) => {
    year = year || new Date().getFullYear();
    month = month || 1;
    date = date || 1;

    const dobDate = new Date(year, month - 1, date);
    const currentDate = new Date();

    let age = currentDate.getFullYear() - dobDate.getFullYear();
    const dobMonth = dobDate.getMonth();
    const currentMonth = currentDate.getMonth();

    if (currentMonth < dobMonth || (currentMonth === dobMonth && currentDate.getDate() < dobDate.getDate())) {
        age--;
    }

    return age;
}

/**
 * Function will help to split japanese address
 * @param {*} address 
 * @returns 
 */
export function splitJapaneseAddress(address) {
    // Define a regular expression that captures all characters up to the last occurrence of any known city/ward marker
    const cityRegex = /^([\s\S]*[\u5e02\u533a\u753a\u6751\u90e1\u90fd\u9053\u5e9c\u770c])/;

    // Match the city part of the address
    const cityMatch = address.match(cityRegex);
    let city = '';
    let street = '';

    if (cityMatch && cityMatch.length > 0) {
        // Extract the city from the matched part of the address
        city = cityMatch[0].trim();

        // Extract the street from the remaining part of the address after the city
        street = address.slice(city.length).trim();
    } else {
        // If no city suffix is found, consider the entire address as the street
        street = address.trim();
    }

    return { city, street };
}

/**
 * Function will help to combine special care name based on locale
 */
export const getSpecialCareName = (nameList, locale = 'ja') => {
    let specialCareName = '';
    if (nameList.length > 0) {
        if (locale == 'ja') {
            nameList.map((item) => {
                specialCareName = specialCareName ? (specialCareName + ", " + item.name) : item.name;
            });
            return specialCareName;
        }
        nameList.map((item) => {
            specialCareName = specialCareName ? (specialCareName + ", " + item.name_en) : item.name_en;
        });
    }
    return specialCareName;
}

export function downloadImage(base64String, fileName) {

    //Convert base64 string to binary data
    const byteCharacters = atob(base64String);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    // Create Blob object from binary data
    const blob = new Blob(byteArrays, { type: 'image/png' }); // Adjust type if necessary

    // Create a URL for the Blob object
    const downloadUrl = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;

    // Append the link to the body
    document.body.appendChild(link);

    // Click the link to trigger the download
    link.click();

    // Remove the link from the DOM
    document.body.removeChild(link);

    // Revoke the URL to free up memory
    URL.revokeObjectURL(downloadUrl);
}

export function formatAddress(zipCode, prefecture, familyOrPersonAddress, familyOrPersonAddressDefault) {
    return `${zipCode ? zipCode : ''} ${prefecture ? prefecture : ''} ${familyOrPersonAddress ? familyOrPersonAddress : ''} ${familyOrPersonAddressDefault ? familyOrPersonAddressDefault : ''}`;
}

export const mobileAndTabletCheck = () => {
    let check = false;
    (function(a) {
      if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  };

  export const mobileCheck = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    console.log(userAgent);
    // Check for iPad, Android tablets, and exclude phones
    return /mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(userAgent);
  };

/**
 * Compare address to get unmatched data
 * @param {*} address1 
 * @param {*} address2 
 * @returns 
 */
export function compareAddresses(address1, address2) {
    const minLength = Math.min(address1.length, address2.length);
    let unmatchedData = '';

    for (let i = 0; i < minLength; i++) {
        if (address1[i] !== address2[i]) {
            unmatchedData += address2[i];
        }
    }

    if (address1.length > minLength) {
        unmatchedData += address1.substring(minLength);
    } else if (address2.length > minLength) {
        unmatchedData += address2.substring(minLength);
    }

    return unmatchedData;
}

export function extractAddress(ocrText) {
    // Define a pattern to match up to the address, excluding anything starting with 令, 令和, or 和
    if(ocrText)
    {
    const addressPattern = /^.*?(?=交付|令和|今和|平成)/;

    // Match the address using the pattern
    const match = ocrText.match(addressPattern);

    // If no match is found, return the original OCR text
    return match ? match[0].trim() : ocrText.trim();
    }
    else return ""
}


export async function geocodeAddressAndExtractData(address,localeJson,locale,setLoader) {

    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&language=ja&key=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.results.length === 0) {
            console.log("No results found for the address.");
            return { prefecture: "", postalCode: "", prefecture_id: "" };
        }

        const prefectureOptions = data.results
            .map((result, index) => {
                const prefectureObj = result.address_components.find(component => component.types.includes("administrative_area_level_1"));
                 const postalCodeObj = result.address_components.find(component => component.types.includes("postal_code"));
                const postalCode = postalCodeObj ? postalCodeObj.long_name.replace(/-/g, "") : "";
                let prefecture = '';
                if (prefectureObj) {
                    const prefectureEntry = Object.values(prefecturesCombined).find(pref =>
                        pref.en === prefectureObj.long_name || pref.ja === prefectureObj.long_name
                    );
                
                    // Choose the name based on the locale
                    prefecture = locale == 'ja'
                        ? (prefectureEntry ? prefectureEntry.ja : prefectureObj.long_name) // Use Japanese name if locale is 'ja'
                        : (prefectureEntry ? prefectureEntry.en : prefectureObj.long_name); // Use English name otherwise
                }
                
                return prefectureObj ? { index, prefecture,postalCode } : null;
            })
            .filter(option => option !== null);

        if (prefectureOptions.length === 0) {
            console.log("No prefecture information found in the results.");
            return { prefecture: "", postalCode: "", prefecture_id: "" };
        }

        if (prefectureOptions.length > 1) {
            return new Promise((resolve, reject) => {
                let selectedIndex = null;

                const handleSelect = () => {
                    if (selectedIndex === null) {
                        console.log("No prefecture selected.");
                        return;
                    }
                    const selectedOption = prefectureOptions[selectedIndex];
                    const result = data.results[selectedOption.index];
                    const prefecture = selectedOption.prefecture;
                    const postalCodeObj = result.address_components.find(component => component.types.includes("postal_code"));
                    const postalCode = postalCodeObj ? postalCodeObj.long_name.replace(/-/g, "") : "";

                    // Assuming you have predefined `prefectures` and `prefectures_en` arrays
                    const selectedPref = prefectures.find(pref => pref.name === prefecture) ||
                                         prefectures_en.find(pref => pref.name === prefecture);
                    const prefecture_id = selectedPref ? selectedPref.value : "";
                    resolve({ prefecture, postalCode, prefecture_id });
                };

                const handleClose = () => {
                    setLoader(true);
                    toast.dismiss(toastId);
                    setLoader(false);
                    reject("User canceled");
                };
                setLoader(false);
                const toastId = toast.custom(t => (
                    <div className='pl-5 pr-5 pl-3 pt-3 pb-3' style={{
                        textAlign: 'center',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        minWidth: '400px',
                        maxWidth:'400px',
                        height:"auto",
                        overflow:"auto",
                        maxHeight:"80vh"
                    }}>
                        <span className='font-semibold'>{ getValueByKeyRecursively(localeJson, "select_prefecture")}</span>
                        <div className='mt-5'>
                        {prefectureOptions.map((option, i) => (
                            <div key={i} className='flex justify-content-start  pl-5 pr-5' style={{ margin: '5px 0' }}>
                                <input
                                    type="radio"
                                    id={`prefecture-${i}`}
                                    name="prefecture"
                                    className='mb-1'
                                    onChange={() => {
                                        selectedIndex = i;
                                    }}
                                />
                                <label htmlFor={`prefecture-${i}`}>{option.postalCode?"〒":""}{option.postalCode}{" "}{option.prefecture} </label>
                            </div>
                        ))}
                        </div>
                         <div className="text-center flex flex-column pl-5 pr-5 evacueeFooterButtonText">
                    <Button
                      buttonProps={{
                        buttonClass:
                          "w-full primary-button h-3rem border-radius-5rem mb-3 mt-5",
                        type: "submit",
                        text: getValueByKeyRecursively(localeJson, "hitachi_list_choice_btn"),
                        onClick: () => {
                            setLoader(true);
                            handleSelect();
                            toast.dismiss();
                            setLoader(false);
                        },
                      }}
                      parentClass={"inline primary-button"}
                    />
                    <Button
                      buttonProps={{
                        buttonClass:
                          "w-full back-button h-3rem border-radius-5rem",
                        text:  getValueByKeyRecursively(localeJson, "cancel"),
                        type: "reset",
                        onClick: () => {
                            handleClose()
                        },
                      }}
                      parentClass={"inline back-button"}
                    />
                  </div>
                        {/* <button
                            onClick={handleSelect}
                            style={{ display: 'block', margin: '10px auto' }}
                        >
                            Select
                        </button>
                        <button
                            onClick={handleClose}
                            style={{ display: 'block', margin: '10px auto' }}
                        >
                            Cancel
                        </button> */}
                    </div>
                ), {
                    duration: Infinity,
                    style: {
                        minWidth: '400px',
                    },
                    action: (
                        <button
                            onClick={handleClose}
                            style={{ display: 'block', marginTop: '10px' }}
                        >
                            Close
                        </button>
                    )
                });
            });
        } else {
            // Only one option available, proceed without showing the toast
            const selectedOption = prefectureOptions[0];
            const result = data.results[selectedOption.index];
            const prefecture = selectedOption.prefecture;
            const postalCodeObj = result.address_components.find(component => component.types.includes("postal_code"));
            const postalCode = postalCodeObj ? postalCodeObj.long_name.replace(/-/g, "") : "";

            // Assuming you have predefined `prefectures` and `prefectures_en` arrays
            const selectedPref = prefectures.find(pref => pref.name === prefecture) ||
                                 prefectures_en.find(pref => pref.name === prefecture);
            const prefecture_id = selectedPref ? selectedPref.value : "";

            return { prefecture, postalCode, prefecture_id };
        }
    } catch (error) {
        // Only log the error
        console.error("Error fetching data from Google Maps API:", error);
        return { prefecture: "", postalCode: "", prefecture_id: "" };
    }
}

export function parseJapaneseDate(japaneseDateString) {
    const eraMapping = {
        "令和": 2019, // Reiwa started in 2019
        "平成": 1989, // Heisei started in 1989
        "昭和": 1926, // Showa started in 1926
        "大正": 1912, // Taisho started in 1912
        "明治": 1868 // Meiji started in 1868
    };

    try {
        // Match the Japanese date string
        const match = japaneseDateString.match(/(令和|平成|昭和|大正|明治)(\d+)年(\d+)月(\d+)日/);
        if (!match) {
            throw new Error("Invalid Japanese date format");
        }

        const [, era, year, month, day] = match;

        // Convert Japanese year to Gregorian year
        const gregorianYear = eraMapping[era] + parseInt(year, 10) - 1;

        // Construct the Gregorian date
        const date = new Date(`${gregorianYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);

        // Format as 'YYYY/MM/DD'
        const formattedDate = date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });

        return formattedDate; // Return the formatted Gregorian date
    } catch (error) {
        console.error("Error parsing Japanese date:", error);
        return null; // Return null if parsing fails
    }
}


export function transformData(input) {
    const dob = parseJapaneseDate(input.Birthday); // Convert Birthday
    if (!dob) return null;
    let age = null;

    if(dob){
        // Get age and gender from dob
        age = calculateDOBAge(dob);
        // const gender = input.Gender === "male"? "男性" : "女性";
    }

    // Transform input object into required output format
    return {
        address: input.Address || "",
        fullAddress: input.Address || "",
        dob: dob,
        age: age?.years||"",
        gender: "",
        month: age.months||"",
        name: input.Name || "",
        prefecture_id: "",
        postal_code: "",
        refugeeName: "",
    };
}

function calculateDOBAge(birthdate) {
    const birthdateObj = new Date(birthdate);
    const currentDate = new Date();
    let years = currentDate.getFullYear() - birthdateObj.getFullYear();
    let months = currentDate.getMonth() - birthdateObj.getMonth();
    if (currentDate.getDate() < birthdateObj.getDate()) {
      // Adjust for cases where the birthdate has not occurred yet in the current month
      months--;
    }
    if (months < 0) {
      // Adjust for cases where the birthdate month is ahead of the current month
      years--;
      months += 12;
    }
    return { years, months };
  }

  export async function fetchIvuResponse(cardType) {
    try {
        const request = {
            client_url: "http://127.0.0.1:50080", // Replace with actual API endpoint
            card_type: cardType, // Initial card type
        };

        const response = await ivuApi(request);
        if(response)
        {
            console.log("Final extracted data:", response);
            return response;
        }
    } catch (error) {
        toast.error(error?.message,{
            position:'top-right'
        })
        console.error("Error occurred:", error.message);
    }
}

// async function tryReadCard(request, cardType, command) {
//     request.card_type = cardType;
//     await executeStep("CLEAR_RESULT", request);
//     await new Promise(res => setTimeout(res, 100));
//     await executeStep("INITIALIZE_STATUS", request);
//     return await executeStep(command, request);
// }

function throwErrorWithCommand(message, command) {
    const error = new Error(message || `${command} failed`);
    error.command = command;
    throw error;
}


  
/**
 * ivuApi
 * @description IVU API to read identity card data
 * @param {Object} request - The request object with the following properties:
 *   - card_type: The type of the card to read. Allowed values are "MYNUMBER" and "DRVLIC".
 * @returns {Promise<Object>} The response object with the following properties:
 *   - card_type: The type of the card that was read.
 *   - front: The front side image of the card.
 *   - back: The back side image of the card.
 *   - issue_date: The issue date of the card in the format "YYYYMMDD".
 *   - expire_date: The expire date of the card in the format "YYYYMMDD".
 *   - name: The name of the card holder.
 *   - address: The address of the card holder.
 *   - kana_name: The name of the card holder in Katakana.
 *   - kana_address: The address of the card holder in Katakana.
 *   - card_number: The number of the card.
 *   - card_version: The version of the card.
 *   - birth_date: The birth date of the card holder in the format "YYYYMMDD".
 *   - gender: The gender of the card holder. Allowed values are "男性" and "女性".
 *   - special_care: The special care status of the card holder. Allowed values are "有" and "無".
 *   - prefecture_id: The prefecture id of the card holder.
 *   - postal_code: The postal code of the card holder.
 *   - refugee_name: The name of the refugee card holder.
 * @throws {Error} If the API returns an error response.
 */
async function ivuApi(request) {
    const steps = [
        "CLEAR_RESULT",
        "INITIALIZE_STATUS",
        "IVU_CMD_IDCARD_READ_FRONTSIDE",
        "IIA_IVD_RECOG",
        "IVU_CMD_IDCARD_OUTPUT",
        "GET_RECORD",
        "CLEAR_RESULT"
    ];

    if (request.card_type === "DRVLIC") {
        steps.splice(2, 0, "IVU_CMD_IDCARD_READ_FRONTSIDE_IMAGE");
    }
    if (request.card_type === "MYNUMBER") {
        steps[2] ="IVU_CMD_IDCARD_READ_FRONTSIDE_IMAGE";
        steps.splice(4, 0, "IVU_CMD_IDCARD_VERIFY");
    }

    let data = {};

    for (const step of steps) {
        try {
            if (step === "GET_RECORD") {
                data = await processStepResponse(step, request);
            } else {
                const status = await executeStep(step, request, step);

                if (status === null) {
                    // SET_PIN failed, stop processing
                    return null;
                }

                if (!status?.result || status.result !== "OK") {
                    if (step === "GET_RECORD" || step === "IVU_CMD_IDCARD_READ_FRONTSIDE_IMAGE") {
                        await executeStep("CLEAR_RESULT", request);
                        throwErrorWithCommand(status.text, "GET_RECORD");
                    }
                }
            }
        } catch (error) {

            console.log(error)
            // Only rethrow if error.command is SET_PIN or GET_RECORD
            if (error.command === "SET_PIN" || error.command === "GET_RECORD") {
                throw error;
            } else {
                console.warn(`Ignored error at ${step}: ${error.message}`);
            }
        }
    }

    return data;
}



  /**
   * Execute a step in the card recognition flow.
   * 
   * @param {string} command The command to execute.
   * @param {object} request The request object containing the client URL and card type.
   * @returns {Promise<object|Error>} The response from the server or an Error if the request fails.
   * 
   * @throws {Error} If the request fails or the server returns an error.
   */
  async function executeStep(command, request, outerStep) {
    const prefix = command === "IIA_IVD_RECOG" ? "gmapi" : "ivuapi";
    const url = `${request.client_url}/${prefix}/${command}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(getParameters(command, request.card_type)),
        });

        const data = await response.json();

        // Special handling for MYNUMBER → run SET_PIN
        if (request.card_type === "MYNUMBER" && command === "IIA_IVD_RECOG") {
            const pin = data?.output?.Pin14OfMNC || null;
            const pinStatus = await executeSetPin(pin, request);

            // if (!pinStatus?.result || pinStatus.result !== "OK") {
            //     throwErrorWithCommand(pinStatus.text, "SET_PIN");
            // }

            if (!pinStatus) {
                return null; // SET_PIN failed, stop here
            }

            return pinStatus;
        }

        return data;
    } catch (error) {
        console.error(`Error in ${command}:`, error);
        if (outerStep === "GET_RECORD") {
            throwErrorWithCommand(error.message, "GET_RECORD");
        }
        return {}; // Silent fail
    }
}


  
  
  /**
   * Process the response of a step in the card recognition flow.
   * 
   * @param {string} command The command that was executed.
   * @param {object} request The request object containing the client URL and card type.
   * @returns {Promise<object|Error>} The response data or an Error if the request fails.
   * 
   * @throws {Error} If the request fails or the server returns an error.
   */
  async function processStepResponse(command, request) {
    const url = `${request.client_url}/ivuapi/${command}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(getParameters(command, request.card_type))
        });

        const data = await response.json();
        console.info(`${command} response:`, data);

        if (!data?.result || data.result !== "OK") {
            throwErrorWithCommand(data.text, command);
        }

        if (command === "GET_RECORD") {
            return await extractDataFromRecordResponse(data);
        }

        return {};
    } catch (error) {
        console.error(`Error in ${command}:`, error);
        throwErrorWithCommand(error.message, command);
    }
}

  
  /**
   * Execute the SET_PIN command to set the PIN for the current MYNUMBER card.
   * 
   * @param {string} pin The PIN to set.
   * @param {object} request The request object containing the client URL and card type.
   * @returns {Promise<object|Error>} The response from the server or an Error if the request fails.
   * 
   * @throws {Error} If the request fails or the server returns an error.
   */
  async function executeSetPin(pin, request) {
    const url = `${request.client_url}/ivuapi/SET_PIN`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pin_type: "MYNUMBER_PINB_14", data: pin })
        });

        const data = await response.json();
        if (!data?.result || data.result !== "OK") {
            toast.error(data?.text || "SET_PIN failed", { position: "top-right" });
            return null; // ❌ Stop here, don’t continue other steps
        }
        console.info("SET_PIN response:", data);
        return data;
    } catch (error) {
        console.error("SET_PIN error:", error);
        throwErrorWithCommand("SET_PIN request failed", "SET_PIN");
    }
}


  
  
  /**
   * Extracts the relevant data from the response of the GET_RECORD command.
   * 
   * @param {object} response The response object from the server.
   * @returns {object} An object containing the extracted data.
   * 
   * @property {string} fullAddress The full address of the person.
   * @property {string} address The address of the person, formatted as a CSV string.
   * @property {number} age The age of the person.
   * @property {string} dob The date of birth of the person.
   * @property {string} Gaiji The Gaiji of the person.
   * @property {string} name The name of the person.
   * @property {string} refugeeName The Katakana name of the person.
   * @property {string} gender The gender of the person.
   * @property {string} TuikiIC The TuikiIC of the person.
   */
  async function extractDataFromRecordResponse(response) {
    const holderInfo = response?.output?.IDCARD_OUTPUT?.HolderInfo || {};
    return {
        fullAddress: holderInfo.Address || null,
        address: holderInfo.Address?handleAddressCSV( holderInfo.Address) : null,
        age: holderInfo.Age || null,
        dob: holderInfo.DayOfBirth || null,
        Gaiji: holderInfo.Gaiji || null,
        name: holderInfo.Name1 ? holderInfo.Name1 : null,
        refugeeName: holderInfo.Name1 ? "" : null,
        gender: holderInfo.Sexuality || null,
        TuikiIC: holderInfo.TuikiIC || null,
    };
  }
  
/**
 * Retrieves the parameters associated with a specific command and card type.
 * 
 * @param {string} command - The command for which parameters are needed.
 * @param {string} card_type - The type of card being processed.
 * @returns {object} An object containing parameters for the specified command. 
 *                   Returns an empty object if the command is not recognized.
 * 
 * Available commands and their parameters:
 * - LOCK: Locks the application with a specific name.
 * - IVU_CMD_IDCARD_READ_FRONTSIDE_IMAGE: Reads the front side image of the ID card.
 * - IIA_IVD_RECOG: Recognizes the ID card.
 * - IVU_CMD_IDCARD_VERIFY: Verifies the ID card with a specified mode.
 * - IVU_CMD_IDCARD_READ_FRONTSIDE: Reads the front side of the ID card.
 * - IVU_CMD_IDCARD_OUTPUT: Outputs card information with specific flags.
 * - GET_RECORD: Retrieves the record of a target person.
 * - UNLOCK: Unlocks the application with a specific name.
 * - CLEAR_RESULT: Clears the result for a target person.
 * - IVU_CMD_LIGHT_CONTROL: Controls the light indicator with specified settings.
 * - IVU_CMD_PICR_POLLING: Polls the card in AUTO mode for a target person.
 * - IVU_CMD_PICR_CHECK: Checks the card in BOTH mode with a timeout.
 */

  function getParameters(command, card_type) {
    const params = {
        LOCK: { app_name: "test_app" },
        IVU_CMD_IDCARD_READ_FRONTSIDE_IMAGE: { card_type },
        IIA_IVD_RECOG: { card_type },
        IVU_CMD_IDCARD_VERIFY: { card_type, mode: "VERIFY" },
        IVU_CMD_IDCARD_READ_FRONTSIDE: { card_type },
        IVU_CMD_IDCARD_OUTPUT: { output_flags: "TokuteiInfo|CardInfo" },
        GET_RECORD: { person: "TARGET" },
        UNLOCK: { app_name: "test_app" },
        CLEAR_RESULT: { person: "TARGET" },
        IVU_CMD_LIGHT_CONTROL: { light_target: "INDICATOR", power: 255, mode: "SQUARE", length: 2000 },
        IVU_CMD_PICR_POLLING: { card_type:"AUTO", mode: "IC", person: "TARGET", timeout: 20000 },
        IVU_CMD_PICR_CHECK: { mode: "BOTH", timeout: 20000 }
    };
    return params[command] || {};
  }
  
  /**
   * Converts a given address string from a CSV file to a standard format used
   * in the application. The standard format is:
   *   Prefecture + City + Address
   * The function tries to extract Prefecture, City and Address from the given
   * string by matching a regular expression. If the string does not match the
   * regular expression, the original string is returned.
   * @param {string} address - The address string from a CSV file.
   * @returns {string} The standardized address string.
   */
  function handleAddressCSV(address) {
    const regex = /^(.{2,3}?[都道府県])(.+?郡.+?[町村]|.+?市.+?区|.+?[市区町村])(.+)/u;
    const matches = address.match(regex);
    if (!matches) {
        return address;
    }
    return matches[2] + matches[3];
  }

  /**
   * Converts a given string to Katakana.
   * The function uses an external service to convert the string, and returns
   * the converted string without any spaces.
   * If the conversion fails, the function returns an empty string.
   * @param {string} text - The string to be converted.
   * @returns {string} The converted string in Katakana without any spaces.
   */
  export async function convertNameToKatakana(text) {
    return new Promise((resolve) => {
        CommonServices.convertToKatakana(text, (res) => {
            if (res) {
                resolve(res.converted);
            } else {
                resolve("");
            }
        });
    });
}
