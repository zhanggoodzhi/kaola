var debug_env = false;//是否是开发环境, 生产环境设置为false

var CDN_ADDRESS_PREFIX = "http://cdn.uukaola.com";
var PAPER_RESOURCE_DEFAULT_ADDRESS_PREFIX = "http://cdn.uukaola.com";


var GetJSPaths = function () {

    var minjsSuffix = debug_env ? "" : ".min";
    var paths = {
        "ocLazyLoad": "/web/lib/ocLazyLoad.require" + minjsSuffix,

        "angular": "/web/lib/angular" + minjsSuffix,
        'angular-animate': '/web/lib/angular-animate' + minjsSuffix,
        "angular-ui-router": "/web/lib/angular-ui-router" + minjsSuffix,
        'jquery': '/web/lib/jquery-1.12.4' + minjsSuffix,
        'bootstrap': '/web/lib/bootstrap' + minjsSuffix,
        'jquery.form': '/web/lib/jquery.form' + minjsSuffix,
        'jquery-ui': '/web/lib/jquery-ui/jquery-ui.min',
        'ui-bootstrap-tpls': '/web/lib/ui-bootstrap-tpls' + minjsSuffix,
        "angular-local-storage": "/web/lib/angular-local-storage" + minjsSuffix,
        "ng-table": "/web/lib/ng-table/ng-table" + minjsSuffix,
        'domReady': '/web/lib/domReady' + minjsSuffix,
        'abnTree': '/web/lib/abnTree' + minjsSuffix,

        'FileAPI': '/web/lib/FileAPI' + minjsSuffix,
        'ng-file-upload-all': '/web/lib/ng-file-upload-all' + minjsSuffix,

        'ngToaster': '/web/lib/ngToaster' + minjsSuffix,
        'cropper': '/web/lib/cropper/cropper' + minjsSuffix,

        'bootstrap-datetimepicker': '/web/lib/timepicker/bootstrap-datetimepicker' + minjsSuffix,
        'moment': '/web/lib/moment' + minjsSuffix,
        'bootstrap-daterangepicker': '/web/lib/daterangepicker/bootstrap-daterangepicker' + minjsSuffix,
        'bootstrap-datetimepicker-locales-zh-CN': '/web/lib/timepicker/locales/bootstrap-datetimepicker.zh-CN',
        'jquery-date-range-picker': '/web/lib/datepicker/jquery.daterangepicker' + minjsSuffix,

        'echarts': '/web/lib/echarts.4.0.2' + minjsSuffix,

        'es6-promise': '/web/lib/es6-promise' + minjsSuffix,

        'html2canvas': '/web/lib/html2canvas' + minjsSuffix,

        'angular-deckgrid': '/web/lib/angular-deckgrid' + minjsSuffix,

        'audio5js': '/web/lib/audio5/audio5' + minjsSuffix,
        "wavesurfer": '/web/lib/wavesurfer' + minjsSuffix,
        "wavesurfer-timeline": "/web/lib/wavesurfer.timeline.min",

        'videojs': '/web/lib/video-js-5.11.4/video.min',
        //'videojs-ie8': '/web/lib/video-js-5.11.4/ie8/videojs-ie8.min',
        'placeholderjs': '/web/lib/placeholders.min',
        //'uploadifyjs': '/web/lib/uploadify/jquery.uploadify.min',
        'uploadifyjs': '/web/lib/uploadify/jquery.uploadify',

        'jquploadifyjs': '/web/lib/uploadify/jquery-1.8.2.min',

        'jquery-scrollbar': '/web/lib/jquery-custom-content-scroller/jquery.mCustomScrollbar' + minjsSuffix,
        'jquery-mousewheel': '/web/lib/jquery-mousewheel/jquery.mousewheel' + minjsSuffix,

        'angular-ui-sortable': '/web/lib/angular-ui-sortable/sortable',
        // 'jquery-stickytableheaders': '/web/lib/jquery-stickytableheaders' + minjsSuffix

        'app': '/web/kaola/app',
        'config': '/web/kaola/config',
    };

    //遍历paths, 添加CDN_ADDRESS_PREFIX
    for (var item in paths) {
        if (typeof (paths[item]) == "function") {
            continue;
        }

        var val = paths[item];

        //exclude app.js
        if (val == 'app' || val == '/web/kaola/app') {
            continue;
        }
        //exclude config.js
        if (val == 'config' || val == '/web/kaola/config') {
            continue;
        }

        //console.log(item, val);
        if (val != undefined && val.indexOf("/web") > -1) {
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
            deps: ['jquery', 'angular', 'jquery-ui'],
            exports: 'angular-ui-sortable'
        },
        // 'jquery.stickytableheaders': {
        //     deps: ['jquery'],
        //     exports: 'jquery.stickytableheaders'
        // },
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
        'app': {
            deps: ['angular'],
            exports: 'app'
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
            deps: ['ocLazyLoad',
                'bootstrap',
                'angular-ui-router',
                'angular-local-storage',
                'ui-bootstrap-tpls',
                'config'],
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
    },
    deps: [],
    urlArgs: GetUrlArgs()
});


require(['app', 'config'], function () {
    require(['domReady!', 'angular'], function (document, angular) {
        angular.bootstrap(document, ['app']);
    });
});
