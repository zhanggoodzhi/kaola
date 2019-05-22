var debug_env = false;//是否是开发环境, 生产环境设置为false

var CDN_ADDRESS_PREFIX = "../";
var PAPER_RESOURCE_DEFAULT_ADDRESS_PREFIX = "http://cdn.uukaola.com";


var GLOBAL_API_URL = "/";//业务相关api 地址前缀, 在登录后会被修改为区域服务器的地址
var GLOBAL_CENTRAL_URL = "/";//中心服务api地址 
var GLOBAL_ANSWER_URL = "/";//答案音频地址
var GLOBAL_PAPER_RESOURCE_URL = "/";//试卷资源地址, 默认=CDN地址


var GetJSPaths = function () {

    var minjsSuffix = debug_env ? "" : ".min";
    var paths = {
        "ocLazyLoad": "lib/ocLazyLoad.require" + minjsSuffix,

        "angular": "lib/angular" + minjsSuffix,
        'angular-animate': 'lib/angular-animate' + minjsSuffix,
        "angular-ui-router": "lib/angular-ui-router" + minjsSuffix,
        'jquery': 'lib/jquery-1.12.4' + minjsSuffix,
        'bootstrap': 'lib/bootstrap' + minjsSuffix,
        'jquery.form': 'lib/jquery.form' + minjsSuffix,
        'jquery-ui': 'lib/jquery-ui/jquery-ui.min',
        'ui-bootstrap-tpls': 'lib/ui-bootstrap-tpls' + minjsSuffix,
        "angular-local-storage": "lib/angular-local-storage" + minjsSuffix,
        "ng-table": "lib/ng-table" + minjsSuffix,
        'domReady': 'lib/domReady' + minjsSuffix,
        'abnTree': 'lib/abnTree' + minjsSuffix,

        'ngToaster': 'lib/ngToaster' + minjsSuffix,
        'cropper': 'lib/cropper/cropper' + minjsSuffix,


        'moment': 'lib/datepicker/moment' + minjsSuffix,
        'jquery-date-range-picker': 'lib/datepicker/jquery.daterangepicker' + minjsSuffix,

        'echarts': 'lib/echarts.4.0.2' + minjsSuffix,

        'es6-promise': 'lib/es6-promise' + minjsSuffix,

        'html2canvas': 'lib/html2canvas' + minjsSuffix,

        'angular-deckgrid': 'lib/angular-deckgrid' + minjsSuffix,

        'audio5js': 'lib/audio5/audio5' + minjsSuffix,
        "wavesurfer": 'lib/wavesurfer' + minjsSuffix,
        "wavesurfer-timeline": "lib/wavesurfer.timeline.min",
        'app': 'kaola/app',

        'videojs': 'lib/video-js-5.11.4/video.min',
        //'videojs-ie8': 'lib/video-js-5.11.4/ie8/videojs-ie8.min',
        'placeholderjs': 'lib/placeholders.min',
        //'uploadifyjs': 'lib/uploadify/jquery.uploadify.min',
        'uploadifyjs': 'lib/uploadify/jquery.uploadify',

        'jquploadifyjs': 'lib/uploadify/jquery-1.8.2.min',

        'jquery-scrollbar': 'lib/jquery-custom-content-scroller/jquery.mCustomScrollbar' + minjsSuffix,
        'jquery-mousewheel': 'lib/jquery-mousewheel/jquery.mousewheel' + minjsSuffix,
        
        'angular-ui-sortable': 'lib/angular-ui-sortable/sortable'
    };

    //遍历paths, 添加CDN_ADDRESS_PREFIX
    for (var item in paths) {
        if (typeof (paths[item]) == "function") {
            continue;
        }

        var val = paths[item];

        //console.log(item, val);
        if (val != undefined) {
            paths[item] = CDN_ADDRESS_PREFIX + val;
        }
    }
    return paths;
};

var GetUrlArgs = function () {
    var args = debug_env ? "bust=" + (new Date()).getTime() : undefined;  //防止读取缓存，调试用
    return args;
}
require.config({
    paths: GetJSPaths(),
    //waitSeconds: 30,
    shim: {
        'angular': {
            deps: ['jquery'],
            exports: 'angular'
        },
        'angular-animate': {
            deps: ['angular'],
            exports: 'angular-animate'
        },
        'angular-ui-router': {
            deps: ['angular'],
            exports: 'angular-ui-router'
        },
        'bootstrap': {
            deps: ['jquery'],
            exports: 'bootstrap'
        },
        'jquery.form': {
            deps: ['jquery'],
            exports: 'jquery.form'
        },
        'jquery-ui': {
            deps: ['jquery'],
            exports: 'jquery-ui'
        },
        'angular-ui-sortable': {
            deps: ['jquery','angular','jquery-ui'],
            exports: 'angular-ui-sortable'
        },
        
        'ui-bootstrap-tpls': {
            deps: ['angular', 'bootstrap'],
            exports: 'ui-bootstrap-tpls'
        },

        'angular-local-storage': {
            deps: ['angular'],
            exports: 'angular-local-storage'
        },
        'ng-table': {
            deps: ['angular'],
            exports: 'ng-table'
        },
        'abnTree': {
            deps: ['angular'],
            exports: 'abnTree'
        },

        'FileAPI': {
            deps: ['angular', 'jquery', 'bootstrap'],
            exports: 'FileAPI'
        },
        'ng-file-upload-all': {
            deps: ['FileAPI'],
            exports: 'ng-file-upload-all'
        },

        'ngToaster': {
            deps: ['angular'],
            exports: 'ngToaster'
        },
        'cropper': {
            deps: ['jquery'],
            exports: 'cropper'
        },

        'moment': {
            deps: ['jquery'],
            exports: 'moment'
        }
        ,
        'jquery-date-range-picker': {
            deps: ['jquery', 'moment'],
            exports: 'jquery-date-range-picker'
        }
        ,
        'echarts': {
            deps: ['jquery'],
            exports: 'echarts'
        }
        ,
        'es6-promise': {
            deps: [''],
            exports: 'es6-promise'
        }

         ,
        'html2canvas': {
            deps: ['es6-promise'],
            exports: 'html2canvas'
        }

          ,
        'angular-deckgrid': {
            deps: ['angular'],
            exports: 'angular-deckgrid'
        }

         ,
        'ocLazyLoad': {
            deps: ['angular'],
            exports: 'ocLazyLoad'
        },
        'app': {
            deps: ['ocLazyLoad', 'bootstrap', 'angular-ui-router', 'angular-local-storage', 'ui-bootstrap-tpls'],
            exports: 'app'
        }
         ,
        'audio5js': {
            deps: [''],
            exports: 'audio5js'
        }
        ,
        'videojs': {
            deps: ['jquery'],
            exports: 'videojs'
        },
        'placeholderjs': {
            deps: [''],
            exports: 'placeholderjs'
        },
        'uploadifyjs': {
            deps: ['jquploadifyjs'],
            exports: 'uploadifyjs'
        },
        'jquploadifyjs': {
            deps: [''],
            exports: 'jquploadifyjs'
        },
        'jquery-scrollbar': {
            deps: ['jquery'],
            exports: 'jquery-scrollbar'
        },
        'jquery-mousewheel': {
            deps: ['jquery'],
            exports: 'jquery-mousewheel'
        },
    },
    deps: [],
    urlArgs: GetUrlArgs()
});


require(['app'], function () {
    require(['domReady!', 'angular'], function (document, angular) {
        angular.bootstrap(document, ['app']);
    });
});
