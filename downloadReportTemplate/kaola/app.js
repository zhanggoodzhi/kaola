var fixScrollBarForBootstrapMultiDialog = function () {
    if ($(".modal.fade.ng-scope.in").length > 0) {
        console.log("add modal-open for body");
        setTimeout(function () {
            $("body:not(.modal-open)").addClass("modal-open");
        }, 1000);
    }
}

/*
 *   DefaultRoute: 默认路由
 */
var cv_DefaultRoute = '/teacherreportdetail/1';

/*
 *   左侧边栏的列表定义
 */
//用户类型：0.系统管理员 ;1.学校教师；2.学生；3.学校管理员 4.业务支撑后台用户； 
var cv_SidebarItems = [{
        'title': '试卷包管理',
        'state': 'package',
        icon: 'shijuanbaoguanli',
        userType: [0, 3]
    },
    {
        'title': '教师管理',
        'state': 'invateCode',
        icon: 'jiaoshiguanli',
        userType: [0, 3]
    },
    {
        'title': '任务管理',
        'state': 'task',
        icon: 'renwuguanli',
        userType: [1]
    },
    {
        'title': '试卷管理',
        'state': 'paper',
        icon: 'tiku',
        userType: [1]
    },
    {
        'title': '成绩查询',
        'state': 'teacherreport',
        icon: 'chengjichaxun',
        userType: [1]
    },
    //{ 'title': '成绩报告', 'state': 'studentreport', icon: 'chengjibaogao', userType: [2] },
    {
        'title': '班级管理',
        'state': 'class',
        icon: 'banji',
        userType: [1]
    }

];

/*
 *   年级设置
 */
var cv_Grade = [
    //{ Name: '一年级', Grade: 1 },
    //{ Name: '二年级', Grade: 2 },
    //{ Name: '三年级', Grade: 3 },
    //{ Name: '四年级', Grade: 4 },
    //{ Name: '五年级', Grade: 5 },
    {
        Name: '六年级',
        Grade: 6
    },
    {
        Name: '七年级',
        Grade: 7
    },
    {
        Name: '八年级',
        Grade: 8
    },
    {
        Name: '九年级',
        Grade: 9
    },
    {
        Name: '十年级',
        Grade: 10
    },
    {
        Name: '十一年级',
        Grade: 11
    },
    {
        Name: '十二年级',
        Grade: 12
    },
];

var oclazyLoadWithCDN = function (ocLazyLoadProvider, filePath) {
    var enable = false;
    if (enable) {
        if (filePath != undefined) {
            if (typeof (filePath) == "string") {
                filePath = CDN_ADDRESS_PREFIX + filePath;
            } else {
                if (filePath instanceof Array) {
                    for (var i = 0; i < filePath.length; i++) {
                        filePath[i] = CDN_ADDRESS_PREFIX + filePath[i];
                    }
                }
            }
        }
    }

    return ocLazyLoadProvider.load(filePath);
}

/*
 *   App function
 */
define(['angular', 'audio5js', 'report/teacher/teacherreport_taskdetail.html', 'report/student/studentreport_taskdetail.html', 'jquery', 'angular-ui-router', 'angular-local-storage', 'ng-table', ], function (angular, Audio5js, teach_html, student_html) {
    'use strict';

    //加载必须的依赖项目
    var app = angular.module('app', ['oc.lazyLoad', 'ui.router', 'ui.bootstrap', 'ngTable', 'LocalStorageModule']);

    //配置ocLazyLoad
    app.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
        $ocLazyLoadProvider.config({
            // jsLoader: requirejs,
            debug: false,
            cache: true,
        });
    }]);


    //配置 ui-state
    //注意点:  1. ui-state必须首先定义好, 这样在发生state 变换时才能切换.
    //        2. 所有的 ui-state 需要定义在 同一个module中(如 app module)
    //           如果分开定义在不同module中, 因为state转换时目标state还未定义(目标module文件未加载), 状态切换失败
    //        3. 因为state定义在同一个module中, 造成 Controller 也需要定义在同一个module中
    //        4. Controller定义的js文件中就没有必要在定义state了
    //        5. 将所有的Filter集中定义到app module中,不分散定义(分散定义lazy load 有问题, 待研究原因)

    //报表功能
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('studentreportdetail', {
            url: "/studentreportdetail/:taskID?classID?studentNumber?paperID?from",
            views: {
                'mainChildView': {
                    template: student_html,
                    controller: 'StudentReportTaskDetailCtrl'
                }
            },
            resolve: {
                TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, 'kaola/report/student/studentreport.js');
                }]
            }

        }).state('teacherreportdetail', {
            url: "/teacherreportdetail/:taskID?classID",
            views: {
                'mainChildView': {
                    // templateUrl: "kaola/report/teacher/teacherreport_taskdetail.html",
                    template: teach_html,
                    controller: 'TeacherReportTaskDetailCtrl'
                }
            },
            resolve: {
                TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, 'kaola/report/teacher/teacherreport.js');
                }]
            }
        });
    }]);

    app.constant('Constants', {
        //apiServiceBaseUri: '/', //业务相关api 地址前缀, 在登录后会被修改为区域服务器的地址
        //authServiceBaseUri: '/',//身份验证相关的api地址, 固定
        //answerBaseUrl: '/',    //学生音频 地址前缀
        //paperResourceBaseUrl: '/',//试卷资源 音频地址前缀
        clientId: 'self',
        sidebarItems: cv_SidebarItems,
        gradeItems: cv_Grade
    });

    app.config(['$urlRouterProvider', function ($urlRouterProvider) {
        $urlRouterProvider.otherwise(window.DEFAULT_ROUTE);
    }]);

    app.config(['$logProvider', function ($logProvider) {
        $logProvider.debugEnabled(true);
    }]);

    app.factory('ShowService', function () {
        return {
            IsHiddin: true
        }
    });

    app.factory('Audio', ['$log', '$http', 'Constants', function ($log, $http, Constants) {

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
            return $http.post(GLOBAL_API_URL + 'api/mark/convertAudio', {
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

        var soundsObj = new Audio5js({
            swf_path: 'lib/audio5/swf/audio5js.swf',
        });

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
                    convertAudioSrc(src, targetAudioType).then(function (result) {
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

                    var reachEnd = AudioPosition == AudioDuration;

                    //每次都重新播放
                    reachEnd = true;

                    if (reachEnd) {
                        //已经播放到尽头, 重新开始播放
                        console.log("audio play from start");
                        soundsObj.seek(0);
                    }
                    soundsObj.play();

                } else {

                    LastAudioSrc = src;

                    //load & play
                    if (needConvert(src)) {
                        //调用转换Audio  wav->mp3
                        convertAudioSrc(src, targetAudioType).then(function (result) {
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
                    convertAudioSrc(src, targetAudioType).then(function (result) {
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
    }]);

    app.service('CommonBusinessService', ['$timeout', function ($timeout) {
        var self = this;
        self.HighlightSearchTextAsync = function (searchText, searchElementClassName, handledElementClassName, delayMillseconds) {
            if (searchText == undefined || searchText == '') {
                return;
            }
            if (searchElementClassName == undefined || searchElementClassName == '') {
                searchElementClassName = '.highlight-no';
            }
            if (handledElementClassName == undefined || handledElementClassName == '') {
                handledElementClassName = '.highlight-yes';
            }
            if (delayMillseconds == undefined || delayMillseconds == '') {
                delayMillseconds = 1000;
            }

            $timeout(function () {
                self.HighlightSearchText(searchText, searchElementClassName, handledElementClassName, delayMillseconds);
            });
        }

        self.HighlightSearchText = function (searchText, searchElementClassName, handledElementClassName, delayMillseconds) {

            console.log("HighlightSearchText:", searchText);

            var bgColor = "#FFFF00";
            var sKey = "<span style='background-color: " + bgColor + ";'>" + searchText + "</span>";

            var rStr = new RegExp(searchText, "ig");
            var rHtml = new RegExp("\<.*?\>", "ig"); //匹配html元素

            var notHighlightElements = $(searchElementClassName);
            console.log('find element length:', notHighlightElements.length);
            for (var i = 0; i < notHighlightElements.length; i++) {
                var element = notHighlightElements[i];
                //console.log("before:", element);
                var sText = element.innerHTML;
                var aHtml = sText.match(rHtml); //存放html元素的数组
                sText = sText.replace(rHtml, '{~}'); //替换html标签
                sText = sText.replace(rStr, sKey); //替换key
                var num = -1;
                sText = sText.replace(/{~}/g, function () { //恢复html标签
                    num++;
                    return aHtml[num];
                });

                element.innerHTML = sText;
                element.classList.remove(searchElementClassName);
                element.classList.add(handledElementClassName);

                //console.log("after:", sText);
            }
        }

        self.GetAreaTitle = function (sa) {
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
    }])

    app.service('SlideMenuService', ['Constants', '$log', function (Constants, $log) {

        this.sidebarItems = [];

        //Start 左侧菜单栏功能
        var contains = function (arr, obj) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === obj) {
                    return true;
                }
            }
            return false;
        }

        this.RefreshSideBar = function (userType) {

            //console.log("refresh sidebar for usertype ", userType);

            userType = parseInt(userType);
            this.sidebarItems = [];
            for (var i = 0; i < Constants.sidebarItems.length; i++) {
                var items = Constants.sidebarItems[i];

                if (items.userType == undefined || items.userType.length == 0) {
                    this.sidebarItems.push(items);
                } else {
                    if (contains(items.userType, userType)) {
                        this.sidebarItems.push(items);
                    }
                }
            }
            //console.log(this.sidebarItems);
        }

        // End 左侧菜单栏功能 
    }]);

    app.controller('MainCtrl', ['$rootScope', '$scope', '$ocLazyLoad', '$log', '$location', '$state', 'Constants', '$modal', 'SlideMenuService', function ($rootScope, $scope, $ocLazyLoad, $log, $location, $state, Constants, $modal, LocationService, SlideMenuService, AuthService) {


        $scope.SlideMenuService = SlideMenuService;

        //Start  Loading加载进度条功能 
        $scope.showLoading = false;
        var updateLoading = function (showLoadingFlag) {
            $scope.showLoading = showLoadingFlag;
        };

        var getHtml = function () {

        }

        var currentLocationPath = $location.path();
        console.log("current localtion path:" + currentLocationPath)


        //教师成绩报告详细页面, 单独显示, 隐藏左侧菜单与头部导航,宽带重新设置为 col-12
        if (currentLocationPath.indexOf("teacherreportdetail") > -1) {
            //console.log("teacherreportdetail");
            angular.element("#div_header_kaola").hide();
            angular.element("#navbar-personallink").hide();
            angular.element("#sidebar_menu").hide();
            angular.element("#sidebar_menu_row").css('padding-top', '0px');
            angular.element("#sidebar_menu_row").css('height', '100%');
            angular.element("#div_mainChildView").removeClass();
            angular.element("#div_mainChildView").addClass('col-xs-12 col-sm-12 col-md-12');
        }

        //学生报告详细页面, 单独显示, 隐藏左侧菜单与头部导航,宽带重新设置为 col-12
        if (currentLocationPath.indexOf("studentreportdetail") > -1) {
            angular.element("#div_header_kaola").hide();
            angular.element("#navbar-personallink").hide();
            angular.element("#sidebar_menu").hide();
            angular.element("#sidebar_menu_row").css('padding-top', '0px');
            angular.element("#sidebar_menu_row").css('height', '100%');
            angular.element("#div_mainChildView").removeClass();
            angular.element("#div_mainChildView").addClass('col-xs-12 col-sm-12 col-md-12');
        }
        //学生主页, 隐藏左侧菜单, 隐藏头部导航中的个人中心链接,宽带重新设置为 col-12
        if (currentLocationPath.indexOf("studenthome") > -1) {
            angular.element("#navbar-personallink").hide();
            angular.element("#sidebar_menu").hide();
            angular.element("#div_mainChildView").removeClass();
            angular.element("#div_mainChildView").addClass('col-xs-12 col-sm-12 col-md-12');
        }



        //START 通用的对话框  确认/放弃
        $rootScope.openCommonModalDialog = function (title, message, okCallback) {

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

            modalInstance.result.then(okCallback, function () {});
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

            modalInstance.result.then(okCallback, function () {});
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

            modalInstance.result.then(okCallback, function () {});
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

            modalInstance.result.then(okCallback, function () {});
        };
        //END 通用的对话框  确认/放弃

        // support placeholder in IE8
        $scope.IEBrowserVersion = getIEVersion();

        $scope.$on('$viewContentLoaded', function (event) {
            if ($scope.IEBrowserVersion <= 8) {
                console.log("$viewContentLoaded");

                if (!('placeholder' in document.createElement('input'))) {

                    $('input[placeholder],textarea[placeholder]').each(function () {
                        var that = $(this),

                            text = that.attr('placeholder');
                        if (that.attr('type') != 'password') {
                            if (that.val() === "") {
                                that.val(text).addClass('placeholder');
                            }
                            that.focus(function () {
                                    if (that.val() === text) {
                                        that.val("").removeClass('placeholder');
                                    }
                                })
                                .blur(function () {
                                    if (that.val() === "") {
                                        that.val(text).addClass('placeholder');
                                    }
                                })
                                .closest('form').submit(function () {
                                    if (that.val() === text) {
                                        that.val('');
                                    }
                                });

                        }

                    });
                }
            }
        });

    }]);

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


    /**********filter 定义**********/

    app.filter('fixedTimeFilter', function () {
        //1,已启用；0，已停用
        return function (time) {

            var fixedTimeText = "";
            if (time != undefined && time != "") {
                if (time == "1900-01-01 00:00:00") {
                    fixedTimeText = "";
                } else {
                    fixedTimeText = time.substring(0, 10);
                }
            }
            return fixedTimeText;
        }
    });
    app.filter('fixedTimeWithHourFilter', function () {
        //1,已启用；0，已停用
        return function (time) {

            var fixedTimeText = "";
            if (time != undefined && time != "") {
                if (time == "1900-01-01 00:00:00" || time == "0001-01-01 00:00:00") {
                    fixedTimeText = "";
                } else {
                    fixedTimeText = time.substring(0, 16);
                }
            }
            return fixedTimeText;
        }
    });

    app.filter('sexFilter', function () {
        //1,男；2，女
        return function (sex) {

            var sexText = "";
            if (sex != undefined && sex != "") {
                if (sex == "1") {
                    sexText = "男";
                } else if (sex == "2") {
                    sexText = "女";
                }
            }
            return sexText;
        }
    });

    app.filter('gradeFilter', ['Constants', function (Constants) {
        return function (grade) {

            var gradeText = grade;
            if (grade != undefined && grade != "") {

                if (angular.isArray(Constants.gradeItems) && Constants.gradeItems.length > 0) {
                    for (var i = 0; i < Constants.gradeItems.length; i++) {
                        var item = Constants.gradeItems[i];
                        if (item.Grade == grade) {
                            gradeText = item.Name;
                            break;
                        }
                    }
                }
            }
            return gradeText;
        }
    }]);


    app.filter('TaskTypeDes', function () {
        return function (type) {
            var typeDes = "";
            switch (type) {
                case 1:
                    typeDes = "考试";
                    break;
                case 2:
                    typeDes = "练习";
                    break;
                default:
                    typeDes = "未知";
                    break;
            }
            return typeDes;
        }
    });
    app.filter('TaskStatusDes', function () {
        return function (status) {
            var statusDes = "";
            switch (status) {
                case 0:
                    statusDes = "未开始";
                    break;
                case 1:
                    statusDes = "进行中";
                    break;
                case 2:
                    statusDes = "考试结束";
                    break;
                case 3:
                    statusDes = "上传中";
                    break;
                case 4:
                    statusDes = "评分中";
                    break;
                case 5:
                    statusDes = "已完成";
                    break;
                default:
                    statusDes = "未知";
                    break;
            }
            return statusDes;
        }
    });

    app.filter('SexFilter', function () {

        return function (sex) {
            var des = "";

            switch (sex) {
                case 1:
                    des = "男";
                    break;
                case 2:
                    des = "女";
                    break;
                default:
                    des = "";
                    break;
            }
            return des;
        }
    });
    app.filter('StuStatusFilter', function () {
        return function (stustatus) {
            var stuStatusDes = '';

            switch (stustatus) {
                case 0:
                    stuStatusDes = "未绑定";
                    break;
                case 1:
                    stuStatusDes = "启用";
                    break;
                default:
                    stuStatusDes = "未知";
                    break;
            }

            return stuStatusDes;
        }
    });
    app.filter('StudentBindUserIDFilter', function () {
        return function (studentID) {
            var stuStatusDes = '';
            if (studentID == null)
                stuStatusDes = "未绑定";
            else if (studentID.trim() != "") {
                stuStatusDes = "正常";
            } else {
                stuStatusDes = "未绑定";
            }
            return stuStatusDes;
        }
    });
    app.filter("HeadPicFilter", function () {
        return function (headpic) {

            if (headpic == null || headpic == '') {
                return "http://cdn.uukaola.com/web/img/defaultHeadPic.png";
            } else {
                return headpic;
            }
        }
    });

    app.filter('GradeDes', function (Constants) {
        return function (grade) {
            var gradeArr = Constants.gradeItems;

            var gradedes = '';

            angular.forEach(gradeArr, function (item, i) {
                if (grade == item.Grade) {
                    gradedes = item.Name;
                }
            });

            return gradedes;

        }
    });


    app.filter('packageStatus', function () {
        //1，未出货，2，已出货(对应 报备状态 )，3，(对应 激活状态), 4.已停用
        return function (packageStatus) {

            var packageStatusText = "";
            if (packageStatus == 1) {
                packageStatusText = "未出货";
            }
            if (packageStatus == 2) {
                packageStatusText = "已出货";
            }
            if (packageStatus == 3) {
                packageStatusText = "激活";
            }
            if (packageStatus == 4) {
                packageStatusText = "已停用";
            }
            return packageStatusText;
        }
    });

    app.filter('packageType', function () {
        //1,激活型；2，增量型
        return function (packageType) {

            var packageTypeText = "";
            if (packageType == 1) {
                packageTypeText = "激活型";
            }
            if (packageType == 2) {
                packageTypeText = "增量型";
            }

            return packageTypeText;
        }
    });

    app.filter('ActiveFlagFilter', function () {
        //0,已启用；1，已停用
        return function (activeFlag) {

            var activeFlagText = "";
            if (activeFlag == 0) {
                activeFlagText = "已停用";
            }
            if (activeFlag == 1) {
                activeFlagText = "已启用";
            }

            return activeFlagText;
        }
    });


    app.filter('CodeStatusFilter', function () {
        return function (status) {
            var statusTxt = "";
            switch (status) {
                case 0:
                    statusTxt = "未激活";
                    break;
                case "0":
                    statusTxt = "未激活";
                    break;
                case 1:
                    statusTxt = "已激活";
                    break;
                case "1":
                    statusTxt = "已激活";
                    break;
                default:
                    statusTxt = "状态未知";
                    break;
            }
            return statusTxt;
        }
    });

    app.filter('AulStatusFilter', function () {
        return function (aulstatus) {
            var statusDes = "";
            switch (aulstatus) {
                case 2:
                    statusDes = "停用";
                    break;
                case 1:
                    statusDes = "正常";
                    break;

                default:
                    statusDes = "";
                    break;
            }
            return statusDes;
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


    app.filter('userType', function () {
        //0.系统管理员 ;1.学校教师；2.学生；3.学校管理员 4.内容编辑；5.业务后台管理员；
        return function (userType) {

            var userTypeText = "未知";
            if (userType == 0) {
                userTypeText = "系统管理员";
            }
            if (userType == 1) {
                userTypeText = "学校教师";
            }
            if (userType == 2) {
                userTypeText = "学生";
            }
            if (userType == 3) {
                userTypeText = "学校管理员";
            }
            if (userType == 4) {
                userTypeText = "内容编辑";
            }
            if (userType == 5) {
                userTypeText = "业务后台管理员";
            }

            return userTypeText;
        }
    });

    app.filter('userStatus', function () {
        //1:'启用':'未启用'
        return function (userStatus) {

            var userStatusText = "未启用";
            if (userStatus == 1) {
                userStatusText = "启用";
            }
            return userStatusText;
        }
    });

    app.filter('trustHtml', ['$sce', function ($sce) {
        return function (text) {
            var replaceStr = '\n';
            var replacedText = text.replace(new RegExp(replaceStr, 'gm'), '<br/>');
            //console.log(replacedText);
            return $sce.trustAsHtml(replacedText);
        };
    }]);
    app.filter('EmptyFilter', function () {
        return function (filter) {
            if (filter == undefined || filter == null) {
                filter = "";
            }
            filter = filter.toString();
            if (filter == "0" || filter == "") {
                return "--";
            }
            return filter;
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

    app.directive('onRepeatFinish', ['$timeout', '$parse', function ($timeout, $parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit('ngRepeatFinished'); //触发事件,通知上层
                        var fun = scope.$eval(attrs.onRepeatFinish);
                        if (fun && typeof (fun) == 'function') {
                            fun(); //回调函数
                        }
                    });
                }
            }
        }
    }]);

    app.filter('fixedScoreFilter', function () {
        return function (score, fixedCount) {
            if (fixedCount == undefined) {
                fixedCount = 1;
            }
            if (score != undefined) {
                var floatVal = parseFloat(score);
                return floatVal.toFixed(fixedCount);
            }
            return score;
        }
    });
    app.filter("Length16Filter", function () {
        return function (filter) {
            if (filter != undefined && filter != null && filter.length > 16) {
                filter = filter.substring(0, 16) + "...";
            }
            return filter;
        }
    })
    app.filter("Length9Filter", function () {
        return function (filter) {
            if (filter != undefined && filter != null && filter.length > 16) {
                filter = filter.substring(0, 16) + "...";
            }
            return filter;
        }
    })
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

    app.filter('audioTimeFilter', function () {

        return function (audioTime) {

            if (audioTime != undefined) {
                //已经是 xx:xx 格式
                if (typeof audioTime == 'string') {
                    if (audioTime.indexOf(":") > 0) {
                        return audioTime;
                    }
                }

                //数字格式=> xx:xx 格式 

                var val = Math.round(parseFloat(audioTime), 0);
                var seconds = val % 60;
                var minutes = Math.floor(val / 60);

                var audioTimeText = '';
                if (minutes < 10) {
                    audioTimeText += '0';
                }
                audioTimeText += minutes;

                audioTimeText += ':';
                if (seconds < 10) {
                    audioTimeText += '0';
                }
                audioTimeText += seconds;

                return audioTimeText;
            }
            return audioTime;
        }
    });
    app.filter('zeroEmptyTextFilter', function () {
        return function (count) {

            if (count == undefined || count <= 0) {
                return '--';
            }
            if (count == '0') {
                return '--';
            }
            return count;

        }
    });
    app.filter('indexFilter', function () {
        return function (index) {
            var text = '';
            var intIndex = parseInt(index);
            return ConvertNumberToCN(index);
        }
    });
    app.filter('formatMinutesFilter', function () {
        return function (seconds) {

            var m = seconds / 60;
            m = m.toFixed(0);
            if (m <= 0) {
                m = 1;
            }
            return m;
        }
    });
    app.filter('filterPaperName', function () {
        return function (name,maxLength, half) {
            var newName = name;
            if (newName.length > maxLength) {
                newName = newName.slice(0, half) + ' ... ' + newName.slice(newName.length - half, newName.length);
            }
            return newName;
        }
    });
});