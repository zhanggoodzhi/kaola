console.log("load config.js");

var GLOBAL_API_URL = "/";//业务相关api 地址前缀, 在登录后会被修改为区域服务器的地址
var GLOBAL_CENTRAL_URL = "/";//中心服务api地址 
var GLOBAL_ANSWER_URL = "/";//答案音频地址
var GLOBAL_PAPER_RESOURCE_URL = "/";//试卷资源地址, 默认=CDN地址

/*
*   DefaultRoute: 默认路由
*/
var cv_DefaultRoute = '/home';


//用户类型： 
/// 0.系统管理员 
/// 1.学校教师
/// 2.学生
/// 3.学校管理员 
/// 4.业务支撑后台用户 
/// 5.制题系统用户(内容编辑)
/// 6.考试机构管理员
var cv_SidebarItems =
    [

        //1=教师
        {
            userType: [1],
            items: [{
                type: 'module',
                module: '业务',
                icon: 'yewu',
                menus: [
                         {
                             type: 'menu',
                             title: '班级考试',
                             state: 'task'
                         },
                          {
                              type: 'menu',
                              title: '模拟考试',
                              state: 'examforteacher',
                              needCheck: true
                          },
                ]
            },
            {
                type: 'menu',
                icon: 'chengjichaxun',
                title: '成绩查询', state: 'teacherreport'
            },
           {
               type: 'module',
               module: '数据',
               icon: 'shuju',
               menus: [
                        {
                            type: 'menu',
                            title: '试卷管理',
                            state: 'paper'
                        },
                        {
                            type: 'menu',
                            title: '班级管理',
                            state: 'class'
                        }
               ]
           }]
        },

        //3=学校管理员
        {
            userType: [3],
            items: [
                {
                    type: 'menu',
                    icon: 'examforschooladmin',
                    title: '模拟考试',
                    state: 'examforschooladmin',
                    needCheck: true
                },
                   {
                       type: 'module',
                       module: '数据',
                       icon: 'shuju',
                       menus: [
                                {
                                    type: 'menu',
                                    title: '试卷管理',
                                    state: 'package',
                                },
                                {
                                    type: 'menu',
                                    title: '教师管理',
                                    state: 'invateCode'
                                }
                       ]
                   }]
        },

          //6=考试机构管理员
        {
            userType: [6],
            items: [
                {
                    type: 'menu',
                    icon: 'examfororgAdmin',
                    title: '模考管理',
                    state: 'examfororg'
                }, {
                    type: 'menu',
                    icon: 'paperfororg',
                    title: '试卷管理',
                    state: 'paperfororg'
                }, {
                    type: 'menu',
                    icon: 'summaryfororgAdmin',
                    title: '日常管理',
                    state: 'summaryfororg'
                }
            ]
        }
    ]
;



/*
*   年级设置
*/
var cv_Grade = [
    //{ Name: '一年级', Grade: 1 },
    //{ Name: '二年级', Grade: 2 },
    //{ Name: '三年级', Grade: 3 },
    //{ Name: '四年级', Grade: 4 },
    //{ Name: '五年级', Grade: 5 },
    { Name: '六年级', Grade: 6, Alias: '六年级' },
    { Name: '七年级', Grade: 7, Alias: '初一' },
    { Name: '八年级', Grade: 8, Alias: '初二' },
    { Name: '九年级', Grade: 9, Alias: '初三' },
    { Name: '十年级', Grade: 10, Alias: '高一' },
    { Name: '十一年级', Grade: 11, Alias: '高二' },
    { Name: '十二年级', Grade: 12, Alias: '高三' },
];

var oclazyLoadWithCDN = function (ocLazyLoadProvider, filePath) {
    var enable = false;
    if (enable) {
        if (filePath != undefined) {
            if (typeof (filePath) == "string") {
                filePath = CDN_ADDRESS_PREFIX + filePath;
            }
            else {
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


var fixScrollBarForBootstrapMultiDialog = function () {
    if ($(".modal.fade.ng-scope.in").length > 0) {
        console.log("add modal-open for body");
        setTimeout(function () {
            $("body:not(.modal-open)").addClass("modal-open");
        }, 1000);
    }
}

//可信网站图片LOGO安装开始
var installKXLogo = function () {
    var _kxs = document.createElement('script');
    _kxs.id = 'kx_script';
    _kxs.async = true;
    _kxs.setAttribute('cid', 'kx_verify');
    _kxs.src = ('https:' == document.location.protocol ? 'https://ss.knet.cn' : 'http://rr.knet.cn') + '/static/js/icon3.js?sn=e17071932050068368d3wr000000&tp=icon3';
    _kxs.setAttribute('size', 0);
    var _kx = document.getElementById('kx_verify');
    _kx.parentNode.insertBefore(_kxs, _kx);
};

installKXLogo();
//可信网站图片LOGO安装结束


//#region 区校级考试

var cv_ExamPlanStatus = [
    {
        userType: 0,//业务支撑管理员考试状态
        statusList: [      
        { value: 1, desc: '倒计时', name: 'countdown' },
        { value: 2, desc: '进行中', name: 'examing' },
        { value: 3, desc: '评分中', name: 'marking' },
        { value: 4, desc: '已完成', name: 'finished' },
        { value: 5, desc: '已结束', name: 'over' },
        ]
    },
      {
          userType: 6,//考试机构管理员考试状态
          statusList: [
          { value: 1, desc: '未开始', name: 'notstart' },
          { value: 2, desc: '进行中', name: 'examing' },
          { value: 3, desc: '评分中', name: 'marking' },
          { value: 4, desc: '评分结束', name: 'markfinished' },
          { value: 5, desc: '已结束', name: 'over' },
          ]
      },
      {
          userType: 3,//学校管理员考试状态
          statusList: [
          { value: 1, desc: '未开始', name: 'notstart' },
          { value: 2, desc: '进行中', name: 'examing' },
          { value: 3, desc: '评分中', name: 'marking' },
          { value: 4, desc: '已完成', name: 'finished' },         
          { value: 5, desc: '已结束', name: 'over' },
          ]
      }
]

//#endregion