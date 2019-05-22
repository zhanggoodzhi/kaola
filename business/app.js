// wrapper window.console function to support IE8
window._console = window.console; //将原始console对象缓存
if (window.console == undefined || window.console.log == undefined || window.console.info == undefined || window.console.error == undefined || window.console.debug == undefined || window.console.debug == undefined) {
    window.console = (function (orgConsole) {
        return { //构造的新console对象
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
                if (typeof (orgConsole) !== "object")
                    return;
                if (typeof (orgConsole[name]) !== "function")
                    return; //判断原始console对象中是否含有此方法，若没有则直接返回
                return orgConsole[name].apply(orgConsole, Array.prototype.slice.call(arguments)); //调用原始函数
            };
        }
    }(window._console));
}

//可信网站图片LOGO安装开始

var installKXLogo = function () {
    var _kxs = document.createElement('script');
    _kxs.id = 'kx_script';
    _kxs.async = true;
    _kxs.setAttribute('cid', 'kx_verify');
    _kxs.src = ('https:' == document.location.protocol
        ? 'https://ss.knet.cn'
        : 'http://rr.knet.cn') + '/static/js/icon3.js?sn=e17071932050068368d3wr000000&tp=icon3';
    _kxs.setAttribute('size', 0);
    var _kx = document.getElementById('kx_verify');
    _kx
        .parentNode
        .insertBefore(_kxs, _kx);
};

//可信网站图片LOGO安装结束

var fixScrollBarForBootstrapMultiDialog = function () {
    if ($(".modal.fade.ng-scope.in").length > 0) {
        console.log("add modal-open for body");
        setTimeout(function () {
            $("body:not(.modal-open)").addClass("modal-open");
        }, 1000);
    }
}

/*
*   cv_JS_Deps: 添加每个模块的JS文件相对与本js文件的相对路径，扩展名可省略
*/
var cv_JS_Deps = [
    'auth/auth',
    'home/home',
    'school/school',
    'dongle/dongle',
    'package/package',
    'channelBusiness/channelBusiness',
    'contentBusiness/contentBusiness',
    'contentEditor/contentEditor',
    'user/user',
    'version/version',
    'version/patchversion',
    'HeadphoneMangement/headphone',
    'PaperManagement/paperlibaray',
    'PaperManagement/paperpackage',
    'DBReport/DBReport',
    'DataReport/DataReport',
    'serverDomain/serverDomain',
    'configCenter/configCenter',
    'examOrg/examOrg',
    'examOrg/examManage/examManage',
];

/*
*   cv_Modules: 添加每个模块的JS文件里定义的Module
*/
var cv_Modules = [
    'Auth', //账户与权限管理
    'Home', //首页
    'School', //学校管理
    'Dongle', //加密狗管理
    'Package', //内容序列号管理
    'ChannelBusiness', //渠道商管理
    'ContentEditor', // 内容编辑管理
    'ContentBusiness', //内容商管理
    'User', //用户管理
    'Version', //自动更新版本管理
    'PatchVersion', //补丁版本管理
    'Headphone', //耳麦管理
    'PaperLibaray', //试卷库管理
    'PaperPackage', //试卷包管理
    'DBReport', // 服务器监控
    'DataReport', //数据监控
    'ServerDomain', //区域服务器配置面板
    'configCenter',//配置中心

    'ExamOrg', //考试机构管理
    'ExamManageForManager', //考试管理For考试机构管理员
];

/*
*   DefaultRoute: 默认路由
*/
var cv_DefaultRoute = '/home';

/*
*   提供服务的基本地址
*/
var cv_ServiceBase = '/';

/*
*   左侧边栏的菜单列表定义
*/
var cv_SidebarItems = [
    {
        'title': '学校管理',
        'state': 'school',
        icon: 'xuxiaoguanli',
        userRole: [1]
    }, {
        'title': '考试机构管理',
        'state': 'examOrg',
        icon: 'kaoshijigouguanli',
        userRole: [100]
    },
    {
        'title': '加密狗管理',
        'state': 'dongle',
        icon: 'jiamigouguanli',
        userRole: [1, 2]
    }, {
        'title': '内容序列号管理',
        'state': 'package',
        icon: 'neirongxuliehaoguanli',
        userRole: [1, 2]
    }, {
        'title': '试卷包管理',
        'state': 'paperpackage',
        icon: 'shijuanbaoguanli',
        userRole: [1, 3]
    }, {
        'title': '试卷库管理',
        'state': 'paperlibaray',
        icon: 'shijuankuguanli',
        userRole: [1, 3]
    }, {
        'title': '内容编辑管理',
        'state': 'contentEditor',
        icon: 'neirongbianjiguanli',
        userRole: [1, 3]
    }, {
        'title': '渠道商管理',
        'state': 'channelBusiness',
        icon: 'qundaoshangguanli',
        userRole: [1]
    }, {
        'title': '内容商管理',
        'state': 'contentBusiness',
        icon: 'neirongshangguanli',
        userRole: [1]
    }, {
        'title': '耳麦管理',
        'state': 'headphone',
        icon: 'ermaiguanli',
        userRole: [1]
    }, {
        'title': '用户管理',
        'state': 'user',
        icon: 'yonghuguanli',
        userRole: [1]
    }, {
        'title': '版本控制管理',
        'state': 'version',
        icon: 'banbenkongzhiguanli',
        userRole: [1, 5]
    }, {
        'title': '服务器监控',
        'state': 'DBReport',
        icon: 'banbenkongzhiguanli',
        userRole: [100]
    }, {
        'title': '数据监控',
        'state': 'DataReport',
        icon: 'banbenkongzhiguanli',
        userRole: [100]
    }, {
        'title': '区域服务器配置',
        'state': 'serverDomainConfig',
        icon: 'banbenkongzhiguanli',
        userRole: [100]
    }, {
        'title': '配置中心',
        'state': 'configCenter',
        icon: 'banbenkongzhiguanli',
        userRole: [100]
    },

];

var cv_UserRole = [
    {
        title: '驰声管理员',
        userRole: 1
    }, {
        title: '渠道管理员',
        userRole: 2
    }, {
        title: '内容管理员',
        userRole: 3
    }, {
        title: '内容编辑',
        userRole: 4
    }, {
        title: '版本管理员',
        userRole: 5
    }, {
        title: '超级管理员',
        userRole: 100
    }
];

/*
*   系统支持的试题题型
*/
var cv_AreaType = [
    "听对话答题",
    "听短文答题",
    "朗读短文",
    "短文跟读",
    "句子跟读",
    "句子复述",
    "情景问答",
    "故事复述",
    "看图说话",
    "话题简述"
];

/*
*   年级设置
*/
var cv_Grade = [
    // { Name: '一年级', Grade: 1 }, { Name: '二年级', Grade: 2 }, { Name: '三年级', Grade: 3
    // }, { Name: '四年级', Grade: 4 }, { Name: '五年级', Grade: 5 },
    {
        Name: '六年级',
        Grade: 6
    }, {
        Name: '七年级',
        Grade: 7
    }, {
        Name: '八年级',
        Grade: 8
    }, {
        Name: '九年级',
        Grade: 9
    }, {
        Name: '十年级',
        Grade: 10
    }, {
        Name: '十一年级',
        Grade: 11
    }, {
        Name: '十二年级',
        Grade: 12
    }
];

define([
    'angular',
    'audio5js',
    'moment',
    'jquery',
    'angular-ui-router',
    'ng-table',
    'angular-local-storage',
    'abnTree',
    'ng-file-upload-all'
].concat(cv_JS_Deps), function (angular, Audio5js, moment) {
    'use strict';

    var app = angular.module('app', [
        'ui.router',
        'ui.bootstrap',
        'ngTable',
        'LocalStorageModule',
        'abnTree',
        'ngFileUpload',
        'toaster',
        'angucomplete'
    ].concat(cv_Modules));
    var cv_servers = [{
        "name": '服务器1',
        "value": 'http://server1.uukaola.com/'
    }, {
        "name": '服务器2',
        "value": 'http://server2.uukaola.com/'
    }, {
        "name": '服务器3',
        "value": 'http://server3.uukaola.com/'
    }];
    app.constant('Constants', {
        apiServiceBaseUri: cv_ServiceBase,
        clientId: 'self',
        sidebarItems: cv_SidebarItems,
        userRole: cv_UserRole,
        areaType: cv_AreaType,
        gradeItems: cv_Grade,
        servers: cv_servers
    });
    app.constant('DatepickerOption', {
        timePicker: true,
        timePicker24Hour: true,
        locale: {
            format: 'YYYY-MM-DD hh:mm',
            applyClass: 'btn-green',
            applyLabel: "确定",
            cancelLabel: '取消',
            fromLabel: "开始",
            toLabel: "到",
            customRangeLabel: '自定义时间',
            daysOfWeek: [
                '日',
                '一',
                '二',
                '三',
                '四',
                '五',
                '六'
            ],
            firstDay: 1,
            monthNames: [
                '1月',
                '2月',
                '3月',
                '4月',
                '5月',
                '6月',
                '7月',
                '8月',
                '9月',
                '10月',
                '11月',
                '12月'
            ]
        },
        opens: 'left',
        startDate: moment(), //最大值今天
        endDate: moment(), //最长允许选择90天
        "ranges": {
            "最近一天": [
                moment().subtract(1, 'days'),
                moment()
            ],
            "最近7天": [
                moment().subtract(7, 'days'),
                moment()
            ],
            "最近30天": [
                moment().subtract(30, 'days'),
                moment()
            ]
        },
        "alwaysShowCalendars": true,
        "showCustomRangeLabel": false
    });
    app.config([
        '$urlRouterProvider',
        function ($urlRouterProvider) {
            $urlRouterProvider.otherwise(cv_DefaultRoute);
        }
    ]);
    app.config([
        '$logProvider',
        function ($logProvider) {
            $logProvider.debugEnabled(true);
        }
    ]);

    app.factory('Audio', [
        '$log',
        '$http',
        'Constants',
        function ($log, $http, Constants) {

            var ieVersion = getIEVersion();
            var needConvert = function (src) {
                var result = false;
                if (ieVersion > 11) {
                    result = false;
                } else {
                    result = stringEndWith(src, '.wav') || stringEndWith(src, '.WAV');
                }
                console.log("audio need convert:", result);
                return result;
            }

            var targetAudioType = 'mp3';

            var convertAudioSrc = function (src, targetAudioType) {
                return $http.post(Constants.apiServiceBaseUri + 'api/mark/convertAudio', {
                    Src: src,
                    TargetAudioType: targetAudioType
                });
            };

            var audioLoadedCallback = null;
            var audioTimeupdateCallback = null;
            var audioEndedCallback = null;

            var audioEnded = function () {
                //soundsObj.seek(0);
                soundsObj.pause();
                AudioStopPlaying = true;
                AudioPosition = AudioDuration;
                console.log("audio play ended");

                if (audioEndedCallback != undefined && audioEndedCallback != null) {
                    audioEndedCallback();
                }
                if (audioTimeupdateCallback != undefined && audioTimeupdateCallback != null) {
                    audioTimeupdateCallback(AudioPosition, AudioDuration);
                }
            }
            var audioTimeupdate = function (position, duration) {
                //console.log("audio playing position: " + position + ", duration:" + duration);

                AudioPosition = position;

                if (audioTimeupdateCallback != undefined && audioTimeupdateCallback != null) {
                    audioTimeupdateCallback(position, duration);
                }
            }
            var audioLoaded = function () {
                console.log("audio duration:", soundsObj.duration);

                AudioLoaded = true;

                AudioDuration = soundsObj.duration;

                if (audioLoadedCallback != undefined && audioLoadedCallback != null) {
                    audioLoadedCallback(soundsObj.duration);
                }
            }

            var soundsObj = new Audio5js({ swf_path: '/web/lib/audio5/swf/audio5js.swf' });

            soundsObj.on('ended', audioEnded, this);
            // timeupdate event passes audio duration and position to callback
            soundsObj.on('timeupdate', audioTimeupdate, this);
            //triggered when the audio has been loaded can can be played
            soundsObj.on('canplay', audioLoaded)

            var LastAudioSrc = ""; //上次播放的音频路径
            var AudioStopPlaying = true; //是否音频播放停止
            var AudioLoaded = false; //音频是否已经加载完成
            var AudioDuration = 0; //音频时长
            var AudioPosition = 0; //音频当前播放位置

            return {
                load: function (src, loadedCallback) {
                    if (!angular.isString(src) || src.length <= 0) {
                        return;
                    }
                    if (soundsObj.playing) {
                        soundsObj.pause();
                    }

                    if (loadedCallback != undefined) {
                        audioLoadedCallback = loadedCallback;
                    } else {
                        audioLoadedCallback = null;
                    }

                    AudioStopPlaying = true;
                    AudioLoaded = false;
                    LastAudioSrc = src;
                    if (needConvert(src)) {
                        //调用转换Audio  wav->mp3
                        convertAudioSrc(src, targetAudioType)
                            .then(function (result) {
                                src = result.data.AudioPath;
                                console.log("load audio:", src);

                                soundsObj.load(src); //设置播放路径

                            })
                    } else {

                        console.log("load audio:", src);

                        soundsObj.load(src); //设置播放路径
                    }
                },

                play: function (src, endedCallback, updateTimeCallback) {
                    if (!angular.isString(src) || src.length <= 0) {
                        return;
                    }
                    if (soundsObj.playing) {
                        soundsObj.pause();
                    }

                    if (endedCallback != undefined) {
                        audioEndedCallback = endedCallback;
                    } else {
                        audioEndedCallback = null;
                    }
                    if (updateTimeCallback != undefined) {
                        audioTimeupdateCallback = updateTimeCallback;
                    } else {
                        audioTimeupdateCallback = null;
                    }

                    AudioStopPlaying = false;

                    if (AudioLoaded && LastAudioSrc == src) {
                        //just play
                        console.log("audio already loaded , just play");
                        if (AudioPosition == AudioDuration) {
                            //已经播放到尽头, 重新开始播放
                            soundsObj.seek(0);
                        }

                        soundsObj.play();

                    } else {

                        LastAudioSrc = src;

                        //load & play
                        if (needConvert(src)) {
                            //调用转换Audio  wav->mp3
                            convertAudioSrc(src, targetAudioType)
                                .then(function (result) {
                                    //console.log(result);
                                    src = result.data.AudioPath;
                                    console.log("load audio:", src);

                                    soundsObj.load(src); //设置播放路径

                                    soundsObj.play();
                                })
                        } else {

                            console.log("load audio:", src);

                            soundsObj.load(src); //设置播放路径

                            soundsObj.play();
                        }
                    }

                },

                pause: function () {
                    soundsObj.pause();

                    AudioStopPlaying = true;
                },
                stop: function () {
                    soundsObj.pause();

                    AudioStopPlaying = true;
                },
                skip: function (startSecs, src) {
                    if (startSecs < 0) {
                        return;
                    }
                    AudioStopPlaying = false;
                    if (needConvert(src)) {
                        //调用转换Audio  wav->mp3
                        convertAudioSrc(src, targetAudioType)
                            .then(function (result) {
                                console.log(result);
                                src = result.data.AudioPath;
                                console.log("final src:", src);
                                soundsObj.load(src);
                                soundsObj.seek(startSecs);
                                soundsObj.play();
                            })
                    } else {
                        soundsObj.load(src);
                        soundsObj.seek(startSecs);
                        soundsObj.play();
                    }

                },
                isEnded: function () {
                    //console.log("isEnded:", AudioStopPlaying);
                    return AudioStopPlaying;

                }
            }
        }
    ]);

    app.service('AuthInterceptorService', [
        '$rootScope',
        '$q',
        '$injector',
        '$location',
        'localStorageService',
        '$log',
        function ($rootScope, $q, $injector, $location, localStorageService, $log) {
            var deferLoadingState = $q.defer();
            this.observeLoading = function () {
                return deferLoadingState.promise;
            }

            var loadingNeedShow = false;
            var showLoading = function (delayTime) {

                loadingNeedShow = true;

                setTimeout(function () {
                    if (loadingNeedShow) {
                        deferLoadingState.notify(loadingNeedShow);
                    }
                }, delayTime);
            }
            var hideLoading = function () {
                loadingNeedShow = false
                deferLoadingState.notify(false);
            }

            this.request = function (config) {
                config.headers = config.headers || {};

                var authData = localStorageService.get('business_authorizationData');
                if (authData) {
                    config.headers.Authorization = 'Bearer ' + authData.token;
                }

                showLoading(2000);

                return config;
            }

            this.response = function (response) {

                hideLoading();

                ////console.log(response.data);
                if (response.data == "login") {
                    var authService = $injector.get('AuthService');
                    authService.logout();
                    $location.path('/login');
                }
                return response;
            }

            this.responseError = function (rejection) {

                hideLoading();

                if (rejection.status === 401) {
                    var authService = $injector.get('AuthService');
                    var authData = localStorageService.get('business_authorizationData');

                    if (authData) {
                        if (authData.useRefreshTokens) {
                            $location.path('/token');
                            return $q.reject(rejection);
                        }
                    }
                    authService.logout();
                    $location.path('/login');
                }

                return $q.reject(rejection);
            }
        }
    ]);

    app.factory('AreaService', [
        '$http',
        'Constants',
        '$q',
        function ($http, Constants, $q) {
            var serviceBase = Constants.apiServiceBaseUri;

            var provinceList = [];
            var cityList = [];
            var areaList = [];

            var FindCityByProvinceID = function (provinceid) {
                if (cityList == undefined || cityList == null || cityList.length == 0) {
                    return null;
                }

                for (var i = 0; i < cityList.length; i++) {
                    var c = cityList[i];
                    if (c.ProvinceID == provinceid) {
                        return c.CityList;
                    }
                }
                return null;
            }

            var FindAreaByCityID = function (cityid) {
                if (areaList == undefined || areaList == null || areaList.length == 0) {
                    return null;
                }

                for (var i = 0; i < areaList.length; i++) {
                    var a = areaList[i];
                    if (a.CityID == cityid) {
                        return a.AreaList;
                    }
                }
                return null;
            }

            return {
                GetProvinceList: function () {

                    if (provinceList == undefined || provinceList == null || provinceList.length == 0) {
                        //console.log("Miss Cache", provinceList);
                        return $http
                            .get(serviceBase + 'api/business/proviceList')
                            .then(function (result) {
                                provinceList = result.data;
                                // provinceList.splice(0, 0, { "ProvinceName": '省', "ProvinceID":''});
                                // console.log("Add Cache", provinceList);
                                return result;
                            });
                    } else {
                        //console.log("Match Cache", provinceList);
                        var deferred = $q.defer();
                        var result = {
                            data: provinceList
                        };
                        deferred.resolve(result);
                        return deferred.promise;
                    }
                },
                GetCityList: function (provinceID) {
                    var provinceid = provinceID || "";

                    var findCityList = FindCityByProvinceID(provinceID);

                    if (findCityList == undefined || findCityList == null || findCityList.length == 0) {
                        //console.log("Miss Cache", provinceList);
                        return $http
                            .post(serviceBase + 'api/business/cityList', { ProvinceID: provinceid })
                            .then(function (result) {
                                //result.data.splice(0, 0, { "CityName": '市',"CityID":'' });
                                cityList.push({ ProvinceID: provinceid, CityList: result.data });
                                return result;
                            });
                    } else {
                        //console.log("Match Cache", findCityList);
                        var deferred = $q.defer();
                        var result = {
                            data: findCityList
                        };
                        deferred.resolve(result);
                        return deferred.promise;
                    }
                },

                GetAreaList: function (cityID) {
                    var cityid = cityID || "";

                    var findAreaList = FindAreaByCityID(cityID);

                    if (findAreaList == undefined || findAreaList == null || findAreaList.length == 0) {
                        //console.log("Miss Cache", provinceList);
                        return $http
                            .post(serviceBase + 'api/business/areaList', { CityID: cityid })
                            .then(function (result) {
                                //result.data.splice(0, 0, { "AreaName": '区',"AreaID":'' });
                                areaList.push({ CityID: cityid, AreaList: result.data });
                                return result;
                            });
                    } else {
                        //console.log("Match Cache", findAreaList);
                        var deferred = $q.defer();
                        var result = {
                            data: findAreaList
                        };
                        deferred.resolve(result);
                        return deferred.promise;
                    }
                }
            }
        }
    ]);

    app.service('SlideMenuService', [
        'Constants',
        '$log',
        function (Constants, $log) {

            this.sidebarItems = [];

            //Start 左侧菜单栏功能
            var contains = function (arr, obj) {
                if (arr == undefined || arr == null || angular.isArray(arr) == false) {
                    return false;
                }
                var i = arr.length;
                while (i--) {
                    if (arr[i] === obj) {
                        return true;
                    }
                }
                return false;
            }

            this.RefreshSideBar = function (userRole) {
                if (userRole == undefined || userRole.length == 0 || angular.isArray(userRole) == false) {
                    return;
                }

                this.sidebarItems = [];
                for (var i = 0; i < Constants.sidebarItems.length; i++) {
                    var items = Constants.sidebarItems[i];

                    if (items.userRole == undefined || items.userRole.length == 0) {
                        this
                            .sidebarItems
                            .push(items);
                    } else {

                        for (var roleIndex = 0; roleIndex < userRole.length; roleIndex++) {
                            //用户角色权限只要满足菜单权限要求的任意一个即可
                            if (contains(items.userRole, parseInt(userRole[roleIndex]))) {
                                this
                                    .sidebarItems
                                    .push(items);
                                break;
                            }
                        }
                    }
                }
                console.log(this.sidebarItems);
            }

            // End 左侧菜单栏功能

            //特殊处理左侧菜单选中状态,延时设置active class, 覆盖 ui-sref-active设置的值
            this.SetActiveSideMenu = function (state, delayTime) {
                 if (delayTime == undefined) {
                    delayTime = 100;
                }

                setTimeout(function () {
                    console.log("set active for ", state);
                    var li = angular.element("#slidemenu-li-state-" + state);
                    if (li == undefined) {
                        console.log("not find the menu");
                    } else {
                        li.addClass('active');
                    }

                    //find element: li a
                    var li_a = angular.element("#slidemenu-li-state-" + state + " a");
                    if (li_a != undefined) {
                        li_a.addClass('active');
                    }

                }, delayTime);

            }
        }
    ]);

    app.service('LocationService', [
        'AuthService',
        'SlideMenuService',
        '$location',
        '$log',
        function (AuthService, SlideMenuService, $location, $log) {

            var contains = function (arr, obj) {
                if (arr == undefined || arr == null || angular.isArray(arr) == false) {
                    return false;
                }
                var i = arr.length;
                while (i--) {
                    if (arr[i] === obj) {
                        return true;
                    }
                }
                return false;
            }

            this.GotoDefaultURL = function () {
                var authData = AuthService.AuthData();
                var isAuth = authData
                    ? authData.isAuth
                    : false;

                if (isAuth) {

                    //刷新左侧菜单
                    var userRole = authData.userRole;
                    SlideMenuService.RefreshSideBar(userRole);

                    console.log("GotoDefaultURL:" + userRole);
                    var defaultHomeUrl = '/home';
                    if (contains(userRole, 1)) {
                        //驰声管理员, 默认学校页面
                        defaultHomeUrl = '/school';
                    } else if (contains(userRole, 2)) {
                        //渠道管理员, 默认加密狗管理页面
                        defaultHomeUrl = '/dongle';
                    } else if (contains(userRole, 3)) {
                        //内容管理员, 默认内容页面
                        defaultHomeUrl = '/PaperManagement/paperpackage';
                    } else if (contains(userRole, 4)) {
                        //内容编辑, 默认内容页面
                        defaultHomeUrl = '/PaperManagement/paperpackage';
                    }
                    console.log("defaultHomeUrl:" + defaultHomeUrl);
                    $location.path(defaultHomeUrl);

                } else {
                    $location.path('/login');
                }
            };
        }
    ]);

    app.service('CommonBusinessService', function () {
        this.GetAreaTitle = function (sa) {
            var areaTitle = sa.AreaTitle + ' ( 共 ' + sa.ContentCount + ' 小题; 满分 ' + sa.AreaScore + ' 分 )';

            if (sa.AreaType != 16 && sa.AreaType != 25 && sa.AreaType != 26) {
                if (sa.IsCustomPaper == false) {
                    areaTitle = sa.AreaTitle + ' ( 共 ' + sa.ContentCount + ' 小题; 每小题 ' + sa.AvgContentScore + ' 分,满分 ' + sa.AreaScore + ' 分 )';

                }
            }

            if (sa.AreaType == 16) {
                if (sa.IsCustomPaper == false) {
                    areaTitle = sa.AreaTitle + ' ( 共 ' + sa.QuestionCount + ' 小题; 每小题 ' + sa.AvgQuestionScore + ' 分, 满分 ' + sa.AreaScore + ' 分 )';
                } else {
                    areaTitle = sa.AreaTitle + ' ( 共 ' + sa.QuestionCount + ' 小题; 满分 ' + sa.AreaScore + ' 分 )';
                }
            }

            if (sa.AreaType == 25) {
                if (sa.IsCustomPaper == false) {
                    areaTitle = sa.AreaTitle + ' ( 第一部分, 共 ' + sa.Part1ContentCount + ' 小题; 每小题 ' + sa.Part1ContentScore + ' 分, 总分' + (sa.Part1ContentCount * sa.Part1ContentScore) + '分; 第二部分 , 总分' + sa.Part2ContentScore + ' 分 )';
                }
            }

            if (sa.AreaType == 26) {
                if (sa.IsCustomPaper == false) {
                    areaTitle = sa.AreaTitle + ' ( 第一部分, 总分' + sa.Part1TotalScoreFor26 + '分; 第二部分 , 总分' + sa.Part2TotalScoreFor26 + ' 分 )';
                }
            }

            return areaTitle;
        }
    })

    app.config(function ($httpProvider) {
        $httpProvider
            .interceptors
            .push('AuthInterceptorService');
    });

    app.controller('MainCtrl', [
        '$rootScope',
        '$scope',
        '$log',
        '$location',
        '$state',
        'AuthService',
        'Constants',
        'AuthInterceptorService',
        '$modal',
        'LocationService',
        'SlideMenuService',
        function ($rootScope, $scope, $log, $location, $state, AuthService, Constants, AuthInterceptorService, $modal, LocationService, SlideMenuService) {

            $scope.AuthService = AuthService;
            $scope.SlideMenuService = SlideMenuService;

            //Start  Loading加载进度条功能
            $scope.showLoading = false;
            var updateLoading = function (showLoadingFlag) {
                $scope.showLoading = showLoadingFlag;
            };
            AuthInterceptorService
                .observeLoading()
                .then(null, null, updateLoading);
            //End  Loading加载进度条功能 Start  登录身份验证
            $scope.isAuth = function () {
                var authData = AuthService.AuthData();
                return authData
                    ? authData.isAuth
                    : false;
            }

            $scope.AuthUpdate = function () {
                var authData = AuthService.AuthData();
                var isAuth = authData
                    ? authData.isAuth
                    : false;
                console.log("isAuth:" + isAuth);
                if (isAuth) {

                    //刷新左侧菜单
                    var userRole = authData.userRole;
                    console.log("userRole:" + userRole);
                    SlideMenuService.RefreshSideBar(userRole);

                    if ($location.path() == '/login') {
                        LocationService.GotoDefaultURL();
                    }
                } else {
                    AuthService.ShowStandaloneView(true);
                    $location.path('/login');
                }
            };
            AuthService
                .observeAuthentication()
                .then(null, null, $scope.AuthUpdate);
            //End  登录身份验证 检查用户登录信息
            $scope.AuthUpdate();

            //START 通用的对话框  确认/放弃
            $rootScope.openCommonModalDialog = function (title, message, okCallback, cancelCallback) {

                var modalInstance = $modal.open({
                    templateUrl: 'commonModalContent.html',
                    controller: 'CommonModalDialogCtrl',
                    size: 'sm',
                    resolve: {
                        title: function () {
                            return title;
                        },
                        message: function () {
                            return message;
                        }
                    }
                });
                modalInstance
                    .result
                    .then(okCallback, cancelCallback);
            };
            $rootScope.openCommonInfoDialog = function (title, message, okCallback) {

                var modalInstance = $modal.open({
                    templateUrl: 'commonInfoDialog.html',
                    controller: 'CommonModalDialogCtrl',
                    size: 'sm',
                    resolve: {
                        title: function () {
                            return title;
                        },
                        message: function () {
                            return message;
                        }
                    }
                });

                modalInstance
                    .result
                    .then(okCallback, function () { });
            };
            $rootScope.openCommonWarningDialog = function (title, message, okCallback) {

                var modalInstance = $modal.open({
                    templateUrl: 'commonWarningDialog.html',
                    controller: 'CommonModalDialogCtrl',
                    size: 'sm',
                    resolve: {
                        title: function () {
                            return title;
                        },
                        message: function () {
                            return message;
                        }
                    }
                });

                modalInstance
                    .result
                    .then(okCallback, function () { });
            };
            $rootScope.openCommonErrorDialog = function (title, message, okCallback) {

                var modalInstance = $modal.open({
                    templateUrl: 'commonErrorDialog.html',
                    controller: 'CommonModalDialogCtrl',
                    size: 'sm',
                    resolve: {
                        title: function () {
                            return title;
                        },
                        message: function () {
                            return message;
                        }
                    }
                });

                modalInstance
                    .result
                    .then(okCallback, function () { });
            };
            //END 通用的对话框  确认/放弃 support placeholder in IE8
            $scope.IE8AndBelow = false;
            var checkIEVersion = function () {
                var browser = navigator.appName
                var b_version = navigator.appVersion
                var version = b_version.split(";"); // FireFox 的版本信息中不包含;字符
                if (version.length < 2) {
                    $scope.IE8AndBelow = false;
                    return;
                }
                var trim_Version = version[1].replace(/[ ]/g, "");
                if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE6.0") {
                    $scope.IE8AndBelow = true;

                } else if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE7.0") {
                    $scope.IE8AndBelow = true;

                } else if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
                    $scope.IE8AndBelow = true;
                }
            }
            checkIEVersion();

            $scope.$on('$viewContentLoaded', function (event) {
                if ($scope.IE8AndBelow) {
                    console.log("$viewContentLoaded");

                    if (!('placeholder' in document.createElement('input'))) {
                        $('input[placeholder],textarea[placeholder]')
                            .each(function () {
                                var that = $(this),
                                    text = that.attr('placeholder');

                                var setValue = function () {
                                    if (that.val() === "") {
                                        that
                                            .val(text)
                                            .addClass('placeholder');
                                    }
                                }
                                setTimeout("setValue()", 300);
                                that.focus(function () {
                                    if (that.val() === text) {
                                        that
                                            .val("")
                                            .removeClass('placeholder');
                                    }
                                })
                                    .blur(function () {
                                        if (that.val() === "") {
                                            that
                                                .val(text)
                                                .addClass('placeholder');
                                        }
                                    })
                                    .closest('form')
                                    .submit(function () {
                                        if (that.val() === text) {
                                            that.val('');
                                        }
                                    });
                            });
                    }
                }
            });

        }
    ]);

    app.controller('CommonModalDialogCtrl', function ($scope, $modalInstance, title, message) {

        $scope.DialogTitle = title;
        $scope.DialogMessage = message;

        $scope.ok = function () {
            $modalInstance.close();

            fixScrollBarForBootstrapMultiDialog();
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');

            fixScrollBarForBootstrapMultiDialog();
        };
    })

    app.filter('fixedTimeFilter', function () {
        //1,已启用；0，已停用
        return function (time) {

            var fixedTimeText = "";
            if (time != undefined && time != "") {
                if (time == "1900-01-01 00:00:00") {
                    fixedTimeText = "";
                } else {
                    var date1 = new Date(time);
                    var formatDate1 = DateTimeUtility.format(date1, 'yyyy-MM-dd')
                    fixedTimeText = formatDate1;
                }
            }
            return fixedTimeText;
        }
    });
    app.filter('Time8Filter', function () {
        //1,已启用；0，已停用
        return function (time) {

            var fixedTimeText = "";
            if (time != undefined && time != "") {
                if (time == "1900-01-01 00:00:00") {
                    fixedTimeText = "";
                } else {
                    var date1 = new Date(time);
                    var formatDate1 = DateTimeUtility.format(date1, 'yy/MM/dd')
                    fixedTimeText = formatDate1;
                }
            }
            return fixedTimeText;
        }
    });
    app.filter('Time10Filter', function () {
        //1,已启用；0，已停用
        return function (time) {

            var fixedTimeText = "";
            if (time != undefined && time != "") {
                if (time == "1900-01-01 00:00:00") {
                    fixedTimeText = "";
                } else {
                    var date1 = new Date(time);
                    var formatDate1 = DateTimeUtility.format(date1, 'yyyy/MM/dd')
                    fixedTimeText = formatDate1;
                }
            }
            return fixedTimeText;
        }
    });
    app.filter('Time14Filter', function () {
        //1,已启用；0，已停用
        return function (time) {

            var fixedTimeText = "";
            if (time != undefined && time != "") {
                if (time == "1900-01-01 00:00:00") {
                    fixedTimeText = "";
                } else {
                    var date1 = new Date(time);
                    var formatDate1 = DateTimeUtility.format(date1, 'yy/MM/dd hh:mm')
                    fixedTimeText = formatDate1;
                }
            }
            return fixedTimeText;
        }
    });
    app.filter('Time16Filter', function () {
        //1,已启用；0，已停用
        return function (time) {

            var fixedTimeText = "";
            if (time != undefined && time != "") {
                if (time == "1900-01-01 00:00:00") {
                    fixedTimeText = "";
                } else {
                    var date1 = new Date(time);
                    var formatDate1 = DateTimeUtility.format(date1, 'yyyy/MM/dd hh:mm')
                    fixedTimeText = formatDate1;
                }
            }
            return fixedTimeText;
        }
    });

    app.filter('PackageTypeFilter', function () {
        return function (packageType) {
            var des = "";
            switch (packageType) {
                case 1:
                    des = "激活型";
                    break;
                case 2:
                    des = "增长型";
                    break;
                default:
                    des = "未知";
            }
            return des;
        }
    });
    app.filter('trustHtml', [
        '$sce',
        function ($sce) {
            return function (text) {
                var replaceStr = '\n';
                var replacedText = text.replace(new RegExp(replaceStr, 'gm'), '<br/>');
                //console.log(replacedText);
                return $sce.trustAsHtml(replacedText);
            };
        }
    ]);
    app.filter('EmptyFilter', function () {
        return function (filler) {

            if (filler == null || filler == "0" || filler == "" || filler == "00/01/01 00:00" || filler == "1900-01-01 00:00:00" || filler == "未设置") {
                return "--";
            }
            return filler;
        }
    });
    app.filter("LongFilter", function () {
        return function (filter) {
            if (filter != undefined && filter != null && filter.length > 20) {
                filter = filter.substring(0, 20) + "...";
            }
            return filter;
        }
    })
    app.filter("Long6Filter", function () {
        return function (filter) {
            if (filter != undefined && filter != null && filter.length > 6) {
                filter = filter.substring(0, 6) + "...";
            }
            return filter;
        }
    })
    app.filter('PaperPackageTypeFilter', function () {
        return function (packageType) {
            var des = "";
            switch (packageType) {
                case 1:
                    des = "激活专用";
                    break;
                case 2:
                    des = "增长专用";
                    break;
                default:
                    des = "未知";
            }
            return des;
        }
    });
    app.filter('PackageStatusFilter', function () {
        return function (status) {
            var des = "";
            switch (status) {
                case 1:
                    des = "未发货";
                    break;
                case 2:
                    des = "已分配";
                    break;
                case 3:
                    des = "已激活";
                    break;
                case 4:
                    des = "已停用";
                    break;
                case 5:
                    des = "已发货";
                    break;
                case 6:
                    des = "已删除";
                    break;
                default:
                    des = "";
            }
            return des;
        }
    });
    app.filter('SchoolPaperStatusFilter', function () {
        return function (status) {
            var des = "";
            switch (status) {
                case 0:
                    des = "停用";
                    break;
                case 1:
                    des = "启用";
                    break;
                default:
                    des = "";
            }
            return des;
        }
    });
    app.filter('option_type', function () {
        return function (option) {
            var answer_txt = "";
            if (option == null) {
                answer_txt = "";
            } else {
                switch (option.Index) {
                    case 1:
                        answer_txt = "A--";
                        break;
                    case 2:
                        answer_txt = "B--";
                        break;
                    case 3:
                        answer_txt = "C--";
                        break;
                }
            }
            return answer_txt;
        }
    });
    app.filter('paperType', function () {
        return function (paperType) {
            var paperTypeText = "系统默认";
            if (paperType == 1) {
                paperTypeText = "系统默认";
            }
            if (paperType == 2) {
                paperTypeText = "我的试卷";
            }
            if (paperType == 3) {
                paperTypeText = "分享试卷";
            }
            return paperTypeText;
        }
    });
    app.filter('format_refs', function () {
        return function (refs) {
            var reftexts = "空";
            if (angular.isArray(refs)) {
                reftexts = "";

                angular.forEach(refs, function (ref) {
                    reftexts += ref.Content + "\r\n";
                });
            }

            return reftexts;
        }
    });
    app.filter('roundMin1Max2Filter', function () {
        return function (score) {

            if (score != undefined) {
                var scoreStr = String(score);

                var round1Score = score.toFixed(1);
                var round2Score = score.toFixed(2);
                if (Math.abs(round1Score - round2Score) < 0.0001) {
                    return round1Score;
                } else {
                    return round2Score;
                }
            }

            return score;

        }
    });
    app.filter('roundMin0Max2Filter', function () {
        return function (score) {

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
    });
    app.filter('optionIndexFilter', function () {
        //1=A, 2=B, 3=C, 4=D, 5=E, 6=F
        return function (optionIndex) {

            var optionIndexText = "";
            if (optionIndex != undefined) {
                if (optionIndex == 1) {
                    optionIndexText = "A";
                } else if (optionIndex == 2) {
                    optionIndexText = "B";
                } else if (optionIndex == 3) {
                    optionIndexText = "C";
                } else if (optionIndex == 4) {
                    optionIndexText = "D";
                } else if (optionIndex == 5) {
                    optionIndexText = "E";
                } else if (optionIndex == 6) {
                    optionIndexText = "F";
                }
            }
            return optionIndexText;
        }
    });
    app.filter('UserTypeFilter', function () {
        return function (status) {
            var des = "";
            switch (status) {
                case 1:
                    des = "学校管理员";
                    break;
                case 2:
                    des = "教师";
                    break;
                case 3:
                    des = "学生";
                    break;
                case 4:
                    des = "管理员";
                    break;
                default:
                    des = "";
            }
            return des;
        }
    });
    app.filter('TaskStatusFilter', function () {
        return function (status) {
            var des = "";
            switch (status) {
                case 0:
                    des = "未开始";
                    break;
                case 1:
                    des = "进行中";
                    break;
                case 2:
                    des = "考试结束";
                    break;
                case 3:
                    des = "上传中";
                    break;
                case 4:
                    des = "评分中";
                    break;
                case 5:
                    des = "已结束";
                    break;
                default:
                    des = "";
            }
            return des;
        }
    });
    app.filter('DongleStatusFilter', function () {
        return function (status) {
            var des = "";
            switch (status) {
                case 1:
                    des = "已入库";
                    break;
                case 2:
                    des = "已分配";
                    break;
                case 3:
                    des = "已报备";
                    break;
                case 4:
                    des = "已激活";
                    break;
                case 5:
                    des = "停用";
                    break;
                case 6:
                    des = "删除";
                    break;
                default:
                    des = "";
            }
            return des;
        }
    });
    return app;
});

installKXLogo();