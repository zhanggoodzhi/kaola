// wrapper window.console function to support IE8
window._console = window.console;//将原始console对象缓存
if (window.console == undefined || window.console.log == undefined
    || window.console.info == undefined || window.console.error == undefined
    || window.console.debug == undefined || window.console.debug == undefined) {
    window.console = (function (orgConsole) {
        return {//构造的新console对象
            log: getConsoleFn("log"),
            debug: getConsoleFn("debug"),
            info: getConsoleFn("info"),
            warn: getConsoleFn("warn"),
            exception: getConsoleFn("exception"),
            assert: getConsoleFn("assert"),
            dir: getConsoleFn("dir"),
            dirxml: getConsoleFn("dirxml"),
            trace: getConsoleFn("trace"),
            group: getConsoleFn("group"),
            groupCollapsed: getConsoleFn("groupCollapsed"),
            groupEnd: getConsoleFn("groupEnd"),
            profile: getConsoleFn("profile"),
            profileEnd: getConsoleFn("profileEnd"),
            count: getConsoleFn("count"),
            clear: getConsoleFn("clear"),
            time: getConsoleFn("time"),
            timeEnd: getConsoleFn("timeEnd"),
            timeStamp: getConsoleFn("timeStamp"),
            table: getConsoleFn("table"),
            error: getConsoleFn("error"),
            memory: getConsoleFn("memory"),
            markTimeline: getConsoleFn("markTimeline"),
            timeline: getConsoleFn("timeline"),
            timelineEnd: getConsoleFn("timelineEnd")
        };
        function getConsoleFn(name) {
            return function actionConsole() {
                if (typeof (orgConsole) !== "object") return;
                if (typeof (orgConsole[name]) !== "function") return;//判断原始console对象中是否含有此方法，若没有则直接返回
                return orgConsole[name].apply(orgConsole, Array.prototype.slice.call(arguments));//调用原始函数
            };
        }
    }(window._console));
}

//生成GUID
function guid() {
    var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    console.log(id);
    return id.replace(/-/g, '');
}

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(decodeURI(r[2]));
    } else {
        return null;
    }
}

//localStorage.getItem(key):获取指定key本地存储的值
//localStorage.setItem(key,value)：将value存储到key字段
//localStorage.removeItem(key):删除指定key本地存储的值

function writeLocalStorage(key, dataObj) {
    var localStorage = window.localStorage;

    localStorage.removeItem(key);

    //JSON.stringify()函数就是把一个对象转化为字符串,将objStr按正常的方式存入localStorage中
    var dataObjStr = JSON.stringify(dataObj);

    localStorage.setItem(key, dataObjStr);
}

function getFromLocalStorage(key) {
    var localStorage = window.localStorage;
    var obj = localStorage.getItem(key);
    return obj;
}

function removeLocalStorage(key) {
    var localStorage = window.localStorage;
    localStorage.removeItem(key);
}

function writeCookies(key, dataObj) {
    clearCookie(key);

    var dataObjStr = JSON.stringify(dataObj);

    setCookie(key, dataObjStr, 30);
}

//设置cookie
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    var path = "path=/";
    document.cookie = cname + "=" + cvalue + "; " + expires + "; " + path;
}
//获取cookie
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
    }
    return "";
}
//清除cookie
function clearCookie(name) {
    setCookie(name, "", -1);
}

function removeCookies(key) {
    setCookie(key, "", -1);
}

function getIEVersion() {
    var ieBrowserVersion = 99;
    var browser = navigator.appName
    var b_version = navigator.appVersion
    if (window.console != undefined) {
        //console.log("b_version:", b_version);
    }
    if (b_version.indexOf("MSIE 7.0") > -1) {
        ieBrowserVersion = 7;
    }
    else if (b_version.indexOf("MSIE 8.0") > -1) {
        ieBrowserVersion = 8;
    }
    else if (b_version.indexOf("MSIE 9.0") > -1) {
        ieBrowserVersion = 9;
    }
    else if (b_version.indexOf("MSIE 10.0") > -1) {
        ieBrowserVersion = 10;
    }
    else if (b_version.indexOf("Trident") > -1) {
        ieBrowserVersion = 11;
    }
    else if (b_version.indexOf("Edge") > -1) {
        ieBrowserVersion = 14;
    }

    if (window.console != undefined) {
        //console.log("get IE browser version :", ieBrowserVersion);
    }
    return ieBrowserVersion;
}

var ArrayUtility = {
    removeByValue: function (array, val) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] == val) {
                array.splice(i, 1);
                break;
            }
        }
    },
    removeAt: function (array, index) {
        if (index < array.length) {
            array.splice(index, 1);
        }
    },
    countValue: function (array, key, value) {
        var count = 0;
        for (var i = 0; i < array.length; i++) {
            var findValue = array[i][key];
            if (findValue != undefined && findValue == value) {
                count++;
            }
        }
        return count;
    },
    insert: function (array, index, item) {
        array.splice(index, 0, item);
    },
    containItem: function (array, item) {
        if (item != undefined && item != null) {
            for (var i = 0; i < array.length; i++) {
                var findValue = array[i];
                if (findValue != undefined && findValue == item) {
                    return true;
                }
            }
        }
        return false;
    },
    containKey: function (array, item, key) {
        if (item != undefined && item != null && key != undefined && key != null) {
            for (var i = 0; i < array.length; i++) {
                var findValue = array[i][key];
                if (findValue != undefined && findValue == item[key]) {
                    return true;
                }
            }
        }
        return false;
    },
    contain2Key: function (array, item, key1, key2) {
        if (item != undefined && item != null && key1 != undefined && key1 != null && key2 != undefined && key2 != null) {
            for (var i = 0; i < array.length; i++) {
                var findValue1 = array[i][key1];
                var findValue2 = array[i][key2];
                if (findValue1 != undefined && findValue1 == item[key1] && findValue2 != undefined && findValue2 == item[key2]) {
                    return true;
                }
            }
        }
        return false;
    },
    searchTreeNode: function (array, searchKeyValue) {
        var findNode = undefined;
        if (searchKeyValue != undefined && searchKeyValue != null) {
            for (var i = 0; i < array.length; i++) {
                var node = array[i];
                var findKeyValue = node.key;
                if (findKeyValue != undefined && findKeyValue == searchKeyValue) {
                    findNode = node;
                    break;
                }
                else {
                    findNode = ArrayUtility.searchTreeNode(node.children, searchKeyValue);
                    if (findNode != undefined) {
                        break;
                    }
                }
            }
        }
        return findNode;
    }
}


var DateTimeUtility = {

    formatMinute: function (seconds) {

        seconds = Math.ceil(seconds);
        //console.log(seconds);
        var second = seconds % 60;
        var minutes = Math.floor(seconds / 60);
        var timeString = "";
        if (minutes < 10) {
            timeString = "0" + minutes;
        } else {
            timeString = minutes;
        }

        if (second < 10) {
            timeString += ":0" + second;
        } else {
            timeString += ":" + second;
        }
        return timeString;
    },
    format: function (dt, fmt) {
        if ((dt instanceof Date) == false) {
            dt = new Date(dt);
        }
        var o = {
            "M+": dt.getMonth() + 1,                 //月份   
            "d+": dt.getDate(),                    //日   
            "h+": dt.getHours(),                   //小时   
            "m+": dt.getMinutes(),                 //分   
            "s+": dt.getSeconds(),                 //秒   
            "q+": Math.floor((dt.getMonth() + 3) / 3), //季度   
            "S": dt.getMilliseconds()             //毫秒   
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (dt.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    },
    // 返回时间差
    diff: function (d1, d2, format) {

        if ((d1 instanceof Date) == false) {
            d1 = new Date(d1);
        } if ((d2 instanceof Date) == false) {
            d2 = new Date(d2);
        }
        //console.log("d1:", d1); console.log("d2:", d2);
        var timeSpan = (d1.getTime() - d2.getTime());
        //console.log("timeSpan:", timeSpan);
        var unit = 1;
        switch (format) {
            case "s":
                unit = 1000;
                break;
            case "m":
                unit = 1000 * 60;
                break;
            case "h":
                unit = 1000 * 60 * 60;
                break;
            case "d":
                unit = 1000 * 60 * 60 * 24;
                break;
            default:
                console.log("not support format");
                break;

        }

        return Math.ceil(timeSpan / unit);
    }
}


var customScrollbarHelper = {
    refreshScrollbarFunction: function ($) {
        //console.log("load and mCustomScrollbar");
        $(".custom-scrollbar").mCustomScrollbar({
            autoHideScrollbar: false, //是否自动隐藏滚动条  
            scrollInertia: 100,//滚动延迟 
        });
    },
    refreshScrollbar: function () {
        setTimeout(function () {
            customScrollbarHelper.refreshScrollbarFunction(jQuery)
        }, 100);
    },

    refreshHorizontalScrollbarFunction: function ($) {
        console.log("load and mCustomScrollbar");
        $(".custom-scrollbar").mCustomScrollbar({
            horizontalScroll: true,
        });
    },
    refreshHorizontalScrollbar: function () {
        setTimeout(function () {
            console.log("refreshHorizontalScrollbar");
            customScrollbarHelper.refreshHorizontalScrollbarFunction(jQuery)
        }, 100);
    }
}

function ConvertNumberToCN(n) {
    var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    var numberCN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十']
    for (var i = 0; i < numbers.length; i++) {
        if (numbers[i] == n) {
            return numberCN[i];
        }
    }
    return '超出范围';
}

function stringEndWith(testStr, specialStr) {
    var reg = new RegExp(specialStr + "$");
    return reg.test(testStr);
}


function roundMin0Max2Filter(score) {

    if (score != undefined) {
        var scoreStr = String(score);
        var round0Score = score.toFixed(0);
        var round1Score = score.toFixed(1);
        var round2Score = score.toFixed(2);
        if (Math.abs(round0Score - round1Score) < 0.0001) {
            return round0Score;
        } else if (Math.abs(round1Score - round2Score) < 0.0001) {
            return round1Score;
        } else {
            return round2Score;
        }
    }
    return score;
}