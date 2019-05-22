define(['angular'], function (angular) {
    'use strict'
    angular.module('app').directive('questionOperation', ['$timeout', '$rootScope', 'CommonBusinessService', function ($timeout, $rootScope, CommonBusinessService) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                data: '=data',
                showAnswer: '=showAnswer'
            },
            link: function (scope, element, attrs) {

                scope.Choose = function () {
                    scope.$emit('Operation_Choose', scope.data);
                }
                scope.Remove = function () {
                    scope.$emit('Operation_Remove', scope.data);
                }
                scope.isShow = false;
                scope.AnswerToggle = function () {
                    scope.isShow = !scope.isShow;

                    if ($rootScope.SearchText != undefined && $rootScope.SearchText != '') {
                        CommonBusinessService.HighlightSearchTextAsync($rootScope.SearchText);
                    }
                }
            },
            templateUrl: '/web/components/directives/paperDesign/directive_operation.html'
        }
    }])
});
