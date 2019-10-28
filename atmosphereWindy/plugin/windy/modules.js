/**
 *	@author cp
 *  入口 
 */
!function(win){
    "use strict";
    //时间格式化定义
    Date.prototype.format = function () {
        var s = '';
        var month = (this.getMonth() + 1)>=10?(this.getMonth() + 1):('0'+(this.getMonth() + 1));
        var day = this.getDate()>=10?this.getDate():('0'+this.getDate());
        var hour = this.getHours()>=10?this.getHours():('0'+this.getHours());
        var minute = this.getMinutes()>=10?this.getMinutes():('0'+this.getMinutes());
        var second = this.getSeconds()>=10?this.getSeconds():('0'+this.getSeconds());
        s += this.getFullYear() + '-'; // 获取年份。
        s += month + "-"; // 获取月份。
        s += day; // 获取日。
        s +=" ";
        s += hour + ":";
        s += "00:00";
        return (s); // 返回日期。
    }


    var citySelect = void 0;
    //预报五天弹出层关闭时间注册
    (function(){
        document.querySelector(".forcast5day-close").onclick =  function(e){
            that.state.forecastvisible = !1,
                    document.querySelector("#forcast5day").style.display = "none";
        }

        //全国城市选择器
        citySelect = new Vcity.CitySelector({
            input: 'citySelect'
        });
        Vcity.options.regionShow = false;
        //为了统一性 getStationsByCity 作为中转方法 只为返回选择的城市信息只能作為全局
        win.getStationsByCity = function(cityName) {

            console.log(cityName);
        }
    })();

    var timeline = function () {
        var styleCss = {};

        var idConfig = {
            "rootId": "_timeLine", // 总的class or id
            "timeControl": "_timeControl", //播放容器div -- class or id                左
            "timePlay": "_timePlay", //播放控件div -- class or id
            "timeProgress-box": "_timeProgress-box", // 右边div -- class or id     右
            "hover-popup": "_hover-popup", // 鼠标悬浮div -- class or id
            "click-popup": "_click-popup", // 鼠标点击div -- class or id
            "animate-popup": "_animate-popup", // 动画div -- class or id
            "com-popup": "_com-popup",
            "timeProgress-hide": "_timeProgress-hide", // 真正的时间DOM div容器  -- class or id
            "timeProgress-inner": "_timeProgress-inner", // 内嵌div 容器
            "timeProgress-line": "_timeProgress-line",
            "timeProgress-bar": "_timeProgress-bar",
            "every-day": "_every-day",
            month: "_month",
            day: "_day"
        }

        // 播放event
        var play = function () {
            //_onPlay(); 	0: stop , 1: play
            0 === styleCss.status ? (styleCss.status = 1,
                    document.querySelectorAll("._com-popup")[0].style.display = "none",
                    document.querySelector("._animate-popup").style.display = "block",
                    setTimeout(function () {		//递归方式
                        _onPlay();
                    }, 20)) : (styleCss.status = 0,

            styleCss.timerout && clearTimeout(styleCss.timerout))

        }

        //play impelement			getData ---> re-render
        var _onPlay = function (e) {

            if (styleCss.barWidth % styleCss.dis_hour != 0) {
                var translatex = styleCss.barWidth % styleCss.dis_hour;
                styleCss.barWidth += styleCss.dis_hour - translatex;
            } else {
                styleCss.barWidth += styleCss.dis_hour;
            }

            if (hasReachEnd()) {
                styleCss.barWidth = 0;
            }
            var dayIndex = Math.floor(styleCss.barWidth / styleCss.dis_day);
            var year = document.querySelectorAll("._every-day")[dayIndex].getAttribute("data-year"),
                    month = document.querySelectorAll("._every-day >span._month")[dayIndex].textContent,
                    day = document.querySelectorAll("._every-day >span._day")[dayIndex].textContent;

            var hour = Math.floor(styleCss.barWidth % styleCss.dis_day / styleCss.dis_hour);
            var time = month < 10 ?
                    day < 10 ?
                            hour < 10 ? (year + "-" + "0"+ month + "-" + "0" + day + " " + "0" + hour + ":00") :
                                    (year + "-" +  "0" + month + "-" + "0" + day + " " + hour + ":00") :
                            hour < 10 ? (year + "-" +  "0" + month + "-" + day + " " + "0" + hour + ":00") : (year + "-" +  "0" + month + "-" + day + " " + hour + ":00") :
                    day < 10 ?
                            hour < 10 ? (year + "-" + month + "-" + "0" + day + " " + "0" + hour + ":00") :
                                    (year + "-" +  month + "-" + "0" + day + " " + hour + ":00") :
                            hour < 10 ? (year + "-" + month + "-" + day + " " + "0" + hour + ":00") : (year + "-" + month + "-" + day + " " + hour + ":00");

            var texts = hour < 10 ? "0" + hour + ":00" : hour + ":00";
            $("._com-popup").text(texts);

            if(new Date(time).getTime() > new Date().getTime()){
                styleCss.barWidth = 0;
            }
            $('._timeProgress-bar').animate({
                width: styleCss.barWidth,
            }, 20, 'linear');

            //null !== this._fetchTime && new Date().getTime() - MC.option._fetchTime < 500 || (MC.option._fetchTime = new Date().getTime(),
            //getTime()
            //获取移动当前时间
            //显示时间
            //调用方法: getDataByTime(this.time,...)		arguments[0]必须
            win.that._selecttime = time,
            console.log(time),
            document.querySelector(".timeInfo") && (document.querySelector(".timeInfo").textContent =  time + ":00")
            win.that.getDataByTime(time, styleCss.status);

            styleCss.timerout = setTimeout(function () {
                _onPlay()
            }, 2e3);
        }

        //播放停止
        var stop = function () {
            styleCss.status = 1;
            document.querySelector("._timePlay").title = "播放";
            $("._timePlay").removeClass("pause").addClass("play");
            clearTimeout(styleCss.timerout);
        }

        //点击事件
        var timeControlClick = function (e) {
            var el = e.target || e.currentTarget;
            if (el.title == "播放") {
                styleCss.status = 0;
                el.title = "暂停";
                $(el).removeClass("play").addClass("pause");
            } else {
                styleCss.status = 1;
                el.title = "播放";
                $(el).removeClass("pause").addClass("play");
            }
            play();
        }

        var timeLineClick = function (e) {
            stop();
            var x = e.clientX;
            var dayIndex = Math.floor((x - 50) / styleCss.dis_day);
            var hour = Math.floor((x - 50) % styleCss.dis_day / styleCss.dis_hour);
            var day = parseInt(document.querySelectorAll("._every-day >span._day")[dayIndex].textContent);
            var month = parseInt(document.querySelectorAll("._every-day >span._month")[dayIndex].textContent),
                    year = document.querySelectorAll("._every-day")[dayIndex].getAttribute("data-year");

            month = month < 10 ? "0" + month : month;
            day = day < 10 ? "0" + day : day;
            hour = hour < 10 ? "0" + hour : hour;
            var time = year + "-" + month + "-" + day +" "+hour+":00";
            if(new Date(time).getTime() > new Date().getTime()){
                return;
            }
            styleCss.barWidth = x - 50;
            var texts = hour + ":00";
            $("._com-popup").text(texts).hide();
            $("._com-popup._click-popup").show().css('left', x - 50);
            $("._timeProgress-bar").stop().css('width', x - 50);
            
            win.that._selecttime = time,
            console.log(time),
            document.querySelector(".timeInfo") && (document.querySelector(".timeInfo").textContent =  time + ":00")
            //getDataByTime(this.time,...)		arguments[0]必须
            win.that.getDataByTime(time, /*styleCss.status*/!1 )
        }

        //鼠标hover事件
        var hover = function (event) {
            //window.addEventListener("mousemove", function hoverOut(e){
            $(window).on("mousemove", function (e) {
                var e = event || window.event;
                var x = e.clientX;
                var dayIndex = Math.floor((x - 50) / styleCss.dis_day);
                var hour = Math.floor((x - 50) % styleCss.dis_day / styleCss.dis_hour);
                var day = parseInt(document.querySelectorAll("._every-day >span._day")[dayIndex].textContent);
                var month = parseInt(document.querySelectorAll("._every-day >span._month")[dayIndex].textContent);

                var hoverPopup = document.getElementsByClassName(idConfig["hover-popup"])[0];
                hoverPopup.innerText = hour < 10 ? "0" + hour + ":00" : hour + ":00";
                hoverPopup.style.left = x - 50 + "px";
                hoverPopup.style.display = "block";

            });

            $('._timeProgress-inner').one('mouseleave', function () {
                $(window).off('mousemove');
                $("._hover-popup").hide();
            })

        }

        //鼠标hoverout事件
        var hoverOut = function (e) {
            document.getElementsByClassName(idConfig["hover-popup"])[0].removeEventListener("mouseover", hover);
            document.getElementsByClassName("_hover-popup")[0].style.display = "none";
        }

        var hasReachEnd = function () {
            if (styleCss.barWidth >= document.getElementsByClassName("_timeProgress-line")[0].clientWidth) {
                return true;
            } else {
                return false;
            }

        }
        //事件注册初始化
        var eventInit = function () {
            $("._timeProgress-inner").on("mouseover", function () {
                hover();
            });
            $("._timeProgress-line").on("click", function (event) {
                var e = event || window.event;
                timeLineClick(e);
            });
            $("._timePlay").on("click", function (e) {

                timeControlClick(e)
            })
        }

        var returnNear5Day = function () {
            var day5 = [];
            var date = new Date();
            var hour = date.getHours(),
                    day = date.getDate(),
                    month = date.getMonth() + 1,
                    year = date.getFullYear(),
                    time = date.getTime();
            //历史
            for (var i = 4; i >= 0; i--) {
                day5[4-i] = [];
                day5[4-i][0] = new Date(time - (i - 1 + 1) * 24 * 60 * 60 * 1000).getFullYear();
                day5[4-i][1] = new Date(time - (i - 1 + 1) * 24 * 60 * 60 * 1000).getMonth() + 1;
                day5[4-i][2] = new Date(time - (i - 1 + 1) * 24 * 60 * 60 * 1000).getDate();

            }
            //历史一天+ 预报3天
            /* for (var i = 0; i < 5; i++) {
                day5[i] = [];
                day5[i][0] = new Date(time + (i - 1) * 24 * 60 * 60 * 1000).getFullYear();
                day5[i][1] = new Date(time + (i - 1) * 24 * 60 * 60 * 1000).getMonth() + 1;
                day5[i][2] = new Date(time + (i - 1) * 24 * 60 * 60 * 1000).getDate();

            } */
            return day5;

        }

        //渲染DOM
        var render = function () {

            styleCss.width = window.innerWidth - 310 + 1 + "px";
            styleCss.height = "80px";
            styleCss.timeControl = "40px";
            styleCss.timeProgress = window.innerWidth - 310 + 1 - 50 + "px";
            styleCss.dis_day = (window.innerWidth - 310 - 50) / 5; // 一天的宽度
            styleCss.dis_hour = (window.innerWidth - 310 - 50) / 5 / 24;
            styleCss.status = 0;
            //var self = this;
            var rootDiv = document.createElement("div");
            rootDiv.id = idConfig.rootId;
            rootDiv.style.width = styleCss.width;
            rootDiv.style.height = styleCss.height;

            //left container
            var timeControlDiv = document.createElement("div");
            timeControlDiv.className = idConfig.timeControl;
            timeControlDiv.style.width = styleCss.timeControl;
            timeControlDiv.style.marginLeft = "10px";

            var timePlayDiv = document.createElement("div");
            timePlayDiv.className = idConfig.timePlay + " play";
            timePlayDiv.title = "播放";
            timeControlDiv.appendChild(timePlayDiv);
            //事件注册

            //右容器
            var timeProgressBoxDiv = document.createElement("div");
            timeProgressBoxDiv.className = idConfig["timeProgress-box"];
            timeProgressBoxDiv.style.width = styleCss.timeProgress;
            var hoverDiv = document.createElement("div");
            hoverDiv.className = idConfig["hover-popup"];
            hoverDiv.innerText = "";

            var clickDiv = document.createElement("div");
            clickDiv.className = idConfig["click-popup"] + " " + idConfig["com-popup"];
            clickDiv.innerText = "10:00";
            clickDiv.style.display = "none";

            timeProgressBoxDiv.appendChild(hoverDiv), timeProgressBoxDiv.appendChild(clickDiv);

            var timeProgressHideDiv = document.createElement("div");
            timeProgressHideDiv.className = idConfig["timeProgress-hide"];
            var timeProgressInnerDiv = document.createElement("div");
            timeProgressInnerDiv.className = idConfig["timeProgress-inner"];

            //right-top
            var timeProgressLineDiv = document.createElement("div");
            timeProgressLineDiv.className = idConfig["timeProgress-line"];

            //当前时间 hour--day
            var date = returnNear5Day();//获取当前时间的hour-day-month-year
            var cur_hour = new Date().getHours(),
                    cur_day = new Date().getDate(),
                    index;

            for(var i = 0; i < date.length; i++){
                if(date[i][2] == cur_day){
                    index = i;
                    break;
                }
            }
            document.querySelector(".timeInfo") && (document.querySelector(".timeInfo").textContent = new Date().format().split(" ")[0] +" " + cur_hour +":00:00");

            var timeProgressBarDiv = document.createElement("div");
            timeProgressBarDiv.className = idConfig["timeProgress-bar"];
            timeProgressBarDiv.style.width = styleCss.dis_day * index + styleCss.dis_hour * cur_hour + "px";
            //init the width of timeBar, click or play can be change it
            styleCss.barWidth = styleCss.dis_day * index + styleCss.dis_hour * cur_hour;

            var animateDiv = document.createElement("div");
            animateDiv.className = idConfig["animate-popup"] + " " + idConfig["com-popup"];
            animateDiv.innerText = cur_hour < 10 ? "0" + cur_hour + ":00" : cur_hour + ":00";

            timeProgressBarDiv.appendChild(animateDiv);
            timeProgressLineDiv.appendChild(timeProgressBarDiv);

            //right-bottom
            var ul = document.createElement("ul");

            for (var i = 0; i < 5; i++) {
                var everyli = document.createElement("li");
                everyli.className = idConfig["every-day"];
                everyli.setAttribute("data-year", date[i][0]);
                everyli.style.width = styleCss.dis_day + "px";

                var ol = document.createElement("ol");
                for (var j = 0; j < 8; j++) {
                    var li = document.createElement("li");
                    j == 0 ? (li.innerText = "") : li.innerText = j * 3 < 10 ? "0" + j * 3 : j * 3;
                    ol.appendChild(li);
                }
                var spanMonth = document.createElement("span");
                spanMonth.className = idConfig.month;
                spanMonth.innerText = date[i][1];
                var spanBackslash = document.createElement("span");
                spanBackslash.innerText = "/";
                var spanDay = document.createElement("span");
                spanDay.className = idConfig.day;
                spanDay.innerText = date[i][2];

                everyli.appendChild(ol),
                        everyli.appendChild(spanMonth),
                        everyli.appendChild(spanBackslash),
                        everyli.appendChild(spanDay);

                ul.appendChild(everyli);

            }
            timeProgressInnerDiv.appendChild(timeProgressLineDiv), timeProgressInnerDiv.appendChild(ul);
            timeProgressHideDiv.appendChild(timeProgressInnerDiv);
            timeProgressBoxDiv.appendChild(timeProgressHideDiv);

            //timeProgressBoxDiv.addEventListener("mouseover", hover);
            rootDiv.appendChild(timeControlDiv), rootDiv.appendChild(timeProgressBoxDiv);

            document.getElementsByTagName("body")[0].appendChild(rootDiv);

            eventInit();

        };
        render();
        win.onresize = function () {
            document.querySelector("#_timeLine").remove();
            render();
        }
        return {
            hover: hover,
            timeLineClick: timeLineClick,
            timeControlClick: timeControlClick,
            play: play,
            _onPlay: _onPlay,
            stop: stop,
        }
    }();

    var layitem = function () {

        var itemConfig = {};

        itemConfig.factorItem = {
            aqi: "aqi|AQI|0||1",
            pm2_5: "pm2_5|PM2.5|0|μg/m³|1",
            pm10: "pm10|PM10|0|μg/m³|1",
            so2: "so2|SO2|0|μg/m³|1",
            no2: "no2|NO2|0|μg/m³|1",
            co: "co|CO|1|mg/m³|1",
            o3: "o3|O3|0|μg/m³|1",
        }
        itemConfig.layerItem = {
            temp: "temp|温度|0|℃|2",
            rain: "rain|降雨量|0|mm|2",
            clouds: "clouds|云|0|%|2",
            wind: "wind|风速|0|km/h|2",
            pressure: "pressure|气压|0|hPa|2",
            humidity: "humidity|湿度|0|%|2",
            self: "self|六项|0||1", //六项
            none: "none|纯净|0||0",     // none|纯净|0||0
            //AQI: "none|AQI|0||0"     // none|纯净|0||0
        }
        itemConfig.key = {
            id: 0,
            name: 1,
            dp: 2,
            unit: 3,
            mode: 4
        }

        var init = function () {

            var rootDiv = common.createDOM("div", {
                id: "container",
                style: "height: auto;",
            });
            common.createDOM("div",{
                className: "switch",
                children: [
                    common.createDOM("a", {
                        className: "active",
                        textContent: "动态风",
                        children:[
                            common.createDOM("span", {
                                className: "dynamicWind"
                            })
                        ],
                        onclick: function(){

                            if(!$(this).hasClass("active")){
                                $(this).addClass("active");
                                win.that.setWindProperty && (win.that._windflag = !0, win.that.setWindProperty())
                            }else{
                                $(this).removeClass("active");
                                win.that.stopWind && (win.that._windflag = !1, win.that.stopWind())
                            }
                        }
                    })
                ],
                style: " height: 28px;",
                parent: rootDiv
            }),
                    common.createDOM("div",{
                        className: "switch",
                        children: [
                            common.createDOM("a", {
                                className: "active",
                                textContent: "空气站",
                                children:[
                                    common.createDOM("span", {
                                        className: "dynamicWind"
                                    })
                                ],
                                onclick: function(t){
                                    if(!$(this).hasClass("active")){
                                        $(this).addClass("active");

                                    }else{
                                        $(this).removeClass("active");
                                    }
                                    win.that.onOverlayLayerSelect($(this).hasClass("active"));
                                }
                            })
                        ],
                        style: " height: 28px;",
                        parent: rootDiv
                    }),
                    common.createDOM("div",{
                        className: "factorSelect",
                        children: [
                            common.createDOM("div", {
                                className: "layers",
                                textContent: "因子",
                                style: "color: #fff"
                            })
                        ],
                        parent: rootDiv
                    });
            var factorParent = common.createDOM("div", {
                className: "factorBox",
                parent: rootDiv
            })
            for(var item in itemConfig.factorItem){
                var a = common.createDOM("a", {
                    className: itemConfig.factorItem[item].split("|")[itemConfig.key.id] === "aqi" ? "active" : "",
                    textContent: itemConfig.factorItem[item].split("|")[itemConfig.key.name],
                    target: itemConfig.factorItem[item],
                    onclick: function () {
                        if (document.querySelector(".factor") != null)
                            document.querySelector(".factor").style.display = "none";
                        if (document.querySelector("#container>.factorBox>.active"))
                            document.querySelector("#container>.factorBox>.active").className = "";
                        this.className = 'active';
                        //console.log(this.text);
                        //console.log(this.target);
                        if (this.nextElementSibling.children[0] != null) {
                            this.nextElementSibling.children[0].style.display = "block";
                        }
                        //请求数据中转方法
                        //timeline.stop();    //stop 要不要返回截止时间？？？
                        //that.onOverlayChange(this.target);
                        win.that.onItemChange(this.target);

                    },
                    parent: factorParent

                });
                common.createDOM("span", {
                    className: itemConfig.factorItem[item].split("|")[itemConfig.key.id],
                    parent: a
                })
                var dd = common.createDOM("div", {
                    parent: factorParent
                });
            }

            if(itemConfig.layerItem){
                common.createDOM("div",{
                    className: "layerSelect",
                    children: [
                        common.createDOM("div", {
                            className: "layers",
                            textContent: "图层",
                            style: "color: #fff"
                        })
                    ],
                    parent: rootDiv
                })
                var layerParent = common.createDOM("div", {
                    className: "layerBox",
                    parent: rootDiv
                })
                for (var item in itemConfig.layerItem) {
                    var a = common.createDOM("a", {
                        className: itemConfig.layerItem[item].split("|")[itemConfig.key.id] == 'none' ? "active" : "",
                        textContent: itemConfig.layerItem[item].split("|")[itemConfig.key.name],
                        target: itemConfig.layerItem[item],
                        onclick: function () {
                            if (document.querySelector(".factor") != null)
                                document.querySelector(".factor").style.display = "none";
                            if (document.querySelector("#container>.layerBox>.active"))
                                document.querySelector("#container>.layerBox>.active").className = "";
                            this.className = 'active';
                            //console.log(this.text);
                            console.log(this.target);
                            if (this.nextElementSibling.children[0] != null) {
                                this.nextElementSibling.children[0].style.display = "block";
                            }
                            //请求数据中转方法
                            //timeline.stop();    //stop 要不要返回截止时间？？？
                            win.that.onOverlayChange(this.target);

                        },
                        parent: layerParent

                    });
                    common.createDOM("span", {
                        className: itemConfig.layerItem[item].split("|")[itemConfig.key.id],
                        parent: a
                    })
                    var dd = common.createDOM("div", {
                        parent: layerParent
                    });
                    if (item == "AQI") {
                        a.className = "active";
                        var selectDiv = common.createDOM("div", {
                            className: "factor aSelect",
                            style: "display: block;",

                            parent: dd
                        });
                        common.createDOM("div", {
                            className: 'name',
                            textContent: "因子:",
                            parent: selectDiv
                        });
                        for (var m = common.createDOM(0, {
                            className: "main",
                            parent: selectDiv
                        }), u, f = {}, s = Object.keys(itemConfig.factorItem), h = 0; h < s.length; h++) {
                            var k = itemConfig.factorItem[s[h]].split("|")[itemConfig.key.name] //a.options[h][0]
                                    ,
                                    Q = common.createDOM("a", {
                                        textContent: k,
                                        value: itemConfig.factorItem[s[h]],
                                        onclick: function (b) {
                                            if (D && b || "disabled" == this.getAttribute("disabled"))
                                                return !1;
                                            timeline.stop();
                                            u && (u.className = "");
                                            u = this;
                                            u.className = "active";

                                            win.that.onItemChange(this.value);
                                        },
                                        parent: m
                                    });
                            f[k] = Q;

                        }
                        u = m.firstElementChild;
                        m.firstElementChild.className = "active";
                        var D = createSelect(m, function (a) {
                            f[a].onclick.call(f[a])
                        });
                        D.optionsMap = {};
                        for (h = 0; h < s.length; h++)
                            D.optionsMap[s[h]] = "---" == s[h] ? common.createDOM("optgroup", {
                                label: "",
                                parent: D
                            }) : common.createDOM("option", {
                                value: itemConfig.factorItem[s[h]].split("|")[itemConfig.key.name],
                                textContent: itemConfig.factorItem[s[h]].split("|")[itemConfig.key.name],
                                //style: a.options[h][2] ? "font-weight: bold" : "",
                                parent: D
                            });
                        D.value = a.value;

                    }
                }
            }

            document.getElementsByTagName("body")[0].appendChild(rootDiv);

        }();

        function createSelect(a, b) {
            return common.createDOM("select", {
                onchange: function () {
                    b(this.value)
                },
                onkeyup: function () {
                    this.onchange()
                },
                onfocus: function () {
                    document.documentElement.onmouseenter = function () {
                        document.documentElement.className = ""
                    };
                    document.documentElement.onmouseleave = function () {
                        document.documentElement.className = "nk"
                    }
                },
                onblur: function () {
                    document.documentElement.onmouseenter = document.documentElement.onmouseleave = null;
                    document.documentElement.className = ""
                },
                parent: a
            })
        }


        function getStyle(obj, style) {
            return obj.currentStyle ? obj.currentStyle[style] : getComputedStyle(obj, false)[style];
        }

        //原生js动画类似jquery--animate
        function animateJS(obj, styleJson, speed, callback) {
            clearInterval(obj.timer);
            // 开启定时器
            obj.timer = setInterval(function () {
                var flag = true; //假设所有动作都已完成成立。
                for (var styleName in styleJson) {
                    //1.取当前属性值
                    var iMov = 0;
                    // 透明度是小数，所以得单独处理
                    iMov = styleName == 'opacity' ? Math.round(parseFloat(getStyle(obj, styleName)) * 100) : parseInt(getStyle(obj,
                            styleName));

                    //2.计算速度
                    var speed = 0;
                    speed = (styleJson[styleName] - iMov) / 8; //缓冲处理，这边也可以是固定值
                    speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed); //区分透明度及小数点，向上取整，向下取整

                    //3.判断是否到达预定值
                    if (styleJson[styleName] != iMov) {
                        flag = false;
                        if (styleName == 'opacity') { //判断结果是否为透明度
                            obj.style[styleName] = (iMov + speed) / 100;
                            obj.style.filter = 'alpha(opacity:' + (iMov + speed) + ')';
                        } else {
                            obj.style[styleName] = iMov + speed + 'px';
                        }
                    }
                }
                if (flag) { //到达设定值，停止定时器，执行回调
                    clearInterval(obj.timer);
                    if (callback) {
                        callback();
                    }
                }
            }, speed)
        }

        return {
            itemConfig: itemConfig,
        }

    }();

	(function($){
        var funObj = {
            timeUserFun:'timeUserFun',
        }
        $[funObj.timeUserFun] = function(time){
            var time = time || 10;
            var userTime = time*60; //默认十分钟监测刷新
            var objTime = {
                init:0,
                time:function(){
                    objTime.init += 1;
                    if(objTime.init == userTime){
                        parent.window.frameManger && parent.window.frameManger.refresh() || window.location.reload()
                        //console.log("用户没有操作页面") // 用户到达未操作事件 做一些处理
                    }
                },
                eventFun:function(){
                    clearInterval(testUser);
                    objTime.init = 0;
                    testUser = setInterval(objTime.time,1000);
                }
            }

            var testUser = setInterval(objTime.time,1000);

            //判断键盘操作
            document.onkeydown = objTime.eventFun;
            var body = document.querySelector('html');
            //页面操作
            body.addEventListener("click",objTime.eventFun);
            body.addEventListener("keydown",objTime.eventFun);
            body.addEventListener("mousemove",objTime.eventFun);
            body.addEventListener("mousewheel",objTime.eventFun);
        }
    })(win)
	
    var TiandiMap_vec = new ol.layer.Tile({ //天地图矢量图层
        name: "天地图矢量图层",
        visible: true,
        source: new ol.source.XYZ({
            url: "http://t0.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=" + common.TiandituKey(),
            wrapX: false
        })
    });
    var TiandiMap_cva = new ol.layer.Tile({ //天地图矢量注记图层
        name: "天地图矢量注记图层",
        visible: true,
        source: new ol.source.XYZ({
            url: "http://t0.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=" + common.TiandituKey(),
            wrapX: false
        })
    });
    var TiandiMap_img = new ol.layer.Tile({ //天地图影像图层
        name: "天地图影像图层",
        visible: false,
        source: new ol.source.XYZ({
            url: "http://t0.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=" + common.TiandituKey(),
            wrapX: false
        })
    });
    var TiandiMap_cia = new ol.layer.Tile({ //天地图影像注记图层
        name: "天地图影像注记图层",
        visible: false,
        source: new ol.source.XYZ({
            url: "http://t0.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=" + common.TiandituKey(),
            wrapX: false
        })
    });
    var TiandiMap_ter = new ol.layer.Tile({ //天地图地形图层
        name: "天地图地形图层",
        visible: false,
        source: new ol.source.XYZ({
            url: "http://t0.tianditu.com/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=" + common.TiandituKey(),
            wrapX: false
        })
    });
    var TiandiMap_cta = new ol.layer.Tile({
        name: "天地图地形注记图层",
        visible: false,
        source: new ol.source.XYZ({
            url: "http://t0.tianditu.com/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=" + common.TiandituKey(),
            wrapX: false
        })
    });
    var ArcGIS_black = new ol.layer.Tile({
        name: '深夜',
        visible: false,
        preload: 4,
        source: new ol.source.XYZ({
            url: "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}"
        })
    });
    var GaoDeMap = new ol.layer.Tile({
        name: '高德',
        visible: false,
        preload: 4,
        source: new ol.source.XYZ({
            url: 'http://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
        })
    })
    var layers = {
        TiandiMap_vector: {
            name: "矢量",
            layers: [TiandiMap_vec, TiandiMap_cva]
        },
        TiandiMap_road: {
            name: "地形",
            layers: [TiandiMap_ter, TiandiMap_cta]
        },
        /*TiandiMap_img: {
            name: "影像",
            layers: [TiandiMap_img, TiandiMap_cia]
        },*/
        ArcGISMap: {
            name: "深夜",
            layers: [ArcGIS_black]
        },
        /*GaoDeMap: {
            name: "高德",
            layers: [GaoDeMap]
        }*/
    }

    var mapInit = (function(){
        var map = new ol.Map({
            target: "map",
            loadTilesWhileAnimating: true,
            pixelRatio: 1,
            view: new ol.View({
                projection: 'EPSG:3857',
                center: ol.proj.transform([106.03450137499999, 34.44104525], 'EPSG:4326', 'EPSG:3857'),
                zoom: 5,
                minZoom: 3,
                maxZoom: 20
            })
        })
        for(var i in layers){
            for(var j in layers[i].layers){
                map.addLayer(layers[i].layers[j])
            }
        }
        !function layerControl() {

            var str = "<div class='layer_panel'><ul class='layer_dropDownList'>";
            for (var layer in layers) {
                str += "<li class='layerItem' id='" + layer + "'>" + layers[layer].name + "</li>"
            }
            str += "</ul></div>";
            $("#ol-layerControl").append(str)
                    .find(".layer_panel").addClass("hide")
                    .find(".layer_dropDownList li:eq(0)").addClass("selected")
            $("#ol-layerControl").find(".layer_dropDownList li").on("click", function(){
                $("#ol-layerControl").find(".layer_dropDownList li.selected").removeClass("selected")
                $(this).addClass("selected")
                var id = $(this).attr("id");
                map.getLayers().getArray().forEach(function(layer){
                    if(layer.get("name") == undefined || layer.get("name") == "overlay" || layer.get("name") == "wind" || layer.get("name") == "imageCanvas"){
                        return ;
                    }
                    if(layer.get("name").indexOf(layers[id].name) >= 0){
                        layer.setVisible(true)
                    }else{
                        layer.setVisible(false)
                    }
                })
            })
            $("#ol-layerControl").hover(function(e){
                if($(this).find(".layer_panel").hasClass("hide")){
                    $(this).find(".layer_panel").removeClass("hide")
                    $(".layer_panel").slideDown("slow")
                }else{
                    $(this).find(".layer_panel").addClass("hide")
                    $(".layer_panel").slideUp("slow")
                }
            })
            $("#ol-layerControl").find(".layer_dropDownList").on("mouseover", function(e) {
                if($(this).find(".layer_panel").hasClass("hide")){
                    $(this).find(".layer_panel").removeClass("hide")
                }else{
                    $(this).find(".layer_panel").addClass("hide")
                }
            })
            $("#ol-layerControl").find(".layer_dropDownList").on("mouseout", function(e) {
                if($(this).find(".layer_panel").hasClass("hide")){
                    $(this).find(".layer_panel").removeClass("hide")
                }else{
                    $(this).find(".layer_panel").addClass("hide")
                }
            })

        }();
        //预先定义的两个图层

        var canvas = common.createCanvas(map.getSize()[0], map.getSize()[1]),
                overlay = common.createCanvas(map.getSize()[0], map.getSize()[1]);
        canvas.id = "windCanvas",canvas.style.position = 'absolute';
        canvas.style.top = 0;
        canvas.style.left = 0;
        //canvas.style.zIndex = 10;
        overlay.id = "overlayCanvas",overlay.style.position = 'absolute';
        overlay.style.top = 0;
        overlay.style.left = 0;
        //overlay.style.zIndex = 10;

        map.getViewport().appendChild(canvas),
                map.getViewport().appendChild(overlay);

        var _windy = new Windy({
            projection: 'EPSG:3857',
            map: map,
            canvas: canvas,
            overlayCanvas: overlay
        })
        //初始化
        win.that = new MapModel({
            map: map,
            canvas: canvas,
            overlayCanvas: overlay,
            paramobj: {
                baselayer: "terrain",
                item: "aqi",
                overlay: "none"
            },
            windy: _windy
        });

        var containerPopup = document.getElementById("windpopup");
        containerPopup.style.display = "block";
        var content = document.getElementById("wind-popup-content");
        var OVERLAY = new ol.Overlay({
            //设置弹出框的容器
            element: containerPopup,
            //是否自动平移，即假如标记在屏幕边缘，弹出时自动平移地图使弹出框完全可见
            autoPan: false,
            positioning: "buttom-center",
            stopEvent: false,
            offset: [0, 0]
        });
        map.getViewport().addEventListener("mouseout", function (e) {
            OVERLAY.setPosition(undefined);
        })
        //添加到图层中
        map.addOverlay(OVERLAY);
        map.on('pointermove', function (event) {

            var str = "";
            if(that._windy._windgrid){
                var _data = that._windy.getPointData(ol.proj.transform(event.coordinate, map.getView().getProjection(), 'EPSG:4326'), "wind");
                if(_data){
                    str += parseInt(_data.speed, 10) + "km/h(" + _data.level + "级)" + _data.directionStr // + " " +  风向算的不对
                    if (2 === that._itemFlag && "wind" !== that._backitem) {
                        return;
                    }
                    content.innerHTML = str;
                    OVERLAY.setPosition(event.coordinate);
                }
            }
        });
      /*  map.on("movestart", function (event) {

            //that.clearWind && that.clearOverlay && (that._windflag = !1, that.clearWind(), that._windy._overlayflag = !1, that.clearOverlay())
            //that.stopWind && that.clearOverlay && ( that.stopWind(), that.clearOverlay())
            //win.that.clearWind && that.clearOverlay && ( that.clearWind(), that.clearOverlay())
            win.that.stopWind(),
                    win.that.clearOverlay()
        })*/
        /*map.getView().on("movestart", function(e){   //change
            win.that.stopWind(),
                    win.that.clearOverlay()
        })*/
        map.on("movestart", function(e){   //change
        	if(e.frameState.index !== 0){
        		win.that.stopWind(),
                	win.that.clearOverlay()
        	}
        })
        map.on("moveend", function (event) {
            if(event.frameState.index !== 1){
                if(win.that.fetchData(),
                        win.that._windy){
                    win.that.setWindProperty();
                }
            }
            win.that._zoom = map.getView().getZoom();

        });
        requestAnimationFrame(function(){
            win.that.fetchData()
        },30);
        requestAnimationFrame(function(){
            win.that.startWind()
        },60);
		
		timeUserFun();
		
        
        var item = layitem.itemConfig.factorItem[ win.that._paramobj.item],
                item_split = void  0;
        item ? (item_split = item.split("|"),  win.that._item = item_split[0],
                win.that._itemName = item_split[1],
                win.that._itemNum = item_split[2],
                win.that._itemUnit = item_split[3]) : (item = layitem.itemConfig.factorItem.aqi,
                win.that._paramobj.item = "aqi");

        var overlay = layitem.itemConfig.layerItem[ win.that._paramobj.overlay],
                overlay_split = void 0;
        overlay ? (overlay_split = overlay.split("|"),  win.that._backitem = overlay_split[0],
                win.that._backitemName = overlay_split[1],
                win.that._backitemNum = overlay_split[2],
                win.that._backitemUnit = overlay_split[3],
                win.that._itemFlag = parseInt(overlay_split[4]),
        2 ===  win.that._itemFlag &&  win.that.getAtmosphereData()) : (overlay = void 0,
                win.that._paramobj.overlay = "none",
                win.that._zoom =  win.that._map.getView().getZoom());
        win.that.state.item = item,
                win.that.state.overlay = overlay
    })();

}(window);
