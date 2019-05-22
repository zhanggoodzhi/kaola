define([
    'angular', 'videojs'
], function (angular, videojs) {
    'use strict'
    angular
        .module('ngVideoModule', [])
        .directive('ngVideo', function ($compile, $timeout) {
            return {
                restrict: 'AE',
                transclude: true,
                scope: {
                    data: '='
                },
                link: function ($scope, $element, $attrs) {
                    console.log('attr',$attrs);
                    var player = null;
                    $scope.VideoPlaying = false;
                    $scope.StopVideoPlay = function () {
                        if ($scope.VideoPlaying) {
                            setPlayingState(false);
                            player.pause(); //暂停播放
                            player.dispose(); //释放操作会将整个video的dom节点删除，因此需要在下方重新将模板内容插入至根节点
                            player = null;
                            //dom
                            var videoHtml = '<video id=' + $scope.data.id + ' class="video-js vjs-default-skin vjs-big-play-centered"  width="100%"  controls' +
                                    '></video>';

                            var elementID = '#ng-video-directives_' + $scope.data.id;

                            angular
                                .element(elementID)
                                .html(videoHtml); //将模板内容重新插入根节点
                        }
                    }

                    $scope.StartVedioPaly = function () {
                        console.log("StartVedioPaly data:", $scope.data);
                        var path = $scope.GetVideoPath();
                        player = videojs($scope.data.id, {
                            sources: [
                                {
                                    src: path,
                                    type: 'video/mp4'
                                }
                            ],
                            "preload": "auto"
                        });
                        player.src(path); //重置video的src
                        player.load(path); //使video重新加载

                        if ($scope.VideoPlaying == false) {
                            setPlayingState(true);
                            //player.play();
                        }
                    }

                    //watch AudioPath
                    $scope.$watch(function () {
                        return $scope.data;
                    }, function (newValue, oldValue) {
                        //console.log("$watch ContentVideo:", newValue, oldValue);
                        if (newValue) {
                            $scope.StopVideoPlay();
                            $scope.StartVedioPaly();
                        }
                    }, true)

                    $scope.GetVideoPath = function () {
                        return $scope.data.path;
                    }

                    $scope.$on('StopVideoPlay', function () {
                        $scope.StopVideoPlay();
                    })

                    $scope.$on('$destroy', function () {
                        $scope.StopVideoPlay();
                    });

                    function safeApply(scope, fn) {
                        (scope.$$phase || scope.$root.$$phase)
                            ? fn()
                            : scope.$apply(fn);
                    }
                    function setPlayingState(flag) {
                        safeApply($scope, function () {
                            $scope.VideoPlaying = flag;
                        });
                    }
                },
                template: '<video id="{{data.id}}" class="video-js vjs-default-skin vjs-big-play-centered" ' +
                        ' width="100%"  controls></video>'
            }
        })
});
