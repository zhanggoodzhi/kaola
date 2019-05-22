define(['angular'], function (angular) {
    'use strict';

    angular.module('refTextModule', []).directive('refText', ['$log', function ($log) {

        return {
            restrict: 'E',
            replace: true,
            scope: {
                refs: '=refs'
            },
            link: function (scope, element, attrs) {
                scope.currentRef = null;

                scope.include = function () {
                    if (scope.refs.length > 0) {
                        var chooseFirst = false;
                        if (scope.currentRef == null) {
                            chooseFirst = true;
                        } else {
                            var findMatched = false;
                            for (var i = 0; i < scope.refs.length; i++) {
                                if (scope.refs[i].AnswerID == scope.currentRef.AnswerID) {
                                    findMatched = true;
                                    break;
                                }
                            }
                            chooseFirst = !findMatched;
                        }

                        if (chooseFirst) {
                            var ref = scope.refs[0];
                            scope.currentRef = {};
                            scope.currentRef.AnswerID = ref.AnswerID;
                            scope.currentRef.Content = ref.Content;
                        }

                    }

                    return '/web/components/directives/refText/directive_ref_text.html';
                };

                scope.SelectRef = function (ref) {
                    scope.currentRef.AnswerID = ref.AnswerID;
                    scope.currentRef.Content = ref.Content;
                };
            },
            template: '<div class="nav-refrence"  ng-include="include()"></div>'
        }
    }])
});
