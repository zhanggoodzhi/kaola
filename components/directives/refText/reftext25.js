define(['angular'], function (angular) {
    'use strict';
    angular.module('refText25Module', []).directive('refText25', ['$log', function ($log) {

        return {
            restrict: 'E',
            replace: true,
            scope: {
                refs: '=refs'
            },
            link: function (scope, element, attrs) {
                scope.currentRef = null;

                scope.init = function () {
                    if (scope.refs.length > 0) {
                        var chooseFirst = false;
                        if (scope.currentRef == null) {
                            chooseFirst = true;
                        } else {
                            var findMatched = false;
                            for (var i = 0; i < scope.refs.length; i++) {
                                if (scope.refs[i].ContentID == scope.currentRef.ContentID) {
                                    findMatched = true;
                                    break;
                                }
                            }
                            chooseFirst = !findMatched;
                        }

                        if (chooseFirst) {
                            var ref = scope.refs[0];
                            scope.currentRef = {};
                            scope.currentRef.Content = ref.Content;
                            scope.currentRef.ContentID = ref.ContentID;
                            scope.currentRef.Title = ref.Title;

                        }
                    }

                    return '/web/components/directives/refText/directive_ref_text_25.html';
                };

                scope.SelectRef = function (ref) {
                    scope.currentRef.Content = ref.Content;
                    scope.currentRef.ContentID = ref.ContentID;
                    scope.currentRef.Title = ref.Title;
                };
            },
            template: '<div class="nav-refrence" ng-include="init()"></div>'
        }
    }])

});
