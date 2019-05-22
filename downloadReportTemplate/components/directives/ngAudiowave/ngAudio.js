define(['angular'], function (angular) {
    'use strict'
    angular.module('ngAudioModule', []).directive('ngAudio', ['$timeout', 'Audio', function ($timeout, Audio) {
        return {
            restrict: 'AE',
            scope: {
                audioOption: '='
            },
            link: function ($scope, $element, $attrs) {

                $element.css('display', 'block');
                //音频总时间(seconds)
                $scope.duration = 0;
                //当前播放时间位置(seconds)
                $scope.position = 0;

                //播放状态
                $scope.audioPlaying = false;

                //音频是否已经加载完成
                $scope.audioReady = false;

                //播放方法
                $scope.playAudio = function () {
                    if ($scope.audioPlaying == false) {
                        Audio.play($scope.audioOption.AudioPath, $scope.StopAudioPlay, $scope.positionUpdateCallback);
                    }
                    else {
                        Audio.stop();
                    }
                    $scope.setPlayingState(!$scope.audioPlaying);
                }


                //watch AudioPath           
                $scope.$watch(function () {
                    return $scope.audioOption.AudioPath;
                }, function (newPath, oldPath) {
                    console.log("$watch AudioPath:", newPath, oldPath);
                    if (newPath) {
                        $scope.audioOption.AudioPath = newPath;
                        $scope.StopAudioPlay();
                        $scope.audioReady = false;
                        $scope.duration = 0;
                        $scope.position = 0;
                        $timeout(function () {
                            Audio.load($scope.audioOption.AudioPath, $scope.audioLoadedCallback)
                        }, 10);
                    }
                })

                $scope.$on('StopAudioPlay', function () {
                    $scope.StopAudioPlay();
                })

                $scope.StopAudioPlay = function () {
                    console.log('StopAudioPlay');
                    if ($scope.audioPlaying) {
                        //$scope.audioPlaying = false;
                        $scope.setPlayingState(false);
                        Audio.stop();
                    }
                }


                $scope.$on('$destroy', function () {
                    $scope.StopAudioPlay();
                });

                function safeApply(scope, fn) {
                    (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
                }
                $scope.setPlayingState = function (flag) {
                    safeApply($scope, function () {
                        $scope.audioPlaying = flag;
                    });
                }
                $scope.positionUpdateCallback = function (position, duration) {
                    safeApply($scope, function () {
                        $scope.duration = duration;
                        $scope.position = position;
                    });
                }
                $scope.audioLoadedCallback = function (duration) {
                    // console.log('audioLoadedCallback:', duration);
                    safeApply($scope, function () {
                        $scope.audioReady = true;
                        $scope.duration = duration;
                    });
                }
            },
            template: '<div><button  id="btn-playAudio" ng-disabled="audioReady==false" class="btn btn-primary btn-sm" style="width:80px;" ng-click="playAudio()">{{ audioPlaying ? "暂停" : "播放"}}</button></div>'

            //template: '<div><button  id="btn-playAudio" ng-disabled="audioReady==false" class="btn btn-primary btn-sm" style="width:80px;" ng-click="playAudio()">{{ audioPlaying ? "暂停" : "播放"}}</button><label style="margin-left:20px;">时长:</label><label>{{duration |audioTimeFilter}}</label>&nbsp&nbsp&nbsp<label>当前播放:</label><label>{{position|audioTimeFilter}}</label></div>'
        }
    }])
});
