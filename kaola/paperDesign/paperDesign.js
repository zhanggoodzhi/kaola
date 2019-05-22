define(['angular', 'ng-table', '/web/components/directives/paperDesign/question.js', 'angular-ui-sortable'], function (angular) {
    'use strict';

    /*
    * Controllers
    */
    angular.module('app').controller('PaperDesignCtrl', ['$scope', '$rootScope', '$stateParams', 'NgTableParams', 'AuthService', 'Constants', 'PaperDesignService', '$state', 'ShowService', '$timeout', 'CommonBusinessService', function ($scope, $rootScope, $stateParams, NgTableParams, AuthService, Constants, PaperDesignService, $state, ShowService, $timeout, CommonBusinessService) {

        //#region main UI adjust
        $scope.HideSlideMenu = function () {
            angular.element("#sidebar_menu").hide();
            angular.element("#div_mainChildView").removeClass();
            angular.element("#div_mainChildView").addClass('col-xs-12 col-sm-12 col-md-12');
        }
        $scope.HideSlideMenu();
        $scope.Back2Paper = function () {
            $state.go("paper");
        }
        //#endregion

        //#region data structure define
        $scope.MAX_PAPER_TOTAL_SECONDS = 60 * 60;
        $scope.OriginalPaperID = "";
        $scope.CurrentPageIndex = 1;
        $scope.PaperName = "组卷测试";
        $scope.ValidatePaperNameMessage = "";
        $scope.ScoreRateOrderBy = 'DESC';//得分率的排序方式
        $scope.CurrentTabID = 0; //当前tabID
        $scope.Filter = {
            AreaType: [0],
            SearchText: '',
            PageSize: 10,
            CurrentPageIndex: 1,
            ScoreRateOrderBy: '' //得分率的排序方式

        }
        //所有题目数据的缓存
        $scope.PaperDesignQuestionDataCache = {
            TotalQuestionCount: 100,
            Data: []
        };

        $scope.PaperDesignDisplayData = {
            TotalQuestionCount: 0,
            Data: []
        };
        $scope.PaperDesignChoosedData = {
            PaperID: '',
            PaperName: '',
            PaperTotalSeconds: 0,
            PaperTotalScore: 0,
            TotalQuestionCount: 0,
            Data: []
        };

        $scope.HasMore = function () {
            if ($scope.Filter.PageSize * $scope.Filter.CurrentPageIndex > $scope.PaperDesignDisplayData.TotalQuestionCount) {
                return false;
            }
            return true;

        }
        //#endregion

        //#region QuestionData Cache
        $scope.UpdateQuestionDataCache = function (newData) {

            if ($scope.PaperDesignQuestionDataCache == undefined) {
                $scope.PaperDesignQuestionDataCache = {};
            }

            if ($scope.PaperDesignQuestionDataCache.Data == undefined) {
                $scope.PaperDesignQuestionDataCache.Data = [];
            }

            if (newData != undefined && newData.length > 0) {
                for (var i = 0; i < newData.length; i++) {
                    var newQuestion = newData[i];
                    if (newQuestion.QuestionModel != undefined && newQuestion.QuestionModel != null) {

                        var findCache = false;
                        if ($scope.PaperDesignQuestionDataCache != undefined
                            && $scope.PaperDesignQuestionDataCache.Data != undefined
                            && $scope.PaperDesignQuestionDataCache.Data.length > 0) {

                            var cacheData = $scope.PaperDesignQuestionDataCache.Data;
                            for (var j = 0; j < cacheData.length; j++) {
                                var cacheQuestionID = cacheData[j].QuestionID;
                                if (cacheQuestionID == newQuestion.QuestionID) {
                                    findCache = true;
                                    break;
                                }
                            }
                        }

                        if (findCache == false) {
                            //add question data into cache
                            $scope.PaperDesignQuestionDataCache.Data.push({
                                AreaID: newQuestion.AreaID,
                                AreaTitle: newQuestion.AreaTitle,
                                AreaType: newQuestion.AreaType,
                                AreaSeconds: newQuestion.AreaSeconds,
                                Index: newQuestion.Index,
                                PaperID: newQuestion.PaperID,
                                PaperName: newQuestion.PaperName,
                                QuestionID: newQuestion.QuestionID,
                                QuestionIndex: newQuestion.QuestionIndex,
                                QuestionScore: newQuestion.QuestionScore,
                                QuestionSeconds: newQuestion.QuestionSeconds,
                                ResourcePath: newQuestion.ResourcePath,
                                QuestionModel: newQuestion.QuestionModel,
                                ExtProperty: newQuestion.ExtProperty,
                                ScoreRate: newQuestion.ScoreRate,
                                AnswerCount: newQuestion.AnswerCount
                            })
                        }
                    }
                }
            }

            $scope.PaperDesignQuestionDataCache.TotalQuestionCount = $scope.PaperDesignQuestionDataCache.Data.length;

            console.log("Cache Data:", $scope.PaperDesignQuestionDataCache);
        }

        $scope.GetCachedQuestionModel = function (questionID, choosedFlag) {

            if ($scope.PaperDesignQuestionDataCache != undefined
                && $scope.PaperDesignQuestionDataCache.Data != undefined
                && $scope.PaperDesignQuestionDataCache.Data.length > 0) {
                for (var i = 0; i < $scope.PaperDesignQuestionDataCache.Data.length; i++) {
                    var item = $scope.PaperDesignQuestionDataCache.Data[i]
                    if (item.QuestionID == questionID) {
                        if (choosedFlag != undefined) {
                            item.IsChoosed = choosedFlag;
                        }
                        return item;
                    }
                }
            }
            return undefined;
        }

        $scope.GetCachedQuestionIDList = function () {
            return [];
            var cachedQuestionIDList = [];
            if ($scope.PaperDesignQuestionDataCache != undefined && $scope.PaperDesignQuestionDataCache.Data != undefined && $scope.PaperDesignQuestionDataCache.Data.length > 0) {
                for (var i = 0; i < $scope.PaperDesignQuestionDataCache.Data.length; i++) {
                    var questionID = $scope.PaperDesignQuestionDataCache.Data[i].QuestionID;
                    cachedQuestionIDList.push(questionID);
                }
            }
            return cachedQuestionIDList;
        }
        //#endregion

        //#region get areaType list
        $scope.AreaTypeList = [];
        $scope.LoadAreaType = function () {
            PaperDesignService.GetAreaType().then(function (result) {
                $scope.AreaTypeList = result.data;
            })
        }
        $scope.LoadAreaType();

        $scope.CurrentAreaTypeChoosed = "";
        $scope.AreaTypeChoosed = function (a) {
            if (a.AreaType == $scope.CurrentAreaTypeChoosed) { return; }

            a.Choosed = true;
            $scope.CurrentAreaTypeChoosed = a.AreaType;

            if (a.AreaType != 0 && a.Choosed) {
                for (var i = 0; i < $scope.AreaTypeList.length; i++) {
                    var aItem = $scope.AreaTypeList[i];

                    if (aItem.AreaType != a.AreaType) {
                        aItem.Choosed = false;
                    }
                }
            }
            if (a.AreaType == 0 && a.Choosed) {
                for (var i = 0; i < $scope.AreaTypeList.length; i++) {
                    var aItem = $scope.AreaTypeList[i];
                    if (aItem.AreaType != 0) {
                        aItem.Choosed = false;
                    }
                }
            }
            $scope.CurrentPageIndex = 1;
            $scope.Search();
        }
        //#endregion

        //#region search function
        $scope.SearchText = function () {

            $scope.CurrentPageIndex = 1;
            $scope.PaperDesignDisplayData.TotalQuestionCount = 0;
            //清空显示的数据 
            $scope.PaperDesignDisplayData.Data.splice(0, $scope.PaperDesignDisplayData.Data.length);


            $scope.Search();
        }
        $scope.LoadMore = function () {
            $scope.CurrentPageIndex += 1;
            $scope.Search();
        }

        $scope.Search = function () {

            $rootScope.SearchText = '';
            if ($scope.Filter.SearchText != undefined && $scope.Filter.SearchText != '') {
                $rootScope.SearchText = $scope.Filter.SearchText;
            }

            $scope.Filter.CurrentPageIndex = $scope.CurrentPageIndex;

            $scope.Filter.AreaType = [];
            for (var i = 0; i < $scope.AreaTypeList.length; i++) {
                var aItem = $scope.AreaTypeList[i];
                if (aItem.Choosed) {
                    $scope.Filter.AreaType.push(aItem.AreaType);
                }
            }
            $scope.Filter.CachedQuestionIDList = $scope.GetCachedQuestionIDList();

            if ($scope.CurrentTabID == 2) {
                $scope.Filter.ScoreRateOrderBy = $scope.ScoreRateOrderBy;
            } else {
                $scope.Filter.ScoreRateOrderBy = '';
            }

            console.log("Search Filter:", $scope.Filter);
            PaperDesignService.Search($scope.Filter).then(function (result) {

                var data = result.data;
                console.log("Search Result:", data);
                if (data.length == 0) {
                    $("#searchButton").html("未查询到数据");
                }
                else {
                    $("#searchButton").html("点击加载更多试题");
                }
                $scope.PaperDesignDisplayData.TotalQuestionCount = data.TotalQuestionCount;

                //处理缓存数据
                $scope.UpdateQuestionDataCache(data.Data);

                //根据页面索引决定是重新绑定数据,还是增量添加数据
                var pageIndex = data.CurrentPageIndex;
                if (pageIndex == 1) {
                    //清空显示的数据后重新赋值
                    $scope.PaperDesignDisplayData.Data.splice(0, $scope.PaperDesignDisplayData.Data.length);

                }
                for (var i = 0; i < data.Data.length; i++) {
                    var q = data.Data[i];
                    var qModel = $scope.GetCachedQuestionModel(q.QuestionID);
                    $scope.PaperDesignDisplayData.Data.push(qModel);
                }
                $scope.UpdateDisplayQuestionItems();

                console.log("Display Data:", $scope.PaperDesignDisplayData);
            })
        }

        //更新显示题目列表上的"已选择"属性
        $scope.UpdateDisplayQuestionItems = function (item, choosedFlag) {
            if (item == undefined || item.QuestionID == undefined) {
                //update all

                var findChoosed = false;
                if ($scope.PaperDesignDisplayData.Data != undefined && $scope.PaperDesignDisplayData.Data.length > 0) {
                    for (var disIndex = 0; disIndex < $scope.PaperDesignDisplayData.Data.length; disIndex++) {
                        var displayItem = $scope.PaperDesignDisplayData.Data[disIndex];
                        var findQuestionID = displayItem.QuestionID;

                        findChoosed = false;
                        if ($scope.PaperDesignChoosedData.Data != undefined && $scope.PaperDesignChoosedData.Data.length > 0) {
                            for (var i = 0; i < $scope.PaperDesignChoosedData.Data.length; i++) {
                                var questions = $scope.PaperDesignChoosedData.Data[i].Questions;
                                if (questions != undefined && questions.length > 0) {
                                    for (var j = 0; j < questions.length; j++) {
                                        var chooseQuestionID = questions[j].QuestionID;
                                        if (findQuestionID == chooseQuestionID) {
                                            findChoosed = true;
                                            break;
                                        }
                                    }
                                }
                                if (findChoosed) {
                                    break;
                                }
                            }
                        }
                        displayItem.IsChoosed = findChoosed;
                    }
                }

            } else {
                //update item
                var chooseQuestionID = item.QuestionID;

                if ($scope.PaperDesignDisplayData.Data != undefined && $scope.PaperDesignDisplayData.Data.length > 0) {
                    for (var j = 0; j < $scope.PaperDesignDisplayData.Data.length; j++) {
                        var displayItem = $scope.PaperDesignDisplayData.Data[j];
                        var findQuestionID = displayItem.QuestionID;
                        if (findQuestionID == chooseQuestionID) {
                            if (choosedFlag == undefined) {
                                choosedFlag = false;
                            }
                            displayItem.IsChoosed = choosedFlag;
                            break;
                        }
                    }
                }
            }

        }
        //#endregion

        //#region  choose/unchoose question
        $scope.$on('Operation_Choose', function (d, data) {
            console.log("Operation_Choose:", data);
            $scope.ChooseQuestion(data);
        });
        $scope.$on('Operation_Remove', function (d, data) {
            console.log("Operation_Remove:", data);
            $scope.UnChooseQuestion(data);
        });
        $scope.ChooseQuestion = function (d) {
            //add
            var findArea = false;
            var findQuestion = false;


            if ($scope.PaperDesignChoosedData.Data != undefined) {
                // find existing area 
                for (var i = 0; i < $scope.PaperDesignChoosedData.Data.length; i++) {
                    var areaItem = $scope.PaperDesignChoosedData.Data[i];

                    if (areaItem.AreaType == d.AreaType) {
                        findArea = true;

                        if (areaItem.Questions == undefined) {
                            areaItem.Questions = [];
                        }

                        for (var j = 0; j < areaItem.Questions.length; j++) {
                            var qItem = areaItem.Questions[j];
                            if (qItem.QuestionID == d.QuestionID) {
                                findQuestion = true;
                            }
                        }
                        if (findQuestion == false) {

                            var questionItem = {
                                Index: 1,
                                AreaType: d.AreaType,
                                QuestionID: d.QuestionID,
                                QuestionScore: d.QuestionScore,
                                QuestionSeconds: d.QuestionSeconds,
                                ExtProperty: {}
                            };

                            if (d.ExtProperty != undefined) {
                                questionItem.ExtProperty = d.ExtProperty;
                            }
                            areaItem.Questions.push(questionItem);
                        }

                    }
                }
                if (findArea == false) {
                    var newAreaItem = {
                        Index: 1,
                        AreaID: d.AreaID,
                        AreaType: d.AreaType,
                        AreaTitle: d.AreaTitle,
                        AreaSeconds: d.AreaSeconds,
                        Questions: [{
                            Index: 1,
                            AreaType: d.AreaType,
                            QuestionID: d.QuestionID,
                            QuestionScore: d.QuestionScore,
                            QuestionSeconds: d.QuestionSeconds,
                            ExtProperty: {}
                        }]
                    }
                    if (d.ExtProperty != undefined) {
                        newAreaItem.Questions[0].ExtProperty = d.ExtProperty;
                    }
                    $scope.PaperDesignChoosedData.Data.push(newAreaItem);
                }
            }
            $scope.UpdateDisplayQuestionItems(d, true);
            $scope.UpdatePaperDesignChoosedDataProperty();
            $scope.ResizeMyPaperContentMaxHeight();
        }

        $scope.UnChooseQuestion = function (d, areaType) {
            //remove
            var findQuestion = false;
            var needRemoveArea = false;
            if ($scope.PaperDesignChoosedData.Data != undefined && $scope.PaperDesignChoosedData.Data.length > 0) {
                for (var i = 0; i < $scope.PaperDesignChoosedData.Data.length; i++) {
                    var areaItem = $scope.PaperDesignChoosedData.Data[i];
                    if (areaType != undefined && areaItem.AreaType != areaType) {
                        continue;
                    }

                    if (areaItem.Questions != undefined && areaItem.Questions.length > 0) {
                        for (var j = 0; j < areaItem.Questions.length; j++) {
                            var qItem = areaItem.Questions[j];
                            if (qItem.QuestionID == d.QuestionID) {
                                areaItem.Questions.splice(j, 1);
                                findQuestion = true;
                                break;
                            }
                        }
                        if (areaItem.Questions.length == 0) {
                            needRemoveArea = true;
                            $scope.PaperDesignChoosedData.Data.splice(i, 1);
                            break;
                        }
                    }
                }
            }
            $scope.UpdateDisplayQuestionItems(d, false);
            $scope.UpdatePaperDesignChoosedDataProperty();


            $scope.ResizeMyPaperContentMaxHeight();
        }

        $scope.UnChooseAllQuestion = function () {

            $scope.openCommonModalDialog("确认", "您确定要清空所有已选试题吗?", function () {
                var allQuestions = [];
                if ($scope.PaperDesignChoosedData.Data != undefined && $scope.PaperDesignChoosedData.Data.length > 0) {
                    for (var i = 0; i < $scope.PaperDesignChoosedData.Data.length; i++) {
                        var areaItem = $scope.PaperDesignChoosedData.Data[i];
                        if (areaItem.Questions != undefined && areaItem.Questions.length > 0) {

                            for (var j = 0; j < areaItem.Questions.length; j++) {
                                var qItem = areaItem.Questions[j];
                                allQuestions.push({ QuestionID: qItem.QuestionID, AreaType: qItem.AreaType });
                            }
                        }
                    }
                }

                for (var i = 0; i < allQuestions.length; i++) {
                    $scope.UnChooseQuestion(allQuestions[i]);
                }
            });

        }

        $scope.UpdatePaperDesignChoosedDataProperty = function (checkMins) {
            var areaIndex = 1;
            var questionIndex = 1;
            var PaperTotalSeconds = 0;
            var PaperTotalScore = 0;
            var TotalQuestionCount = 0;

            if ($scope.PaperDesignChoosedData.Data != undefined && $scope.PaperDesignChoosedData.Data.length > 0) {
                for (var i = 0; i < $scope.PaperDesignChoosedData.Data.length; i++) {
                    var areaItem = $scope.PaperDesignChoosedData.Data[i];
                    areaItem.Index = areaIndex;
                    areaIndex++;

                    PaperTotalSeconds += areaItem.AreaSeconds;

                    questionIndex = 1;
                    if (areaItem.Questions != undefined && areaItem.Questions.length > 0) {
                        for (var j = 0; j < areaItem.Questions.length; j++) {
                            var qItem = areaItem.Questions[j];
                            qItem.Index = questionIndex;
                            questionIndex++;

                            PaperTotalSeconds += qItem.QuestionSeconds;
                            PaperTotalScore += qItem.QuestionScore;

                        }
                        TotalQuestionCount += areaItem.Questions.length;
                    }

                }
            }
            $scope.PaperDesignChoosedData.TotalQuestionCount = TotalQuestionCount;
            $scope.PaperDesignChoosedData.PaperTotalSeconds = PaperTotalSeconds;
            $scope.PaperDesignChoosedData.PaperTotalScore = PaperTotalScore;
            if (!checkMins) {
                if ($scope.PaperDesignChoosedData.PaperTotalSeconds > $scope.MAX_PAPER_TOTAL_SECONDS) {
                    console.log("试卷时长超出" + $scope.MAX_PAPER_TOTAL_SECONDS);
                    angular.element('#PaperTotalSecondsInfoDialog').modal({ backdrop: 'static', keyboard: false });
                }
            }
            //console.log("PaperDesignChoosedDataProperty:", $scope.PaperDesignChoosedData);
        }

        $scope.ChangeScore = function (q, areaType) {
            console.log(q);
            //1. 单小题, Contents.length=1
            //分数= ExtProperty.Contents[0].Score

            //2. 多小题, Contents.length>1
            //分数= ExtProperty.Contents[i].Score
            //3. 跟读与模仿16
            //分数= question.QuestionScore
            //4. 听后记录并转述信息25
            //第一节分数 = ExtProperty.Contents[i].Score , i !=last index
            //第二节分数 = ExtProperty.Contents[i].Score,  i=last index
            //5. 信息转述与询问26
            //第一节分数 = ExtProperty.Contents[0].Score , i =0
            //第二节分数 = ExtProperty.RelationQuestionModel.ExtProperty.Contents[i].Score
            if (areaType != 16 && areaType != 25 && areaType != 26) {
                var questionScore = 0;
                for (var i = 0; i < q.ExtProperty.Contents.length; i++) {
                    questionScore += q.ExtProperty.Contents[i].Score;
                }
                q.QuestionScore = questionScore;
            }

            if (areaType == 16) {
                q.QuestionScore = q.QuestionScore;
            }

            if (areaType == 25) {
                var questionScore = 0;
                for (var i = 0; i < q.ExtProperty.Contents.length; i++) {

                    questionScore += q.ExtProperty.Contents[i].Score;
                }
                q.QuestionScore = questionScore;
            }

            if (areaType == 26) {
                var questionScore = 0;
                for (var i = 0; i < q.ExtProperty.Contents.length; i++) {
                    questionScore += q.ExtProperty.Contents[i].Score;
                }
                if (q.ExtProperty.RelationQuestionModel != undefined
                    && q.ExtProperty.RelationQuestionModel.ExtProperty.Contents != undefined) {
                    var refContent = q.ExtProperty.RelationQuestionModel.ExtProperty.Contents;
                    for (var i = 0; i < refContent.length; i++) {
                        questionScore += refContent[i].Score;
                    }
                }

                q.QuestionScore = questionScore;
            }
            $scope.UpdatePaperDesignChoosedDataProperty(true);
        }

        //#endregion

        //#region paper design temp data
        $scope.LoadPaperDesignTempData = function (paperID) {
            console.log("LoadPaperDesignTempData:", paperID);
            PaperDesignService.LoadPaperDesignTempData(paperID).then(function (result) {
                var data = result.data;

                console.log("LoadPaperDesignTempData Result:", data);

                //处理缓存数据
                $scope.UpdateQuestionDataCache(data.QuestionModelList);

                $scope.PaperDesignChoosedData = data.ChoosedData;

                //处理已选数据 
                for (var i = 0; i < data.QuestionModelList.length; i++) {
                    var choosedQuestionItem = data.QuestionModelList[i];
                    $scope.UpdateDisplayQuestionItems(choosedQuestionItem, true);
                    $scope.UpdatePaperDesignChoosedDataProperty();
                }

                $scope.Search();
            })
        }
        //#endregion

        //#region get init param

        var stateParam = $state.params;
        console.log("stateParam:", stateParam);
        if (stateParam != undefined && stateParam.paperID != undefined && stateParam.paperID != '') {
            $scope.PaperDesignChoosedData.PaperID = stateParam.paperID;
            $scope.LoadPaperDesignTempData(stateParam.paperID);
            if (stateParam.originalPaperID != undefined && stateParam.originalPaperID != '') {
                $scope.OriginalPaperID = stateParam.originalPaperID;
            }
        } else {
            $scope.PaperDesignChoosedData.PaperID = guid();
            console.log("PaperDesignChoosedData:", $scope.PaperDesignChoosedData);
            $scope.Search();
        }
        //#endregion

        //#region adjust UI for scorll and float panel
        $scope.InitAreaTypeFinished = function () {

            //console.log("areaType in header filter repeat finished , InitAreaTypeFinished");

            var filterWidth = $('.areatype-filter').width();
            var filterTitleWidth = $('.areatype-filter-title').width();
            var itemsDivWidth = filterWidth - filterTitleWidth - 50;
            $('.areatype-filter-items-div').width(itemsDivWidth);

            $timeout(function () {
                var itemsDivHeight = $('.areatype-filter-items-div').outerHeight();
                $('.areatype-filter-title').height(itemsDivHeight);
                $('.areatype-filter').height(itemsDivHeight);

                var areaTypeFilterTop = $('.areatype-filter').offset().top;
                var myPaperDivTop = areaTypeFilterTop + itemsDivHeight + 18;
                $('.mypaper-container').css('top', myPaperDivTop + "px");
                $scope.ResizeMyPaperContentMaxHeight();

                var areaTypeFilterLeft = $('.areatype-filter').offset().left;
                var areaTypeFilterWidth = $('.areatype-filter').width();
                var myPaperDivWidth = $('.mypaper-container').width();
                var myPaperDivLeft = areaTypeFilterLeft + areaTypeFilterWidth - myPaperDivWidth;
                $('.mypaper-container').css('left', myPaperDivLeft + "px");
            }, 10);

        }
        $scope.InitAreaTypeFinishedForScroll = function (showFlag) {
            //console.log("areaType in Scroll filter repeat finished , InitAreaTypeFinishedForScroll");
            //init scroll part
            var containerWidth = $('.areatype-filter').width() - 20;
            $('.areatype-filter-scroll-container').width(containerWidth);
            var filterWidth = containerWidth - 20;
            var filterTitleWidth = $('.areatype-filter-title-scroll').width();
            var itemsDivWidth = filterWidth - filterTitleWidth - 250 - 20;
            $('.areatype-filter-items-div-scroll').width(itemsDivWidth);
            //console.log(itemsDivWidth);
            $timeout(function () {
                var itemsDivHeight = $('.areatype-filter-items-div-scroll').outerHeight();
                $('.areatype-filter-title-scroll').height(itemsDivHeight - 2);
                $('.areatype-filter-scroll').height(itemsDivHeight);
                $('.areatype-filter-scroll-container').height(itemsDivHeight);
                //console.log(itemsDivHeight);   
                if (showFlag) {
                    var myPaperDivTop = itemsDivHeight + 18 + 18;
                    $('.mypaper-container').css('top', myPaperDivTop + "px");
                    $scope.ResizeMyPaperContentMaxHeight();
                }

            }, 10);
        }
        $scope.ResizeMyPaperContentMaxHeight = function () {
            //console.log("myPaper areaItem repeat finished, ResizeMyPaperContentMaxHeight");
            var windowHeight = $(window).height();
            //console.log("windowHeight:" + windowHeight);
            var myPaperDivTop = $('.mypaper-container').position().top;
            //console.log("myPaperDivTop:" + myPaperDivTop);
            var myPaperDivContentMaxHeight = windowHeight - myPaperDivTop - 200;
            //console.log("myPaperDivContentMaxHeight:" + myPaperDivContentMaxHeight);
            $('.mypaper-questions').css('max-height', myPaperDivContentMaxHeight);

            var actualMyPaperContentDivHeight = $('.mypaper-questions .mCSB_container').height();
            //console.log("actualMyPaperContentDivHeight:" + actualMyPaperContentDivHeight);

            if (actualMyPaperContentDivHeight > myPaperDivContentMaxHeight) {
                $('.mypaper-questions').css('height', actualMyPaperContentDivHeight);
            } else {
                $('.mypaper-questions').css('height', '');
            }


        }

        $(window).on('resize.doResize', function () {
            //console.log(window.innerWidth);
            $scope.InitAreaTypeFinished();
            $scope.InitAreaTypeFinishedForScroll();
            $scope.ResizeMyPaperContentMaxHeight();
        });
        $(window).on('scroll', function () {
            var t = document.documentElement.scrollTop || document.body.scrollTop;
            //console.log(t);
            var topToShowScrollFilter = 500;
            var containerElement = $('.papercontent-container');
            if (containerElement) {
                var containerTop = containerElement.offset().top;
                topToShowScrollFilter = containerTop + 50;
            }

            if (t > topToShowScrollFilter) {
                $('.areatype-filter-scroll-container').fadeIn(200);
                $scope.InitAreaTypeFinishedForScroll(true);
            }
            else {
                $('.areatype-filter-scroll-container').fadeOut(200);
                $scope.InitAreaTypeFinished();
            }
        });
        $scope.$on('$destroy', function () {
            // remove the handler  
            $(window).off('resize.doResize');
            $(window).off('scroll');
        });
        //#endregion  adjust areaType UI

        //#region  save and preview
        $scope.ShowSaveDialog = function () {

            //检查小题的分数, 要求同一题型内,小题分数一致
            //if ($scope.CheckContentScore() == false) {
            //    return;
            //}

            //bug#11081 如果超出60分钟，是不可以保存的
            if ($scope.PaperDesignChoosedData.PaperTotalSeconds > $scope.MAX_PAPER_TOTAL_SECONDS) {
                $rootScope.openCommonErrorDialog("错误", "已选试题的考试时长已经超过60分钟");
                return;
            }


            $scope.PaperName = $scope.PaperDesignChoosedData.PaperName;
            angular.element('#SavePaperDialog').modal({ backdrop: 'static', keyboard: false });
        }
        $scope.SaveButtonDisabled = false;
        $scope.Save = function () {
            $scope.ValidatePaperNameMessage = "";
            if ($scope.PaperName == null || $scope.PaperName == "") {
                $scope.ValidatePaperNameMessage = "试卷名称不能为空!";
                return;
            }
            if ($scope.PaperName.length > 30) {
                $scope.ValidatePaperNameMessage = "试卷名称最多可输入30个字符!";
                return;
            }

            //check paper name if duplicate
            var data = {
                PaperID: $scope.PaperDesignChoosedData.PaperID,
                PaperName: $scope.PaperName,
                OriginalPaperID: $scope.OriginalPaperID
            };
            PaperDesignService.CheckPaperNameDuplicate(data).then(function (response) {
                var success = response.data.Success;

                if (success) {

                    angular.element('#SavePaperDialog').modal('hide');

                    //show progress dialog
                    $scope.StartGeneratePaperProgress();

                    $scope.PaperDesignChoosedData.PaperName = $scope.PaperName;

                    PaperDesignService.SavePaperDesignTempData($scope.PaperDesignChoosedData).then(function (response) {
                        console.log("SavePaperDesignTempData result:", response);
                        if (response.data.Success) {
                            console.log("保存试卷数据成功");
                            $scope.GeneratePaper();
                        } else {
                            $scope.StopGeneratePaperProgress();

                            var msg = response.data.State;
                            $rootScope.openCommonErrorDialog("错误", "保存试卷数据失败," + msg);
                        }
                    }, function (error) {
                        console.log("保存试卷数据出错:", error);
                        $scope.StopGeneratePaperProgress();

                        $rootScope.openCommonErrorDialog("错误", "保存试卷数据出错");
                    });
                } else {
                    $scope.ValidatePaperNameMessage = "存在重复的试卷名称!";
                }
            })

        }

        $scope.PaperGenerateResult = '';
        $scope.GeneratePaper = function () {
            var paperID = $scope.PaperDesignChoosedData.PaperID;
            var originalPaperID = $scope.OriginalPaperID;
            var paperData = {
                PaperID: paperID,
                OriginalPaperID: originalPaperID,
                PaperName: $scope.PaperName
            };

            PaperDesignService.GeneratePaper(paperData).then(function (response) {
                console.log("GeneratePaper result:", response);
                if (response.data.Success) {

                    $scope.GeneratePaperPercent = 100;
                    $scope.StopGeneratePaperProgress();

                    //open paper preview in new page
                    var finalPaperID = response.data.State;
                    console.log("生成试卷成功, 试卷编号:", finalPaperID);
                    var href = "index.html#/paperpreview?paperID=" + finalPaperID;
                    window.open(href, '_blank');

                } else {

                    $scope.StopGeneratePaperProgress();

                    var msg = "生成试卷失败\r\n";
                    msg += "试卷名称[" + paperData.PaperName + "],试卷编号[" + paperData.PaperID + "]\r\n\r\n";
                    msg += response.data.State;
                    $scope.PaperGenerateResult = msg;
                    angular.element('#PaperGenerateResultDialog').modal({ backdrop: 'static', keyboard: false });
                }

            }, function (error) {
                console.log("生成试卷出错:", error);
                $scope.StopGeneratePaperProgress();

                $rootScope.openCommonErrorDialog("错误", "生成试卷出错");
            });
        }

        $scope.StartGeneratePaperProgress = function () {
            $scope.SaveButtonDisabled = true;
            $scope.GeneratePaperPercent = 0;
            angular.element('#GeneratePaperProgressDialog').modal({ backdrop: 'static', keyboard: false });

            $scope.updateGeneratePaperPercentPercent();
        }
        $scope.StopGeneratePaperProgress = function () {
            $scope.SaveButtonDisabled = false;

            if ($scope.updateGeneratePaperPercentPercentTimer != null) {
                $timeout.cancel($scope.updateGeneratePaperPercentPercentTimer);
            }
            angular.element('#GeneratePaperProgressDialog').modal('hide');
        }
        $scope.GeneratePaperPercent = 0;
        $scope.updateGeneratePaperPercentPercent = function () {
            $scope.updateGeneratePaperPercentPercentTimer = $timeout(function () {
                if ($scope.GeneratePaperPercent > 80) {
                    //nothing to do 
                } else {
                    var p = Math.ceil(Math.random() * 10);
                    console.log(p);
                    $scope.GeneratePaperPercent += p;
                }

                $scope.updateGeneratePaperPercentPercent();

            }, 300);
        }
        $scope.updateGeneratePaperPercentPercentTimer = null;

        $scope.CheckContentScore = function () {
            var checkValid = true;
            var data = $scope.PaperDesignChoosedData.Data;
            if (data != undefined && data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    var areaItem = data[i];
                    if (areaItem.AreaType != 25 && areaItem.AreaType != 26 && areaItem.AreaType != 16) {
                        var questions = areaItem.Questions;
                        var scoreCount = 1;
                        var score = undefined;
                        for (var qIndex = 0; qIndex < questions.length; qIndex++) {
                            var contents = questions[qIndex].ExtProperty.Contents;
                            for (var cIndex = 0; cIndex < contents.length; cIndex++) {
                                if (score === undefined) {
                                    score = contents[cIndex].Score;
                                }
                                if (score === undefined
                                    || score === null
                                    || score === 0
                                    || contents[cIndex].Score === undefined
                                    || contents[cIndex].Score === null
                                    || contents[cIndex].Score === 0
                                   ) {
                                    checkValid = false;
                                    $rootScope.openCommonErrorDialog("错误", "题型[" + areaItem.AreaTitle + "]中小题分数不能为空或者零");
                                    return checkValid;

                                }
                                if (score === undefined
                                    || score === null
                                    || contents[cIndex].Score === undefined
                                    || contents[cIndex].Score === null
                                   ) {
                                    scoreCount++;
                                }
                            }
                        }
                        if (scoreCount > 1) {
                            checkValid = false;
                            $rootScope.openCommonErrorDialog("错误", "请检查题型[" + areaItem.AreaTitle + "]中小题的分数,小题分数应该一致");
                            return checkValid;
                        }
                    }
                    if (areaItem.AreaType == 16) {
                        var questions = areaItem.Questions;
                        var scoreCount = 1;
                        var score = undefined;
                        for (var qIndex = 0; qIndex < questions.length; qIndex++) {
                            var contents = questions[qIndex].ExtProperty.Contents;
                            if (contents.length > 0) {
                                if (score === undefined) {
                                    score = contents[0].Score;
                                }
                                if (score === undefined
                                    || score === null
                                    || contents[0].Score === undefined
                                    || contents[0].Score === null
                                    || score !== contents[0].Score) {
                                    scoreCount++;
                                }
                            }
                        }
                    }
                    if (areaItem.AreaType == 25) {
                        var questions = areaItem.Questions;
                        for (var qIndex = 0; qIndex < questions.length; qIndex++) {

                            var scoreCount = 1;
                            var score = undefined;
                            var contents = questions[qIndex].ExtProperty.Contents;
                            for (var cIndex = 0; cIndex < contents.length - 1; cIndex++) {
                                if (score === undefined) {
                                    score = contents[cIndex].Score;
                                }
                                if (score === undefined
                                    || score === null
                                    || contents[cIndex].Score === undefined
                                    || contents[cIndex].Score === null
                                    || score !== contents[cIndex].Score) {
                                    scoreCount++;
                                }
                            }
                            if (scoreCount > 1) {
                                checkValid = false;
                                $rootScope.openCommonErrorDialog("分数验证错误", "请检查题型[" + areaItem.AreaTitle + "]中第" + questions[qIndex].Index + "题的第一部分小题的分数,小题分数应该一致");
                                return checkValid;
                            }
                        }
                    }
                    if (areaItem.AreaType == 26) {
                        var questions = areaItem.Questions;
                        for (var qIndex = 0; qIndex < questions.length; qIndex++) {

                            var scoreCount = 1;
                            var score = undefined;
                            var contents = questions[qIndex].ExtProperty.RelationQuestionModel.ExtProperty.Contents;
                            for (var cIndex = 0; cIndex < contents.length - 1; cIndex++) {
                                if (score === undefined) {
                                    score = contents[cIndex].Score;
                                }
                                if (score === undefined
                                    || score === null
                                    || contents[cIndex].Score === undefined
                                    || contents[cIndex].Score === null
                                    || score !== contents[cIndex].Score) {
                                    scoreCount++;
                                }
                            }
                            if (scoreCount > 1) {
                                checkValid = false;
                                $rootScope.openCommonErrorDialog("分数验证错误", "请检查题型[" + areaItem.AreaTitle + "]中第" + questions[qIndex].Index + "题的第二部分小题的分数,小题分数应该一致");
                                return checkValid;
                            }
                        }
                    }
                }
            }

            return checkValid;
        }
        //#endregion

        //#region drag and drop by angular-ui-sortable


        $scope.sortAreaOptions = {
            'update': function (e, ui) {
                console.log("update area");
            },
            'stop': function (e, ui) {
                console.log("stop area");
                $scope.SortArea();
            }
        };
        $scope.sortQuestionOptions = {
            'update': function (e, ui) {
                console.log("update question");
            },
            'stop': function (e, ui) {
                if (ui != undefined && ui.item != undefined && ui.item.length > 0) {
                    var qID = ui.item[0].getAttribute('id');
                    console.log("stop question:", qID);
                    var arr = qID.split('_');
                    if (arr.length >= 4) {
                        var areaType = arr[1];
                        $scope.SortQuestion(areaType);
                    }


                }

            }
        };
        $scope.SortArea = function () {
            var aElementList = $('.area_draggable');
            if (aElementList != undefined && aElementList.length > 0) {
                var newAIndexList = [];
                for (var aIndex = 0; aIndex < aElementList.length; aIndex++) {
                    var element = aElementList[aIndex];
                    var elementID = element.getAttribute('id');
                    var arr = elementID.split('_');
                    if (arr.length >= 2) {
                        var areaType = arr[1];
                        newAIndexList.push({ index: aIndex + 1, areaType: areaType });
                    }
                }
                console.log("newAIndexList:", newAIndexList);

                var originalAreaList = $scope.PaperDesignChoosedData.Data;
                var newAreaList = [];

                for (var j = 0; j < newAIndexList.length; j++) {
                    var findAreaIndex = newAIndexList[j].index;
                    var findAreaType = newAIndexList[j].areaType;

                    var findAreaItem = undefined;
                    for (var oj = 0; oj < originalAreaList.length; oj++) {
                        if (originalAreaList[oj].AreaType == findAreaType) {
                            findAreaItem = originalAreaList[oj];
                            break;
                        }
                    }
                    if (findAreaItem != undefined) {
                        findAreaItem.Index = findAreaIndex;
                        newAreaList.push(findAreaItem);
                    }
                }
                console.log("newAreaList:", newAreaList);
                $scope.PaperDesignChoosedData.Data = newAreaList;
            }
        }
        $scope.SortQuestion = function (dragAreaType) {
            var qElementList = $('.question_draggable');
            if (qElementList != undefined && qElementList.length > 0) {
                var newQIndexList = [];
                var currentQuestionIndex = 0;
                for (var qIndex = 0; qIndex < qElementList.length; qIndex++) {
                    var element = qElementList[qIndex];
                    var elementID = element.getAttribute('id');
                    var arr = elementID.split('_');
                    if (arr.length >= 4) {
                        var areaType = arr[1];
                        var qID = arr[3];
                        if (areaType == dragAreaType) {
                            currentQuestionIndex++;
                            newQIndexList.push({
                                index: currentQuestionIndex,
                                areaType: areaType,
                                questionID: qID
                            });
                        }

                    }
                }
                console.log("newQIndexList:", newQIndexList);

                var updateAreaType = dragAreaType;

                for (var i = 0; i < $scope.PaperDesignChoosedData.Data.length; i++) {
                    var areaItem = $scope.PaperDesignChoosedData.Data[i];
                    if (areaItem.AreaType == updateAreaType) {
                        var originalQuestionList = areaItem.Questions;
                        var newQuestionList = [];

                        for (var j = 0; j < newQIndexList.length; j++) {
                            var findQuestionIndex = newQIndexList[j].index;
                            var findQuestionID = newQIndexList[j].questionID;

                            var findQuestionItem = undefined;
                            for (var oj = 0; oj < originalQuestionList.length; oj++) {
                                if (originalQuestionList[oj].QuestionID == findQuestionID) {
                                    findQuestionItem = originalQuestionList[oj];
                                    break;
                                }
                            }
                            if (findQuestionItem != undefined) {
                                findQuestionItem.Index = findQuestionIndex;
                                newQuestionList.push(findQuestionItem);
                            }
                        }

                        console.log("newQuestionList:", newQuestionList);
                        areaItem.Questions = newQuestionList;

                        break;
                    }
                }
            }
            $scope.$apply();
        }
        //#endregion

        //#region miscellaneous methods 
        $scope.PaperDesignTabChange = function (tabID) {

            if ($scope.CurrentTabID != tabID) {
                if (($scope.CurrentTabID == 0 && tabID == 2)
                    || ($scope.CurrentTabID == 2 && tabID == 0)) {
                    $scope.CurrentTabID = tabID;
                    $scope.Filter.CurrentPageIndex = 1;
                    $scope.CurrentPageIndex = 1;
                    $scope.Search();
                    return;
                }

                $scope.CurrentTabID = tabID;
            }

            if ($scope.CurrentTabID == tabID) {

                if (tabID == 2) {
                    console.log("ScoreRateOrderBy:", $scope.ScoreRateOrderBy);
                    $scope.ScoreRateOrderBy = ($scope.ScoreRateOrderBy == 'DESC' ? 'ASC' : 'DESC');
                    $scope.Filter.CurrentPageIndex = 1;
                    $scope.CurrentPageIndex = 1;
                    $scope.Search();
                    return;
                }
            }

        }
        //#endregion


        //#region  search text highlight
        $scope.QuestionRepeatFinished = function () {
            console.log("questionRepeatFinished");
            if ($rootScope.SearchText != undefined && $rootScope.SearchText != '') {
                CommonBusinessService.HighlightSearchTextAsync($rootScope.SearchText);
            }
        }
        //#endregion
    }])

/*
* Services
*/
    .service('PaperDesignService', function ($http, Constants) {
        var self = this;

        self.LoadPaperDesignTempData = function (paperID) {
            return $http.get(GLOBAL_API_URL + 'api/paperdesign/tempdata/' + paperID);
        }
        self.SavePaperDesignTempData = function (tempData) {
            return $http.post(GLOBAL_API_URL + 'api/paperdesign/tempdata/save', tempData);
        }
        self.GetAreaType = function () {
            return $http.get(GLOBAL_API_URL + 'api/paperdesign/areatypelist');
        }
        self.Search = function (filter) {
            return $http.post(GLOBAL_API_URL + 'api/paperdesign/search', filter);
        }
        self.GeneratePaper = function (paperData) {
            return $http.post(GLOBAL_API_URL + 'api/paperdesign/generatePaper', paperData);
        }
        self.CheckPaperNameDuplicate = function (paperData) {
            return $http.post(GLOBAL_API_URL + 'api/paperdesign/checkPaperNameDuplicate', paperData);
        }
    })


    /*
    * Directives
    */

});
