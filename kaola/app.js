
/*
*   App function
*/
define(['angular', 'audio5js', 'jquery', 'angular-ui-router', 'angular-local-storage', 'ng-table'].concat(['auth/authservice']), function (angular, Audio5js) {
    'use strict';

    //加载必须的依赖项目
    var app = angular.module('app', ['oc.lazyLoad', 'ui.router', 'ui.bootstrap', 'ngTable', 'LocalStorageModule'].concat(['AuthServiceModule']));

    //配置ocLazyLoad
    app.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
        $ocLazyLoadProvider.config({
            // jsLoader: requirejs,
            debug: false,
            cache: true,
        });
    }]);

    app.constant('Constants', {
        clientId: 'self',
        sidebarItems: cv_SidebarItems,
        gradeItems: cv_Grade
    });

    //#region ui-state

    //配置 ui-state
    //注意点:  1. ui-state必须首先定义好, 这样在发生state 变换时才能切换.
    //        2. 所有的 ui-state 需要定义在 同一个module中(如 app module)
    //           如果分开定义在不同module中, 因为state转换时目标state还未定义(目标module文件未加载), 状态切换失败
    //        3. 因为state定义在同一个module中, 造成 Controller 也需要定义在同一个module中
    //        4. Controller定义的js文件中就没有必要在定义state了
    //        5. 将所有的Filter集中定义到app module中,不分散定义(分散定义lazy load 有问题, 待研究原因)

    //登录,身份验证功能
    app.config(['$stateProvider', '$ocLazyLoadProvider', function ($stateProvider, $ocLazyLoadProvider) {

        $stateProvider.state('login', {
            url: "/login",
            views: {
                'standaloneView': {
                    templateUrl: "/web/kaola/auth/login.html",
                    controller: 'LoginCtrl'
                }
            },
            resolve: { // 增加了resolve, 它会返回一个 promise
                lazyLoadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/auth/auth.js'); // 此处加载Controller定义的js文件
                }]
            }
        }).state('logout', {
            url: "/logout",
            views: {
                'standaloneView': {
                    controller: 'LogoutCtrl'
                },
            },
            resolve: {
                lazyLoadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/auth/auth.js');
                }]
            }
        }).state('signup', {
            url: "/signup",
            views: {
                'standaloneView': {
                    templateUrl: "/web/kaola/auth/signup.html",
                    controller: 'SignupCtrl'
                },
            },
            resolve: {
                lazyLoadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/auth/auth.js');
                }]
            }
        }).state('findpwd', {
            url: "/findpwd",
            views: {
                'standaloneView': {
                    templateUrl: "/web/kaola/auth/findpwd.html",
                    controller: 'FindpwdCtrl',
                },
            },
            resolve: {
                lazyLoadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/auth/auth.js');
                }]
            }
        }).state('resetpwd', {
            url: "/resetpwd/{email}",
            views: {
                'standaloneView': {
                    templateUrl: "/web/kaola/auth/resetpwd.html",
                    controller: 'ResetPwdCtrl',
                },
            },
            params: {
                phoneNum: "",
            },
            resolve: {
                lazyLoadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/auth/auth.js');
                }]
            }

        }).state('validate', {
            url: "/validate",
            views: {
                'standaloneView': {
                    templateUrl: "/web/kaola/auth/validate.html",
                    controller: 'ValidateCtrl'
                },
            },
            resolve: {
                lazyLoadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/auth/auth.js');
                }]
            }
        });
    }]);

    //Home 主页功能
    app.config(['$stateProvider', '$ocLazyLoadProvider', function ($stateProvider, $ocLazyLoadProvider) {
        $stateProvider.state('home', {
            url: "/home",
            views: {
                'mainChildView': {
                    templateUrl: "/web/kaola/home/home.html",
                    controller: 'HomeCtrl'
                }
            },
            resolve: {
                HomeCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/home/home.js');
                }]
            }
        }).state('studenthome', {
            url: "/studenthome?childview",
            views: {
                'mainChildView': {
                    templateUrl: "/web/kaola/home/studenthome.html",
                    controller: 'StudentHomeCtrl'
                }
            },
            resolve: {
                loadStudentHomeCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, ['/web/kaola/home/studenthome.js']);
                }]
            }
        }).state('studenthome.studentreport', {
            url: "/studentreport",
            views: {
                'subMenuLinkView': {
                    templateUrl: "/web/kaola/report/student/studentreport.html",
                    controller: 'StudentHomeReportCtrl'
                }
            },
            resolve: {
                loadModules02: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, ['/web/kaola/home/studenthome.js']);
                }]
            }
        }).state('studenthome.setting', {
            url: "/setting",
            views: {
                'subMenuLinkView': {
                    templateUrl: "/web/kaola/personal/setting.html",
                    controller: 'StudentHomePersonalSettingCtrl'
                }
            },
            resolve: {
                loadModules03: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, ['/web/kaola/home/studenthome.js']);
                }]
            }
        }).state('studenthome.changepassword', {
            url: "/changepassword",
            views: {
                'subMenuLinkView': {
                    templateUrl: "/web/kaola/personal/changepassword.html",
                    controller: 'StudentHomeChangePasswordCtrl'
                }
            },
            resolve: {
                loadModules04: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, ['/web/kaola/home/studenthome.js']);
                }]
            }
        });
    }]);

    //Home 主页功能
    app.config(['$stateProvider', '$ocLazyLoadProvider', function ($stateProvider, $ocLazyLoadProvider) {
        $stateProvider.state('mistakecollectionforstudent', {
            url: "/mistakecollectionforstudent",
            views: {
                'mainChildView': {
                    templateUrl: "/web/kaola/mistakeCollectionForStudent/mistakeCollectionForStudent.html",
                    controller: 'MistakeCollectionForStudentCtrl'
                }
            },
            resolve: {
                loadModules04: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, ['/web/kaola/mistakeCollectionForStudent/mistakeCollectionForStudent.js']);
                }]
            }
        });
    }]);

    //模拟考试 examforschooladmin     
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('examforschooladmin', {
            url: "/examforschooladmin",
            views: {
                "mainChildView":
                    {
                        templateUrl: "/web/kaola/examforschooladmin/examforschooladmin.html",
                        controller: 'ExamForSchoolAdminCtrl'
                    }
            },
            resolve: {
                TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/examforschooladmin/examforschooladmin.js');
                }]
            }
        });
    }]);
    //教师管理(邀请码)功能     
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('invateCode', {
            url: "/invateCode",
            views: {
                "mainChildView":
                    {
                        templateUrl: "/web/kaola/invateCode/invateCode.html",
                        controller: 'invateCodeCtrl'
                    }
            },
            resolve: {
                TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/invateCode/invateCode.js');
                }]
            }
        });
    }]);

    //内容序列号功能
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('package', {
            url: "/package",
            views: {
                "mainChildView":
                    {
                        templateUrl: "/web/kaola/package/package.html",
                        controller: 'PackageCtrl'
                    }
            },
            resolve: {
                TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/package/package.js');
                }]
            }
        });
    }]);

    //试卷功能
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('paper', {
            url: "/paper?paperID",
            views: {
                "mainChildView":
                    {
                        templateUrl: "/web/kaola/paper/paper.html",
                        controller: 'PaperCtrl'
                    }
            },
            resolve: {
                PaperCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/paper/paper.js');
                }]
            }
        }).state('paper.createtask', {
            url: "/task/createtaskfrompaper",
            views: {
                'createTaskView': {
                    templateUrl: "/web/kaola/task/createtask_frompaper.html",
                    controller: 'CreateTaskCtrl'
                },
            },
            params: {
                'data': null
            },
            resolve: {
                PaperCreateTaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/task/task.js');
                }]
            }

        });
    }]);
    //试卷功能
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('paperdesign', {
            url: "/paperdesign?paperID?originalPaperID",
            views: {
                "mainChildView":
                    {
                        templateUrl: "/web/kaola/paperDesign/paperDesign.html",
                        controller: 'PaperDesignCtrl'
                    }
            },
            resolve: {
                PaperCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/paperDesign/paperDesign.js');
                }]
            }
        });
    }]);
    //学生错题集功能
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('mistakeforstudent', {
            url: "/mistakeforstudent",
            views: {
                "mainChildView":
                    {
                        templateUrl: "/web/kaola/mistakeCollectionForStudent/mistakeCollectionForStudent.html",
                        controller: 'MistakeCollectionForStudentCtrl'
                    }
            },
            resolve: {
                PaperCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/mistakeCollectionForStudent/mistakeCollectionForStudent.js');
                }]
            }
        });
    }]);
    //试卷预览
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('paperpreview', {
            url: "/paperpreview?paperID?enableCreateTask",
            views: {
                "mainChildView":
                    {
                        templateUrl: "/web/kaola/paperpreview/paperpreview.html",
                        controller: 'PaperPreviewCtrl'
                    }
            },
            resolve: {
                PaperPreviewCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/paperpreview/paperpreview.js');
                }]
            }
        }).state('paperpreview.createtask', {
            url: "/task/createtaskfrompaperpreview",
            views: {
                'createTaskView': {
                    templateUrl: "/web/kaola/task/createtask_frompaper.html",
                    controller: 'CreateTaskCtrl'
                },
            },
            params: {
                'data': null
            },
            resolve: {
                PaperPreviewCreateTaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, ['/web/kaola/task/task.js']);
                }]
            }

        });
    }]);

    //个人中心功能
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('personal',
            {
                url: "/personal/:childview",
                views: {
                    'mainChildView': {
                        templateUrl: "/web/kaola/personal/personal.html",
                        controller: 'PersonalCtrl'
                    },
                },
                resolve: {
                    TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/personal/personal.js');
                    }]
                }
            }).state('personal.setting',
                {
                    url: "/personal/setting",
                    views: {
                        'personalChildView': {
                            templateUrl: "/web/kaola/personal/setting.html",
                            controller: 'PersonalSettingCtrl'
                        }
                    },
                    resolve: {
                        TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/personal/personal.js');
                        }]
                    }
                }).state('personal.changepassword',
                    {
                        url: "/personal/changepassword",
                        views: {
                            'personalChildView': {
                                templateUrl: "/web/kaola/personal/changepassword.html",
                                controller: 'ChangePasswordCtrl'
                            }
                        },
                        resolve: {
                            TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                                return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/personal/personal.js');
                            }]
                        }
                    }).state('personal.bindclass',
                        {
                            url: "/personal/bindclass",
                            views: {
                                'personalChildView': {
                                    templateUrl: "/web/kaola/personal/bindclass.html",
                                    controller: 'BindClassCtrl'
                                }
                            },
                            resolve: {
                                TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/personal/personal.js');
                                }]
                            }
                        }).state('personal.activePackage',
                            {
                                url: "/personal/activepackage",
                                views: {
                                    'personalChildView': {
                                        templateUrl: "/web/kaola/personal/activepackage.html",
                                        controller: 'ActivePackageCtrl'
                                    }
                                },
                                resolve: {
                                    TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                                        return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/personal/personal.js');
                                    }]
                                }
                            }).state('completePersonalInfo', {
                                url: "/completePersonalInfo",
                                views: {
                                    'standaloneView': {
                                        templateUrl: "/web/kaola/personal/completePersonalInfo.html",
                                        controller: 'CompletePersonalInfoCtrl'
                                    }
                                },
                                resolve: {
                                    TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                                        return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/personal/personal.js');
                                    }]
                                }
                            });
    }]);

    //报表功能
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('studentreport', {
            url: "/studentreport/:studentNumber?classID?from",
            views: {
                'mainChildView': {
                    templateUrl: "/web/kaola/report/student/studentreport.html",
                    controller: 'StudentReportCtrl'
                }
            },
            resolve: {
                TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/report/student/studentreport.js');
                }]
            }

        }).state('studentreportdetail', {
            url: "/studentreportdetail/:taskID?classID?studentNumber?paperID?from",
            views: {
                'mainChildView': {
                    templateUrl: "/web/kaola/report/student/studentreport_taskdetail.html",
                    controller: 'StudentReportTaskDetailCtrl'
                }
            },
            resolve: {
                TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/report/student/studentreport.js');
                }]
            }

        }).state('teacherreport', {
            url: "/teacherreport/?classID?from",
            views: {
                'mainChildView': {
                    templateUrl: "/web/kaola/report/teacher/teacherreport.html",
                    controller: 'TeacherReportCtrl'
                }
            },
            resolve: {
                TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/report/teacher/teacherreport.js');
                }]
            }
        }).state('teacherreportdetail', {
            url: "/teacherreportdetail/:taskID?classID",
            views: {
                'mainChildView': {
                    templateUrl: "/web/kaola/report/teacher/teacherreport_taskdetail.html",
                    controller: 'TeacherReportTaskDetailCtrl'
                }
            },
            resolve: {
                TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/report/teacher/teacherreport.js');
                }]
            }
        });
    }]);

    //班级功能 
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('class', {
            url: "/class",
            views: {
                'mainChildView': {
                    templateUrl: "/web/kaola/class/class.html",
                    controller: 'ClassCtrl',
                }
            },
            params: {
                'isHistoryClass': null
            },
            resolve: {
                ClassCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/class/class.js');
                }]
            }
        }).state('class.createtask', {
            url: "/task/createtaskfromclass",
            views: {
                'createTaskView': {
                    templateUrl: "/web/kaola/task/createtask_fromclass.html",
                    controller: 'CreateTaskCtrl'
                },
            },
            params: {
                'data': null
            },
            resolve: {
                ClassCreateTaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, ['/web/kaola/task/task.js']);
                }]
            }
        });
    }]);


    //学生功能
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('student', {
            url: "/student/:classId",
            views: {
                'mainChildView': {
                    templateUrl: "/web/kaola/student/student.html",
                    controller: 'StudentCtrl'
                }
            },
            params: {
                'isHistoryClass': null
            },
            resolve: {
                StudentCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/student/student.js');
                }]
            }

        }).state('student.createtask', {
            url: "/task/createtaskfromclass",
            views: {
                'createTaskView': {
                    templateUrl: "/web/kaola/task/createtask_fromclass.html",
                    controller: 'CreateTaskCtrl'
                },
            },
            params: {
                'data': null
            },
            resolve: {
                StudentCreateTaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, ['/web/kaola/task/task.js']);
                }]
            }

        });
    }]);

    //任务功能
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('task', {
            url: "/task",
            views: {
                'mainChildView': {
                    templateUrl: "/web/kaola/task/task.html",
                    controller: 'TaskCtrl'
                }
            },
            resolve: {
                TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/task/task.js');
                }]
            }
        }).state('task.createtask', {
            url: "/task/createtask",
            views: {
                'createTaskView': {
                    templateUrl: "/web/kaola/task/createtask.html",
                    controller: 'CreateTaskCtrl'
                }
            },
            params: {
                'data': null
            },
            resolve: {
                CreateTaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/task/task.js');
                }]
            }
        });
    }]);

    //教师业务菜单:模拟考试 examforteacher     
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('examforteacher', {
            url: "/examforteacher",
            views: {
                "mainChildView":
                    {
                        templateUrl: "/web/kaola/examforteacher/examforteacher.html",
                        controller: 'ExamForTeacherCtrl'
                    }
            },
            resolve: {
                TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/examforteacher/examforteacher.js');
                }]
            }
        });
    }]);

    //考试机构管理员菜单
    //模拟考试:examfororg
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('examfororg', {
            url: "/examfororg",
            views: {
                "mainChildView":
                    {
                        templateUrl: "/web/kaola/examfororg/examfororg.html",
                        controller: 'ExamForOrgCtrl'
                    }
            },
            resolve: {
                TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/examfororg/examfororg.js');
                }]
            }
        }).state('selectschoolfororg', {
            url: "/examfororg/selectschoolfororg",
            views: {
                'mainChildView': {
                    templateUrl: "/web/kaola/examfororg/selectSchool/selectSchool.html",
                    controller: 'SelectSchoolCtrl'
                }
            },
            params: {
                'data': null
            },
            resolve: {
                CreateTaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/examfororg/selectSchool/selectSchool.js');
                }]
            }
        }).state('selectpaperfororg', {
            url: "/examfororg/selectpaperfororg",
            views: {
                'mainChildView': {
                    templateUrl: "/web/kaola/examfororg/selectPaper/selectPaper.html",
                    controller: 'ExamForOrgSelectPaperCtrl'
                }
            },
            params: {
                'data': null
            },
            resolve: {
                CreateTaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/examfororg/selectPaper/selectPaper.js');
                }]
            }
        }).state('examfororgdetail', {
            url: "/examfororg/examfororgdetail",
            views: {
                'mainChildView': {
                    templateUrl: "/web/kaola/examfororg/examfororgdetail/examfororgdetail.html",
                    controller: 'ExamForOrgDetailCtrl'
                }
            },
            params: {
                'data': null
            },
            resolve: {
                CreateTaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/examfororg/examfororgdetail/examfororgdetail.js');
                }]
            }
        });
    }]);
    //试卷管理
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('paperfororg', {
            url: "/paperfororg",
            views: {
                "mainChildView":
                    {
                        templateUrl: "/web/kaola/paperfororg/paperfororg.html",
                        controller: 'PaperForOrgCtrl'
                    }
            },
            resolve: {
                TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/paperfororg/paperfororg.js');
                }]
            }
        });
    }]);
    //日常管理summaryfororg
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('summaryfororg', {
            url: "/summaryfororg",
            views: {
                "mainChildView":
                    {
                        templateUrl: "/web/kaola/summaryfororg/summaryfororg.html",
                        controller: 'SummaryForOrgCtrl'
                    }
            },
            resolve: {
                TaskCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return oclazyLoadWithCDN($ocLazyLoad, '/web/kaola/summaryfororg/summaryfororg.js');
                }]
            }
        });
    }]);



    app.config(['$urlRouterProvider', function ($urlRouterProvider) {
        $urlRouterProvider.otherwise(cv_DefaultRoute);
    }]);

    app.config(['$logProvider', function ($logProvider) {
        $logProvider.debugEnabled(true);
    }]);

    //#endregion

    //#region Service & Factory

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
            return $http.post(GLOBAL_API_URL + 'api/mark/convertAudio', { Src: src, TargetAudioType: targetAudioType });
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
            swf_path: '/web/lib/audio5/swf/audio5js.swf',
        });

        soundsObj.on('ended', audioEnded, this);
        // timeupdate event passes audio duration and position to callback
        soundsObj.on('timeupdate', audioTimeupdate, this);
        //triggered when the audio has been loaded can can be played
        soundsObj.on('canplay', audioLoaded)

        var LastAudioSrc = "";//上次播放的音频路径
        var AudioStopPlaying = true;//是否音频播放停止
        var AudioLoaded = false;//音频是否已经加载完成
        var AudioDuration = 0;//音频时长
        var AudioPosition = 0;//音频当前播放位置

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

                        soundsObj.load(src);//设置播放路径  

                    })
                }
                else {

                    console.log("load audio:", src);

                    soundsObj.load(src);//设置播放路径  
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

                            soundsObj.load(src);//设置播放路径  

                            soundsObj.play();
                        })
                    }
                    else {

                        console.log("load audio:", src);

                        soundsObj.load(src);//设置播放路径  

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
                }
                else {
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
                sText = sText.replace(rHtml, '{~}');  //替换html标签
                sText = sText.replace(rStr, sKey); //替换key
                var num = -1;
                sText = sText.replace(/{~}/g, function () {  //恢复html标签
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
                }
                else {
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

    app.service('AuthInterceptorService', ['$rootScope', '$q', '$injector', '$location', 'localStorageService', '$log', function ($rootScope, $q, $injector, $location, localStorageService, $log) {
        var deferLoadingState = $q.defer();
        this.observeLoading = function () { return deferLoadingState.promise; }

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
            //console.log("request:",config);
            config.headers = config.headers || {};

            var authData = localStorageService.get('kaola_authorizationData');
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
                var authData = localStorageService.get('kaola_authorizationData');

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
    }]);

    app.service('SlideMenuService', ['Constants', '$log', 'AuthService', function (Constants, $log, AuthService) {

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
                var item = Constants.sidebarItems[i];

                if (item.userType == userType) {
                    this.sidebarItems = JSON.parse(JSON.stringify(item.items));
                }
            }
            //根据用户权限检查菜单
            if (this.sidebarItems.length > 0) {
                for (var j = this.sidebarItems.length - 1; j >= 0; j--) {
                    var m = this.sidebarItems[j];
                    if (m.type == 'module') {
                        for (var mIndex = m.menus.length - 1; mIndex >= 0; mIndex--) {
                            var mItem = m.menus[mIndex];
                            if (mItem.needCheck != undefined && mItem.needCheck == true) {
                                //check
                                if (AuthService.CheckMenuEnable(mItem.state) == false) {
                                    //remove menu
                                    m.menus.splice(mIndex, 1);
                                }
                            }
                        }
                        if (m.menus.length == 0) {
                            this.sidebarItems.splice(j, 1);
                        }
                    }
                    if (m.type == 'menu') {
                        if (m.needCheck != undefined && m.needCheck == true) {
                            //check
                            if (AuthService.CheckMenuEnable(m.state) == false) {
                                //remove menu
                                this.sidebarItems.splice(j, 1);
                            }
                        }
                    }
                }
            }

            console.log("sidebarItems:", this.sidebarItems);
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

    }]);

    app.service('LocationService', ['AuthService', 'SlideMenuService', '$location', '$log', '$state', function (AuthService, SlideMenuService, $location, $log, $state) {

        this.Goto = function (state) {
            $state.go(state);
        }

        this.GotoDefaultURL = function () {
            var authData = AuthService.AuthData();
            var isAuth = authData ? authData.isAuth : false;

            if (isAuth) {
                if (authData.nickName == '') {
                    AuthService.ShowStandaloneView(true);
                    $location.path('/completePersonalInfo');
                    return;
                }

                //刷新左侧菜单
                var userType = authData.userType;
                SlideMenuService.RefreshSideBar(userType);

                var directUrl = 'home';

                if (userType == 1) {
                    //教师, 默认任务管理页面
                    directUrl = 'task';
                }
                if (userType == 2) {
                    //学生, 默认学生主页页面
                    directUrl = 'studenthome';
                }

                if (userType == 3) {
                    //学校管理员, 默认内容序列号管理页面
                    directUrl = 'package';
                }
                if (userType == 6) {
                    //考试机构管理员, 默认模拟考试页面
                    directUrl = 'examfororg';
                }
                this.Goto(directUrl);

            }
            else {

                if (!($location.path() == '/signup'
                    || $location.path() == '/validate'
                    || $location.path().indexOf("/resetpwd") > -1
                    || $location.path() == '/findpwd')
                    && !isAuth) {

                    this.Goto('login');
                }
            }
        };
    }]);
    //#endregion Filter


    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptorService');
    });

    app.controller('MainCtrl', ['$rootScope', '$scope', '$ocLazyLoad', '$log', '$location', '$state', 'Constants', 'AuthInterceptorService', '$modal', 'LocationService', 'SlideMenuService', 'AuthService', function ($rootScope, $scope, $ocLazyLoad, $log, $location, $state, Constants, AuthInterceptorService, $modal, LocationService, SlideMenuService, AuthService) {

        $scope.AuthService = AuthService;

        $scope.SlideMenuService = SlideMenuService;
        $scope.GetMenuIcon = function (i) {
            var active = '';
            var currentState = $state.current.name;
            if (currentState != undefined && currentState === i.state) {
                active = '_active';
            }
            return 'http://cdn.uukaola.com/web/img/sidemenu/' + i.icon + active + '.png';
        }


        //Start  Loading加载进度条功能 
        $scope.showLoading = false;
        var updateLoading = function (showLoadingFlag) {
            $scope.showLoading = showLoadingFlag;
        };
        AuthInterceptorService.observeLoading().then(null, null, updateLoading);
        //End  Loading加载进度条功能

        //Start  登录身份验证
        $scope.isAuth = function () {
            var authData = AuthService.AuthData();
            return authData ? authData.isAuth : false;
        }

        $scope.AuthUpdate = function () {

            var currentLocationPath = $location.path();
            //console.log("current localtion path:"+ currentLocationPath)

            var authData = AuthService.AuthData();
            //console.log("AuthService.AuthData:"+authData);
            var isAuth = authData ? authData.isAuth : false;
            if (isAuth) {

                Constants.serverDomain = authData.serverDomain;
                GLOBAL_API_URL = authData.apiServiceBaseUri;
                GLOBAL_CENTRAL_URL = authData.authServiceBaseUri;
                GLOBAL_ANSWER_URL = authData.answerBaseUrl;
                GLOBAL_PAPER_RESOURCE_URL = authData.paperResourceBaseUrl;
                console.log("Constants:", Constants);

                //刷新左侧菜单               
                var userType = authData.userType;
                SlideMenuService.RefreshSideBar(userType);

                if (currentLocationPath == '/login'
                    || currentLocationPath == '/signup'
                    || currentLocationPath == '/validate'
                    || currentLocationPath == '/resetpwd'
                    || currentLocationPath == '/findpwd') {
                    LocationService.GotoDefaultURL();
                }

                //教师成绩报告详细页面, 单独显示, 隐藏左侧菜单与头部导航,宽度重新设置为 col-12
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

                //学生报告详细页面, 单独显示, 隐藏左侧菜单与头部导航,宽度重新设置为 col-12
                if (currentLocationPath.indexOf("studentreportdetail") > -1) {
                    angular.element("#div_header_kaola").hide();
                    angular.element("#navbar-personallink").hide();
                    angular.element("#sidebar_menu").hide();
                    angular.element("#sidebar_menu_row").css('padding-top', '0px');
                    angular.element("#sidebar_menu_row").css('height', '100%');
                    angular.element("#div_mainChildView").removeClass();
                    angular.element("#div_mainChildView").addClass('col-xs-12 col-sm-12 col-md-12');
                }
                //学生主页, 隐藏左侧菜单, 隐藏头部导航中的个人中心链接,宽度重新设置为 col-12
                if (currentLocationPath.indexOf("studenthome") > -1) {
                    angular.element("#navbar-personallink").hide();
                    angular.element("#sidebar_menu").hide();
                    angular.element("#div_mainChildView").removeClass();
                    angular.element("#div_mainChildView").addClass('col-xs-12 col-sm-12 col-md-12');
                }

            }
            else {
                if (!(currentLocationPath == '/signup'
                    || currentLocationPath == '/validate'
                    || currentLocationPath.indexOf("/resetpwd") > -1
                    || currentLocationPath == '/findpwd')
                    && !isAuth) {

                    LocationService.Goto('login');
                }
            }
        };

        AuthService.observeAuthentication().then(null, null, $scope.AuthUpdate);
        //End  登录身份验证

        //检查用户登录信息
        $scope.AuthUpdate();

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

            modalInstance.result.then(okCallback, function () {
            });
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

            modalInstance.result.then(okCallback, function () {
            });
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

            modalInstance.result.then(okCallback, function () {
            });
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

            modalInstance.result.then(okCallback, function () {
            });
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


    //#region Filter

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
    app.filter('StudentBindNameFilter', function () {
        return function (Name) {
            var stuStatusDes = '';
            if (Name == null)
                stuStatusDes = "未绑定";
            else if (Name.trim() != "") {
                stuStatusDes = Name;
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
            }
            else {
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
            }
            else {
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
            if (userType == 6) {
                userTypeText = "考试机构管理员";
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
                            fun();  //回调函数
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
        return function (name, maxLength, half) {
            var newName = name;
            if (newName.length > maxLength) {
                newName = newName.slice(0, half) + ' ... ' + newName.slice(newName.length - half, newName.length);
            }
            return newName;
        }
    });

    //#region 区校级考试
    app.filter('examPlanStatusFilter', function () {
        return function (status, userType, returnKey) {
            if (returnKey === undefined || returnKey === "") {
                returnKey = 'desc';
            }
            var result = '';
            if (status !== undefined && status !== "" && userType !== undefined && userType !== "") {
                if (cv_ExamPlanStatus != undefined && cv_ExamPlanStatus.length > 0) {

                    for (var i = 0; i < cv_ExamPlanStatus.length; i++) {
                        if (cv_ExamPlanStatus[i].userType == userType) {
                            var statusList = cv_ExamPlanStatus[i].statusList;

                            for (var sIndex = 0; sIndex < statusList.length; sIndex++) {
                                if (statusList[sIndex].value == status) {
                                    result = statusList[sIndex][returnKey];
                                    break;
                                }
                            }
                        }

                        if (result != '') {
                            break;
                        }
                    }
                }
            }
            return result;
        }
    });
    //#endregion

    //#endregion
});

