var debug_env = false;//是否是开发环境, 生产环境设置为false

var CDN_ADDRESS_PREFIX = "http://cdn.uukaola.com";

var GetJSPaths = function () {

    var minjsSuffix = debug_env ? "" : ".min";

    var paths = {
        "angular": "/web/lib/angular" + minjsSuffix,
        'angular-animate': '/web/lib/angular-animate' + minjsSuffix,
        "angular-ui-router": "/web/lib/angular-ui-router" + minjsSuffix,
        'jquery': '/web/lib/jquery-1.12.4' + minjsSuffix,
        'bootstrap': '/web/lib/bootstrap' + minjsSuffix,
        'jquery.form': '/web/lib/jquery.form' + minjsSuffix,
        'ui-bootstrap-tpls': '/web/lib/ui-bootstrap-tpls' + minjsSuffix,

        "angular-local-storage": "/web/lib/angular-local-storage" + minjsSuffix,
        "ng-table": "/web/lib/ng-table/ng-table-business" + minjsSuffix,
        'domReady': '/web/lib/domReady' + minjsSuffix,

        'abnTree': '/web/lib/abnTree' + minjsSuffix,

        'FileAPI': '/web/lib/FileAPI' + minjsSuffix,
        'FileAPISWF': 'lib/FileAPI.flash.swf',
        'ng-file-upload-all': '/web/lib/ng-file-upload-all' + minjsSuffix,

        'ngToaster': '/web/lib/ngToaster' + minjsSuffix,
        'cropper': '/web/lib/cropper/cropper' + minjsSuffix,

        'audio5js': '/web/lib/audio5/audio5' + minjsSuffix,
        'videojs': '/web/lib/video-js-5.11.4/video.min',

        'moment': '/web/lib/datepicker/moment' + minjsSuffix,
        'jquery-stickytableheaders': '/web/lib/jquery-stickytableheaders' + minjsSuffix,
        'jquery-date-range-picker': '/web/lib/datepicker/jquery.daterangepicker' + minjsSuffix,
        'bootstrap-datetimepicker': '/web/lib/timepicker/bootstrap-datetimepicker' + minjsSuffix,
        'moment': '/web/lib/moment' + minjsSuffix,
        'bootstrap-daterangepicker': '/web/lib/daterangepicker/bootstrap-daterangepicker' + minjsSuffix,
        'bootstrap-datetimepicker-locales-zh-CN': '/web/lib/timepicker/locales/bootstrap-datetimepicker.zh-CN',
        'echarts': '/web/lib/echarts.4.0.2' + minjsSuffix,
        'angucomplete': '/web/lib/angucomplete/angucomplete' + minjsSuffix,
        'angular-touch': '/web/lib/angucomplete/angular-touch.min',
        'jquery-scrollbar': '/web/lib/jquery-custom-content-scroller/jquery.mCustomScrollbar' + minjsSuffix,
        'jquery-mousewheel': '/web/lib/jquery-mousewheel/jquery.mousewheel' + minjsSuffix,
        'app': '/web/business/app',

        'jquery-stickytableheaders': '/web/lib/jquery-stickytableheaders' + minjsSuffix,
    };

    //遍历paths, 添加CDN_ADDRESS_PREFIX
    for (var item in paths) {
        if (typeof (paths[item]) == "function") {
            continue;
        }

        var val = paths[item];

        //exclude app.js
        if (val == 'app' || val == '/web/business/app') {
            continue;
        }

        //console.log(item, val);
        if (val != undefined && val.indexOf("/web") > -1) {
            paths[item] = CDN_ADDRESS_PREFIX + val;
        }
        //console.log(item, paths[item]);
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
        'jquery.stickytableheaders': {
            deps: ['jquery'],
            exports: 'jquery.stickytableheaders'
        },
        'bootstrap': {
            deps: ['jquery'],
            exports: 'bootstrap'
        },
        'jquery.form': {
            deps: ['jquery'],
            exports: 'jquery.form'
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
        },
        'bootstrap-datetimepicker': {
            deps: ['jquery', 'bootstrap'],
            exports: 'bootstrap-datetimepicker'
        },
        'bootstrap-daterangepicker': {
            deps: ['jquery', 'moment', 'bootstrap'],
            exports: 'bootstrap-daterangepicker'
        },
        'bootstrap-datetimepicker-locales-zh-CN': {
            deps: ['bootstrap-datetimepicker'],
            exports: 'bootstrap-datetimepicker-locales-zh-CN'
        },
        'jquery-scrollbar': {
            deps: ['jquery'],
            exports: 'jquery-scrollbar'
        },
        'jquery-mousewheel': {
            deps: ['jquery'],
            exports: 'jquery-mousewheel'
        },
        'app': {
            deps: ['angular'],
            exports: 'app'
        }
        ,
        'echarts': {
            init: function () {
                return echarts;
            }
        }
        ,
        'angucomplete': {
            deps: ['angular'],
            exports: 'angucomplete'
        },
        'angular-touch': {
            deps: ['angular'],
            exports: 'angular-touch'
        },
        'audio5js': {
            deps: [''],
            exports: 'audio5js'
        }
        ,
        'videojs': {
            deps: ['jquery'],
            exports: 'videojs'
        },

        'jquery.stickytableheaders': {
            deps: ['jquery'],
            exports: 'jquery.stickytableheaders'
        },
    },
    deps: [],
    urlArgs: GetUrlArgs()
});

var baseJS = ['require',
    'angular',
    'jquery',
    'bootstrap'];

var pluginJS = ['require',
    'angular-animate',
    'angular-ui-router',
    'angular-local-storage',

    'ui-bootstrap-tpls',
    'jquery.form',

    'ng-file-upload-all',
    'FileAPI',

    'abnTree',
    'ng-table',
    'ngToaster',
    'cropper',

    'moment',
    'jquery-date-range-picker',

    'echarts',
    'angucomplete'
];


var appJS = ['require', 'app'];

require(baseJS, function () {

    require(pluginJS, function () {

        require(appJS, function () {
            require(['domReady!', 'angular'], function (document, angular) {
                angular.bootstrap(document, ['app']);
            });
        });
    })
});
