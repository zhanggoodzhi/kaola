define(function () {
    'use strict';
    var html =
        '<link rel="stylesheet" type="text/css" href="components/directives/questionDetail/student-report/studentreport_paperanlysis.css" />' +
        '<link rel="stylesheet" type="text/css" href="kaola/report/student/studentreport_taskdetail.css" />' +
        '<div class="" style="width: 930px;margin: 0 auto;height:100%;">' +
        '    <div class="content-container" style="margin:0 auto; width: 900px;box-shadow: 0px 0px 5px #d0d0d0;background-color:#ffffff;min-height:100%;margin-bottom:10px;">' +
        '        <div class="report-title">' +
        '            <div style="width: 100%;padding-right: 160px;float: left;">' +
        '                <div class="row" style="width:100%;padding-left:20px;">' +
        '                    <label class="report-title-taskname">{{StudentTaskData.TaskName}}</label><label class="report-title-taskdesc">(总分:&nbsp;{{StudentTaskData.PaperScore|roundMin0Max2Filter}} &nbsp;&nbsp;日期:&nbsp;{{StudentTaskData.TaskFinishedTime|fixedTimeFilter}})</label>' +
        '                </div>' +
        '                <div class="row" style="width:100%;">' +
        '                    <img src="img/report/ksmc-bg.jpg" style="height:12px;width:99%;" />' +
        '                </div>' +
        '            </div>' +
        '            <div style="width:153px; float: right;position: relative;margin-top: -40px;">' +
        '                <img src="img/report/logo.png" style="">' +
        '            </div>' +
        '        </div>' +
        '        <div class="report-content" style="padding-bottom: 10px;">' +
        '           <div id="personalInfo" class="report-content-section" style="padding-top:0px;">' +
        '                <img class="report-content-section-img" src="http://cdn.uukaola.com/web/img/report/shijuanjiexi.png" />' +
        '                <label class="report-content-section-label">个人信息</label>' +
        '                <div style="border:solid 1px #e0e0e0; padding:20px 14px 20px 14px;background-color:#f5f5f5;margin-top:14px;">' +
        '                    <div style="height:95px;background-color:#f5f5f5;">' +
        '                        <div class="col-md-4 col-xs-4" style="border-right:solid 1px #E1E1E1;height:95px;line-height:95px;text-align:center;">' +
        '                            <label style="color:#ff0000;font-size:80px !important; font-family:Arial, Helvetica, sans-serif;">{{StudentTaskData.Score|roundMin1Max2Filter}}</label>' +
        '                            <label style="color:#ff0000;font-size:28px  !important;">分</label>' +
        '                        </div>' +
        '                        <div class="col-md-8 col-xs-8 student-info">' +
        '                            <div class="row" style="padding:5px 0px 20px 10px;border-bottom: dotted 1px  #d5d5d5;">' +
        '                                <label>姓名:</label>' +
        '                                <label class="ellipsis" style="font-size:28px !important;max-width:108px;display:inline-block;line-height: 28px;vertical-align: middle;"' +
        '                                    ng-attr-title="{{StudentTaskData.StudentName}}">{{StudentTaskData.StudentName}}</label>' +
        '                                <label style="margin-left:30px;">学号:</label>' +
        '                                <label class="ellipsis" style="max-width:110px;display:inline-block;" ng-attr-title="{{StudentTaskData.StudentNumber}}">{{StudentTaskData.StudentNumber}}</label>' +
        '                                <label style="margin-left:30px;">班级:</label>' +
        '                                <label class="ellipsis" style="max-width:90px;display:inline-block;" ng-attr-title="{{StudentTaskData.ClassName}}">{{StudentTaskData.ClassName}}</label>' +
        '                            </div>' +
        '                            <div class="row" style="padding:17px 0px 10px 10px;">' +
        '                                <label>使用试卷:</label>' +
        '                                <label class="label-studenttask-papername" class="ellipsis" style="max-width:220px;display:inline-block;" ng-attr-title="{{StudentTaskData.PaperName}}">{{StudentTaskData.PaperName|filterPaperName:14:5}}</label>' +
        '                                <label style="margin-left:42px;">总体排名:</label>' +
        '                                <label style="color:#16B300; font-size:21px !important; font-family:Arial, Helvetica, sans-serif;margin-right: -5px;">{{StudentTaskData.ScoreSequence}}</label>' +
        '                                <label style=" font-size:18px !important; font-family:Arial, Helvetica, sans-serif;">/&nbsp;{{StudentTaskData.StudentCount}}</label>' +
        '                            </div>' +
        '                        </div>' +
        '                    </div>' +
        '                </div>' +
        '            </div>' +
        '            <div id="scoreSummaryInfo" class="report-content-section" style="padding-top:0px;">' +
        '                <img class="report-content-section-img" src="img/report/shijuanjiexi.png" /><label class="report-content-section-label">成绩简报</label>' +
        '                <div style="border:solid 1px #e8e8e8; padding:0px;background-color:#f1faff;margin-top:14px;">' +
        '                    <div style="height:42px;background-color:#178ec9;text-align:center;padding-top:10px;">' +
        '                        <div style="width:241px;float:left;">' +
        '                            <label style="color:#ffffff;font-size:18px !important; font-weight:bold;">项目</label>' +
        '                        </div>' +
        '                        <div style="width:65px;float:left;">' +
        '                            <label style="color:#ffffff;font-size:18px !important; font-weight:bold;">满分</label>' +
        '                        </div>' +
        '                        <div style="width:65px;float:left;">' +
        '                            <label style="color:#ffffff;font-size:18px !important; font-weight:bold;">成绩</label>' +
        '                        </div>' +
        '                        <div style="width:499px;float:left;">' +
        '                            <label style="color:#ffffff;font-size:18px !important; font-weight:bold;">小题得分</label>' +
        '                        </div>' +
        '                    </div>' +
        '                    <div style="clear:both;"></div>' +
        '                    <!--听力部分-->' +
        '                    <div style="clear:both;height:42px;line-height:38px; background-color:#f1faff;text-align:center;border-bottom: solid 1px #e8e8e8;" ng-if="ListeningAreaData.length>0">' +
        '                        <div style="border-right:solid 1px #e8e8e8;width:241px;float:left;">' +
        '                            <label style="color:#0093dc;font-size:18px !important; font-weight:bold;">听力部分</label>' +
        '                        </div>' +
        '                        <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                            <label style="color:#333333;font-size:20px !important; font-weight:normal;">{{StudentTaskData.PaperListeningScore|roundMin0Max2Filter}}</label>' +
        '                        </div>' +
        '                        <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                            <label style="color:#ff0000;font-size:20px !important; font-weight:normal;">{{StudentTaskData.ListeningScore|roundMin0Max2Filter}}</label>' +
        '                        </div>' +
        '                        <div style="float:left;width:499px;">' +
        '                        </div>' +
        '                    </div>' +
        '                    <div style="clear:both;"></div>' +
        '                    <div ng-repeat="la in ListeningAreaData" style="clear:both; background-color:#ffffff;text-align:center;border-bottom:solid 1px #e8e8e8;overflow:hidden;" ng-style="GetContentDataCssStyle(la)">' +
        '                        <div>' +
        '                            <div style="border-right:solid 1px #e8e8e8;width:241px;float:left;">' +
        '                                <label class="label-area-title" style="" title="{{la.AreaTitle}}">{{la.AreaTitle}}</label>' +
        '                            </div>' +
        '                            <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                                <label style="color:#333333;font-size:20px !important; font-weight:normal;">{{la.PaperAreaScore|roundMin0Max2Filter}}</label>' +
        '                            </div>' +
        '                            <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                                <label style="color:#ff0000;font-size:20px !important; font-weight:normal;">{{la.StudentAreaScore|roundMin0Max2Filter}}</label>' +
        '                            </div>' +
        '                            <div ng-repeat="d in la.DisplayRows">' +
        '                                <div style="padding:0px;width:499px;float:left;">' +
        '                                    <div style="height:40px;line-height:40px;background-color:#f5f5f5;">' +
        '                                        <div style="float:left;width: 64px;text-align: center;font-size: 12px;border-right: 1px solid #e8e8e8;">' +
        '                                            <a style="text-decoration:none; color:#383838">' +
        '                                                题号' +
        '                                            </a>' +
        '                                        </div>' +
        '                                        <div style="overflow-x:auto;overflow-y:hidden;border-bottom: 1px solid #e8e8e8;">' +
        '                                            <div ng-repeat="c in d.Columns" style="float:left;width: 87px;height: 40px;" ng-style="{false:{\'border-right\':\'0px\'},true:{\'border-right\':\' 1px solid #e8e8e8\'}}[$last==false || $index%4!=0 || $index==0]">' +
        '                                                <div class="ng-binding" style="text-align: center;color: #333333;font-size:14px;">{{c.Index}}</div>' +
        '                                            </div>' +
        '                                        </div>' +
        '                                    </div>' +
        '                                    <div style="height:41px;line-height:39px; ">' +
        '                                        <div style="float:left;width: 64px;text-align: center;font-size: 12px;border-top: 1px solid #e8e8e8;border-right:1px solid #e8e8e8;border-bottom: 1px solid #e8e8e8;">' +
        '                                            <a style="text-decoration:none; color:#383838">' +
        '                                                答案' +
        '                                            </a>' +
        '                                        </div><div style="overflow-x:auto;overflow-y:hidden;border-bottom: 1px solid #e8e8e8;">' +
        '                                            <div ng-repeat="c in d.Columns" style="float:left;width: 87px;height: 40px;" ng-style="{false:{\'border-right\':\'0px\'},true:{\'border-right\':\' 1px solid #e8e8e8\'}}[$last==false || $index%4!=0 || $index==0]">' +
        '                                                <div ng-if="c.IsRight==false" class="ng-binding" style="text-align: center;font-size: 18px; "><img src="img/report/wrong.png" /></div>' +
        '                                                <div ng-if="c.IsRight==true" class="ng-binding" style="text-align: center;font-size: 18px;">' +
        '                                                    <img src="img/report/right.png" />' +
        '                                                </div>' +
        '                                            </div>' +
        '                                        </div>' +
        '                                    </div>' +
        '                                </div>' +
        '                            </div>' +
        '                        </div>' +
        '                    </div>' +
        '                    <!--口语部分-->' +
        '                    <div style="clear:both;height:42px;line-height:38px; background-color:#f1faff;text-align:center;border-bottom: solid 1px #e8e8e8;" ng-if="SpeakingAreaData.length>0">' +
        '                        <div style="border-right:solid 1px #e8e8e8;width:241px;float:left;">' +
        '                            <label style="color:#0093dc;font-size:18px !important; font-weight:bold;">口语部分</label>' +
        '                        </div>' +
        '                        <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                            <label style="color:#333333;font-size:20px !important; font-weight:normal;">{{StudentTaskData.PaperSpeakingScore|roundMin0Max2Filter}}</label>' +
        '                        </div>' +
        '                        <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                            <label style="color:#ff0000;font-size:20px !important; font-weight:normal;">{{StudentTaskData.SpeakingScore|roundMin0Max2Filter}}</label>' +
        '                        </div>' +
        '                        <div>' +
        '                        </div>' +
        '                    </div>' +
        '                    <div style="clear:both;"></div>' +
        '                    <div ng-repeat="sa in SpeakingAreaData">' +
        '                        <div ng-if="sa.AreaType!=25 && sa.AreaType!=26 " style="clear:both;  background-color:#ffffff;text-align:center;border-bottom:solid 1px #e8e8e8;overflow:hidden;" ng-style="GetContentDataCssStyle(sa)">' +
        '                            <div style="border-right:solid 1px #e8e8e8;width:241px;float:left;">' +
        '                                <label class="label-area-title" style="" title="{{sa.AreaTitle}}">{{sa.AreaTitle}}</label>' +
        '                            </div>' +
        '                            <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                                <label style="color:#333333;font-size:20px !important; font-weight:normal;">{{sa.PaperAreaScore|roundMin0Max2Filter}}</label>' +
        '                            </div>' +
        '                            <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                                <label style="color:#ff0000;font-size:20px !important; font-weight:normal;">{{sa.StudentAreaScore|roundMin0Max2Filter}}</label>' +
        '                            </div>' +
        '                            <div ng-repeat="d in sa.DisplayRows">' +
        '                                <div style="padding:0px;width:499px;float:left;">' +
        '                                    <div style="height:40px;line-height:40px;background-color:#f5f5f5;">' +
        '                                        <div style="float:left;width: 64px;text-align: center;font-size: 12px;border-right: 1px solid #e8e8e8">' +
        '                                            <a style="text-decoration:none; color:#383838">' +
        '                                                题号' +
        '                                            </a>' +
        '                                        </div>' +
        '                                        <div style="overflow-x:auto;overflow-y:hidden;border-bottom: 1px solid #e8e8e8;">' +
        '                                            <div ng-repeat="c in d.Columns" style="float:left;width: 87px;height: 40px;border-bottom: 0px solid #e8e8e8;" ng-style="{false:{\'border-right\':\'0px\'},true:{\'border-right\':\' 1px solid #e8e8e8\'}}[$last==false || $index%4!=0 || $index==0]">' +
        '                                                <div class="ng-binding" style="text-align: center;color: #333333;font-size:14px;">{{c.Index}}</div>' +
        '                                            </div>' +
        '                                        </div>' +
        '                                    </div>' +
        '                                    <div style="height:39px;line-height:39px;">' +
        '                                        <div style="float:left;width: 64px;text-align: center;font-size: 12px;border-right: 1px solid #e8e8e8;border-top: 1px solid #e8e8e8;">' +
        '                                            <a style="text-decoration:none; color:#383838">' +
        '                                                得分' +
        '                                            </a>' +
        '                                        </div><div style="overflow-x:auto;overflow-y:hidden;">' +
        '                                            <div ng-repeat="c in d.Columns" style="float:left;width: 87px;height: 40px;" ng-style="{false:{\'border-right\':\'0px\'},true:{\'border-right\':\' 1px solid #e8e8e8\'}}[$last==false || $index%4!=0 || $index==0]">' +
        '                                                <div class="ng-binding" style="text-align: center;color: #FF0000;font-size:20px;">{{c.Score|roundMin0Max2Filter}}</div>' +
        '                                            </div>' +
        '                                        </div>' +
        '                                    </div>' +
        '                                </div>' +
        '                            </div>' +
        '                        </div>' +
        '                        <div ng-if="sa.AreaType==25 ">' +
        '                            <div ng-repeat="q in sa.QuestionData">' +
        '                                <!--Part1-->' +
        '                                <div style="clear:both; background-color:#ffffff;text-align:center;border-bottom:solid 1px #e8e8e8;overflow:hidden;" ng-style="GetContentDataCssStyle(sa,\'Part1\',q.QuestionID)">' +
        '                                    <div style="border-right:solid 1px #e8e8e8;line-height: 30px;    height: inherit;width:241px;float:left;">' +
        '                                        <label class="label-area-title" style="margin-top:10px;" title="{{sa.AreaTitle}}">{{sa.AreaTitle}}</label>' +
        '                                        <br />' +
        '                                        <label class="label-area-title" style="margin-top:-35px;">(第一部分)</label>' +
        '                                    </div>' +
        '                                    <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                                        <label style="color:#333333;font-size:20px !important; font-weight:normal;">{{(GetPart1ContentCountByQuestionIDFor25(sa,q.QuestionID))*GetPart1ContentScoreByQuestionID(sa,q.QuestionID)}}</label>' +
        '                                    </div>' +
        '                                    <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                                        <label style="color:#ff0000;font-size:20px !important; font-weight:normal;">{{GetPart1StudentScoreByQuestionIDFor25(sa,q.QuestionID)}}</label>' +
        '                                    </div>' +
        '                                    <div ng-repeat="d in q.Part1.DisplayRows">' +
        '                                        <div style="padding:0px;width:499px;float:left;">' +
        '                                            <div style="height:40px;line-height:40px;background-color:#f5f5f5;">' +
        '                                                <div style="float:left;width: 64px;text-align: center;font-size: 12px;border-right: 1px solid #e8e8e8">' +
        '                                                    <a style="text-decoration:none; color:#383838">' +
        '                                                        题号' +
        '                                                    </a>' +
        '                                                </div>' +
        '                                                <div style="overflow-x:auto;overflow-y:hidden;border-bottom: 1px solid #e8e8e8;">' +
        '                                                    <div ng-repeat="c in d.Columns" style="float:left;width: 87px;height: 40px;" ng-style="{false:{\'border-right\':\'0px\'},true:{\'border-right\':\' 1px solid #e8e8e8\'}}[$last==false || $index%4!=0 || $index==0]">' +
        '                                                        <div class="ng-binding" style="text-align: center;color: #333333;font-size:14px;">{{c.Index}}</div>' +
        '                                                    </div>' +
        '                                                </div>' +
        '                                            </div>' +
        '                                            <div style="height:40px;line-height:39px;">' +
        '                                                <div style="float:left;width: 64px;text-align: center;font-size: 12px;border-right: 1px solid #e8e8e8;border-top: 1px solid #e8e8e8;border-bottom: 1px solid #e8e8e8;">' +
        '                                                    <a style="text-decoration:none; color:#383838">' +
        '                                                        得分' +
        '                                                    </a>' +
        '                                                </div>' +
        '                                                <div style="overflow-x:auto;overflow-y:hidden;border-bottom: 1px solid #e8e8e8;">' +
        '                                                    <div ng-repeat="c in d.Columns" style="float:left;width: 87px;height: 40px;" ng-style="{false:{\'border-right\':\'0px\'},true:{\'border-right\':\' 1px solid #e8e8e8\'}}[$last==false || $index%4!=0 || $index==0]">' +
        '                                                        <div ng-if="c.Score==undefined||c.Score<=0" class="ng-binding" style="text-align: center;font-size: 18px; "><img src="img/report/wrong.png" /></div>' +
        '                                                        <div ng-if="c.Score>0" class="ng-binding" style="text-align: center;font-size: 18px;">' +
        '                                                            <img src="img/report/right.png" />' +
        '                                                        </div>' +
        '                                                    </div>' +
        '                                                </div>' +
        '                                            </div>' +
        '                                        </div>' +
        '                                    </div>' +
        '                                </div>' +
        '                                <!--Part2-->' +
        '                                <div style="clear:both;  background-color:#ffffff;text-align:center;border-bottom:solid 1px #e8e8e8;overflow:hidden;" ng-style="GetContentDataCssStyle(sa,\'Part2\')">' +
        '                                    <div style="border-right:solid 1px #e8e8e8;line-height: 30px;width:241px;float:left;">' +
        '                                        <label class="label-area-title" style="margin-top:10px;" title="{{sa.AreaTitle}}">{{sa.AreaTitle}}</label>' +
        '                                        <br />' +
        '                                        <label class="label-area-title" style="margin-top:-35px;">(第二部分)</label>' +
        '                                    </div>' +
        '                                    <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                                        <label style="color:#333333;font-size:20px !important; font-weight:normal;">{{GetPart2ContentScoreByQuestionIDFor25(sa,q.QuestionID)}}</label>' +
        '                                    </div>' +
        '                                    <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                                        <label style="color:#ff0000;font-size:20px !important; font-weight:normal;">{{GetPart2StudentScoreFor25(sa,q.QuestionID)}}</label>' +
        '                                    </div>' +
        '                                    <div ng-repeat="d in q.Part2.DisplayRows">' +
        '                                        <div style="padding:0px;width:499px;float:left;">' +
        '                                            <div style="height:40px;line-height:40px;background-color:#f5f5f5;">' +
        '                                                <div style="float:left;width: 64px;text-align: center;font-size: 12px;border-right: 1px solid #e8e8e8">' +
        '                                                    <a style="text-decoration:none; color:#383838">' +
        '                                                        题号' +
        '                                                    </a>' +
        '                                                </div>' +
        '                                                <div style="overflow-x:auto;overflow-y:hidden;border-bottom: 1px solid #e8e8e8;">' +
        '                                                    <div ng-repeat="c in d.Columns" style="float:left;width: 87px;height: 40px;border-bottom: 0px solid #e8e8e8;" ng-style="{false:{\'border-right\':\'0px\'},true:{\'border-right\':\' 1px solid #e8e8e8\'}}[$last==false || $index%4!=0 || $index==0]">' +
        '                                                        <div class="ng-binding" style="text-align: center;color: #333333;font-size:14px;">{{c.Index}}</div>' +
        '                                                    </div>' +
        '                                                </div>' +
        '                                            </div>' +
        '                                            <div style="height:39px;line-height:39px;">' +
        '                                                <div style="float:left;width: 64px;text-align: center;font-size: 12px;border-right: 1px solid #e8e8e8;border-top: 1px solid #e8e8e8;">' +
        '                                                    <a style="text-decoration:none; color:#383838">' +
        '                                                        得分' +
        '                                                    </a>' +
        '                                                </div><div style="overflow-x:auto;overflow-y:hidden;">' +
        '                                                    <div ng-repeat="c in d.Columns" style="float:left;width: 87px;height: 40px;" ng-style="{false:{\'border-right\':\'0px\'},true:{\'border-right\':\' 1px solid #e8e8e8\'}}[$last==false || $index%4!=0 || $index==0]">' +
        '                                                        <div class="ng-binding" style="text-align: center;color: #FF0000;font-size:20px;">{{c.Score}}</div>' +
        '                                                    </div>' +
        '                                                </div>' +
        '                                            </div>' +
        '                                        </div>' +
        '                                    </div>' +
        '                                </div>' +
        '                            </div>' +
        '                        </div>' +
        '                        <div ng-if="sa.AreaType==26 ">' +
        '                            <div ng-repeat="q in sa.QuestionData" ng-if="q.Idx %2 !=0">' +
        '                                <!--Part1-->' +
        '                                <div style="clear:both;  background-color:#ffffff;text-align:center;border-bottom:solid 1px #e8e8e8;overflow:hidden;" ng-style="GetContentDataCssStyle(sa,\'Part1\')">' +
        '                                    <div style="border-right:solid 1px #e8e8e8;line-height: 30px;width:241px;float:left;">' +
        '                                        <label class="label-area-title" style="margin-top:10px;" title="{{sa.AreaTitle}}">{{sa.AreaTitle}}</label>' +
        '                                        <br />' +
        '                                        <label class="label-area-title" style="margin-top:-35px;">(第一部分)</label>' +
        '                                    </div>' +
        '                                    <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                                        <label style="color:#333333;font-size:20px !important; font-weight:normal;">{{GetPart1TotalScoreByQuestionIDFor26(sa,q.QuestionID)}}</label>' +
        '                                    </div>' +
        '                                    <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                                        <label style="color:#ff0000;font-size:20px !important; font-weight:normal;">{{GetPart1StudentScoreByQuestionIDFor26(sa,q.QuestionID)}}</label>' +
        '                                    </div>' +
        '                                    <div ng-repeat="d in sa.Part1.DisplayRows">' +
        '                                        <div style="padding:0px;width:499px;float:left;">' +
        '                                            <div style="height:40px;line-height:40px;background-color:#f5f5f5;">' +
        '                                                <div style="float:left;width: 64px;text-align: center;font-size: 12px;border-right: 1px solid #e8e8e8">' +
        '                                                    <a style="text-decoration:none; color:#383838">' +
        '                                                        题号' +
        '                                                    </a>' +
        '                                                </div>' +
        '                                                <div style="overflow-x:auto;overflow-y:hidden;border-bottom: 1px solid #e8e8e8;">' +
        '                                                    <div ng-repeat="c in d.Columns" style="float:left;width: 87px;height: 40px;border-bottom: 0px solid #e8e8e8;" ng-style="{false:{\'border-right\':\'0px\'},true:{\'border-right\':\' 1px solid #e8e8e8\'}}[$last==false || $index%4!=0 || $index==0]">' +
        '                                                        <div class="ng-binding" style="text-align: center;color: #333333;font-size:14px;">{{c.Index}}</div>' +
        '                                                    </div>' +
        '                                                </div>' +
        '                                            </div>' +
        '                                            <div style="height:39px;line-height:39px;">' +
        '                                                <div style="float:left;width: 64px;text-align: center;font-size: 12px;border-right: 1px solid #e8e8e8;border-top: 1px solid #e8e8e8;">' +
        '                                                    <a style="text-decoration:none; color:#383838">' +
        '                                                        得分' +
        '                                                    </a>' +
        '                                                </div><div style="overflow-x:auto;overflow-y:hidden;">' +
        '                                                    <div ng-repeat="c in d.Columns" style="float:left;width: 87px;height: 40px;" ng-style="{false:{\'border-right\':\'0px\'},true:{\'border-right\':\' 1px solid #e8e8e8\'}}[$last==false || $index%4!=0 || $index==0]">' +
        '                                                        <div class="ng-binding" style="text-align: center;color: #FF0000;font-size:20px;">{{c.Score}}</div>' +
        '                                                    </div>' +
        '                                                </div>' +
        '                                            </div>' +
        '                                        </div>' +
        '                                    </div>' +
        '                                </div>' +
        '                                <!--Part2-->' +
        '                                <div style="clear:both; background-color:#ffffff;text-align:center;border-bottom:solid 1px #e8e8e8;overflow:hidden;" ng-style="GetContentDataCssStyle(sa,\'Part2\',q.QuestionID)">' +
        '                                    <div style="border-right:solid 1px #e8e8e8;line-height: 30px;    height: inherit;width:241px;float:left;">' +
        '                                        <label class="label-area-title" style="margin-top:10px;" title="{{sa.AreaTitle}}">{{sa.AreaTitle}}</label>' +
        '                                        <br />' +
        '                                        <label class="label-area-title" style="margin-top:-35px;">(第二部分)</label>' +
        '                                    </div>' +
        '                                    <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                                        <label style="color:#333333;font-size:20px !important; font-weight:normal;">{{GetPart2TotalScoreByQuestionIDFor26(sa,q.QuestionID)}}</label>' +
        '                                    </div>' +
        '                                    <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                                        <label style="color:#ff0000;font-size:20px !important; font-weight:normal;">{{GetPart2StudentScoreByQuestionIDFor26(sa,q.QuestionID)}}</label>' +
        '                                    </div>' +
        '                                    <div ng-repeat="d in sa.Part2.DisplayRows">' +
        '                                        <div style="padding:0px;width:499px;float:left;">' +
        '                                            <div style="height:40px;line-height:40px;background-color:#f5f5f5;">' +
        '                                                <div style="float:left;width: 64px;text-align: center;font-size: 12px;border-right: 1px solid #e8e8e8">' +
        '                                                    <a style="text-decoration:none; color:#383838">' +
        '                                                        题号' +
        '                                                    </a>' +
        '                                                </div>' +
        '                                                <div style="overflow-x:auto;overflow-y:hidden;border-bottom: 1px solid #e8e8e8;">' +
        '                                                    <div ng-repeat="c in d.Columns" style="float:left;width: 87px;height: 40px;border-bottom: 0px solid #e8e8e8;" ng-style="{false:{\'border-right\':\'0px\'},true:{\'border-right\':\' 1px solid #e8e8e8\'}}[$last==false || $index%4!=0 || $index==0]">' +
        '                                                        <div class="ng-binding" style="text-align: center;color: #333333;font-size:14px;">{{c.Index}}</div>' +
        '                                                    </div>' +
        '                                                </div>' +
        '                                            </div>' +
        '                                            <div style="height:41px;line-height:39px;">' +
        '                                                <div style="float:left;width: 64px;text-align: center;font-size: 12px;border-right: 1px solid #e8e8e8;border-top: 1px solid #e8e8e8;border-bottom: 1px solid #e8e8e8;">' +
        '                                                    <a style="text-decoration:none; color:#383838">' +
        '                                                        得分' +
        '                                                    </a>' +
        '                                                </div>' +
        '                                                <div style="overflow-x:auto;overflow-y:hidden;border-bottom: 1px solid #e8e8e8;">' +
        '                                                    <div ng-repeat="c in d.Columns" style="float:left;width: 87px;height: 40px;" ng-style="{false:{\'border-right\':\'0px\'},true:{\'border-right\':\' 1px solid #e8e8e8\'}}[$last==false || $index%4!=0 || $index==0]">' +
        '                                                        <div class="ng-binding" style="text-align: center;color: #FF0000;font-size:20px;">{{c.Score}}</div>' +
        '                                                    </div>' +
        '                                                </div>' +
        '                                            </div>' +
        '                                        </div>' +
        '                                    </div>' +
        '                                </div>' +
        '                            </div>' +
        '                        </div>' +
        '                    </div>' +
        '                    <!--总成绩-->' +
        '                    <div style="clear:both;height:42px;line-height:38px; background-color:#f1faff;text-align:center;">' +
        '                        <div style="border-right:solid 1px #e8e8e8;width:241px;float:left;">' +
        '                            <label style="color:#0093dc;font-size:18px !important; font-weight:bold;">总成绩</label>' +
        '                        </div>' +
        '                        <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                            <label style="color:#333333;font-size:20px !important; font-weight:normal;">{{StudentTaskData.PaperScore|roundMin0Max2Filter}}</label>' +
        '                        </div>' +
        '                        <div style="border-right:solid 1px #e8e8e8;width:65px;float:left;">' +
        '                            <label style="color:#ff0000;font-size:20px !important; font-weight:normal;">{{StudentTaskData.Score|roundMin0Max2Filter}}</label>' +
        '                        </div>' +
        '                        <div style="width:499px;float:left;">' +
        '                        </div>' +
        '                    </div>' +
        '                </div>' +
        '            </div>' +
        '            <div id="scoreAnalysisInfo" class="report-content-section" style="padding-top:0px;">' +
        '                <img class="report-content-section-img" src="img/report/shijuanjiexi.png" /><label class="report-content-section-label">试卷解析</label>' +
        '                <!--听力部分-->' +
        '                <div style="margin-top:14px;margin-bottom:14px;background-color:#FFF9E9;border: dashed 1px #E3CEB3;padding:10px 10px;color:#E46C37;border-radius:3px;" ng-if="ListeningAreaData.length>0">' +
        '                    <label style="font-weight:bold;font-size:16px !important;">听力部分&nbsp;</label> <label style="font-size:16px !important;">(&nbsp;满分&nbsp;{{StudentTaskData.PaperListeningScore}}&nbsp;分, 得分&nbsp;{{StudentTaskData.ListeningScore}}&nbsp;分&nbsp;)</label>' +
        '                </div>' +
        '                <div class="" ng-repeat="la in ListeningAreaData" style="clear:both;background-color:#ffffff;border-top-left-radius:0px;border-top-right-radius:0px;border-top:solid 2px #1790C9;border-right:solid 1px #e8e8e8;border-left:solid 1px #e8e8e8;margin-bottom:14px;">' +
        '                    <div data-toggle="collapse" data-parent="#accordion"' +
        '                         href="{{\'#collapse\'+la.AreaID}}" ng-click="collapseToggle(la)" style="height:40px;line-height:40px;background-color:#F0F0F0;cursor:pointer;">' +
        '                        <label style="margin-left:14px;cursor:pointer;font-weight:bold;font-size:15px !important;color:#000000;">' +
        '                            {{GetAreaTitle(la)}}' +
        '                        </label>' +
        '                        <img ng-if="la.CollapseState==0" src="img/report/collapseDown.png" style="float:right;cursor:pointer;margin:16px 10px 16px 4px;" data-toggle="collapse" data-parent="#accordion"' +
        '                             href="{{\'#collapse\'+la.AreaID}}" />' +
        '                        <img ng-if="la.CollapseState==1" src="img/report/collapseUp.png" style="float:right;cursor:pointer;margin:16px 10px 16px 4px;" data-toggle="collapse" data-parent="#accordion"' +
        '                             href="{{\'#collapse\'+la.AreaID}}" />' +
        '                        <label ng-if="la.CollapseState==0" data-toggle="collapse" data-parent="#accordion"' +
        '                               href="{{\'#collapse\'+la.AreaID}}" style="float:right;cursor:pointer;font-size:13px !important;color:#777777;">' +
        '                            展开' +
        '                        </label>' +
        '                        <label ng-if="la.CollapseState==1" data-toggle="collapse" data-parent="#accordion"' +
        '                               href="{{\'#collapse\'+la.AreaID}}" style="float:right;cursor:pointer;font-size:13px !important;color:#777777;">' +
        '                            收缩' +
        '                        </label>' +
        '                    </div>' +
        '                    <div id="{{\'collapse\'+la.AreaID}}" class="panel-collapse collapse">' +
        '                        <div style="font-size:14px;padding:10px 14px 10px  14px;border-bottom:dotted 1px #cbcbcb;color:#666;">' +
        '                            {{la.AreaPrompt}}' +
        '                        </div>' +
        '                        <div ng-repeat="qData in la.QuestionData" style="border-bottom: 1px solid #e8e8e8;">' +
        '                            <student-question-detail question-data="qData" analysis-data="PaperAnalysisData" paper-resource-base-url="Constants.paperResourceBaseUrl" answer-base-url="Constants.answerBaseUrl"></student-question-detail>' +
        '                        </div>' +
        '                    </div>' +
        '                </div>' +
        '                <!--口语部分-->' +
        '                <div style="margin-top:14px;margin-bottom:14px;background-color:#FFF9E9;border: dashed 1px #E3CEB3;padding:10px 10px;font-size:15px;color:#E46C37;border-radius:3px;" ng-if="SpeakingAreaData.length>0">' +
        '                    <label style="font-weight:bold;font-size:16px !important; ">口语部分&nbsp;</label> <label style="font-size:16px !important; ">(&nbsp;满分&nbsp;{{StudentTaskData.PaperSpeakingScore|roundMin0Max2Filter}}&nbsp;分, 得分&nbsp;{{StudentTaskData.SpeakingScore|roundMin0Max2Filter}}&nbsp;分&nbsp;)</label>' +
        '                </div>' +
        '                <div class="" ng-repeat="sa in SpeakingAreaData" style="clear:both;background-color:#ffffff;border-top-left-radius:0px;border-top-right-radius:0px;border-top:solid 2px #1790C9;border-right:solid 1px #e8e8e8;border-left:solid 1px #e8e8e8;margin-bottom:14px;">' +
        '                    <div data-toggle="collapse" data-parent="#accordion"' +
        '                         href="{{\'#collapse\'+sa.AreaID}}" ng-click="collapseToggle(sa)" style="height:40px;line-height:40px;background-color:#F0F0F0;cursor:pointer;">' +
        '                        <label style="margin-left:14px;cursor:pointer;font-weight:bold;font-size:15px !important;color:#000000;">' +
        '                            {{GetAreaTitle(sa)}}' +
        '                        </label>' +
        '                        <img ng-if="sa.CollapseState==0" src="img/report/collapseDown.png" style="float:right;cursor:pointer;margin:15px 10px;" data-toggle="collapse" data-parent="#accordion"' +
        '                             href="{{\'#collapse\'+sa.AreaID}}" />' +
        '                        <img ng-if="sa.CollapseState==1" src="img/report/collapseUp.png" style="float:right;cursor:pointer;margin:15px 10px;" data-toggle="collapse" data-parent="#accordion"' +
        '                             href="{{\'#collapse\'+sa.AreaID}}" />' +
        '                        <label ng-if="sa.CollapseState==0" data-toggle="collapse" data-parent="#accordion"' +
        '                               href="{{\'#collapse\'+sa.AreaID}}" style="float:right;cursor:pointer;font-size:15px !important; color:#777777;">' +
        '                            展开' +
        '                        </label>' +
        '                        <label ng-if="sa.CollapseState==1" data-toggle="collapse" data-parent="#accordion"' +
        '                               href="{{\'#collapse\'+sa.AreaID}}" style="float:right;cursor:pointer;font-size:15px !important;color:#777777;">' +
        '                            收缩' +
        '                        </label>' +
        '                    </div>' +
        '                    <div id="{{\'collapse\'+sa.AreaID}}" class="panel-collapse collapse">' +
        '                        <div style="font-size:14px;padding:10px 14px 10px  14px;border-bottom:dotted 1px #cbcbcb;color:#666;">' +
        '                            {{sa.AreaPrompt}}' +
        '                        </div>' +
        '                        <div ng-repeat="qData in sa.QuestionData" style="border-bottom: 1px solid #e8e8e8;">' +
        '                            <student-question-detail question-data="qData" analysis-data="PaperAnalysisData" paper-resource-base-url="Constants.paperResourceBaseUrl" answer-base-url="Constants.answerBaseUrl"></student-question-detail>' +
        '                        </div>' +
        '                    </div>' +
        '                </div>' +
        '            </div>' +
        '        </div>' +
        '        <div class="report-footer" style="z-index:9999;background-color:#E3EAEB;width: 920px;bottom: 0px;position: fixed;line-height:42px;margin-left: -10px;">' +
        '            <div class="row" style="text-align:center;">' +
        '                <a href="http://www.miitbeian.gov.cn/" target="_blank">苏ICP备14027754号-3</a> <a href="http://www.chivox.com" target="_blank">苏州驰声信息科技有限公司 Copyright ©2016-2017 All Rights Reserved</a>' +
        '                <!--<span id="kx_verify" style="display: inline-block; position: relative; width: 128px; height: 47px;"><a id="kx_verify_link" tabindex="-1" kx_type="图标式"><img src="http://rr.knet.cn/static/images/logo/cnnic.png" style="border:0; position: absolute; top: 0px; left: 0px;" w="128" h="47" width="128" height="47" oncontextmenu="return false;" alt="可信网站"></a></span>-->' +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '    <div style="width: 30px; cursor:pointer;float:left;position: fixed;top: 15px;margin-left: 915px;display:none;">' +
        '        <img src="img/report/download.png" style="width: 36px;height: 127px;position: fixed;" ng-click="DownloadReport()">' +
        '    </div>' +
        '</div>' +
        '<div class="modal" id="showRefTextDialog" tabindex="-2" role="dialog">' +
        '    <div class="modal-dialog">' +
        '        <div class="modal-content" style="width: 500px;margin:auto;">' +
        '            <div class="modal-header" style="background-color: #E1E1E1 !important;color: #333;">' +
        '                <button type="button" class="close" style="background-image: url(img/report/close.png);width:16px;height:15px;" data-dismiss="modal" aria-label="Close"></button>' +
        '                <span class="modal-title" id="myModalLabel" style="line-height:0px;font-size:16px;">录音原文</span>' +
        '            </div>' +
        '            <div class="modal-body">' +
        '                <div style="background-color:#ffffff;font-family:Arial,\'Microsoft YaHei\';font-size:14px !important;color:black;">{{GetRefText()}}</div>' +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '</div>';

    return html;
});