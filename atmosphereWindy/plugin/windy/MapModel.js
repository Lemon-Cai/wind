(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
            typeof define === 'function' && define.amd ? define(factory) :
                    (global.MapModel = factory());
}(this, (function () {
    'use strict';

    function parse2Module(t) {
        return t && t.__esModule ? t : {
            default: t
        }
    }

    //判断obj是否为 objectStr类型
    function judgeFunction(obj, objectStr) {
        if(!(obj instanceof objectStr))
            throw new TypeError("Cannot call a class as a function")
    }

    function judge(t, e) {
        if (!t)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
    }

    function createProperty(t, e) {
        if ("function" != typeof e && null !== e)
            throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
            constructor: {
                value: t,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
    }

    function defineAccessor(t, e, n, i, r) {
        var o = {};
        return Object.keys(i).forEach(function(t) {
            o[t] = i[t]
        }),
                o.enumerable = !!o.enumerable,
                o.configurable = !!o.configurable,
        ("value" in o || o.initializer) && (o.writable = !0),
                o = n.slice().reverse().reduce(function(n, i) {
                    return i(t, e, n) || n
                }, o),
        r && void 0 !== o.initializer && (o.value = o.initializer ? o.initializer.call(r) : void 0,
                o.initializer = void 0),
        void 0 === o.initializer && (Object.defineProperty(t, e, o),
                o = null),
                o
    }

    function _inheritsLoose(subClass, superClass) {
        subClass.prototype = Object.create(superClass.prototype);
        subClass.prototype.constructor = subClass;
        subClass.__proto__ = superClass;
    }
    //转化成自己的属性
    var convert2Accessor = function() {
                function Accessor(t, e) {
                    for(var n = 0; n < e.length; n++) {
                        var i = e[n];
                        i.enumerable = i.enumerable || !1,
                                i.configurable = !0,
                        "value" in i && (i.writable = !0),
                                Object.defineProperty(t, i.key, i)
                    }
                }
                return function(e, n, i) {
                    return n && Accessor(e.prototype, n),
                    i && Accessor(e, i),
                            e
                }
            }(),

           /* DateUtils = n(8),
            RequestInterface = n(12),
            common = parse2Module(n(7)),
            _windy = n(9),
            Windy = parse2Module(_windy),
            _layerItem = n(5),
            config = n(13),*/
            alias = {
                date: ["日期", "&nbsp;"],
                time: ["小时", "H"],
                temp: ["温度", "℃"],
                humi: ["湿度", "%"],
                windSpeed: ["风速", "km/h"],
                windDirect: ["风向", "✤"],
                AQI: ["AQI", "&nbsp;"],
                pollute: ["主要污染物", "&nbsp;"]
            },
            mainpollColor = {
                pm2_5: ['red', "#fff"],
                pm10: ['rgb(0, 146, 255)', "#fff"],
                no2: ['orange', "#000"],
                so2: ['yellow', "#000"],
                o3: ['lime', "#fff"],
                co: ['rgba(0, 0, 0, .25)', '#fff']
            },
            ChinaBounds = [60.42, 10.01, 152.48, 57.35],
            _function;
    if(!_function) _function = function() {
        function _class() {}

        return _class;
    }();
    var MapModel = function($function){
        _inheritsLoose(MapModel, $function);

        function MapModel(params){
            judgeFunction(this, MapModel);
            var that = judge(this, (MapModel.__proto__ || Object.getPrototypeOf(MapModel)).call(this, params));
            return that._map = params.map,
                    that._windy = params.windy,
                    that._canvas = params.canvas,
                    that._overlay = params.overlayCanvas,
                    that._paramobj = params.paramobj,
                    that._overlayMaps = {},
                    that._item = "aqi",
                    that._itemName = "AQI",
                    that._itemNum = 0,
                    that._itemFlag = 0,
                    that._windflag = !0,
                    that._datatype = "REALTIME",
                    that._pointLayerFlag = !0,
                    that._imageLayerFlag = !0,
                    that._zoom = 5,
                    that.state = {
                        //map: params.map,
                        time: DateUtils.getSmpFormatNowDate(),
                        status: "当前",
                        timelinevisible: !0,
                        forcastvisible: !1,
                        city: "北京",
                        flag: !1
                    },
                    this.mapEventRegister(),
                    that
        }

        MapModel.prototype = {
            constructor: MapModel,
            mapEventRegister: function(){
                var $self = this,
                        containerPopup = document.getElementById("popup");
                containerPopup.style.display = "block";
                var content = document.getElementById("popup-content"),
                        popupCloser = document.getElementById("popup-closer"),
                        popupChart = document.querySelector("#icon-chart"),

                        OVERLAY_POINT = new ol.Overlay({
                            element: containerPopup,
                            autoPan: false,
                            positioning: "buttom-center",
                            stopEvent: false,
                            offset: [0, -15]
                        });
                this._map.on("click", function (event) {
                    OVERLAY_POINT.setPosition(undefined);
                })
                //添加到图层中
                this._map.addOverlay(OVERLAY_POINT);
                var target = this._map.getTarget();
                var $target = typeof target === "string" ? $("#" + target) : $(target);
                //$(this._map.getViewport()).off('click');
                $(this._map.getViewport()).on('click', function (e) {
                    var pixel = $self._map.getEventPixel(e.originalEvent);
                    var hit = $self._map.forEachFeatureAtPixel(pixel, function (feature, layer) {
                        return true;
                    });
                    var feature = $self._map.forEachFeatureAtPixel(pixel, function (feature) {
                        return feature;
                    });
                    if (feature) {

                        if (feature.get("name") == "vector" || feature.get("id") == "3201" || feature.get("name") == undefined) {
                            return;
                        }
                        var str = '';
                        var coordinate;
                        var data = feature.get("data");
                        var level = getAQIlevel(parseInt(data.aqi));
                        str = "<table width='100%'>"
                                + "<tr colspan='4' style='font-size:20px;float: left;padding-left: 5px; border-bottom: 1px solid;line-height: 28px; width:100%;'><td>" + data.city + "</td></tr>"
                                + "<tr>"
                                + "<td style='font-size:12px' valign='top'>"
                                + "<table width='100%' class='fitem'>"
                                + "<tr><th width='50px'>AQI:</th><td style='width:70px;text-align:center;background-color:" + returnColorByPollName(parseInt(data.aqi), "aqi") + ";color:#fff'>" + data.aqi
                                + "</td><th width='50px'>等级:</th><td style='width:70px;text-align:center;'>" + getAQIlevel(parseInt(data.aqi))
                                + "</td></tr><tr><th>PM2.5:</th><td style='width:70px;text-align:center;background-color:" + returnColorByPollName(parseInt(data.pm2_5), "pm2_5") + ";color:#fff'>" + parseInt(data.pm2_5)
                                + "</td><th>PM10:</th><td style='width:70px;text-align:center;background-color:" + returnColorByPollName(parseInt(data.pm10), "pm10") + ";color:#fff'>" + parseInt(data.pm10)
                                + "</td></tr><tr><th>CO:</th><td style='width:70px;text-align:center;background-color:" + returnColorByPollName(parseFloat(data.co), "co") + ";color:#fff'>" + data.co
                                + "</td><th>NO2:</th><td style='width:70px;text-align:center;background-color:" + returnColorByPollName(parseInt(data.no2), "no2") + ";color:#fff'>" + parseInt(data.no2)
                                + "</td></tr><tr><th>SO2:</th><td style='width:70px;text-align:center;background-color:" + returnColorByPollName(parseInt(data.so2), "so2") + ";color:#fff'>" + parseInt(data.so2)
                                + "</td><th>O3:</th><td style='width:70px;text-align:center;background-color:" + returnColorByPollName(parseInt(data.o3), "o3") + ";color:#fff'>" + parseInt(data.o3)
                                + "</td></tr><tr><th>首要污染:</th><td colspan='3'>" + data.primary_pollutant
                                + "</td></tr><tr><th>监测时间:</th><td colspan='3'>" + data.time
                                + "</td></tr>"
                                + "</table>"
                                + "</td>"

                                + "</tr></table><div id='futureHistoryChart'>" +
                                "<div id='chartPane'></div>" +
                                "</div>";

                        //未来五日预报
                        popupChart && popupChart.addEventListener('click', function() {
                            $self.showForcast(data.city);
                        });
                        coordinate = feature.getGeometry().getCoordinates();
                        content.innerHTML = str;
                        
                        var cityname = "POINT" === $self._type ? data["province"] : data["city"],
    							pointname = "POINT" === $self._type ? data["city"] : null;
                        $self.getCityHistoryAndForcastData(data.cityCode, cityname, pointname, data.latitude, data.longitude);
                        OVERLAY_POINT.setPosition(coordinate);
                    } else {

                    }
                });
                popupCloser.addEventListener('click', function () {
                    OVERLAY_POINT.setPosition(undefined);
                });

            },
            //更新url
            updateUrl: function(){
                this._orthographic = ol.proj.toLonLat(this._map.getView().getCenter())[0].toFixed(6) +
                        "," + ol.proj.toLonLat(this._map.getView().getCenter())[1].toFixed(6) + "," + this._map.getView().getZoom(),
                        window.history.pushState({}, 0 , document.location.protocol + "/#/layer=" + this._paramobj.baselayer +
                                "/item=" + this._paramobj.item + "/overlay=" + this._paramobj.overlay + "/orthographic=" + this._orthographic);
            },
            /**
             * 请求数据开始风场
             * @param {Object} time
             */
            startWind: function(time){
                var $self = this;
                void 0 === time && void 0 !== this._selecttime && (time = this._selecttime),
                        RequestInterface.getWindData(time, "wind", this._map.getView().getZoom(), function(data){
                            $self._windy.setData(data),
                                    $self.setWindProperty(),
                                    data = null;
                        })
            },
            setWindProperty: function(){
                var size = this._map.getSize(),
                        mapBounds,
                        bounds = this._map.getView().calculateExtent(size);
                if(size && bounds){
                    var _projection = this._map.getView().getProjection().getCode(),
                            _extent = ol.proj.transformExtent(this._map.getView().calculateExtent(size), _projection, "EPSG:4326");
                    mapBounds = [[[0, 0], [size[0], size[1]]], size[0], size[1], [[_extent[0], _extent[1]], [_extent[2], _extent[3]]]];
                }
                this.updateWind(mapBounds)
            },
            stopWind: function(){
                this._windy.stop(),
                        this._canvas.getContext("2d").clearRect(0, 0, this._map.getSize()[0], this._map.getSize()[0])
            },
            clearOverlay: function(){
                if (this._overlay) {
                    this._overlay.getContext("2d").clearRect(0, 0, this._map.getSize()[0], this._map.getSize()[0])
                }
            },
            updateWind: function(extent){
                this._windflag ? this._windy.start(extent) : this.stopWind(),
                2 !== this._itemFlag || "wind" === this._backitem && this._windflag || this._windy.drawOverlay(extent)
            },
            fetchData: function(){
                null !== this._map && (
                        null !== this._fetchTime && new Date().getTime() - this._fetchTime < 250 || (
                                this._fetchTime = (new Date).getTime(), this._map.getView().getZoom() >= 9 ? (
                                        this._type = "POINT", void 0 !== this._pointdata && this._pointdata.length > 0 &&
                                        this._datatype == this._pointdatatype ? this.showMarker(this._pointdata, this._selecttime, this._type) :
                                                this._fetchData(void 0, this._type)
                                ) : (
                                        this._type = "CITY", void 0 !== this._citydata && this._citydata.length > 0 &&
                                        this._datatype == this._citydatatype ? this.showMarker(this._citydata, this._selecttime, this._type) :
                                                this._fetchData(void 0, this._type)
                                )
                        )
                )
            },
            /*
            * _fetchData 获取AQI数据
            * @param type = "CITY", "POINT"
            */
            _fetchData: function(time, type){
                var $self = this,
                        _type = !(arguments.length > 2 && void 0 !== arguments[2]) || arguments[2];
                void 0 === time && void 0 !== this._selecttime && (time = this._selecttime);
                RequestInterface.getAQIData(time, type, this._datatype, function(data){
                    let time = data[0].time;
                    "CITY" === type ? (
                            $self._citydata = data,	$self._citydatatype = $self._datatype
                    ) : (
                            $self._pointdata = data, $self._pointdatatype = $self._datatype
                    );
                    var index = 0;
                    data.forEach(function(item){
                        Number(item.aqi < 0) && index++
                    });

                    var dataHour = new Date(time).getHours(),
                            dataMinute = new Date(time).getMinutes(),
                            nowHour = (new Date).getHours(),
                            nowMinute = (new Date).getMinutes();
                    nowMinute > 35 && (
                            nowMinute > dataMinute && dataHour === nowHour ? $self.state.flag = !1 : $self.state.flag = !0
                    ),
                            data.length / 3 > index ? $self.state.flag = !1 : $self.state.flag = !0
                    _type && $self.showMarker(data, time, type);
                    data = null;
                })

            },

            showMarker: function(data, time, type){
                var $self = this;
                var zoom = this._map.getView().getZoom(),
                        a = 0.1,
                        time = data[0].time;

                var southwest = ol.proj.toLonLat([this._map.getView().calculateExtent(this._map.getSize())[0], this._map.getView().calculateExtent(this._map.getSize())[1]]),
                        northeast = ol.proj.toLonLat([this._map.getView().calculateExtent(this._map.getSize())[2], this._map.getView().calculateExtent(this._map.getSize())[3]]),
                        center = ol.proj.toLonLat([this._map.getView().getCenter()[0],this._map.getView().getCenter()[1]]);
                var viewpoint = void 0;

                viewpoint = "CITY" === type && zoom < 8 ? data.filter(function (t) {
                    return t.latitude >= southwest[1] - a && t.longitude >= southwest[0] - a && t.latitude <= northeast[1] + a && t.longitude <= northeast[0] + a && ("" === t.region || void 0 === t.region)

                }) : data.filter(function (t) {
                    return t.latitude >= southwest[1] - a && t.longitude >= southwest[0] - a && t.latitude <= northeast[1] + a && t.longitude <= northeast[0] + a

                });
                //console.log("aqi数据过滤 "+ viewpoint.length + "," + data.length);

                var iconFeatures = [];
                this._vectorlayer && this._map.removeLayer(this._vectorlayer) ;
                if (this._map.getView().getZoom() >= 7) {
                    for (var i = 0; i < viewpoint.length; i++) {
                        var color = returnColorByPollName(viewpoint[i][this._item], this._item);
                        var lon = parseFloat(viewpoint[i].longitude);
                        var lat = parseFloat(viewpoint[i].latitude);
                        var lonlat = {x: lon, y: lat};
                        var mercator = common.lonlat2mercator(lonlat);
                        var src = $ctxStatic + "/gbq/modules/air/atmosphereWindy/plugin/images/qp/level" + getAQIIndex(parseInt(viewpoint[i].aqi)) + ".png"
                        var anchor = new ol.Feature({
                            geometry: new ol.geom.Point([mercator.x, mercator.y]),
                            id: viewpoint[i].cityCode,//{longitude: viewpoint[i].longitude, latitude: viewpoint[i].latitude},cityid: "101200901",cityname: "宜昌"
                            data: viewpoint[i],
                            name: viewpoint[i].city,
                            population: 4000,
                            rainfall: 500
                        });
                        anchor.setStyle([new ol.style.Style({
                            image: new ol.style.Icon({
                                anchor: [0.4, 32],
                                anchorXUnits: 'fraction',
                                anchorYUnits: 'pixels',
                                src: src
                            }),
                            text: new ol.style.Text({
                                font: '12px Calibri,sans-serif',
                                text: viewpoint[i][this._item] + "",// !!! 这里必须是字符串形式   // + "\n" +viewpoint[i]['cityname'],
                                fill: new ol.style.Fill({
                                    color: '#000'
                                }),
                                offsetY: -22,
                                offsetX: 0,
                                stroke: new ol.style.Stroke({
                                    color: '#ffcc33',
                                    width: 2
                                })
                            })

                        }),
                            new ol.style.Style({

                                text: new ol.style.Text({
                                    font: '12px Calibri,sans-serif',
                                    text: viewpoint[i]['city'],
                                    fill: new ol.style.Fill({
                                        color: '#ffcc33'
                                    }),
                                    offsetY: 5,
                                    offsetX: 0,
                                    stroke: new ol.style.Stroke({
                                        color: '#fff',
                                        width: 2
                                    })
                                })

                            })]);
                        iconFeatures.push(anchor);

                    }
                }else{
                    for (var i = 0; i < viewpoint.length; i++) {
                        var color = returnColorByPollName(viewpoint[i][this._item], this._item);
                        var lon = parseFloat(viewpoint[i].longitude);
                        var lat = parseFloat(viewpoint[i].latitude);
                        var lonlat = {x: lon, y: lat};
                        var mercator = common.lonlat2mercator(lonlat);
                        var anchor = new ol.Feature({
                            geometry: new ol.geom.Point([mercator.x, mercator.y]),
                            id: viewpoint[i].cityCode,
                            data: viewpoint[i],
                            name: viewpoint[i].city,
                            population: 4000,
                            rainfall: 500
                        });
                        anchor.setStyle(new ol.style.Style({
                            image: new ol.style.Circle({		//圆
                                radius: 8,
                                fill: new ol.style.Fill({
                                    color: color
                                })
                            })

                        }));
                        iconFeatures.push(anchor);

                    }
                }
                if(viewpoint.length > 0){
                    this._vectorlayer = new ol.layer.Vector({
                        zIndex: 999,
                        source: new ol.source.Vector()
                    });
                    this._vectorlayer.getSource().addFeatures(iconFeatures);
                    this._pointLayerFlag && this._map.getView().getZoom() > 4 && this._map.addLayer(this._vectorlayer);
                    this._map.updateSize();
                    var item = "综合指数" === this._itemName ? "AQI" : this._itemName,
                            url = "https://graph.zq12369.cn/" + item + "/hour/CUACE_09km_" + item + "_station_" + time + ".png";
                    void 0 == this._imageLayer ? (this._imageLayer = this.setImageLayer(url, 0.8), this._imageLayerFlag && 1 === this._itemFlag &&
                    this._map.addLayer(this._imageLayer)) : 1 === this._itemFlag &&  (this._imageLayer.get("setUrl")(url))
                }
                "当前" === this.state.status && time !== this.state.time && (this.state.time = time),
                        viewpoint = null,
                        data = null,
                        iconFeatures = null;
            },

            getAtmosphereData: function(time){
                var $self = this;
                if (void 0 === time && void 0 !== this._selecttime && (time = this._selecttime),
                2 === this._itemFlag) {
                    "wind" !== this._backitem ? (
                            RequestInterface.getWindData(time, this._backitem, this._map.getView().getZoom(), function(data){
                                $self._windy.setOverlay($self._backitem, data),
                                        data = null
                            })
                    ) : (
                            this._windflag || console.info("请先启用风场"),
                                    this._windy.setOverlay(this._backitem, ""),
                                    this.setWindProperty()
                    );
                }else{
                    this._overlay.getContext("2d").clearRect(0, 0, this._map.getSize()[0], this._map.getSize()[1])
                }
            },
            /**
             * getDataByTime 播放根据时间执行查询
             * @param time
             */
            getDataByTime: function(time){
                var n = "";
                time === this.state.time ? n = "当前" : time < this.state.time ? n = "历史" : time > this.state.time && (n = "预测"),
                void 0 !== this._citydata && (this._citydata = void 0),
                void 0 !== this._pointdata && (this._pointdata = void 0),
                        this.state.status = n;
                parseInt(time.substr(11, 2), 10);
                this._fetchData(time, this._type),
                        this.startWind(time),
                        this.getAtmosphereData(time);
            },
            getCityHistoryAndForcastData: function(cityCode, cityName, r, lat, lon){
            	var $self = this,
					msg = {};
				msg.city = cityName,
				msg.cityCode = cityCode,
				msg.item = this._item;
				r && (msg.pointname = r),
                RequestInterface.getServerData("/api/mapapi", "GETFURTUREHISTORY", msg, function (data) {
                	if(data.length > 0){
                		 var d = data.sort(function(a, b){
         			    	return new Date(a.time) - new Date(b.time) 
         			    }),
         			    	dataArr = [],
         			    	time = d[0].time;
         			    for(var i = 0; i < d.length; i++){
         			    	dataArr.push({
         			            x: new Date(d[i].time).getTime(),		//echarts: d[i].time
         			            y: d[i][$self._itemName.toLowerCase()],
         			            color: d[i].time <= $self.state.time ? returnColorByPollName(d[i][$self._itemName.toLowerCase()], $self._itemName.toLowerCase()) : "#999"
         			        });
         					d[i].time > time && (time = d[i].time);
         			    }
         			    var axisLable = [];
         			    axisLable.push({
         			    	from: new Date(d[0].time).getTime() - 18e5,
         			    	to: new Date($self.state.time),
         			    	color: "#EFFFFF",
         			    	lable: {
         			    		text: "历史",
         			    		style: {
         			    			color: "#999"
         			    		},
         			    		y: 12
         			    	}
         			    }),
         			    axisLable.push({
         			    	from: new Date($self.state.time).getTime(),
         			    	to: new Date(time).getTime() + 18e5 ,
         			    	color: "#EFFFFF",
         			    	lable: {
         			    		text: "预测",
         			    		style: {
         			    			color: "#999"
         			    		},
         			    		y: 12
         			    	}
         			    })
         				//$self.showFutureHistoryChart(cityName, "历史二十四小时" + $self._itemName + "变化曲线", dataArr, 'axisLable'),
         				$self.showFutureHistoryHighChart("chartPane", "最近及未来二十四小时" + $self._itemName + "变化曲线", dataArr, axisLable),
         				d = null,
         				data = null;
                	}
                }, 1)
            },

            showForcast: function(city){
                this.state.city = city,
                        this.state.forcastvisible = !0,
                        this.getForecastDataByCity(city)
            },
            getForecastDataByCity: function(city){
                var $self = this,
                        msg = {};
                msg.city = city;
                RequestInterface.getServerData("/api/mapapi", "GETFORCASTBYCITY", msg, function(data){
                    $self.render(data.data);
                }, 1)
            },
            /**
             * 空气站点图层切换
             */
            onOverlayLayerSelect: function(){
                arguments[0] ? (this._pointLayerFlag = !0,
                                this._map.addLayer(this._vectorlayer)
                ) : (this._pointLayerFlag = !1,
                                this._map.removeLayer(this._vectorlayer)
                ),
                void 0 !== this._enterpriseLayer && (t.indexOf("enterpriseLayer") >= 0 ? (this._enterpriseLayerFlag = !0,
                        this._map.getZoom() > 7 && this._map.addLayer(this._enterpriseLayer)
                ) : (this._enterpriseLayerFlag = !1,
                                this._map.removeLayer(this._enterpriseLayer)
                ))
            },
            onOverlayChange: function(item){
                var overlay_split = item.split("|");
                //overlay_split[0] === "AQI" && this._imageLayer ? map.removeLayer(this._imageLayer):
                (this._backitem = overlay_split[0],
                        this._backitemName = overlay_split[1],
                        this._backitemNum = overlay_split[2],
                        this._backitemUnit = overlay_split[3],
                        this._paramobj.overlay = this._backitem);
                var flag = this._itemFlag = parseInt(overlay_split[4]);
                //this.updateUrl(),
                2 === flag ? (
                        this.getAtmosphereData(), this._imageLayer && this._map.removeLayer(this._imageLayer)
                ) : 0 === flag ? (
                        this._imageLayer && this._map.removeLayer(this._imageLayer),
                                this._windy.setOverlay()
                ) : (this._windy.setOverlay(), this._imageLayer && this._map.addLayer(this._imageLayer)),

                        this.state.overlay = item


            },
            onItemChange: function(item){
                var item_arr = item.split("|");
                this._item = item_arr[0],
                        this._itemName = item_arr[1],
                        this._itemNum = item_arr[2],
                        this._itemUnit = item_arr[3],
                        this._paramobj.item = this._item;
                //				this.updateUrl(),
                this.fetchData();
                this.state.overlay = item
            },
            setImageLayer: function(url, opacity){
                var $self = this,
                        canvasImg = new Image(),
                        canvas = document.createElement("canvas");
                canvasImg.src = url;
                var canvasOption = new Object();
                canvasOption.canvasFunction = function(extent, resolution, pixelRatio, size, projection){
                    var bix = size[0]/(extent[2]-extent[0]);
                    var biy = size[1]/(extent[3]-extent[1]);
                    var lt = common.lonlat2mercator({
                        x:parseFloat(ChinaBounds[0]),
                        y:parseFloat(ChinaBounds[1])
                    });

                    var rd = common.lonlat2mercator({
                        x:parseFloat(ChinaBounds[2]),
                        y:parseFloat(ChinaBounds[3])
                    });

                    canvas.width = size[0];
                    canvas.height = size[1];
                    var ctx = canvas.getContext("2d");

                    var canvaslt = {
                        x:(lt.x-extent[0])*bix,
                        y:(extent[3]-lt.y)*biy
                    };
                    ctx.drawImage(canvasImg,canvaslt.x,canvaslt.y,(rd.x-lt.x)*bix,(lt.y-rd.y)*biy);

                    return canvas;

                };
                /**
                 * 更新canvas重新绘制
                 * @param {Object} url
                 */
                function setUrl(url){
                    canvasImg.src = url,
                            canvas = document.createElement("canvas"),
                            redraw();
                }

                function getUrl(){
                    return canvasImg.src;
                }

                function redraw(){
                    that._imageLayer.setExtent($self._map.getView().calculateExtent($self._map.getSize()));
                    $self._map.animationDelay_ && $self._map.animationDelay_();
                }
                // 为ImageCanvasLayer创建数据源
                var imageCanvas = new ol.source.ImageCanvas(canvasOption);
                // 创建一个ImageCanvasLayer图层
                var area_overlay = new ol.layer.Image({
                    source: imageCanvas,
                    name: "imageCanvas",
                    opacity: opacity,
                    setUrl: setUrl,
                    getUrl: getUrl
                });
                return area_overlay;
            },
            gradientColorByAQI: function(t) {
                var colorArr = ["#43ce17", "#efdc31", "#fa0", "#ff401a", "#d20040", "#9c0a4e"],
                        color = void 0,
                        back = void 0;
                t = parseInt(t),
                        t < 50 ? (back = "rgba(135,211,33,1)",
                                color = "black") : t < 100 ? (back = "rgba(242,210,39,1)",
                                color = "black") : t < 150 ? (back = "rgba(255,170,0,1)",
                                color = "black") : t < 200 ? (back = "rgba(255,64,26,1)",
                                color = "white") : t < 300 ? (back = "rgba(219,12,56,1)",
                                color = "white") : (back = colorArr[5],
                                color = "white");
                return {
                    background: back,
                    color: color
                }
            },
            render: function(data){
                var $self = this;
                document.querySelector("#forcast5day ._table") && document.querySelector("#forcast5day ._table").remove();
                var root = document.querySelector("#forcast5day");
                this.state.forcastvisible && (root.style.display = "block");
                var average = [],
                        pane = {},
                        week = ["日", "一", "二", "三", "四", "五", "六"],
                        avg = 0;
                pane.date = [],
                        pane.time = [],
                        pane.temp = [],
                        pane.humi = [],
                        pane.windSpeed = [],
                        pane.windDirect = [],
                        pane.AQI = [],
                        pane.pollute = [];
                void 0 !== data && data.forEach(function(t){
                    var hour = parseInt(t.time.substr(11,2)),
                            CLASSName = "";
                    0 === hour && (CLASSName = "begin",
                    avg > 0 && average.push(parseInt(avg / 24, 10)),
                            avg = 0);
                    avg += t.aqi;
                    if( hour % 3 == 0){
                        pane.time.push(common.createDOM("td",{
                            className: CLASSName,
                            textContent: hour
                        })),
                                pane.temp.push(common.createDOM("div",{
                                    className: "temp",
                                    style: "background: rgba(0,150,255,0.6); color: #fff;",
                                    textContent: t.temp,
                                    parent: common.createDOM("td",{
                                        className: CLASSName
                                    })
                                }).parentElement),
                                pane.humi.push(common.createDOM("div",{
                                    className: "humi",
                                    style: "background: rgba(0,150,255,1);",
                                    textContent: t.humi,
                                    parent: common.createDOM("td",{
                                        className: CLASSName
                                    })
                                }).parentElement),
                                pane.windSpeed.push(common.createDOM("td",{
                                    className: CLASSName,
                                    textContent: parseInt(3.6 * t.ws, 10)
                                })),
                                pane.windDirect.push(common.createDOM("span",{
                                    className: "windArrow",
                                    style: "transform: rotate("+ t.wda +"deg);",
                                    parent:  common.createDOM("div",{
                                        "className": "windDirect",
                                        parent: common.createDOM("td",{
                                            "className": CLASSName,
                                        })
                                    })
                                }).parentElement.parentElement),
                                pane.AQI.push(common.createDOM("div",{
                                    className: "AQI",
                                    style: "background: "+ $self.gradientColorByAQI(t.aqi).background +"; color: "+ $self.gradientColorByAQI(t.aqi).color +"",
                                    textContent: t.aqi,
                                    parent: common.createDOM("td",{
                                        className: CLASSName
                                    })
                                }).parentElement),
                                pane.pollute.push(common.createDOM("div",{
                                    className: "mainpoll",
                                    style: "pm2.5" == t.mainpoll.toLowerCase() ? "background: "+ mainpollColor["pm2_5"][0] +"; color: "+ mainpollColor["pm2_5"][1]+"" : "background: "+ mainpollColor[t.mainpoll.toLowerCase()][0] +"; color: "+ mainpollColor[t.mainpoll.toLowerCase()][1]+"",
                                    textContent: t.mainpoll,
                                    parent: common.createDOM("td",{
                                        className: CLASSName
                                    })
                                }).parentElement);

                    }

                }), average.push(parseInt(avg / 24, 10));
                var now = new Date();
                var day = now.getDay(),
                        today = now.format().split(" ")[0];
                for (var i = 4; i >= 0; i--){
                    var time = new Date(now.getTime() - 24*60*60*1000*i).format();
                    pane.date.push(common.createDOM("td",{
                        "className":"date",
                        colSpan: 8,
                        children: [common.createDOM("span",{
                            className: "day",
                            textContent: time.substr(5, 5).replace("-", "/") + "（周"+ week[(day - i + 7)%7] +"）"
                        }),common.createDOM("span",{
                            className: "value",
                            textContent: average[i],
                            style: "background: "+  returnColorByPollName(average[i], 'aqi') +"; color: #fff;"
                        })],

                    }))
                }

                var el = common.createDOM("div",{
                    className: "_table",
                    children: [common.createDOM("table",{
                        children: [common.createDOM("tbody",{

                        })]
                    })],
                    parent: root
                }).children[0].children[0];
                for(var item in pane){
                    common.createDOM("tr",{
                        children: [
                            common.createDOM("td",{
                                className: "title",
                                textContent: alias[item][0]
                            }),
                            common.createDOM("td",{
                                className: "unit",
                                innerHTML: alias[item][1]
                            }),
                        ].concat(pane[item]),
                        parent: el
                    })
                }
            },
            /**
             *
             * @param {Object} container div 的id号
             * @param {Object} title
             * @param {Object} data
             * @param {Object} axis
             */
            showFutureHistoryHighChart: function(container, title, data, axis){
                var r = data.length < 32;
                Highcharts.setOptions({
                    global: {
                        useUTC: !1
                    }
                });
                var option = {
                    global: {
                        useUTC: !1
                    },
                    chart: {
                        type: "column",
                        zoomType: "x",
                        spacing: [10, 0, 5, 0]
                    },
                    title: {
                        text: title,
                        style: {
                            fontSize: "12px"
                        }
                    },
                    subtitle: {
                        text: ""
                    },
                    xAxis: {
                        type: "datetime",
                        dateTimeLabelFormats: {
                            millisecond: "%H:%M:%S.%L",
                            second: "%H:%M:%S",
                            minute: "%H:%M",
                            hour: "%H:%M",
                            day: "%m-%d",
                            week: "%m-%d",
                            month: "%Y-%m",
                            year: "%Y"
                        },
                        plotBands: axis
                    },
                    yAxis: [{
                        title: {
                            text: ""
                        },
                        min: 0
                    }],
                    tooltip: {
                        dateTimeLabelFormats: {
                            millisecond: "%H:%M:%S.%L",
                            second: "%Y-%m-%d %H:%M:%S",
                            minute: "%Y-%m-%d %H:%M",
                            hour: "%Y-%m-%d %H:%M",
                            day: "%Y-%m-%d",
                            week: "%m-%d",
                            month: "%Y-%m",
                            year: "%Y"
                        }
                    },
                    plotOptions: {
                        series: {
                            marker: {
                                enabled: r
                            },
                            turboThreshold: 0
                        },
                        spline: {
                            dataLabels: {
                                enabled: !1
                            },
                            enableMouseTracking: !0
                        }
                    },
                    legend: {
                        align: "center",
                        verticalAlign: "bottom",
                        borderWidth: 0,
                        enabled: !1
                    },
                    credits: {
                        enabled: !1
                    },
                    series: [{
                        name: title,
                        data: data
                    }]
                };
                Highcharts.chart("chartPane", option)
            },

        }

        return MapModel;
    }(_function);

    return MapModel;
})));
