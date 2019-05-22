define(['angular', ], function (angular) {
    'use strict'
    angular.module('progressbarModule', []).directive('progressBar', function () {

        var option = {
            restrict: "AE",
            replace: false,
            scope: {
                percentData: "=",
            },
            link: function (scope, element, attrs) {
                console.log(scope.percentData);
                //watch percentData data           
                scope.$watch(function () {
                    return scope.percentData;
                }, function (newVal, oldVal) {
                    if (newVal) {
                        console.log("percentData", scope.percentData);
                    }
                });
            },
            templateUrl: '/web/components/directives/progressbar/progressbar.html'
        };
        return option;

    })
})

