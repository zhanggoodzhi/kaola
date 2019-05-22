define(['angular', 'wavesurfer', 'wavesurfer-timeline' ], function (angular) {
    'use strict'
    angular.module('ngAudiowaveModule', []).directive('ngAudiowave', function ($compile, Audio) {
        return {
            restrict: 'AE',
            scope: {
                audioOption: '='
            },
            link: function ($scope, $element, $attrs) {

                $element.css('display', 'block');

                //播放状态
                $scope.audioPlaying = false;

                //音频是否已经加载完成
                $scope.audioReady = false;

                //播放方法
                $scope.playAudio = function () {
                    if (wavesurfer) {
                        if ($scope.audioPlaying) {
                            wavesurfer.pause();
                        }
                        else {
                            wavesurfer.play();
                        }
                    }
                }

                var options = angular.extend({ container: '#wave' }, $attrs);
                options.normalize = true;
                options.cursorWidth = 2;

                // 修改了wavesurfer的源代码, 增加了一个minWaveformWidth. 
                // 因为Angularjs的自动绑定特性,在切换音频源时,会触发波形图区域的大小发生变化, 在wavesufer中获取绘图区域的clientwidth时=0,绘图过程停止.
                // 增加区域的最小宽度后解决该问题.
                options.minWaveformWidth = 480;

                //console.log(options);
                var wavesurfer = WaveSurfer.create(options);

                $scope.loadAudio = function (path) {
                    if (wavesurfer && path) {
                        wavesurfer.pause();
                        $scope.audioReady = false;
                        wavesurfer.load(path);
                        console.log("wavesurfer load audio:", path);
                    }
                }
                //watch AudioPath           
                $scope.$watch(function () {
                    return $scope.audioOption.AudioPath;
                }, function (newPath, oldPath) {
                    //console.log("$watch AudioPath:", newPath, oldPath);
                    if (newPath) {
                        $scope.loadAudio(newPath);
                    }
                })

                //init timeline and control button
                wavesurfer.on('ready', function () {
                    console.log("wavesurfer ready");

                    safeApply($scope, function () {
                        $scope.audioReady = true;
                    });
                    wavesurfer.play();

                    $scope.$emit('ngAudioWaveRenderFinished', wavesurfer);

                });

                //bind event
                function safeApply(scope, fn) {
                    (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
                }
                function setPlayingState(flag) {
                    safeApply($scope, function () {
                        $scope.audioPlaying = flag;
                    });
                }
                wavesurfer.on('play', function () {
                    Audio.stop();
                    setPlayingState(true);
                });
                wavesurfer.on('pause', function () {
                    setPlayingState(false);
                });
                wavesurfer.on('finish', function () {
                    setPlayingState(false);
                });

                wavesurfer.on('seek', function (seekProgress) {
                    //console.log("seek:", seekProgress);
                    wavesurfer.play();
                });
                wavesurfer.on('error', function (errorstring) {
                    console.log("error:", errorstring);
                });
                wavesurfer.on('loading', function (percent) {
                    //console.log("loading:", percent);
                });

                $scope.$on('$destroy', function () {
                    console.log("destroy");
                    wavesurfer.destroy();
                });

                $scope.$on('StopAudiowavePlay', function () {
                    console.log('StopAudiowavePlay');

                    Audio.stop();
                    if (wavesurfer) {
                        wavesurfer.pause();
                    }
                })

                $scope.$emit('ngAudioWaveInit', wavesurfer);

            },
            template: '<div><div id="wave" style="cursor: pointer;"></div><div id="wave-timeline"></div><div id="audiowave-control-button" style="text-align:center;"><button  id="btn-playAudio" ng-disabled="audioReady==false" class="btn btn-primary btn-sm" style="width:80px;" ng-click="playAudio()">{{ audioPlaying ? "暂停" : "播放"}}</button></div></div>'
        }
    })
});
