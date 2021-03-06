﻿define(function () {
    'use strict';
    var html =
    '<link rel="stylesheet" type="text/css" href="components//directives//questionDetail//teacher-report/teacherreport-paperanalysis.css"'+
    '/>'+
    '<link rel="stylesheet" type="text/css" href="kaola/report/teacher/teacherreport_taskdetail.css" />'+
    '<div class="" style="width: 940px;margin: 0 auto;height:100%;">'+
    '    <div class="content-container" style="width: 900px;margin: 0 auto;background-color:#ffffff;box-shadow: 0px 0px 5px #d0d0d0;min-height:100%;margin-bottom:10px;">'+
    '        <div class="report-title">'+
    '            <div style="width: 100%;padding-right: 160px;float: left;">'+
    '                <div class="row" style="width:100%;padding-left:14px;">'+
    '                    <label class="report-title-taskname">{{TaskData.TaskName}}</label>'+
    '                    <label class="report-title-taskdesc">(总分:&nbsp;{{TaskData.PaperScore}} &nbsp;&nbsp;日期:&nbsp;{{TaskData.TaskFinishTime|fixedTimeFilter}})</label>'+
    '                </div>'+
    '                <div class="row" style="width:100%;">'+
    '                    <img src="img/report/ksmc-bg.jpg" style="height:12px;width:99%;" />'+
    '                </div>'+
    '            </div>'+
    '            <div style="width:153px; float: right;position: relative;margin-top: -40px;">'+
    '                <img src="img/report/logo.png" style="">'+
    '            </div>'+
    '        </div>'+
    '        <div class="report-info">'+
    '            <div style="border: dashed 1px #EBD9C4;">'+
    '                <div class="row" style="border:0px;">'+
    '                    <div style="width:120px" class="btn-group" ng-if="TaskData.ClassCount!=undefined&&TaskData.ClassCount>0">'+
    '                        <label class="label tasklabel-desc">班级数量:</label>'+
    '                        <label class="tasklabel-data">{{TaskData.ClassCount}}</label>'+
    '                    </div>'+
    '                    <div style="width:120px;" class="btn-group">'+
    '                        <label class="label tasklabel-desc">试卷数量:</label>'+
    '                        <label class="tasklabel-data">{{TaskData.PaperCount}}</label>'+
    '                    </div>'+
    '                    <div style="width:120px;" class="btn-group">'+
    '                        <label class="label tasklabel-desc">总人数:</label>'+
    '                        <label class="tasklabel-data">{{TaskData.TotalStudentCount}}</label>'+
    '                    </div>'+
    '                    <div style="width:120px;" class="btn-group">'+
    '                        <label class="label tasklabel-desc">成功人数:</label>'+
    '                        <label class="tasklabel-data">{{TaskData.ExamStudentCount}}</label>'+
    '                    </div>'+
    '                </div>'+
    '                <div style="border-bottom: dotted 1px #EBD9C4;margin: 0px 14px;"></div>'+
    '                <div class="row" style="border:0px;">'+
    '                    <label class="label tasklabel-desc btn-group">班级:</label>'+
    '                    <div class="btn-group dropdown" style="min-width:122px;margin-right:20px;">'+
    '                        <a class="btn btn-block btn-default" href="#" id="class_dropdown" data-toggle="dropdown" style="color:#000000;padding: 5px 5px 5px 8px !important;">'+
    '                            {{ CurrentClassName }}'+
    '                            <span class="caret"></span>'+
    '                        </a>'+
    '                        <ul class="dropdown-menu query-dropdown-width" aria-labelledby="class_dropdown" role="menu">'+
    '                            <li ng-repeat="c in TaskData.AllClasses">'+
    '                                <a href="javascript:void(0);" ng-click="ChangeClass(c)">{{c.ClassName}}</a>'+
    '                            </li>'+
    '                        </ul>'+
    '                    </div>'+
    '                    <label class="label tasklabel-desc btn-group">使用试卷:</label>'+
    '                    <div class="btn-group dropdown" style="min-width:262px;">'+
    '                        <a class="btn btn-block btn-default" href="#" id="paper_dropdown" data-toggle="dropdown" style="color:#000000;padding: 5px 5px 5px 8px !important;">'+
    '                            {{ CurrentPaperName }}'+
    '                            <span class="caret"></span>'+
    '                        </a>'+
    '                        <ul class="dropdown-menu query-dropdown-width" style="min-width:262px;" aria-labelledby="paper_dropdown" role="menu">'+
    '                            <li ng-repeat="p in TaskData.AllPapers">'+
    '                                <a href="javascript:void(0);" ng-click="ChangePaper(p)">{{p.PaperName}}</a>'+
    '                            </li>'+
    '                        </ul>'+
    '                    </div>'+
    '                </div>'+
    '            </div>'+
    '        </div>'+
    '        <div class="report-content row" style="">'+
    '            <ul class="nav nav-tabs teacher-report-tab">'+
    '                <li id="li_simple_report_teacher" class="reportContentTabHeader active">'+
    '                    <a href="#simple_report_teacher" data-toggle="tab" ng-click="refreshScrollBar();turnAll()">成绩简报</a>'+
    '                </li>'+
    '                <li id="li_summary_report_teacher" class="reportContentTabHeader">'+
    '                    <a href="#summary_report_teacher" data-toggle="tab" ng-click="turnAll();">统计分析</a>'+
    '                </li>'+
    '                <li style="" id="li_analysis_report_teacher" class="reportContentTabHeader">'+
    '                    <a href="#analysis_report_teacher" data-toggle="tab" ng-click="turnDefautPaper()">卷面分析</a>'+
    '                </li>'+
    '            </ul>'+
    '            <div class="tab-spliter"></div>'+
    '            <div class="tab-content">'+
    '                <div class="tab-pane active" id="simple_report_teacher" style="padding-bottom:50px;">'+
    '                    <div class="input-group col-sm-3 pull-right col-xs-3" style="margin-top: -43px;">'+
    '                        <input style="height: 34px !important;" type="text" class="form-control" placeholder="输入学号与姓名" ng-model="QueryParam.StudentFilter">'+
    '                        <span class="input-group-btn">'+
    '                            <img src="img/report/search.png" ng-click="QuerySearchStudent()" style="cursor:pointer;" />'+
    '                            <!--<button class="btn btn-info button-onlyIcon" type="button" ng-click="QuerySearchStudent()" style="border-top-right-radius:3px;border-bottom-right-radius:3px;border-top-left-radius:0px;border-bottom-left-radius:0px;height: 34px !important;width:40px !important;">'+
    '                                <span class="xsmallicon icon-sousuo" style=""></span>'+
    '                            </button>-->'+
    '                        </span>'+
    '                    </div>'+
    '                    <div class="scroll-table-wrap clearfix">'+
    '                        <div class="left-table-wrap">'+
    '                            <table ng-table="TaskStudentReportList" class="table table-condensed table-bordered table-hover table-center-align table-special-header"'+
    '                                style="border: 1px solid #ddd !important;">'+
    '                                <tbody>'+
    '                                    <tr ng-repeat="stu in $data">'+
    '                                        <td data-title="\'排名\'" width="55" sortable="\'ScoreSequence\'">'+
    '                                            {{ stu.ScoreSequence }}'+
    '                                        </td>'+
    '                                        <td data-title="\'学号\'" width="90" style="" ng-attr-title="{{stu.StudentNumber}}">'+
    '                                            <a class="ellipsis" href="javascript:void(0)" class="color-blue" style="height:16px;display:inline-block;color: #337ab7;max-width:70px;text-decoration:none;"'+
    '                                                target="_blank" ui-sref="studentreportdetail({studentNumber:\'{{stu.StudentNumber}}\',taskID:\'{{stu.TaskID}}\',from:\'teacherreportdetail\'})">{{ stu.StudentNumber }}</a>'+
    '                                        </td>'+
    '                                        <td data-title="\'姓名\'" max-="78">'+
    '                                            <span class="ellipsis" style="height:16px;max-width:60px;display:inline-block;" ng-attr-title="{{stu.StudentName}}">{{ stu.StudentName }}</span>'+
    '                                        </td>'+
    '                                    </tr>'+
    '                                </tbody>'+
    '                            </table>'+
    '                        </div>'+
    '                        <div class="middle-table-wrap custom-scrollbar h-custom-scrollbar">'+
    '                            <table ng-table-dynamic="TaskStudentReportList with cols" class="table table-condensed table-bordered table-hover table-center-align table-special-header">'+
    '                                <tbody>'+
    '                                    <tr ng-repeat="stu in $data">'+
    '                                        <td ng-repeat="col in $columns">'+
    '                                            <span ng-if="col.field==\'StudentSex\'">{{stu[col.field] | sexFilter}}</span>'+
    '                                            <span ng-if="col.field==\'ClassName\'" class="ellipsis" ng-attr-title="{{stu.ClassName}}">{{stu[col.field]}}</span>'+
    '                                            <span ng-if="col.field==\'PaperName\'" class="ellipsis" style="display: inline-block;max-width: 170px;height: 16px;" ng-attr-title="{{stu.PaperName}}">{{stu.PaperName|filterPaperName}}</span>'+
    '                                            <span ng-if="col.field==\'Score\'" style="vertical-align:middle;">{{ stu[col.field] }}</span>'+
    '                                            <img ng-if="col.field==\'Score\'&&stu.CompareWithAvgScore==\'1\'" src="img/report/upArrow.png" />'+
    '                                            <img ng-if="col.field==\'Score\'&&stu.CompareWithAvgScore==\'0\'" src="img/report/equalArrow.png"'+
    '                                            />'+
    '                                            <img ng-if="col.field==\'Score\'&&stu.CompareWithAvgScore==\'-1\'" src="img/report/downArrow.png"'+
    '                                            />'+
    '                                            <span ng-if="col.field==\'ScoreDetail\'">{{ stu[col.field][col.index].Score}}</span>'+
    '                                        </td>'+
    '                                        <!-- <td data-title="\'性别\'">{{ stu.StudentSex | sexFilter }}</td>'+
    '                                        <td data-title="\'班级\'" class="ellipsis" ng-attr-title="{{stu.ClassName}}">{{ stu.ClassName }}</td>'+
    '                                        <td data-title="\'试卷名称\'" class="ellipsis" ng-attr-title="{{stu.PaperName}}">{{ stu.PaperName}}</td>'+
    '                                        <td data-title="\'总成绩\'" sortable="\'Score\'">'+
    '                                            <span style="vertical-align:middle;">{{ stu.Score }}</span>'+
    '                                            <img style="" ng-if="stu.CompareWithAvgScore==\'1\'" src="img/report/upArrow.png" />'+
    '                                            <img style="" ng-if="stu.CompareWithAvgScore==\'0\'" src="img/report/equalArrow.png" />'+
    '                                            <img style="" ng-if="stu.CompareWithAvgScore==\'-1\'" src="img/report/downArrow.png" />'+
    '                                        </td> -->'+
    '                                        <!-- <td data-title="\'44\'">'+
    '                                            <span ng-if="stu.Score>0||stu.Score>0">{{v.Score}}</span>'+
    '                                            <span ng-if="stu.Score<=0&& stu.Score<=0">--</span>'+
    '                                        </td> -->'+
    '                                        <!-- <td data-title="\'口语成绩\'">'+
    '                                            <span ng-if="stu.PaperSpeakingScore>0||stu.SpeakingScore>0 "> {{ stu.SpeakingScore}}</span>'+
    '                                            <span ng-if="stu.PaperSpeakingScore<1&& stu.SpeakingScore<=0 ">--</span>'+
    '                                        </td> -->'+
    '                                    </tr>'+
    '                                </tbody>'+
    '                            </table>'+
    '                        </div>'+
    '                        <div class="right-table-wrap special-table-color" style="padding-top:10px;">'+
    '                            <table ng-table="TaskStudentReportList" class="table table-condensed table-bordered table-hover table-center-align table-special-header"'+
    '                                style="border: 1px solid #ddd !important;">'+
    '                                <tbody>'+
    '                                    <tr ng-repeat="stu in $data">'+
    '                                        <td data-title="\'学生报告\'" width="70">'+
    '                                            <a href="javascript:void(0)" target="_blank" ui-sref="studentreportdetail({studentNumber:\'{{stu.StudentNumber}}\',taskID:\'{{stu.TaskID}}\',paperID:\'{{stu.PaperID}}\',classID:\'{{stu.ClassID}}\',from:\'teacherreportdetail\'})"'+
    '                                                style="display:block;" tooltip="查看学生报告" tooltip-placement="bottom">'+
    '                                                <span style="text-decoration:none;color:#198DC9;">'+
    '                                                    查看'+
    '                                                </span>'+
    '                                            </a>'+
    '                                        </td>'+
    '                                    </tr>'+
    '                                </tbody>'+
    '                            </table>'+
    '                        </div>'+
    '                    </div>'+
    '                </div>'+
    '                <div class="tab-pane" id="summary_report_teacher" style="">'+
    '                    <div ng-if="!chartData.AllData">'+
    '                        <div id="paper-analysis-title" style="text-align:center;font-size:24px;color:#000000; font-weight:normal;margin-top:40px;margin-bottom:40px;">{{PaperAnalysisData.PaperName}}</div>'+
    '                        <div style="text-align:center;">'+
    '                            <img src="img/report/cantAanlysis.png" alt="">'+
    '                        </div>'+
    '                        <div style="text-align:center;color:#9b9b9b;padding-top:20px;font-size:14px;">'+
    '                            <span>没有学生使用本套试卷答题，系统无法进行统计分析！</span>'+
    '                        </div>'+
    '                    </div>'+
    '                    <div ng-if="chartData.AllData">'+
    '                        <div class="analysis-layout">'+
    '                            <div class="title">'+
    '                                <img class="report-content-section-img" src="img/report/shijuanjiexi.png" />'+
    '                                <label class="report-content-section-label">总成绩分布图</label>'+
    '                            </div>'+
    '                            <div class="content-wrap">'+
    '                                <div class="info">'+
    '                                    <ul class="clearfix">'+
    '                                        <li class="info-item">'+
    '                                            <span class="text">满分</span>'+
    '                                            <span class="value">{{chartData.AllData.AllScore}}</span>'+
    '                                        </li>'+
    '                                        <li class="info-item">'+
    '                                            <span class="text">平均分</span>'+
    '                                            <span class="value">{{chartData.AllData.AvgScore.toFixed(2)}}</span>'+
    '                                        </li>'+
    '                                        <li class="info-item">'+
    '                                            <span class="text">最高分</span>'+
    '                                            <span class="value">{{chartData.AllData.MaxScore}}</span>'+
    '                                        </li>'+
    '                                        <li class="info-item">'+
    '                                            <span class="text">最低分</span>'+
    '                                            <span class="value">{{chartData.AllData.MinScore}}</span>'+
    '                                        </li>'+
    '                                        <li class="info-item">'+
    '                                            <span class="text">满分数</span>'+
    '                                            <span class="value">{{chartData.AllData.StudentCountForAllScore}}</span>'+
    '                                        </li>'+
    '                                        <li class="info-item">'+
    '                                            <span class="text">得分率</span>'+
    '                                            <span class="value">{{chartData.AllData.ScoreRate}}%</span>'+
    '                                        </li>'+
    '                                    </ul>'+
    '                                </div>'+
    '                                <div class="chart-wrap">'+
    '                                    <div id="allChart1"></div>'+
    '                                </div>'+
    '                            </div>'+
    '                        </div>'+
    '                        <div ng-repeat="(index,item) in chartData.AreaSummaryDataList" class="analysis-layout">'+
    '                            <div class="title">'+
    '                                <img class="report-content-section-img" src="img/report/shijuanjiexi.png" />'+
    '                                <label class="report-content-section-label">{{item.AreaTypeDescription}} - 成绩分布情况</label>'+
    '                            </div>'+
    '                            <div class="content-wrap">'+
    '                                <div class="info">'+
    '                                    <ul class="clearfix">'+
    '                                        <li class="info-item">'+
    '                                            <span class="text">满分</span>'+
    '                                            <span class="value">{{item.AllScore}}</span>'+
    '                                        </li>'+
    '                                        <li class="info-item">'+
    '                                            <span class="text">平均分</span>'+
    '                                            <span class="value">{{item.AvgScore.toFixed(2)}}</span>'+
    '                                        </li>'+
    '                                        <li class="info-item">'+
    '                                            <span class="text">最高分</span>'+
    '                                            <span class="value">{{item.MaxScore}}</span>'+
    '                                        </li>'+
    '                                        <li class="info-item">'+
    '                                            <span class="text">最低分</span>'+
    '                                            <span class="value">{{item.MinScore}}</span>'+
    '                                        </li>'+
    '                                        <li class="info-item">'+
    '                                            <span class="text">满分数</span>'+
    '                                            <span class="value">{{item.StudentCountForAllScore}}</span>'+
    '                                        </li>'+
    '                                        <li class="info-item">'+
    '                                            <span class="text">得分率</span>'+
    '                                            <span class="value">{{item.ScoreRate}}%</span>'+
    '                                        </li>'+
    '                                    </ul>'+
    '                                </div>'+
    '                                <div class="chart-wrap">'+
    '                                    <div ng-attr-id="score-detail{{index}}"></div>'+
    '                                </div>'+
    '                            </div>'+
    '                        </div>'+
    '                        <!-- <div id="allChart_container" class="row" style="border: solid 1px #ddd;margin: 14px 0 5px 0;">'+
    '                        <div class="row" id="allChart" style="height:450px;width:780px;  background-color:#E9F0F2;margin:30px auto !important;"></div>'+
    '                    </div>'+
    '                    <div id="listeningChart_container" class="row" style="border: solid 1px #ddd;margin: 14px 0 5px 0;">'+
    '                        <div class="row" id="listeningChart" style="height:450px;width:780px; background-color:#E9F0F2;margin:30px auto !important;"></div>'+
    '                    </div>'+
    '                    <div id="speakingChart_container" class="row" style="border: solid 1px #ddd;margin: 14px 0 14px 0;">'+
    '                        <div class="row" id="speakingChart" style="height:450px;width:780px;  background-color:#E9F0F2;margin:30px auto !important;"></div>'+
    '                    </div> -->'+
    '                    </div>'+
    '                </div>'+
    '                <div class="tab-pane" id="analysis_report_teacher">'+
    '                    <div ng-if="PaperAnalysisData&&!PaperAnalysisData.ContentAnalysisDetailList[0].StudentAnswerDataList.length">'+
    '                        <div id="paper-analysis-title" style="text-align:center;font-size:24px;color:#000000; font-weight:normal;margin-top:40px;margin-bottom:40px;">{{PaperAnalysisData.PaperName}}</div>'+
    '                        <div style="text-align:center;">'+
    '                            <img src="img/report/cantAanlysis.png" alt="">'+
    '                        </div>'+
    '                        <div style="text-align:center;color:#9b9b9b;padding-top:20px;font-size:14px;">'+
    '                            <span>没有学生使用本套试卷答题，系统无法进行卷面分析！</span>'+
    '                        </div>'+
    '                    </div>'+
    '                    <div ng-if="PaperAnalysisData.ContentAnalysisDetailList[0].StudentAnswerDataList.length">'+
    '                        <div id="paper-analysis-title" style="text-align:center;font-size:24px;color:#000000; font-weight:normal;margin-top:40px;margin-bottom:40px;">{{PaperAnalysisData.PaperName}}</div>'+
    '                        <div id="knowledgrpoint-info" ng-if="EnableKnowledgePointAnalysisBarChart" class="report-content-section" style="padding-top:0px;">'+
    '                            <img class="report-content-section-img" src="img/report/shijuanjiexi.png" />'+
    '                            <label class="report-content-section-label">知识点掌握情况</label>'+
    '                            <div class="row" style="height: 320px;padding: 10px 0px 10px 0px;margin-top:20px;">'+
    '                                <div class="col-md-6 col-xs-6" style="">'+
    '                                    <div class="row" id="knowledgePoint_analysis_barChart" style="height:300px;width:500px;  float:left;background-color:#E9F0F2;"></div>'+
    '                                </div>'+
    '                            </div>'+
    '                        </div>'+
    '                        <div id="scoreAnalysisInfo" class="report-content-section" style="padding-top:0px;" ng-if="PaperAnalysisData.ListeningAreaData!=undefined || PaperAnalysisData.SpeakingAreaData!=undefined">'+
    '                            <img class="report-content-section-img" src="img/report/shijuanjiexi.png" />'+
    '                            <label class="report-content-section-label">试卷解析</label>'+
    '                            <!--听力部分-->'+
    '                            <div style="margin-top:14px;margin-bottom:14px;background-color:#FFF9E9;border: dashed 1px #E3CEB3;padding:10px 10px;color:#E46C37;border-radius:3px;"'+
    '                                ng-if="PaperAnalysisData.ListeningAreaData.length>0">'+
    '                                <label style="font-weight:bold;font-size:16px !important;">听力部分&nbsp;</label>'+
    '                                <label style="font-size:16px !important;">(&nbsp;满分&nbsp;{{PaperAnalysisData.PaperListeningScore|roundMin0Max2Filter}}&nbsp;分&nbsp;)</label>'+
    '                            </div>'+
    '                            <div class="" ng-repeat="la in PaperAnalysisData.ListeningAreaData" style="clear:both;background-color:#ffffff;border-top-left-radius:0px;border-top-right-radius:0px;border-top:solid 2px #1790C9;border-right:solid 1px #e8e8e8;border-left:solid 1px #e8e8e8;margin-bottom:14px;">'+
    '                                <div data-toggle="collapse" data-parent="#accordion" href="{{\'#collapse\'+la.AreaID}}" ng-click="collapseToggle(la)" style="height:40px;line-height:40px;background-color:#F0F0F0;cursor:pointer;">'+
    '                                    <label style="margin-left:14px;cursor:pointer;font-weight:bold;font-size:15px !important;color:#000000;">'+
    '                                        {{GetAreaTitle(la)}}'+
    '                                    </label>'+
    '                                    <!-- <img src="img/report/defen.png" style="margin-left:20px;margin-right:5px;cursor:pointer;margin-top: -3px;"'+
    '                                    ng-click="ViewAreaScoreDetail(la,$event)" />'+
    '                                <label style="text-decoration:underline;cursor:pointer;font-size:14px !important; color:#333;" ng-click="ViewAreaScoreDetail(la,$event)">得分详情</label> -->'+
    '                                    <img ng-if="la.CollapseState==0" src="img/report/collapseDown.png" style="float:right;cursor:pointer;margin:16px 10px 16px 4px;"'+
    '                                        data-toggle="collapse" data-parent="#accordion" href="{{\'#collapse\'+la.AreaID}}" />'+
    '                                    <img ng-if="la.CollapseState==1" src="img/report/collapseUp.png" style="float:right;cursor:pointer;margin:16px 10px 16px 4px;"'+
    '                                        data-toggle="collapse" data-parent="#accordion" href="{{\'#collapse\'+la.AreaID}}" />'+
    '                                    <label ng-if="la.CollapseState==0" data-toggle="collapse" data-parent="#accordion" href="{{\'#collapse\'+la.AreaID}}" style="float:right;cursor:pointer;font-size:14px;color:#777777;">'+
    '                                        展开'+
    '                                    </label>'+
    '                                    <label ng-if="la.CollapseState==1" data-toggle="collapse" data-parent="#accordion" href="{{\'#collapse\'+la.AreaID}}" style="float:right;cursor:pointer;font-size:14px;color:#777777;">'+
    '                                        收缩'+
    '                                    </label>'+
    '                                </div>'+
    '                                <div id="{{\'collapse\'+la.AreaID}}" class="panel-collapse collapse">'+
    '                                    <div style="font-size:14px;padding:10px 14px 10px  14px;border-bottom:dotted 1px #cbcbcb;color:#666;">'+
    '                                        {{la.AreaPrompt}}'+
    '                                    </div>'+
    '                                    <div ng-repeat="qData in la.QuestionData" style="border-bottom: 1px solid #e8e8e8;">'+
    '                                        <teacher-question-detail analysis-detail-data="PaperAnalysisData.ContentAnalysisDetailList" question-data="qData" paper-resource-base-url="Constants.paperResourceBaseUrl"></teacher-question-detail>'+
    '                                    </div>'+
    '                                </div>'+
    '                            </div>'+
    '                            <!--口语部分-->'+
    '                            <div style="margin-top:14px;margin-bottom:14px;background-color:#FFF9E9;border: dashed 1px #E3CEB3;padding:10px 10px;color:#E46C37;border-radius:3px;"'+
    '                                ng-if="PaperAnalysisData.SpeakingAreaData.length>0">'+
    '                                <label style="font-weight:bold;font-size:16px !important;">口语部分&nbsp;</label>'+
    '                                <label style="font-size:16px !important;">(&nbsp;满分&nbsp;{{PaperAnalysisData.PaperSpeakingScore|roundMin0Max2Filter}}&nbsp;分&nbsp;)</label>'+
    '                            </div>'+
    '                            <div class="" ng-repeat="sa in PaperAnalysisData.SpeakingAreaData" style="clear:both;background-color:#ffffff;border-top-left-radius:0px;border-top-right-radius:0px;border-top:solid 2px #1790C9;border-right:solid 1px #e8e8e8;border-left:solid 1px #e8e8e8;margin-bottom:14px;">'+
    '                                <div data-toggle="collapse" data-parent="#accordion" href="{{\'#collapse\'+sa.AreaID}}" ng-click="collapseToggle(sa)" style="height:40px;line-height:40px;background-color:#F0F0F0;cursor:pointer;">'+
    '                                    <label style="margin-left:14px;cursor:pointer;font-weight:bold;font-size:15px !important;color:#000000;">'+
    '                                        {{GetAreaTitle(sa)}}'+
    '                                    </label>'+
    '                                    <!-- <img src="img/report/defen.png" style="margin-left:20px;margin-right:5px;cursor:pointer;margin-top: -3px;"'+
    '                                    ng-click="ViewAreaScoreDetail(sa,$event)" />'+
    '                                <label style="text-decoration:underline;cursor:pointer;font-size:14px !important; color:#333;" ng-click="ViewAreaScoreDetail(sa,$event)">得分详情</label> -->'+
    '                                    <img ng-if="sa.CollapseState==0" src="img/report/collapseDown.png" style="float:right;cursor:pointer;margin:15px 10px;"'+
    '                                        data-toggle="collapse" data-parent="#accordion" href="{{\'#collapse\'+sa.AreaID}}" />'+
    '                                    <img ng-if="sa.CollapseState==1" src="img/report/collapseUp.png" style="float:right;cursor:pointer;margin:15px 10px;"'+
    '                                        data-toggle="collapse" data-parent="#accordion" href="{{\'#collapse\'+sa.AreaID}}" />'+
    '                                    <label ng-if="sa.CollapseState==0" data-toggle="collapse" data-parent="#accordion" href="{{\'#collapse\'+sa.AreaID}}" style="float:right;cursor:pointer;font-size:14px;color:#777777;">'+
    '                                        展开'+
    '                                    </label>'+
    '                                    <label ng-if="sa.CollapseState==1" data-toggle="collapse" data-parent="#accordion" href="{{\'#collapse\'+sa.AreaID}}" style="float:right;cursor:pointer;font-size:14px;color:#777777;">'+
    '                                        收缩'+
    '                                    </label>'+
    '                                </div>'+
    '                                <div id="{{\'collapse\'+sa.AreaID}}" class="panel-collapse collapse">'+
    '                                    <div style="font-size:14px;padding:10px 14px 10px  14px;border-bottom:dotted 1px #cbcbcb;color:#666;">'+
    '                                        {{sa.AreaPrompt}}'+
    '                                    </div>'+
    '                                    <div ng-repeat="qData in sa.QuestionData" style="border-bottom: 1px solid #e8e8e8;">'+
    '                                        <teacher-question-detail analysis-detail-data="PaperAnalysisData.ContentAnalysisDetailList" question-data="qData" area-data="sa"'+
    '                                            paper-resource-base-url="Constants.paperResourceBaseUrl"></teacher-question-detail>'+
    '                                    </div>'+
    '                                </div>'+
    '                            </div>'+
    '                        </div>'+
    '                    </div>'+
    '                </div>'+
    '            </div>'+
    '        </div>'+
    '        <div class="report-footer" style="z-index:9999;background-color:#E3EAEB;width: 920px;bottom: 0px;position: fixed;line-height:42px;margin-left: -10px;">'+
    '            <div class="row" style="text-align:center;">'+
    '                <a href="http://www.miitbeian.gov.cn/" target="_blank">苏ICP备14027754号-3</a>'+
    '                <a href="http://www.chivox.com" target="_blank">苏州驰声信息科技有限公司 Copyright ©2016-2017 All Rights Reserved</a>'+
    '            </div>'+
    '        </div>'+
    '    </div>'+
    //'    <div style="width: 30px;cursor:pointer;float: left;position: fixed;top: 15px;margin-left: 920px;">'+
    //'        <img src="img/report/download.png" style="width: 36px;height: 127px;position:fixed;" ng-click="DownloadReport()">'+
    //'    </div>'+
    '</div>'+
    '<div class="modal" id="ExportingDialog" tabindex="-2" role="dialog">'+
    '    <div class="modal-dialog">'+
    '        <div class="modal-content" style="width: 400px; margin: auto;">'+
    '            <div class="modal-header" style="background-color: #F2F3F7;">'+
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close"></button>'+
    '                <h5 class="modal-title" style="">导出报告</h5>'+
    '            </div>'+
    '            <div class="modal-body">'+
    '                <div style="" ng-if="ByArea==true&&ReportDownloadKey==\'\'">正在导出报告('+
    '                    <a>{{ExportAreaPercent}}</a>%)...</div>'+
    '                <div style="" ng-if="ByArea==false&&ReportDownloadKey==\'\'">正在导出报告...</div>'+
    '                <div style="" ng-if="ReportDownloadKey!=\'\'">'+
    '                    <a id="a_downloadReportLink" href="/api/report/download/{{ReportDownloadKey}}" style="color:#337ab7;text-decoration:underline;">下载报告</a>'+
    '                </div>'+
    '            </div>'+
    '            <div class="modal-footer">'+
    '                <button type="button" class="btn btn-primary" data-dismiss="modal" style="width: 169px">取消</button>'+
    '            </div>'+
    '        </div>'+
    '    </div>'+
    '</div>'+
    '<div class="modal" id="showRefTextDialog" tabindex="-2" role="dialog">'+
    '    <div class="modal-dialog">'+
    '        <div class="modal-content" style="width: 500px;margin:auto;">'+
    '            <div class="modal-header" style="background-color: #E1E1E1 !important;color: #333;">'+
    '                <button type="button" class="close" data-dismiss="modal" style="background-image: url(img/report/close.png);width:16px;height:15px;"'+
    '                    aria-label="Close"></button>'+
    '                <span class="modal-title" id="myModalLabel" style="line-height:0px;font-size:16px;">录音原文</span>'+
    '            </div>'+
    '            <div class="modal-body">'+
    '                <div style="background-color:#ffffff;font-family:Arial,\'Microsoft YaHei\';font-size:14px !important;color:black !important;">{{GetRefText()}}</div>'+
    '            </div>'+
    '        </div>'+
    '    </div>'+
    '</div>'+
    '<div class="modal" id="areaAnalysisChartDialog" tabindex="-2" role="dialog">'+
    '    <div class="modal-dialog">'+
    '        <div class="modal-content" style="width: 465px;margin:auto;">'+
    '            <div class="modal-header" style="background-color: #E1E1E1 !important;color: #333333;">'+
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close"> </button>'+
    '                <h5 class="modal-title" id="myModalLabel" style="color:#898989;">得分详情</h5>'+
    '            </div>'+
    '            <div class="modal-body">'+
    '                <div style="background-color:#ffffff;padding:15px 0px 20px 0px">'+
    '                    <div class="row" id="AreaAnalysisChart" style="height:230px;width:420px; background-color:#E9F0F2;"></div>'+
    '                </div>'+
    '            </div>'+
    '        </div>'+
    '    </div>'+
    '</div>'+
    '<div class="modal" id="contentAnalysisChartDialog" tabindex="-2" role="dialog">'+
    '    <div class="modal-dialog">'+
    '        <div class="modal-content" id="contentAnalysisChartDialog_modal-content" style="width: 950px;margin:auto;">'+
    '            <div class="modal-header" style="background-color: #E1E1E1 !important;color: #333333;">'+
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close"> </button>'+
    '                <h5 class="modal-title" id="myModalLabel" style="color:#898989;">得分详情</h5>'+
    '            </div>'+
    '            <div class="modal-body" id="contentAnalysisChartDialog_modal-body" style="height: 600px;">'+
    '                <div class="analysis-chart-container" style="border-right:solid 1px #dbdbdb;">'+
    '                    <div class="row analysis-chart" id="ContentAnalysisChart_All" style=""></div>'+
    '                </div>'+
    '                <div id="ContentAnalysisChart_Integrity_container" class="analysis-chart-container" style="">'+
    '                    <div class="row analysis-chart" id="ContentAnalysisChart_Integrity"></div>'+
    '                </div>'+
    '                <div class="row" id="contentAnalysisChart_spliter" style="border-top:solid 1px #dbdbdb;width:100%;height:1px;clear:both;"></div>'+
    '                <div id="ContentAnalysisChart_Pronounce_container" class="analysis-chart-container" style="">'+
    '                    <div class="row analysis-chart" id="ContentAnalysisChart_Pronounce"></div>'+
    '                </div>'+
    '                <div id="ContentAnalysisChart_Fluency_container" class="analysis-chart-container" style="">'+
    '                    <div class="row analysis-chart" id="ContentAnalysisChart_Fluency"></div>'+
    '                </div>'+
    '            </div>'+
    '        </div>'+
    '    </div>'+
    '</div>'+
    '<div class="modal simple-chart-dialog" id="simple-chart-dialog" tabindex="-2" role="dialog">'+
    '    <div class="modal-dialog">'+
    '        <div class="modal-content">'+
    '            <div class="modal-header">'+
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">'+
    '                    <span>&times;</span>'+
    '                </button>'+
    '                <h5 class="modal-title">查看答题解析</h5>'+
    '            </div>'+
    '            <div class="modal-body">'+
    '                <div class="clearfix">'+
    '                    <div class="chart-wrap">'+
    '                        <div class="chart" id="analysis-simple-piechart"></div>'+
    '                    </div>'+
    '                    <div class="table-wrap custom-scrollbar v-custom-scrollbar">'+
    '                        <div id="scrollable-area" class="scrollable-area">'+
    '                            <table fixed-table-headers="scrollable-area" ng-table="analysisSimpleTable" class="table table-condensed table-bordered table-hover table-center-align table-special-header">'+
    '                                <tbody>'+
    '                                    <tr ng-repeat="item in $data">'+
    '                                        <td data-title="\'学号\'" class="ellipsis" ng-attr-title="{{item.StudentNumber}}">{{ item.StudentNumber}}</td>'+
    '                                        <td data-title="\'姓名\'" class="ellipsis" ng-attr-title="{{item.StudentName}}">{{ item.StudentName }}</td>'+
    '                                        <td ng-if="detailData.ContentAnalysisType===0" data-title="\'得分\'">{{ item.Score }}</td>'+
    '                                        <td class="ellipsis" data-title="\'考生答案\'">'+
    '                                            <div ng-if="item.AnswerID&&detailData.ContentAnalysisType===0" class="audio-wrap" ng-click="PlayAudio(item.AnswerID,item.Answer.slice(5));$event.stopPropagation();">'+
    '                                                <img ng-if="IsAudioPlaying(item.AnswerID)==false" src="img/paperDesign/playAudio.png" />'+
    '                                                <img ng-if="IsAudioPlaying(item.AnswerID)==true" src="img/paperDesign/playingAudio.gif" />'+
    '                                            </div>'+
    '                                            <span class="answer false" ng-if="!item.AnswerID&&detailData.ContentAnalysisType===0">未答题</span>                                            '+
    '                                            <span class="answer" ng-if="detailData.ContentAnalysisType===1" ng-class="{true: \'true\', false: \'false\'}[item.IfTrue]" ng-attr-title="{{item.Answer}}">{{item.Answer?item.Answer:\'未答题\'}}</span>'+
    '                                            <span class="answer" ng-if="detailData.ContentAnalysisType===2" ng-class="{true: \'true\', false: \'false\'}[item.IfTrue]" ng-attr-title="{{item.Answer}}">{{item.Answer?item.Answer:\'未答题\'}}</span>'+
    '                                        </td>'+
    '                                    </tr>'+
    '                                </tbody>'+
    '                            </table>'+
    '                        </div>'+
    '                    </div>'+
    '                </div>'+
    '            </div>'+
    '        </div>'+
    '    </div>'+
    '</div>'+
    '<div class="modal complex-chart-dialog" id="complex-chart-dialog" tabindex="-2" role="dialog">'+
    '    <div class="modal-dialog">'+
    '        <div class="modal-content">'+
    '            <div class="modal-header">'+
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">'+
    '                    <span>&times;</span>'+
    '                </button>'+
    '                <h5 class="modal-title">查看答题解析</h5>'+
    '            </div>'+
    '            <div class="modal-body">'+
    '                <div class="v-custom-scrollbar custom-scrollbar">'+
    '                    <div class="chart-group clearfix">'+
    '                        <div class="chart-wrap" ng-repeat="item in detailData.ScoreScattergramList">'+
    '                            <div class="title">'+
    '                                <span>{{item.ScoreScattergramType|filterChartType}}</span>'+
    '                            </div>'+
    '                            <div class="chart" ng-attr-id="{{\'analysis-complex-piechart\'+item.ScoreScattergramType}}"></div>'+
    '                        </div>'+
    '                    </div>'+
    '                    <div class="table-wrap">'+
    '                        <table fixed-table-headers="scrollable-area" ng-table-dynamic="analysisComplexTable with detailCols" class="table table-condensed table-bordered table-hover table-center-align table-special-header">'+
    '                            <tbody>'+
    '                                <tr class="parent-tr" ng-repeat="item in $data" data-show="false" ng-click="showChild($event,item)">'+
    '                                    <td ng-repeat="col in $columns">'+
    '                                        <div ng-if="col.field==\'ReadTextScoreDetail\'" class="clearfix range-wrap">'+
    '                                            <div ng-style="getRangePercent(item.ReadTextScoreDetail,\'green\')" class="green"></div>'+
    '                                            <div ng-style="getRangePercent(item.ReadTextScoreDetail,\'yellow\')" class="yellow"></div>'+
    '                                            <div ng-style="getRangePercent(item.ReadTextScoreDetail,\'blue\')" class="blue"></div>'+
    '                                            <div ng-style="getRangePercent(item.ReadTextScoreDetail,\'red\')" class="red"></div>'+
    '                                        </div>'+
    '                                        <div ng-if="col.field==\'Answer\'&&item.AnswerID&&detailData.AreaType!==16" class="audio-wrap" ng-click="PlayAudio(item.AnswerID,item.Answer.slice(5));$event.stopPropagation();">'+
    '                                            <img ng-if="IsAudioPlaying(item.AnswerID)==false" src="img/paperDesign/playAudio.png" />'+
    '                                            <img ng-if="IsAudioPlaying(item.AnswerID)==true" src="img/paperDesign/playingAudio.gif" />'+
    '                                        </div>'+
    '                                        <div ng-if="col.field==\'Answer\'&&item.AnswerID&&detailData.AreaType==16" class="audio-wrap" ng-click="PlayMultiAudio(item.AnswerID,item.Answer.slice(5));$event.stopPropagation();">'+
    '                                            <img ng-if="IsAudioPlaying(item.AnswerID)==false" src="img/paperDesign/playAudio.png" />'+
    '                                            <img ng-if="IsAudioPlaying(item.AnswerID)==true" src="img/paperDesign/playingAudio.gif" />'+
    '                                        </div>'+
    '                                        <span ng-if="col.field==\'StudentNumber\'" class="ellipsis" style="display:inline-block;max-width:100px;" ng-attr-title="{{item.StudentNumber}}">{{item.StudentNumber}}</span>'+
    '                                        <span ng-if="col.field==\'StudentName\'">{{item.StudentName}}</span>'+
    '                                        <span ng-if="col.field==\'Score\'&&item.AnswerID">{{item.Score}}</span>'+
    '                                        <span style="color:#fe0000" ng-if="col.field==\'Score\'&&!item.AnswerID">未答题</span>'+
    '                                        <span ng-if="col.field==\'IntegrityScore\'">{{!item.AnswerID||item.IntegrityScore==-1?\'--\':formatScoreDisplayText(item.IntegrityScore)}}</span>'+
    '                                        <span ng-if="col.field==\'PronounceScore\'">{{!item.AnswerID||item.PronounceScore==-1?\'--\':formatScoreDisplayText(item.PronounceScore)}}</span>'+
    '                                        <span ng-if="col.field==\'FluencyScore\'">{{!item.AnswerID||item.FluencyScore==-1?\'--\':formatScoreDisplayText(item.FluencyScore)}}</span>'+
    '                                    </td>'+
    '                                    <!-- <td data-title=" \'学号\' ">{{ item.StudentNumber}}</td>'+
    '                                    <td data-title=" \'姓名\' ">{{ item.StudentName }}</td>'+
    '                                    <td data-title=" \'得分\' ">{{ item.Score }}</td>'+
    '                                    <td data-title=" \'完整度\' ">{{ item.IntegrityScore}}</td>'+
    '                                    <td data-title=" \'准确度\' ">{{ item.PronounceScore }}</td>'+
    '                                    <td data-title=" \'流利度\' ">{{ item.FluencyScore }}</td>'+
    '                                    <td data-title=" \'考生答案\' " class="range-td ">'+
    '                                        <div ng-if="item.ReadTextScoreDetail " class="clearfix range-wrap ">'+
    '                                            <div ng-style="getRangePercent(item.ReadTextScoreDetail, \'green\') " class="green "></div>'+
    '                                            <div ng-style="getRangePercent(item.ReadTextScoreDetail, \'yellow\')'+
    '                                            " class="yellow "></div>'+
    '                                            <div ng-style="getRangePercent(item.ReadTextScoreDetail, \'blue\') " class="blue "></div>'+
    '                                            <div ng-style="getRangePercent(item.ReadTextScoreDetail, \'red\') " class="red "></div>'+
    '                                        </div>'+
    '                                    </td>'+
    '                                    <td data-title=" \'操作\' ">'+
    '                                        <div ng-if="item.AnswerID " class="audio-wrap " ng-click="PlayAudio(item.AnswerID,item.Answer.slice(5)) ">'+
    '                                            <img ng-if="IsAudioPlaying(item.AnswerID)==false " src="img/paperDesign/playAudio.png " />'+
    '                                            <img ng-if="IsAudioPlaying(item.AnswerID)==true " src="img/paperDesign/playingAudio.gif " />'+
    '                                        </div>'+
    '                                    </td> -->'+
    '                                </tr>'+
    '                            </tbody>'+
    '                        </table>'+
    '                    </div>'+
    '                </div>'+
    '            </div>'+
    '        </div>'+
    '    </div>'+
    '</div>';

    return html
});