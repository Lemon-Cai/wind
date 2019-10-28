! function(t) {
	function e(moduleId) {
		if(obj[moduleId])
			return obj[moduleId].exports;
		var r = obj[moduleId] = {
			exports: {},
			id: moduleId,
			loaded: !1
		};
		return t[moduleId].call(r.exports, r, r.exports, e),
			r.loaded = !0,
			r.exports
	}
	var obj = {};
	e.modules = t,
		e.c = obj,
		e.path = "/",
		e(0)
}(function(t) {
	for(var e in t)
		if(Object.prototype.hasOwnProperty.call(t, e))
			switch(typeof t[e]) {
				case "function":
					break;
				case "object":
					t[e] = function(arr) {
						var arrSlice = arr.slice(1),
							reverse = t[arr[0]];
						return function(t, e, r) {
							reverse.apply(this, [t, e, r].concat(arrSlice))
						}
					}(t[e]);
					break;
				default:
					t[e] = t[t[e]]
			}
	return t
}([
	function(pack, exports, n){
		pack.exports = n(1)
	},
	function(pack, exports, n){
		"use strict";

		function parse2Module(t) {
			return t && t.__esModule ? t : {
				default: t
			}
		}


	},
	function(pack, exports, n) {
		"use strict";

		function parse2Module(t) {
			return t && t.__esModule ? t : {
				default: t
			}
		}

		Object.defineProperty(exports, "__esModule", {
			value: !0
		});

		var canvas,  windy, grid, gridData, map;
		var _timePlay = n(1),
			timePlay = parse2Module(_timePlay),
			_layerControl = n(2),
			layerControl = parse2Module(_layerControl),
			_common = n(3),
			common = parse2Module(_common),
			layers = n(6);
			//layers = parse2Module(_layers);

		var _Windy = n(5),
			Windy = parse2Module(_Windy); //

		function addWindMap(data) {
			canvas = common.default.createCanvas(map.getSize()[0], map.getSize()[1])
			canvas.id = "windCanvas";
			canvas.style.position = 'absolute';
			canvas.style.top = 0;
			canvas.style.left = 0;
			canvas.style.zIndex = 100;
			map.getViewport().appendChild(canvas);
			windy = new Windy.default({
				map: map,
				canvas: canvas,
				projection: 'EPSG:3857'
			});
			windy.setData(data)

			windDraw(map);
			map.getView().on('change', function(e) { //propertychange 有bug整个页面会卡死不动
				windy.stop(),
					canvas.getContext("2d").clearRect(0, 0, map.getSize()[0], map.getSize()[1])

				/*if(e.frameState.index !== 1){
					windy.stop(),
					canvas.getContext("2d").clearRect(0, 0, map.getSize()[0], map.getSize()[1])
				}*/
			});
			map.on("moveend", function(e) {
				if(e.frameState.index !== 1) {
					windDraw(map);
				}

			});
		}

		function windDraw() {
			//$(canvas).show();
			var size = map.getSize();
			var mapBounds;

			var bounds = map.getView().calculateExtent(size);
			if(size && bounds) {
				var _projection = map.getView().getProjection().getCode();
				var _extent = ol.proj.transformExtent(map.getView().calculateExtent(size), _projection, "EPSG:4326");
				mapBounds = [
					[
						[0, 0],
						[size[0], size[1]]
					], size[0], size[1],
					[
						[_extent[0], _extent[1]],
						[_extent[2], _extent[3]]
					]
				];
			}
			var _min = [bounds[0], bounds[1]];
			var _max = [bounds[2], bounds[3]];
			var py = map.getPixelFromCoordinate([bounds[0], bounds[3]]); //经纬度转成屏幕坐标

			windy.start(mapBounds);
		}

		(function init() {
			map = new ol.Map({
				target: 'map',
				loadTilesWhileAnimating: true,
				pixelRatio: 1,
				view: new ol.View({
					projection: 'EPSG:3857',
					center: ol.proj.transform([113.53450137499999, 34.44104525], 'EPSG:4326', 'EPSG:3857'), //[118.53450137499999, 34.44104525],
					zoom: 5
				})
			});
			for(var i in layers) {
				for(var j in layers[i].layers) {
					map.addLayer(layers[i].layers[j])
				}
			}
			! function layerControl() {

				var str = "<div class='layer_panel'><ul class='layer_dropDownList'>";
				for(var layer in layers) {
					str += "<li class='layerItem' id='" + layer + "'>" + layers[layer].name + "</li>"
				}
				str += "</ul></div>";
				$("#ol-layerControl").append(str)
					.find(".layer_panel").addClass("hide")
					.find(".layer_dropDownList li:eq(0)").addClass("selected")
				$("#ol-layerControl").find(".layer_dropDownList li").on("click", function() {
					$("#ol-layerControl").find(".layer_dropDownList li.selected").removeClass("selected")
					$(this).addClass("selected")
					var id = $(this).attr("id");
					map.getLayers().getArray().forEach(function(layer) {
						if(layer.get("name") == undefined || layer.get("name") == "overlay" || layer.get("name") == "wind") {
							return;
						}
						if(layer.get("name").indexOf(layers[id].name) >= 0) {
							layer.setVisible(true)
						} else {
							layer.setVisible(false)
						}
					})
				})
				$("#ol-layerControl").hover(function(e) {
					if($(this).find(".layer_panel").hasClass("hide")) {
						$(this).find(".layer_panel").removeClass("hide")
						$(".layer_panel").slideDown("slow")
					} else {
						$(this).find(".layer_panel").addClass("hide")
						$(".layer_panel").slideUp("slow")
					}
				})
				$("#ol-layerControl").find(".layer_dropDownList").on("mouseover", function(e) {
					if($(this).find(".layer_panel").hasClass("hide")) {
						$(this).find(".layer_panel").removeClass("hide")
					} else {
						$(this).find(".layer_panel").addClass("hide")
					}
				})
				$("#ol-layerControl").find(".layer_dropDownList").on("mouseout", function(e) {
					if($(this).find(".layer_panel").hasClass("hide")) {
						$(this).find(".layer_panel").removeClass("hide")
					} else {
						$(this).find(".layer_panel").addClass("hide")
					}
				})

			}();
			axios.get('../data/current-wind-surface-level-gfs-1p00.json').then(function(res) {
				if(res.data) {

					//windData = res.data;

					addWindMap(res.data)
				}
			});
		})();

	},

	function(pack, exports, n){
		"use strict";

		function defineProperty(t) {
			if(t && t.__esModule)
				return t
			var e = {};
			if(null != t) {
				for(var n in t) {
					Object.prototype.hasOwnProperty.call(t, n) && (exports[n] = t[n]);
				}
				return exports.default = t,
					exports
			}
		}

		function parse2Module(t) {
			return t && t.__esModule ? t : {
				default: t
			}
		}

		Object.defineProperty(exports, "__esModule", {
			value: !0
		});

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

		function m(t, e, n, i, r) {
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

			DateUtils = n(8),
			RequestInterface = n(12),
			common = parse2Module(n(7)),
			_windy = n(9),
			Windy = parse2Module(_windy),
			_layerItem = n(5),
			config = n(13),

			ChinaBounds = [60.42, 10.01, 152.48, 57.35],
			_function;

		var MapModel = function($function){
			_inheritsLoose(MapModel, $function);

			function MapModel(params){
				judgeFunction(this, MapModel);
				var that = judge(this, (MapModel.__proto__ || Object.getPrototypeOf(MapModel)).call(this, params));
				return that._map = params.map,
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
								+ "<tr colspan='4' style='font-size:20px;float: left;padding-left: 5px; border-bottom: 1px solid;line-height: 28px; width:100%;'><td>" + data.cityname + "</td></tr>"
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
							popupChart.addEventListener('click', function() {
								$self.showForcast(data.cityname);
							});
							coordinate = feature.getGeometry().getCoordinates();

							content.innerHTML = str;
							$self.getCityHistoryAndForcastData(data.cityname, data.cityname, void 0, data.latitude, data.longitude);
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
					void 0 === t && void 0 !== this._selecttime && (t = this._selecttime),
						RequestInterface.getWindData(time, "wind", this._map.getView().getZoom(), function(data){
							$self._windy.setData(data),
								$self.updateWind(),
								data = null;
						})
				},
				stopWind: function(){
					this._windy.stop(),
					this._canvas.node().getContext("2d").clearRect(0, 0, this._map.getSize()[0], this._map.getSize()[0])
				},
				clearOverlay: function(){
					if (this._overlay) {
						this._overlay.node().getContext("2d").clearRect(0, 0, this._map.getSize()[0], this._map.getSize()[0])
					}
				},
				updateWind: function(){
					this._windflag ? this._windy.start() : this.stopWind(),
						2 !== this._itemFlag || "wind" === this._backitem && this._windflag || this._windy.drawOverlay()
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
							var mercator = lonlat2mercator(lonlat);
							var src = "../images/qp/level" + getAQIIndex(parseInt(viewpoint[i].aqi)) + ".png"
							var anchor = new ol.Feature({
								geometry: new ol.geom.Point([mercator.x, mercator.y]),
								id: viewpoint[i].cityid,//{longitude: viewpoint[i].longitude, latitude: viewpoint[i].latitude},cityid: "101200901",cityname: "宜昌"
								data: viewpoint[i],
								name: viewpoint[i].cityname,
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
									text: viewpoint[i]['cityname'],
									fill: new ol.style.Fill({
										color: '#000'
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
							var mercator = lonlat2mercator(lonlat);
							var anchor = new ol.Feature({
								geometry: new ol.geom.Point([mercator.x, mercator.y]),
								id: viewpoint[i].cityid,
								data: viewpoint[i],
								name: viewpoint[i].cityname,
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
							zIndex: 99,
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
							this.updateWind()
						);
					}else{
						this._overlay.node().getContext("2d").clearRect(0, 0, this._map.getSize()[0], this._map.getSize()[1])
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
				getCityHistoryAndForcastData: function(provinceAndCity, cityName, r, lat, lon){
					var $self = this,
						msg = {};
					msg.city = cityName,
					msg.item = this._item;
					RequestInterface.getServerData("/api/mapapi", "MAPAPI_GETFURTUREHISTORY", msg, function (data) {
						var d = data.data;
						var dataArr = [];
						var time = d[0].time;
						for(var i = 0; i < d.length; i++){
							dataArr.push({
								x: new Date(d[i].time).getTime(),		//echarts: d[i].time
								y: d[i][$self._itemName.toLowerCase()],
								color: d[i].time <= "2019-05-09 10:00:00"/*$self.state.time*/ ? returnColorByPollName(d[i][$self._itemName.toLowerCase()], $self._itemName.toLowerCase()) : "#999"
							});
							d[i].time > time && (time = d[i].time);
						}

						var axisLable = [];
						axisLable.push({
							from: new Date(d[0].time).getTime() - 18e5,
							to: new Date("2019-05-09 10:00:00").getTime(),	//$self.state.time
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
							from: new Date("2019-05-09 10:00:00").getTime(),	//$self.state.time
							to: new Date(time).getTime() + 18e5 ,
							color: "#FFEFFF",
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
					RequestInterface.getServerData("/api/mapapi", "MAPAPI_GETFORCASTBYCITY", msg, function(data){
						$self.render(data.data);
					}, 1)
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
						var lt = lonlat2mercator({
							x:parseFloat(ChinaBounds[0]),
							y:parseFloat(ChinaBounds[1])
						});

						var rd = lonlat2mercator({
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
						$self._map.animationDelay_();
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
							pane.time.push(common.default.createDOM("td",{
								className: CLASSName,
								textContent: hour
							})),
							pane.temp.push(common.default.createDOM("div",{
								className: "temp",
								style: "background: rgba(0,150,255,0.6); color: #fff;",
								textContent: t.temp,
								parent: common.default.createDOM("td",{
									className: CLASSName
								})
							}).parentElement),
							pane.humi.push(common.default.createDOM("div",{
								className: "humi",
								style: "background: rgba(0,150,255,1);",
								textContent: t.humi,
								parent: common.default.createDOM("td",{
									className: CLASSName
								})
							}).parentElement),
							pane.windSpeed.push(common.default.createDOM("td",{
								className: CLASSName,
								textContent: parseInt(3.6 * t.ws, 10)
							})),
							pane.windDirect.push(common.default.createDOM("span",{
								className: "windArrow",
								style: "transform: rotate("+ t.wda +"deg);",
								parent:  common.default.createDOM("div",{
									"className": "windDirect",
									parent: common.default.createDOM("td",{
										"className": CLASSName,
									})
								})
							}).parentElement.parentElement),
							pane.AQI.push(common.default.createDOM("div",{
								className: "AQI",
								style: "background: "+ $self.gradientColorByAQI(t.aqi).background +"; color: "+ $self.gradientColorByAQI(t.aqi).color +"",
								textContent: t.aqi,
								parent: common.default.createDOM("td",{
									className: CLASSName
								})
							}).parentElement),
							pane.pollute.push(common.default.createDOM("div",{
								className: "mainpoll",
								style: "pm2.5" == t.mainpoll.toLowerCase() ? "background: "+ config.mainpollColor["pm2_5"][0] +"; color: "+ config.mainpollColor["pm2_5"][1]+"" : "background: "+ config.mainpollColor[t.mainpoll.toLowerCase()][0] +"; color: "+ config.mainpollColor[t.mainpoll.toLowerCase()][1]+"",
								textContent: t.mainpoll,
								parent: common.default.createDOM("td",{
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
						pane.date.push(common.default.createDOM("td",{
							"className":"date",
							colSpan: 8,
							children: [common.default.createDOM("span",{
								className: "day",
								textContent: time.substr(5, 5).replace("-", "/") + "（周"+ week[(day - i + 7)%7] +"）"
							}),common.default.createDOM("span",{
								className: "value",
								textContent: average[i],
								style: "background: "+  returnColorByPollName(average[i], 'aqi') +"; color: #fff;"
							})],

						}))
					}

					var el = common.default.createDOM("div",{
						className: "_table",
						children: [common.default.createDOM("table",{
								children: [common.default.createDOM("tbody",{

								})]
							})],
						parent: root
					}).children[0].children[0];
					for(var item in pane){
						common.default.createDOM("tr",{
							children: [
								common.default.createDOM("td",{
									className: "title",
									textContent: config.alias[item][0]
								}),
								common.default.createDOM("td",{
									className: "unit",
									innerHTML: config.alias[item][1]
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

		exports.default = MapModel;
	},
	/**
	 * 时间轴控制
	 * @param {Object} pack
	 * @param {Object} exports
	 * @param {Object} n
	 */
	function(pack, exports, n) {

		"use strict";
		Object.defineProperty(exports, "__esModule", {
			value: !0
		});
		//var main = n();
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
		var play = function() {
			//_onPlay(); 	0: stop , 1: play
			0 === styleCss.status ? (styleCss.status = 1,
				document.querySelectorAll("._com-popup")[0].style.display = "none",
				document.querySelector("._animate-popup").style.display = "block",
				setTimeout(function() { //递归方式
					_onPlay();
				}, 20)) : (styleCss.status = 0,

				styleCss.timerout && clearTimeout(styleCss.timerout))

		}

		//play impelement			getData ---> re-render
		var _onPlay = function(e) {

			if(styleCss.barWidth % styleCss.dis_hour != 0) {
				var translatex = styleCss.barWidth % styleCss.dis_hour;
				styleCss.barWidth += styleCss.dis_hour - translatex;
			} else {
				styleCss.barWidth += styleCss.dis_hour;
			}

			if(hasReachEnd()) {
				styleCss.barWidth = 0;
			}
			var dayIndex = Math.floor(styleCss.barWidth / styleCss.dis_day);
			var year = document.querySelectorAll("._every-day")[dayIndex].getAttribute("data-year"),
				month = document.querySelectorAll("._every-day >span._month")[dayIndex].textContent,
				day = document.querySelectorAll("._every-day >span._day")[dayIndex].textContent;

			var hour = Math.floor(styleCss.barWidth % styleCss.dis_day / styleCss.dis_hour);
			var time = month < 10 ?
				day < 10 ?
				hour < 10 ? (year + "-" + "0" + month + "-" + "0" + day + " " + "0" + hour + ":00") :
				(year + "-" + "0" + month + "-" + "0" + day + " " + hour + ":00") :
				hour < 10 ? (year + "-" + "0" + month + "-" + day + " " + "0" + hour + ":00") : (year + "-" + "0" + month + "-" + day + " " + hour + ":00") :
				day < 10 ?
				hour < 10 ? (year + "-" + month + "-" + "0" + day + " " + "0" + hour + ":00") :
				(year + "-" + month + "-" + "0" + day + " " + hour + ":00") :
				hour < 10 ? (year + "-" + month + "-" + day + " " + "0" + hour + ":00") : (year + "-" + month + "-" + day + " " + hour + ":00");

			var texts = hour < 10 ? "0" + hour + ":00" : hour + ":00";
			$("._com-popup").text(texts);

			if(new Date(time).getTime() > new Date().getTime()) {
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
			console.log(time);
			document.querySelector(".timeInfo") && (document.querySelector(".timeInfo").textContent = time + ":00")
			//that.getDataByTime(time, styleCss.status);

			styleCss.timerout = setTimeout(function() {
				_onPlay()
			}, 2e3);
		}

		//播放停止
		var stop = function() {
			styleCss.status = 1;
			document.querySelector("._timePlay").title = "播放";
			$("._timePlay").removeClass("pause").addClass("play");
			clearTimeout(styleCss.timerout);
		}

		//点击事件
		var timeControlClick = function(e) {
			var el = e.target || e.currentTarget;
			if(el.title == "播放") {
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

		var timeLineClick = function(e) {
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
			var time = year + "-" + month + "-" + day + " " + hour + ":00";
			if(new Date(time).getTime() > new Date().getTime()) {
				return;
			}
			styleCss.barWidth = x - 50;
			var texts = hour + ":00";
			$("._com-popup").text(texts).hide();
			$("._com-popup._click-popup").show().css('left', x - 50);
			$("._timeProgress-bar").stop().css('width', x - 50);

			console.log(time);
			document.querySelector(".timeInfo") && (document.querySelector(".timeInfo").textContent = time + ":00")
			//getDataByTime(this.time,...)		arguments[0]必须
			//that.getDataByTime(time, /*styleCss.status*/!1 )
		}

		//鼠标hover事件
		var hover = function(event) {
			//window.addEventListener("mousemove", function hoverOut(e){
			$(window).on("mousemove", function(e) {
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

			$('._timeProgress-inner').one('mouseleave', function() {
				$(window).off('mousemove');
				$("._hover-popup").hide();
			})

		}

		//鼠标hoverout事件
		var hoverOut = function(e) {
			document.getElementsByClassName(idConfig["hover-popup"])[0].removeEventListener("mouseover", hover);
			document.getElementsByClassName("_hover-popup")[0].style.display = "none";
		}

		var hasReachEnd = function() {
			if(styleCss.barWidth >= document.getElementsByClassName("_timeProgress-line")[0].clientWidth) {
				return true;
			} else {
				return false;
			}

		}
		//事件注册初始化
		var eventInit = function() {
			$("._timeProgress-inner").on("mouseover", function() {
				hover();
			});
			$("._timeProgress-line").on("click", function(event) {
				var e = event || window.event;
				timeLineClick(e);
			});
			$("._timePlay").on("click", function(e) {

				timeControlClick(e)
			})
		}

		var returnNear5Day = function() {
			var day5 = [];
			var date = new Date();
			var hour = date.getHours(),
				day = date.getDate(),
				month = date.getMonth() + 1,
				year = date.getFullYear(),
				time = date.getTime();
			//历史
			for(var i = 4; i >= 0; i--) {
				day5[4 - i] = [];
				day5[4 - i][0] = new Date(time - (i - 1 + 1) * 24 * 60 * 60 * 1000).getFullYear();
				day5[4 - i][1] = new Date(time - (i - 1 + 1) * 24 * 60 * 60 * 1000).getMonth() + 1;
				day5[4 - i][2] = new Date(time - (i - 1 + 1) * 24 * 60 * 60 * 1000).getDate();

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
		var render = function() {

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
			var date = returnNear5Day(); //获取当前时间的hour-day-month-year
			var cur_hour = new Date().getHours(),
				cur_day = new Date().getDate(),
				index;

			for(var i = 0; i < date.length; i++) {
				if(date[i][2] == cur_day) {
					index = i;
					break;
				}
			}
			document.querySelector(".timeInfo") && (document.querySelector(".timeInfo").textContent = new Date().format().split(" ")[0] + " " + cur_hour + ":00:00");

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

			for(var i = 0; i < 5; i++) {
				var everyli = document.createElement("li");
				everyli.className = idConfig["every-day"];
				everyli.setAttribute("data-year", date[i][0]);
				everyli.style.width = styleCss.dis_day + "px";

				var ol = document.createElement("ol");
				for(var j = 0; j < 8; j++) {
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
		window.onresize = function() {
			document.querySelector("#_timeLine").remove();
			render();
		}
		exports.default = {
			hover: hover,
			timeLineClick: timeLineClick,
			timeControlClick: timeControlClick,
			play: play,
			_onPlay: _onPlay,
			stop: stop,
		}
	},
	/**
	 * 图层选择
	 * @param {Object} pack
	 * @param {Object} exports
	 * @param {Object} n
	 */
	function(pack, exports, n) {
		"use strict";

		var common = n(7);
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
			none: "none|纯净|0||0", // none|纯净|0||0
			//AQI: "none|AQI|0||0"     // none|纯净|0||0
		}
		itemConfig.key = {
			id: 0,
			name: 1,
			dp: 2,
			unit: 3,
			mode: 4
		}

		var init = function() {

			var rootDiv = common.default.createDOM("div", {
				id: "container",
				style: "height: auto;",
			});
			common.default.createDOM("div", {
					className: "switch",
					children: [
						common.default.createDOM("a", {
							className: "active",
							textContent: "动态风",
							children: [
								common.default.createDOM("span", {
									className: "dynamicWind"
								})
							],
							onclick: function() {

								if(!$(this).hasClass("active")) {
									$(this).addClass("active");
									that.updateWind && (that._windflag = !0, that.updateWind())
								} else {
									$(this).removeClass("active");
									that.stopWind && (that._windflag = !1, that.stopWind())
								}
							}
						})
					],
					style: " height: 28px;",
					parent: rootDiv
				}),
				common.default.createDOM("div", {
					className: "switch",
					children: [
						common.default.createDOM("a", {
							className: "active",
							textContent: "空气站",
							children: [
								common.default.createDOM("span", {
									className: "dynamicWind"
								})
							],
							onclick: function(t) {
								if(!$(this).hasClass("active")) {
									$(this).addClass("active");

								} else {
									$(this).removeClass("active");
								}
								that.onOverlayLayerSelect($(this).hasClass("active"));
							}
						})
					],
					style: " height: 28px;",
					parent: rootDiv
				}),
				common.default.createDOM("div", {
					className: "factorSelect",
					children: [
						common.default.createDOM("div", {
							className: "layers",
							textContent: "因子",
							style: "color: #fff"
						})
					],
					parent: rootDiv
				});
			var factorParent = common.default.createDOM("div", {
				className: "factorBox",
				parent: rootDiv
			})
			for(var item in itemConfig.factorItem) {
				var a = common.default.createDOM("a", {
					className: itemConfig.factorItem[item].split("|")[itemConfig.key.id] === "aqi" ? "active" : "",
					textContent: itemConfig.factorItem[item].split("|")[itemConfig.key.name],
					target: itemConfig.factorItem[item],
					onclick: function() {
						if(document.querySelector(".factor") != null)
							document.querySelector(".factor").style.display = "none";
						if(document.querySelector("#container>.factorBox>.active"))
							document.querySelector("#container>.factorBox>.active").className = "";
						this.className = 'active';
						//console.log(this.text);
						//console.log(this.target);
						if(this.nextElementSibling.children[0] != null) {
							this.nextElementSibling.children[0].style.display = "block";
						}
						//请求数据中转方法
						//timeline.stop();    //stop 要不要返回截止时间？？？
						//that.onOverlayChange(this.target);
						that.onItemChange(this.target);

					},
					parent: factorParent

				});
				common.default.createDOM("span", {
					className: itemConfig.factorItem[item].split("|")[itemConfig.key.id],
					parent: a
				})
				var dd = common.default.createDOM("div", {
					parent: factorParent
				});
			}

			if(itemConfig.layerItem) {
				common.default.createDOM("div", {
					className: "layerSelect",
					children: [
						common.default.createDOM("div", {
							className: "layers",
							textContent: "图层",
							style: "color: #fff"
						})
					],
					parent: rootDiv
				})
				var layerParent = common.default.createDOM("div", {
					className: "layerBox",
					parent: rootDiv
				})
				for(var item in itemConfig.layerItem) {
					var a = common.default.createDOM("a", {
						className: itemConfig.layerItem[item].split("|")[itemConfig.key.id] == 'none' ? "active" : "",
						textContent: itemConfig.layerItem[item].split("|")[itemConfig.key.name],
						target: itemConfig.layerItem[item],
						onclick: function() {
							if(document.querySelector(".factor") != null)
								document.querySelector(".factor").style.display = "none";
							if(document.querySelector("#container>.layerBox>.active"))
								document.querySelector("#container>.layerBox>.active").className = "";
							this.className = 'active';
							//console.log(this.text);
							console.log(this.target);
							if(this.nextElementSibling.children[0] != null) {
								this.nextElementSibling.children[0].style.display = "block";
							}
							//请求数据中转方法
							//timeline.stop();    //stop 要不要返回截止时间？？？
							that.onOverlayChange(this.target);

						},
						parent: layerParent

					});
					common.default.createDOM("span", {
						className: itemConfig.layerItem[item].split("|")[itemConfig.key.id],
						parent: a
					})
					var dd = common.default.createDOM("div", {
						parent: layerParent
					});
					if(item == "AQI") {
						a.className = "active";
						var selectDiv = common.default.createDOM("div", {
							className: "factor aSelect",
							style: "display: block;",

							parent: dd
						});
						common.default.createDOM("div", {
							className: 'name',
							textContent: "因子:",
							parent: selectDiv
						});
						for(var m = common.default.createDOM(0, {
								className: "main",
								parent: selectDiv
							}), u, f = {}, s = Object.keys(itemConfig.factorItem), h = 0; h < s.length; h++) {
							var k = itemConfig.factorItem[s[h]].split("|")[itemConfig.key.name] //a.options[h][0]
								,
								Q = common.default.createDOM("a", {
									textContent: k,
									value: itemConfig.factorItem[s[h]],
									onclick: function(b) {
										if(D && b || "disabled" == this.getAttribute("disabled"))
											return !1;
										timeline.stop();
										u && (u.className = "");
										u = this;
										u.className = "active";

										that.onItemChange(this.value);
									},
									parent: m
								});
							f[k] = Q;

						}
						u = m.firstElementChild;
						m.firstElementChild.className = "active";
						var D = createSelect(m, function(a) {
							f[a].onclick.call(f[a])
						});
						D.optionsMap = {};
						for(h = 0; h < s.length; h++)
							D.optionsMap[s[h]] = "---" == s[h] ? common.default.createDOM("optgroup", {
								label: "",
								parent: D
							}) : common.default.createDOM("option", {
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
			return common.default.createDOM("select", {
				onchange: function() {
					b(this.value)
				},
				onkeyup: function() {
					this.onchange()
				},
				onfocus: function() {
					document.documentElement.onmouseenter = function() {
						document.documentElement.className = ""
					};
					document.documentElement.onmouseleave = function() {
						document.documentElement.className = "nk"
					}
				},
				onblur: function() {
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
			obj.timer = setInterval(function() {
				var flag = true; //假设所有动作都已完成成立。
				for(var styleName in styleJson) {
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
					if(styleJson[styleName] != iMov) {
						flag = false;
						if(styleName == 'opacity') { //判断结果是否为透明度
							obj.style[styleName] = (iMov + speed) / 100;
							obj.style.filter = 'alpha(opacity:' + (iMov + speed) + ')';
						} else {
							obj.style[styleName] = iMov + speed + 'px';
						}
					}
				}
				if(flag) { //到达设定值，停止定时器，执行回调
					clearInterval(obj.timer);
					if(callback) {
						callback();
					}
				}
			}, speed)
		}

		pack.exports = itemConfig;

	},
	/**
	 * 色标配置
	 * @param {Object} pack
	 * @param {Object} exports
	 * @param {Object} n
	 */
	function(pack, exports, n){
		"use strict";

		/**
		 * Constructs a toggler for the specified product's units, storing the toggle state on the element having
		 * the specified id. For example, given a product having units ["m/s", "mph"], the object returned by this
		 * method sets the element's "data-index" attribute to 0 for m/s and 1 for mph. Calling value() returns the
		 * currently active units object. Calling next() increments the index.
		 */
		var createUnitToggle = function createUnitToggle(id, product) {
			var units = product.units, size = units.length;
			var index = +(d3.select(id).attr("data-index") || 0) % size;
			return {
				value: function() {
					return units[index];
				},
				next: function() {
					d3.select(id).attr("data-index", index = ((index + 1) % size));
				}
			};
		}

		/**
		 * Returns a human readable string for the provided scalar in the given units.
		 */
		var formatScalar = function formatScalar(value, units) {
			return units.conversion(value).toFixed(units.precision);
		}


		var colorInterpolator = function colorInterpolator(start, end) {
			var r = start[0],
				g = start[1],
				b = start[2];
			var Δr = end[0] - r,
				Δg = end[1] - g,
				Δb = end[2] - b;
			return function(i, a) {
				return [Math.floor(r + i * Δr), Math.floor(g + i * Δg), Math.floor(b + i * Δb), a];
			};
		}

		/**
		 * Produces a color style in a rainbow-like trefoil color space. Not quite HSV, but produces a nice
		 * spectrum. See http://krazydad.com/tutorials/makecolors.php.
		 *
		 * @param hue the hue rotation in the range [0, 1]
		 * @param a the alpha value in the range [0, 255]
		 * @returns {Array} [r, g, b, a]
		 */

		var sinebowColor = function sinebowColor(t, e) {
			var n = 2 * Math.PI,
				i = t * n * 5 / 6;
			i *= .75;
			var r = Math.sin(i),
				o = Math.cos(i);
			return [Math.floor(255 * Math.max(0, -o)), Math.floor(255 * Math.max(r, 0)), Math.floor(255 * Math.max(o, 0, -r)),
				e
			]
		}

		var extendedSinebowColor = function extendedSinebowColor(i, a) {
			return i <= BOUNDARY ?
				sinebowColor(i / BOUNDARY, a) :
				fadeToWhite((i - BOUNDARY) / (1 - BOUNDARY), a);
		}

		var clamp = function clamp(x, low, high) {
			return Math.max(low, Math.min(x, high));
		}

		var proportion = function proportion(x, low, high) {
			return (clamp(x, low, high) - low) / (high - low);
		}


		/**
		 * Creates a color scale composed of the specified segments. Segments is an array of two-element arrays of the
		 * form [value, color], where value is the point along the scale and color is the [r, g, b] color at that point.
		 * For example, the following creates a scale that smoothly transitions from red to green to blue along the
		 * points 0.5, 1.0, and 3.5:
		 *
		 *     [ [ 0.5, [255, 0, 0] ],
		 *       [ 1.0, [0, 255, 0] ],
		 *       [ 3.5, [0, 0, 255] ] ]
		 *
		 * @param segments array of color segments
		 * @returns {Function} a function(point, alpha) that returns the color [r, g, b, alpha] for the given point.
		 */
		var segmentedColorScale = function segmentedColorScale(segments) {
			var points = [], interpolators = [], ranges = [];
			for (var i = 0; i < segments.length - 1; i++) {
				points.push(segments[i+1][0]);
				interpolators.push(colorInterpolator(segments[i][1], segments[i+1][1]));
				ranges.push([segments[i][0], segments[i+1][0]]);
			}

			return function(point, alpha) {
				var i;
				for (i = 0; i < points.length - 1; i++) {
					if (point <= points[i]) {
						break;
					}
				}
				var range = ranges[i];
				return interpolators[i](proportion(point, range[0], range[1]), alpha);
			};
		}
		/**
		 * @returns {number} the value p within the range [0, 1], scaled to the range [low, high].
		 */
		var spread = function spread(p, low, high) {
			return p * (high - low) + low;
		}

		var execute = function execute(t) {
			return d[t.toLowerCase()]
		}
		Object.defineProperty(exports, "__esModule", {
				value: !0
			}),
			exports.Product = execute;

		var BOUNDARY = 0.45,
			fadeToWhite = colorInterpolator(sinebowColor(1.0, 0), [255, 255, 255]),
			d = {
				wind: {
					filed: "scalar",
					type: "wind",
					name: "风场",
					units: [{
						label: "km/h",
						conversion: function (t) {
							return 3.6 * t
						},
						precision: 0
					}],
					scale: {
						bounds: [0, 35],
						gradient: segmentedColorScale([
							[0, [37, 74, 255]],
							[2, [0, 150, 254]],
							[4, [18, 196, 200]],
							[6, [18, 211, 73]],
							[8, [0, 240, 0]],
							[10, [127, 237, 0]],
							[12, [254, 199, 0]],
							[14, [237, 124, 14]],
							[16, [200, 37, 39]],
							[18, [217, 0, 100]],
							[20, [202, 25, 186]],
							[24, [86, 54, 222]],
							[27, [42, 132, 222]],
							[29, [64, 199, 222]]
						]),
						colors: {
							"Colors": [

								[0, [37, 74, 255]],
								[2, [0, 150, 254]],
								[4, [18, 196, 200]],
								[6, [18, 211, 73]],
								[8, [0, 240, 0]],
								[10, [127, 237, 0]],
								[12, [254, 199, 0]],
								[14, [237, 124, 14]],
								[16, [200, 37, 39]],
								[18, [217, 0, 100]],
								[20, [202, 25, 186]],
								[24, [86, 54, 222]],
								[27, [42, 132, 222]],
								[29, [64, 199, 222]]
							],
							"ele": "WIND",
							"textColor":["#FFF", "#FFF","#FFF","#FFF","#000","#000","#000","#000","#000","#000","#FFF","#FFF","#FFF","#FFF"]
						},
						length: 0
					}
				},
				temp: {
					filed: "scalar",
					type: "temp",
					name: "温度",
					units: [{
						label: "°C",
						conversion: function (t) {
							return  t - 273.15
						},
						precision: 1
					}],
					scale: {
						bounds: [193, 328],	//[-36000, 50000], //
						gradient: segmentedColorScale([
							[193, [37, 4, 42]],
							[206, [41, 10, 130]],
							[219, [81, 40, 40]],
							[233.15, [192, 37, 149]],
							[255.372, [70, 215, 215]],
							[273.15, [21, 84, 187]],
							[275.15, [24, 132, 14]],
							[291, [247, 251, 59]],
							[298, [235, 167, 21]],
							[311, [230, 71, 39]],
							[328, [88, 27, 67]]
						]),
						colors: {
							"Colors": [
								[193, [37, 4, 42]],
								[206, [41, 10, 130]],
								[219, [81, 40, 40]],
								[233.15, [192, 37, 149]],
								[255.372, [70, 215, 215]],
								[273.15, [21, 84, 187]],
								[275.15, [24, 132, 14]],
								[291, [247, 251, 59]],
								[298, [235, 167, 21]],
								[311, [230, 71, 39]],
								[328, [88, 27, 67]]
							],
							"ele": "TMP",
							"textColor":["#FFF", "#FFF","#FFF","#FFF","#000","#FFF","#FFF","#000","#FFF","#FFF","#FFF"]
						},
						length: 11
					}
				},
				humidity: {
					filed: "scalar",
					type: "humi",
					name: "湿度",
					units: [{
						label: "%",
						conversion: function (t) {
							return t
						},
						precision: 0
					}],
					scale: {
						bounds: [0, 100],
						gradient: segmentedColorScale([
							[0, [230, 165, 30]],
							[25, [120, 100, 95]],
							[60, [40, 44, 92]],
							[75, [21, 13, 193]],
							[90, [75, 63, 235]],
							[100, [25, 255, 255]]
						]),
						colors: {
							"Colors": [
								[0, [230, 165, 30]],
								[25, [120, 100, 95]],
								[60, [40, 44, 92]],
								[75, [21, 13, 193]],
								[90, [75, 63, 235]],
								[100, [25, 255, 255]]
							],
							"ele": "RH",
							"textColor":["#FFF", "#FFF","#FFF","#FFF","#FFF","#FFF","#FFF"]
						},
						length: 6
					}
				},
				dswrf: {
					filed: "scalar",
					type: "dswrf",
					name: "辐射",
					units: [{
						label: "W/m²",
						conversion: function (t) {
							return t
						},
						precision: 0
					}],
					scale: {
						bounds: [0, 1200],
						gradient: segmentedColorScale([
							[0, [0, 0, 181]],
							[100, [80, 148, 181]],
							[200, [59, 155, 189]],
							[300, [90, 216, 117]],
							[400, [137, 215, 79]],
							[500, [186, 222, 73]],
							[600, [239, 247, 71]],
							[700, [241, 180, 52]],
							[800, [248, 125, 32]],
							[900, [212, 77, 11]],
							[1e3, [191, 56, 8]],
							[1100, [184, 31, 13]],
							[1200, [148, 7, 9]]
						]),
						colors: {
							"unit": "%",
							"Colors": [
								[0, 0, 181,1],
								[80, 148, 181,1],
								[59, 155, 189,1],
								[90, 216, 117,1],
								[137, 215, 79,1],
								[186, 222, 73,1],
								[239, 247, 71,1],
								[241, 180, 52,1],
								[248, 125, 32,1],
								[212, 77, 11,1],
								[191, 56, 8,1],
								[184, 31, 13, 1],
								[148, 7, 9, 1]
							],
							"ele": "DSWRF",
							"bounds": [0, 1200],
							"Interval": "0,100,200,300,400,500,600,700,800,900,1000,1100,1200",
							"textColor":["#FFF", "#FFF","#FFF","#FFF","#FFF","#FFF","#FFF","#FFF","#FFF","#FFF","#FFF","#FFF","#FFF"]
						},
						length: 13
					}
				},
				pressure: {
					filed: "scalar",
					type: "pres",
					name: "气压",
					units: [{
						label: "hPa",
						conversion: function (t) {
							return t / 100
						},
						precision: 0
					}],
					scale: {
						bounds: [94000, 105400], //[995, 1040],//
						gradient:
						segmentedColorScale([
							[94000, [238, 238, 238, 1]],
							[94814.28571428572, [255, 51, 255, 1]],
							[95628.57142857143, [166, 4, 166, 0.85]],
							[96442.85714285715, [28, 15, 101, 0.85]],
							[97257.14285714285, [85, 77, 173, 0.85]],
							[98071.42857142857, [61, 124, 198, 0.85]],
							[98885.71428571428, [76, 186, 136, 0.85]],
							[99700, [108, 209, 80, 0.85]],
							[100514.28571428572, [211, 232, 57, 0.85]],
							[101328.57142857143, [235, 198, 55, 0.85]],
							[102142.85714285715, [233, 141, 68, 0.85]],
							[102957.14285714286, [218, 69, 112, 0.85]],
							[103771.42857142857, [168, 35, 88, 0.85]],
							[104585.71428571428, [110, 21, 46, 0.93]],
							[105400, [43, 0, 1, 0.93]]
						]),
						colors: {
							"Colors": [
								[94000, [238, 238, 238, 1]],
								[94814.28571428572, [255, 51, 255, 1]],
								[95628.57142857143, [166, 4, 166, 0.85]],
								[96442.85714285715, [28, 15, 101, 0.85]],
								[97257.14285714285, [85, 77, 173, 0.85]],
								[98071.42857142857, [61, 124, 198, 0.85]],
								[98885.71428571428, [76, 186, 136, 0.85]],
								[99700, [108, 209, 80, 0.85]],
								[100514.28571428572, [211, 232, 57, 0.85]],
								[101328.57142857143, [235, 198, 55, 0.85]],
								[102142.85714285715, [233, 141, 68, 0.85]],
								[102957.14285714286, [218, 69, 112, 0.85]],
								[103771.42857142857, [168, 35, 88, 0.85]],
								[104585.71428571428, [110, 21, 46, 0.93]],
								[105400, [43, 0, 1, 0.93]]
							],
							"ele": "PRESSURE",
							"textColor":["#000", "#FFF","#FFF","#FFF","#FFF","#FFF","#FFF","#000","#FFF","#FFF","#FFF","#FFF"]
						},
						length: 12
					}
				},
				rain: {
					filed: "scalar",
					type: "rain",
					name: "降雨",
					units: [{
						label: "mm",
						conversion: function (t) {
							return t
						},
						precision: 1
					}],
					scale: {
						bounds: [0, 50],
						gradient: segmentedColorScale([
							[.1, [117, 117, 117]],
							[.2, [91, 87, 137]],
							[.5, [73, 102, 170]],
							[1, [70, 153, 171]],
							[2, [83, 184, 100]],
							[4, [145, 206, 76]],
							[6, [206, 218, 62]],
							[8, [220, 182, 64]],
							[10, [219, 158, 69]],
							[15, [217, 121, 77]],
							[20, [210, 96, 95]],
							[30, [179, 56, 103]],
							[40, [147, 23, 78]],
							[50, [84, 16, 41]]
						]),
						colors: {
							"Colors": [
								[.1, [117, 117, 117]],
								[.2, [91, 87, 137]],
								[.5, [73, 102, 170]],
								[1, [70, 153, 171]],
								[2, [83, 184, 100]],
								[4, [145, 206, 76]],
								[6, [206, 218, 62]],
								[8, [220, 182, 64]],
								[10, [219, 158, 69]],
								[15, [217, 121, 77]],
								[20, [210, 96, 95]],
								[30, [179, 56, 103]],
								[40, [147, 23, 78]],
								[50, [84, 16, 41]]
							],
							"ele": "RAIN",
							"textColor":["#FFF","#FFF","#FFF","#FFF","#000","#000","#000","#000","#000","#000","#FFF","#FFF","#FFF","#FFF"]
						},
						length: 15
					}
				},
				clouds: {
					filed: "scalar",
					type: "clouds",
					name: "总云",
					units: [{
						label: "%",
						convertion: function (t) {
							return t;
						},
						percision: 0
					}],
					scale: {
						bounds: [0, 100],
						gradient: segmentedColorScale([
							[0, [61, 130, 212]],
							[10, [93, 151, 219]],
							[20, [125, 171, 226]],
							[30, [157, 192, 233]],
							[40, [189, 213, 240, 0.64]],
							[50, [221, 233, 247, 0.67]],
							[60, [253, 254, 255, 0.69]],
							[70, [255, 255, 255, 0.76]],
							[80, [255, 255, 255, 0.84]],
							[90, [255, 255, 255, 0.92]],
							[100, [255, 255, 255, 1.0]]
						]),
						colors: {
							"Colors": [
								[0, [61, 130, 212]],
								[10, [93, 151, 219]],
								[20, [125, 171, 226]],
								[30, [157, 192, 233]],
								[40, [189, 213, 240, 0.64]],
								[50, [221, 233, 247, 0.67]],
								[60, [253, 254, 255, 0.69]],
								[70, [255, 255, 255, 0.76]],
								[80, [255, 255, 255, 0.84]],
								[90, [255, 255, 255, 0.92]],
								[100, [255, 255, 255, 1.0]]
							],
							"ele": "TOTLE_CLOUDS",
							"textColor":["#FFF","#FFF","#000","#000","#000","#000","#000","#000","#000","#000","#000"]
						},
						length: 11
					}
				}
			};

		var colorConfig = {
			createUnitToggle: createUnitToggle,
			formatScalar: formatScalar,
			colorInterpolator: colorInterpolator,
			sinebowColor: sinebowColor,
			extendedSinebowColor: extendedSinebowColor,
			clamp: clamp,
			proportion: proportion,
			segmentedColorScale: segmentedColorScale,
			spread: spread,

			execute: execute
		}
		exports.default = execute;

	},
	/**
	 * 通用配置
	 * @param {Object} pack
	 * @param {Object} exports
	 */
	function(pack, exports) {
		"use strict";
		Object.defineProperty(exports, "__esModule", {
			value: !0
		});

		function createDOM(dom, obj) {
			var c = document.createElement(dom || "div");
			if(obj)
				for(var d in obj)
					if("parent" == d)
						obj[d].appendChild(c);
					else if("style" == d)
				c.style.cssText = obj[d];
			else if("children" == d)
				for(var m = 0; m < obj[d].length; m++)
					c.appendChild("object" != typeof obj[d][m] ? document.createTextNode(obj[d][m]) : obj[d][m]);
			else
				try {
					c[d] = obj[d]
				} catch(u) {}
			return c

		}

		var clearCanvas = function clearCanvas(canvas) {
			canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
			return canvas;
		}

		var createCanvas = function createCanvas(width, height, Canvas) {
			if(typeof document !== 'undefined') {
				var canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				return canvas;
			} else {
				return new Canvas(width, height);
			}
		}
		var TiandituKey = function() {
			var keyArray = ["03ec1881f0bbb5e09bf9bcc9550225c0",
				"84567f2343b0d12ab07341d540f1fe2b",
				"3dcc07b9c11b178c0d9ff5a84fca6f1d",
				"dbe1cc8da6ed7a8c914d07aa1793aad4",
				"686c72bbbee7c6fcb81d27aba2216cb3",
				"f45027f1731b61b21dcc714b01694ac1",
				"515cb668488f73e28a91d9c37c13920e"
			]
			var index = Math.round(Math.random() * 6);
			//console.log(keyArray[index])
			return keyArray[index];
		}
		exports.default = {
			createDOM: createDOM,
			TiandituKey: TiandituKey,
			clearCanvas: clearCanvas,
			createCanvas: createCanvas
		}
	},
	/**
	 * 时间utils
	 * @param {Object} pack
	 * @param {Object} exports
	 */
	function(pack, exports) {
		"use strict";
		Object.defineProperty(exports, "__esModule", {
			value: !0
		});
		var timeformat = exports.timeformat = function(date, convert) {
				var n = {
						"M+": date.getMonth() + 1,
						"d+": date.getDate(),
						"h+": date.getHours(),
						"m+": date.getMinutes(),
						"s+": date.getSeconds(),
						"q+": Math.floor((date.getMonth() + 3) / 3),
						S: date.getMilliseconds()
					},
					format = convert;
				return /(y+)/.test(format) && (format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length))),
					Object.keys(n).forEach(function(t) {
						new RegExp("(" + t + ")").test(format) && (format = format.replace(RegExp.$1, 1 === RegExp.$1.length ? n[t] : ("00" + n[t]).substr(
							("" + n[t]).length)))
					}),
					format
			},
			getFormatDate = exports.getFormatDate = function(time, format) {
				return time ? "string" == typeof time && time.constructor === String && (time = time.replace(/-/g, "/"),
						time = new Date(time)) : time = new Date,
					format || (format = "yyyy-MM-dd hh:mm:ss"),
					timeformat(time, format)
			},
			getSmpFormatDate = exports.getSmpFormatDate = function(time, isFormat) {
				var format = "";
				return format = !0 === isFormat || void 0 === isFormat ? "yyyy-MM-dd hh:mm:ss" : "yyyy-MM-dd",
					getFormatDate(time, format)
			},
			getSmpFormatNowDate = exports.getSmpFormatNowDate = function(format) { //把当前时间转化成对应的格式
				return getSmpFormatDate(new Date, format)
			},
			getSmpFormatNowHour = exports.getSmpFormatNowHour = function() {
				return getSmpFormatDate(new Date, !0).substr(0, 13) + ":00:00"
			},
			getPointTime = exports.getPointTime = function() {
				var t = new Date;
				return t.getMinutes() < 33 && t.setHours(t.getHours() - 1),
					t.setMinutes(0),
					t.setSeconds(0),
					getSmpFormatDate(t)
			},
			getSmpFormatDateByLong = exports.getSmpFormatDateByLong = function(t, e) {
				return getSmpFormatDate(new Date(t), e)
			},

			getFormatDateByLong = exports.getFormatDateByLong = function(t, e) {
				return getFormatDate(new Date(t), e)
			},
			getLongByDate = exports.getLongByDate = function(t) {
				return void 0 === t ? (new Date).getTime() : (t = t.replace(/-/g, "/"),
					new Date(t).getTime())
			},
			getDateByStr = exports.getDateByStr = function(dateStr) {
				return void 0 === dateStr ? new Date : (dateStr = dateStr.replace(/-/g, "/"),
					new Date(dateStr))
			},
			calTimeDiff = exports.calTimeDiff = function(dateStr1, dateStr2) {
				var n = dateStr1.replace(/-/g, "/");
				n = new Date(n).getTime();

				var i = void 0;
				return void 0 === dateStr2 ? i = (new Date).getTime() : (i = dateStr2.replace(/-/g, "/"),
						i = new Date(i).getTime()),
					i - n
			},
			getFormatDateAdd = exports.getFormatDateAdd = function(t, e) {
				var i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "yyyy-MM-dd hh:mm:ss",
					r = t.replace(/-/g, "/");
				return r = new Date(r),
					r.setDate(r.getDate() + e),
					timeformat(r, i)
			},
			getFormatDateHourAdd = exports.getFormatDateHourAdd = function(t, e) {
				var i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "yyyy-MM-dd hh:mm:ss",
					r = t.replace(/-/g, "/");
				return r = new Date(r),
					r.setHours(r.getHours() + e),
					timeformat(r, i)
			},
			getDayFlag = exports.getDayFlag = function() {
				var t = (new Date).getHours();
				return t >= 6 && t < 18
			};
		exports.default = {
			getSmpFormatDate: getSmpFormatDate,
			getSmpFormatNowDate: getSmpFormatNowDate,
			getSmpFormatDateByLong: getSmpFormatDateByLong,
			getFormatDateByLong: getFormatDateByLong,
			getSmpFormatNowHour: getSmpFormatNowHour,
			getFormatDate: getFormatDate,
			getLongByDate: getLongByDate,
			getDateByStr: getDateByStr,
			calTimeDiff: calTimeDiff,
			getPointTime: getPointTime,
			getFormatDateAdd: getFormatDateAdd,
			getFormatDateHourAdd: getFormatDateHourAdd,
			getDayFlag: getDayFlag
		}
	},

	function(pack, exports, n) {
		"use strict";

		function defineProperty(t) {
			if(t && t.__esModule)
				return t
			var e = {};
			if(null != t) {
				for(var n in t) {
					Object.prototype.hasOwnProperty.call(t, n) && (exports[n] = t[n]);
				}
				return exports.default = t,
					exports
			}
		}

		function esModule_pack(module) {
			return module && module.__esModule ? module : {
				default: module
			}
		}
		//判断obj是否为 objectStr类型
		function judgeFunction(obj, objectStr) {
			if(!(obj instanceof objectStr))
				throw new TypeError("Cannot call a class as a function")
		}

		function _inheritsLoose(subClass, superClass) {
			subClass.prototype = Object.create(superClass.prototype);
			subClass.prototype.constructor = subClass;
			subClass.__proto__ = superClass;
		}

		Object.defineProperty(exports, "__esModule", {
			value: !0
		});
		//转化成存取器模式
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
			DateUtils = n(1),
			MIN_VELOCITY_INTENSITY = 0, //velocity at which particle intensity is minimum (m/s)
			MAX_VELOCITY_INTENSITY = 15,
			FRAME_RATE = 15,
			FRAME_TIME = 1000 / FRAME_RATE,
			MAX_PARTICLE_AGE = 90,
			PARTICLE_MULTIPLIER = 0.002, //粒子放大系数
			PARTICLE_LINE_WIDTH = 1, //默认的粒子线宽
			NULL_WIND_VECTOR = [NaN, NaN, null], //风场矢量为空时的值
			VELOCITY_SCALE = 0.000016666666666666667, //粒子速率放大系数
			defaulColorScale = ["rgb(36,104, 180)", "rgb(60,157, 194)", "rgb(128,205,193 )", "rgb(151,218,168 )", "rgb(198,231,181)", "rgb(238,247,217)", "rgb(255,238,159)", "rgb(252,217,125)", "rgb(255,182,100)", "rgb(252,150,75)", "rgb(250,112,52)", "rgb(245,64,32)", "rgb(237,45,28)", "rgb(220,24,32)", "rgb(180,0,35)"],
			colorScale,
			_function;
		if(!_function) _function = function() {
			function _class() {}

			return _class;
		}();
		var Windy = function($function) {
			_inheritsLoose(Windy, $function);

			function Windy(options) {
				if(!options.projection) {
					this.projection = 'EPSG:4326'
				} else {
					this.projection = options.projection
				}
				PARTICLE_LINE_WIDTH = options.lineWidth || 1;
				colorScale = options.colorScale || defaulColorScale;
				judgeFunction(this, Windy),
					this._map = options.map,
					this._canvas = options.canvas,
					this._overlayCanvas = options.overlayCanvas,
					this._startcolor = "#0099ff",
					this._endcolor = "#3300ff",
					this._type = "wind",
					this._overlayflag = !1,
					this._windy = {
						params: options,
						field: null
					}
				return this;
			}
			Windy.prototype = {
				constructor: Windy,

				setOptions: function(options) {
					options.defaulColorScale && (defaulColorScale = options.defaulColorScale),
						options.velocity && (VELOCITY_SCALE = options.velocity),
						options._startcolor && (this._startcolor = options._startcolor),
						options._endcolor && (this._endcolor = options._endcolor),
						options._opacity && (this._opacity = options._opacity),
						options._linewidth && (this._linewidth = options._linewidth);
				},
				setData: function(data) {
					var e = this;
					this.buildGrid(data, function(grid) {
							e._windgrid = grid
						}),
						data = null
				},
				// interpolation for vectors like wind (u,v,m)
				bilinearInterpolateVector: function bilinearInterpolateVector(x, y, g00, g10, g01, g11) {
					var rx = 1 - x;
					var ry = 1 - y;
					var a = rx * ry,
						b = x * ry,
						c = rx * y,
						d = x * y;
					var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
					var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
					return [u, v, Math.sqrt(u * u + v * v)];
				},

				bilinearInterpolateScalar: function(x, y, g00, g10, g01, g11) {
					var rx = (1 - x);
					var ry = (1 - y);
					return g00 * rx * ry + g10 * x * ry + g01 * rx * y + g11 * x * y;
				},

				createWindBuilder: function createWindBuilder(uComp, vComp) {
					var $self = this;
					var uData = uComp.data,
						vData = vComp.data;
					return {
						header: uComp.header,
						data: function data(i) {
							var u = uData[i],
								v = vData[i];
							return $self.isValue(u) && $self.isValue(v) ? [u, v] : null;
						},
						interpolate: $self.bilinearInterpolateVector
					};
				},

				createScalarBuild: function(record) {
					var data = record.data;
					return {
						header: record.header,
						interpolate: this.bilinearInterpolateScalar,
						data: function(i) {
							return data[i];
						}
					}
				},

				createBuilder: function createBuilder(data) {
					var uComp = null,
						vComp = null;
					var scalar = null; //  by caip
					data.forEach(function(record) {
						switch(record.header.parameterCategory + "," + record.header.parameterNumber) {
							case "1,2":
							case "2,2":
								uComp = record; //u方向
								break;

							case "1,3":
							case "2,3":
								vComp = record; //v方向
								break;
							default:
								scalar = record;

						}
					});

					return uComp ? this.createWindBuilder(uComp, vComp) : this.createScalarBuild(scalar);
				},
				isValue: function isValue(x) {
					return x !== null && x !== undefined;
				},
				floorMod: function floorMod(a, n) {
					return a - n * Math.floor(a / n);
				},
				buildGrid: function(data, callback) {
					/**
					 * Get interpolated grid value from Lon/Lat position
					 * @param λ {Float} Longitude
					 * @param φ {Float} Latitude
					 * @returns {Object}
					 */
					var interpolate = function interpolate(λ, φ) {
						if(!grid) return null;
						var i = $self.floorMod(λ - λ0, 360) / Δλ; // calculate longitude index in wrapped range [0, 360)
						var j = (φ0 - φ) / Δφ; // calculate latitude index in direction +90 to -90

						var fi = Math.floor(i),
							ci = fi + 1;
						var fj = Math.floor(j),
							cj = fj + 1;
						var row;

						if(row = grid[fj]) {
							var g00 = row[fi];
							var g10 = row[ci];

							if($self.isValue(g00) && $self.isValue(g10) && (row = grid[cj])) {
								var g01 = row[fi];
								var g11 = row[ci];

								if($self.isValue(g01) && $self.isValue(g11)) {
									// All four points found, so interpolate the value.
									return builder.interpolate(i - fi, j - fj, g00, g10, g01, g11);
								}
							}
						}

						return null;
					};
					var $self = this,
						builder = this.createBuilder(data);
					var header = builder.header,
						λ0 = header.lo1, // the grid's origin (e.g., 0.0E, 90.0N)
						φ0 = Math.max(header.la2, header.la1),
						Δλ = header.dx, // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)
						Δφ = header.dy,
						ni = header.nx, // number of grid points W-E and N-S (e.g., 144 x 73)
						nj = header.ny;
					var date = new Date(header.refTime);
					date.setHours(date.getHours() + header.forecastTime);

					// Scan mode 0 assumed. Longitude increases from λ0, and latitude decreases from φ0.
					var grid = [],
						p = 0,
						isContinuous = Math.floor(ni * Δλ) >= 360;

					if(header.la1 > header.la2) {
						for(var j = 0; j < nj; j++) {
							var row = [];
							for(var i = 0; i < ni; i++, p++) {
								row[i] = builder.data(p);
							}
							if(isContinuous) {
								// For wrapped grids, duplicate first column as last column to simplify interpolation logic
								row.push(row[0]);
							}
							grid[j] = row;
						}
					} else {
						for(var j = nj - 1; j >= 0; j--) {
							for(var row = [], i = 0; i < ni; i++, p++) {
								row[i] = builder.data(p)
							}
							isContinuous && row.push(row[0]),
								grid[j] = row;
						}
					}

					data = null,
						callback({
							//source: dataSource(header),
							date: date,
							interpolate: interpolate
						});
				},
				/**
				 * 角度转弧度
				 * @param {Object} deg
				 */
				deg2rad: function deg2rad(deg) {
					return deg / 180 * Math.PI;
				},
				/**
				 * 弧度转角度
				 * @param {Object} ang
				 */
				rad2deg: function rad2deg(ang) {
					return ang / (Math.PI / 180.0);
				},
				/**
				 * 不同投影的坐标转化原理不同
				 * @param {Object} x
				 * @param {Object} y
				 * @param {Object} windy
				 */
				invert3857: function(x, y, windy) {
					var mapLonDelta = windy.east - windy.west;
					var worldMapRadius = windy.width / this.rad2deg(mapLonDelta) * 360 / (2 * Math.PI);
					var mapOffsetY = worldMapRadius / 2 * Math.log((1 + Math.sin(windy.south)) / (1 - Math.sin(windy.south)));
					var equatorY = windy.height + mapOffsetY;
					var a = (equatorY - y) / worldMapRadius;
					var lat = 180 / Math.PI * (2 * Math.atan(Math.exp(a)) - Math.PI / 2);
					var lon = this.rad2deg(windy.west) + x / windy.width * this.rad2deg(mapLonDelta);
					return [lon, lat];
				},
				invert4326: function(x, y, windy) {
					var mapLonDelta = windy.east - windy.west;
					var worldMapRadius = windy.width / this.rad2deg(mapLonDelta) * 360 / (2 * Math.PI);
					var mapOffsetY = worldMapRadius / 2 * Math.log((1 + Math.sin(windy.south)) / (1 - Math.sin(windy.south)));
					var equatorY = windy.height + mapOffsetY;
					var a = (equatorY - y) / worldMapRadius;
					var lat = 180 / Math.PI * (2 * Math.atan(Math.exp(a)) - Math.PI / 2);
					var lon = this.rad2deg(windy.west) + x / windy.width * this.rad2deg(mapLonDelta);
					return [lon, lat];
				},
				mercY: function(lat) {
					return Math.log(Math.tan(lat / 2 + Math.PI / 4));
				},
				project: function(lat, lon, windy) {
					var ymin = this.mercY(windy.south);
					var ymax = this.mercY(windy.north);
					var xFactor = windy.width / (windy.east - windy.west);
					var yFactor = windy.height / (ymax - ymin);
					var y = this.mercY(this.deg2rad(lat));
					var x = (this.deg2rad(lon) - windy.west) * xFactor;
					var y = (ymax - y) * yFactor;
					return [x, y];
				},

				/**
				 * Calculate distortion of the wind vector caused by the shape of the projection at point (x, y). The wind
				 * vector is modified in place and returned by this function.
				 */
				distort: function(projection, λ, φ, x, y, scale, wind, windy) {
					var u = wind[0] * scale;
					var v = wind[1] * scale;
					var d = this.distortion(projection, λ, φ, x, y, windy);

					// Scale distortion vectors by u and v, then add.
					wind[0] = d[0] * u + d[2] * v;
					wind[1] = d[1] * u + d[3] * v;
					return wind;
				},

				distortion: function(projection, λ, φ, x, y, windy) {
					var τ = 2 * Math.PI;
					var H = this.projection === 'EPSG:4326' ? 5 : Math.pow(10, -5.2);
					var hλ = λ < 0 ? H : -H;
					var hφ = φ < 0 ? H : -H;
					var pλ = this.project(φ, λ + hλ, windy);
					var pφ = this.project(φ + hφ, λ, windy);

					// Meridian scale factor (see Snyder, equation 4-3), where R = 1. This handles issue where length of 1º λ
					// changes depending on φ. Without this, there is a pinching effect at the poles.
					var k = Math.cos(φ / 360 * τ);
					return [(pλ[0] - x) / hλ / k, (pλ[1] - y) / hλ / k, (pφ[0] - x) / hφ, (pφ[1] - y) / hφ];
				},
				buildBounds: function(bounds, width, height) {
					var upperLeft = bounds[0],
						lowerRight = bounds[1],
						x = Math.round(upperLeft[0]),
						y = Math.max(Math.floor(upperLeft[1], 0), 0),
						xMax = Math.min(Math.ceil(lowerRight[0], width), width - 1),
						yMax = Math.min(Math.ceil(lowerRight[1], height), height - 1);

					return {
						x: x,
						y: y,
						xMax: width,
						yMax: yMax,
						width: width,
						height: height
					};
				},
				view: function() {
					var w = window,
						d = document && document.documentElement,
						b = document && document.getElementsByTagName("body")[0],
						x = w.innerWidth || d.clientWidth || b.clientWidth,
						y = w.innerHeight || d.clientHeight || b.clientHeight;
					return {
						width: x,
						height: y
					};
				},
				createMask: function() {
					var width = this.view().width,
						height = this.view().height,

						canvas = d3.select(document.createElement("canvas")).attr("width", width).attr("height", height).node(),
						ctx = canvas.getContext("2d");
					ctx.fillStyle = "rgba(255, 0, 0, 1)",
						ctx.fill();
					var imageData = ctx.getImageData(0, 0, width, height),
						data = imageData.data;
					return {
						imageData: imageData,
						isVisible: function(x, y) {
							var i = (y * width + x) * 4;
							return data[i + 3] > 0; // non-zero alpha means pixel is visible
						},
						set: function(x, y, rgba) {
							var i = (y * width + x) * 4;
							data[i] = rgba[0];
							data[i + 1] = rgba[1];
							data[i + 2] = rgba[2];
							data[i + 3] = rgba[3];
							//return this;
						}
					}
				},
				createField: function(columns, bounds, callback) {
					/**
					 * @returns {Array} wind vector [u, v, magnitude] at the point (x, y), or [NaN, NaN, null] if wind
					 *          is undefined at that point.
					 */
					function field(x, y) {
						var column = columns[Math.round(x)];
						return column && column[Math.round(y)] || NULL_WIND_VECTOR;
					}

					// Frees the massive "columns" array for GC. Without this, the array is leaked (in Chrome) each time a new
					// field is interpolated because the field closure's context is leaked, for reasons that defy explanation.
					field.release = function() {
						cancelAnimationFrame(animationLoop);
						clearTimeout(animationLoop);
						columns = [], grid = void 0;
						mask && mask.imageData && (mask.imageData = [])
					};

					field.randomize = function(o) { // UNDONE: this method is terrible
						var x, y;
						var safetyNet = 0;

						do {
							x = Math.round(Math.floor(Math.random() * bounds.width) + bounds.x);
							y = Math.round(Math.floor(Math.random() * bounds.height) + bounds.y);
						} while (field(x, y)[2] === null && safetyNet++ < 30);

						o.x = x;
						o.y = y;
						return o;
					};
					scale && scale.scale && (field.overlay = mask.imageData)
					callback(bounds, field);
				},

				/**
				 * 以下七个为 风场核心方法
				 * @param {Object} grid
				 * @param {Object} bounds
				 * @param {Object} scale
				 * @param {Object} callback
				 */
				interpolateGrid: function(grid, bounds, extent, scale, callback) {

					function isNotNull(t) {
						return null !== t && void 0 !== t
					}

					function createField(columns, bounds, callback) {
						/**
						 * @returns {Array} wind vector [u, v, magnitude] at the point (x, y), or [NaN, NaN, null] if wind
						 *          is undefined at that point.
						 */
						function field(x, y) {
							var column = columns[Math.round(x)];
							return column && column[Math.round(y)] || NULL_WIND_VECTOR;
						}

						// Frees the massive "columns" array for GC. Without this, the array is leaked (in Chrome) each time a new
						// field is interpolated because the field closure's context is leaked, for reasons that defy explanation.
						field.release = function() {
							cancelAnimationFrame($self._timer);
							clearTimeout($self._timer);
							columns = [],
								grid = void 0;
							mask && mask.imageData && (mask.imageData = [])
						};

						field.randomize = function(o) { // UNDONE: this method is terrible
							var x, y;
							var safetyNet = 0;

							do {
								x = Math.round(Math.floor(Math.random() * bounds.width) + bounds.x);
								y = Math.round(Math.floor(Math.random() * bounds.height) + bounds.y);
							} while (field(x, y)[2] === null && safetyNet++ < 30);

							o.x = x;
							o.y = y;
							return o;
						};
						scale && (field.overlay = mask.imageData)
						callback(bounds, field);
					}

					function interpolateColumn(x) {
						var column = [];

						for(var y = bounds.y; y <= bounds.yMax; y += 2) {
							var coord = $self.projection == "EPSG:3857" ? $self.invert3857(x, y, extent) : $self.invert4326(x, y, extent);
							//var color = TRANSPARENT_BLACK;
							//var wind = null;
							if(coord) {
								var λ = coord[0],
									φ = coord[1];

								if(isFinite(λ)) {
									var wind = grid.interpolate(λ, φ);
									var scalar = void 0;
									if(wind && isNotNull(wind[2])) {
										var windd = $self.distort(projection, λ, φ, x, y, velocityScale, wind, extent);
										column[y + 1] = column[y] = wind || NULL_WIND_VECTOR;
										scalar = windd[2];

									} else {
										scalar = wind;
									}
									if(scale && scale.scale && isValue(scalar)) { //   scale undefined      作为参数传过来！！！
										var color = scale.gradient(scalar, OVERLAY_ALPHA)
										mask.set(x, y, color),
											mask.set(x + 1, y, color),
											mask.set(x, y + 1, color),
											mask.set(x + 1, y + 1, color);
									}
								}
							}

						}

						columns[x + 1] = columns[x] = column;
					}

					var $self = this;
					var velocityScale = bounds.height * VELOCITY_SCALE; //VELOCITY_SCALE
					var columns = [];
					var x = bounds.x;
					var projection = {};
					var mask = void 0;
					if(scale && scale.scale) {
						mask = this.createMask();
						var colorBar = d3.select("#overlay-color"),
							color_el = d3.select("#overlay-color").node(),
							ctx = color_el.getContext("2d"),
							M = color_el.width - 1,
							X = [];
						for(var k = 0; k <= M; k++) {
							var rgb = scale.scale.gradient(percent(k / M, scale.scale.bounds[0], scale.scale.bounds[1]), 1);
							X.push(rgb);
							ctx.fillStyle = "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")",
								ctx.fillRect(k, 0, 1, color_el.height);
						}
						colorBar.on("mousemove", function() {
							var x = d3.mouse(this)[0];
							var pct = colorConfig.clamp((Math.round(x) - 2) / (M - 2), 0, 1);
							var value = colorConfig.spread(pct, scale.scale.bounds[0], scale.scale.bounds[1]);
							var elementId = scale.type === "wind" ? "#location-wind-units" : "#location-value-units";
							var units = colorConfig.createUnitToggle(elementId, scale).value();
							colorBar.attr("title", colorConfig.formatScalar(value, units) + " " + units.label);
						});

						for(var range = scale.scale.bounds[1] - scale.scale.bounds[0], c = 0; c < 6; c++) {
							var el = document.querySelector(".colorTip td:nth-child(" + (c + 1) + ")"),
								val = scale.scale.bounds[0] + (c + 0.5) * range / 6;
							el.innerHTML = parseInt(scale.units[0].conversion(val), 10);
						}

						if(scale.type === "wind") {
							document.querySelector("#legend").style.display = "block";
							document.querySelector("#colourCode").style.display = "none";
						} else {
							document.querySelector("#legend").style.display = "none";
							document.querySelector("#colourCode").style.display = "block";
						}
						document.querySelector("#climateLegend").style.display = "none";

					}

					(function batchInterpolate() {
						var start = Date.now();
						while(x < bounds.xMax) {
							interpolateColumn(x);
							x += 2;
							if((Date.now() - start) > 1000) { //MAX_TASK_TIME
								setTimeout(batchInterpolate, 25);
								return;
							}
						}
						createField(columns, bounds, callback);
					})();
				},
				animate: function(bounds, vector, extent) {
					function windIntensityColorScaleZq(t, e) {
						a._opacity && (l = a._opacity);
						var n = a._startcolor,
							i = a._endcolor,
							r = new p.gradientColor(n, i, t, l);
						return r.indexFor = function(t) {
								return Math.floor(Math.min(t, e) / e * (r.length - 1))
							},
							r
					}

					function windIntensityColorScale(min, max) {
						colorScale.indexFor = function(m) {
							return Math.max(0, Math.min(colorScale.length - 1, Math.round((m - min) / (max - min) * (colorScale.length - 1))));
						};

						return colorScale;
					}

					function evolve() {
						buckets.forEach(function(bucket) {
							bucket.length = 0;
						});
						particles.forEach(function(particle, i) {
							if(particle.age > MAX_PARTICLE_AGE) {
								vector.randomize(particle).age = 0
							}
							var x = particle.x;
							var y = particle.y;
							var v = vector(x, y),
								m = v[2];
							if(m == null) {
								particle.age = MAX_PARTICLE_AGE;
							} else {
								var xe = x + windVelocity * v[0],
									ye = y + windVelocity * v[1];

								if(vector(xe, ye)[2] !== null) {
									// Path from (x,y) to (xt,yt) is visible, so add this particle to the appropriate draw bucket.
									particle.xe = xe;
									particle.ye = ye;
									buckets[colorStyles.indexFor(m)].push(particle);
								} else {
									// Particle isn't visible, but it still moves through the field.
									particle.x = xe;
									particle.y = ye;
								}
							}
							particle.age += 1;
						});
					}

					function draw() {
						var prev = "lighter"; //g.globalCompositeOperation;
						g.globalCompositeOperation = "destination-in";
						g.fillRect(0, 0, bounds.width, bounds.height);
						g.globalCompositeOperation = prev;
						g.globalAlpha = 0.9;
						//g.restore();
						buckets.forEach(function(bucket, i) {
							if(bucket.length > 0) {
								g.beginPath();
								g.strokeStyle = colorStyles[i];
								bucket.forEach(function(particle) {
									g.moveTo(particle.x, particle.y);
									g.lineTo(particle.xe, particle.ye);
									particle.x = particle.xe;
									particle.y = particle.ye;
								});
								g.stroke();
							}
						})
					}

					var $self = this;

					var colorStyles = windIntensityColorScale(MIN_VELOCITY_INTENSITY, MAX_VELOCITY_INTENSITY);
					var buckets = colorStyles.map(function() {
						return [];
					});
					var zoom = this._map.getView().getZoom();
					var fps = 60,
						opacity = 0.8,
						amplificationFactor = 10,
						/*amplificationFactor: 放大系数*/
						windVelocity = 1,
						/*windVelocity: 风速系数 */
						lineWidth = 1.5;
					zoom <= 3 ? (opacity = .8, fps = 60, amplificationFactor = 20, windVelocity = 1.2,
						lineWidth = 1.5) : 4 === zoom ? (opacity = .8, fps = 60, amplificationFactor = 16, windVelocity = 1.1,
						lineWidth = 1.5) : 5 === zoom ? (opacity = .8, fps = 75, amplificationFactor = 10, windVelocity = 1,
						lineWidth = 1.6) : 6 === zoom ? (opacity = .7, fps = 75, amplificationFactor = 8, windVelocity = .8,
						lineWidth = 1.8) : 7 === zoom ? (opacity = .65, fps = 75, amplificationFactor = 6, windVelocity = .6,
						lineWidth = 1.8) : 8 === zoom ? (opacity = .6, fps = 80, amplificationFactor = 4, windVelocity = .5,
						lineWidth = 1.8) : 9 === zoom ? (opacity = .55, fps = 80, amplificationFactor = 3, windVelocity = .4,
						lineWidth = 2) : 10 === zoom ? (opacity = .5, fps = 80, amplificationFactor = 2, windVelocity = .3,
						lineWidth = 2) : 11 === zoom ? (opacity = .4, fps = 100, amplificationFactor = 1, windVelocity = .2,
						lineWidth = 2.2) : 12 === zoom ? (opacity = .3, fps = 100, amplificationFactor = .8, windVelocity = .1,
						lineWidth = 2.3) : 13 === zoom ? (opacity = .2, fps = 100, amplificationFactor = .7, windVelocity = .08,
						lineWidth = 2.5) : (opacity = .1, fps = 120, amplificationFactor = .5, windVelocity = .05, lineWidth = 2.6);

					var mapArea = (extent.south - extent.north) * (extent.west - extent.east);
					var particleCount = Math.round(bounds.width * bounds.height * PARTICLE_MULTIPLIER * Math.pow(mapArea, 0.24));
					//var particleCount = (bounds.width < 1200 && bounds.width, Math.round(bounds.width * amplificationFactor * 0.25)); zq粒子数
					console.log(particleCount);
					var fadeFillStyle = "rgba(255, 255, 255, 0.8)", //"rgba(0, 0, 0, 0.97)";
						particles = [];
					if(particles.length > particleCount) particles = particles.slice(0, particleCount);
					for(var i = 0; i < particleCount; i++) {
						particles.push(vector.randomize({
							age: Math.floor(Math.random() * MAX_PARTICLE_AGE)
						}));
					}

					var g = this._canvas.getContext("2d");
					g.lineWidth = PARTICLE_LINE_WIDTH * lineWidth,
						g.fillStyle = fadeFillStyle,
						this._timer && clearTimeout(this._timer),
						function frame() {
							try {
								evolve(),
									draw(),
									$self._windflag && ($self._timer = setTimeout(frame, fps))
							} catch(t) {
								console.error(t)
							}
						}();

				},
				start: function(extent) {
					var $self = this;
					this._cloneExtent = extent;
					if(this._windgrid) {
						var width = extent[1], //  width,
							height = extent[2], // height
							bounds = extent[0], // bounds
							_extent = extent[3]; // extent
						this._bounds = bounds,
							this._width = width,
							this._height = height;
						var mapBounds = {
							south: this.deg2rad(_extent[0][1]),
							north: this.deg2rad(_extent[1][1]),
							east: this.deg2rad(_extent[1][0]),
							west: this.deg2rad(_extent[0][0]),
							width: width,
							height: height
						};
						var config = !1;
						"wind" === this._type && !0 === this._overlayflag && (config = (0, h.default)(this._type)),
							this._windflag = !0,
							this.interpolateGrid(this._windgrid, this.buildBounds(bounds, width, height), mapBounds, config, function(bounds, vector) {
								$self._windy.vector = vector
								config && $self._overlayCanvas.getContext("2d").putImageData(vector.overlay, 0, 0)
								clearTimeout($self._timer),
									$self.animate(bounds, vector, mapBounds)
							})
					}
				},
				stop: function() {
					this._windy.vector && (this._windy.vector.release(),
							void 0 !== this._timer && clearTimeout(this._timer)),
						this._windflag = !1
				},
				setOverlay: function(type, data) {
					this._overlayData = data,
						this._type = void 0 !== type ? type : "wind",
						void 0 !== data ? (
							this._overlayflag = !0, this._overlayProduct = colorConfig.execute(("" == type ? "wind" : type)),
							this.drawOverlay()
						) : (
							this._overlayflag = !1, this.releaseOverlay()
						)
				},
				drawOverlay: function() {
					var $self = this;
					var width = this._cloneExtent[1], //  width,
						height = this._cloneExtent[2], // height
						bounds = this._cloneExtent[0], // bounds
						extent = this._cloneExtent[3]; // extent
					var mapBounds = {
						south: this.deg2rad(extent[0][1]),
						north: this.deg2rad(extent[1][1]),
						east: this.deg2rad(extent[1][0]),
						west: this.deg2rad(extent[0][0]),
						width: width,
						height: height
					};
					"wind" !== this._type && this._overlayData && this.buildGrid(this._overlayData, function(e) {
						$self.overlayGrid = e,
							$self.interpolateGrid(e, $self.buildBounds(bounds, width, height), function(bounds, field) {
								$self.overlayfield = field,
									$self._overlayCanvas.getContext("2d").putImageData(field.overlay, 0, 0)
							})
					})
				},
				releaseOverlay: function() {
					if(this._windy.overlayfield && this._windy.overlayfield.release(),
						this._overlayCanvas) {
						this._overlayCanvas.getContext("2d").clearRect(0, 0, this._width, this._height);

						var noder = d3.select("#overlay-color").node(); //  这里是 classname		色标的
						noder.getContext("2d").clearRect(0, 0, noder.width, noder.height);
						d3.select("#colourCode").node().style.display = "none";
						d3.select("#legend").node().style.display = "block";
					}
				},
				shift: function(dx, dy) {
					var canvas = this._canvas,
						w = canvas.width,
						h = canvas.height,
						ctx = canvas.getContext("2d");

					if(w > dx && h > dy) {
						var clamp = function clamp(high, value) {
							return Math.max(0, Math.min(high, value));
						};

						var imageData = ctx.getImageData(clamp(w, -dx), clamp(h, -dy), clamp(w, w - dx), clamp(h, h - dy));
						ctx.clearRect(0, 0, w, h);
						ctx.putImageData(imageData, clamp(w, dx), clamp(h, dy));

						for(var i = 0, pLength = particles.length; i < pLength; i++) {
							particles[i].x += dx;
							particles[i].y += dy;
						}
					}
				}
			}
			return Windy;
		}(_function)

		exports.default = Windy

	},

	/**
	 * 图层信息配置及常规配置
	 * @param {Object} pack
	 * @param {Object} exports
	 * @param {Object} n
	 */
	function(pack, exports, n) {
		"use strict";

		Object.defineProperty(exports, "__esModule", {
			value: !0
		});

		function esModule_pack(module) {
			return module && module.__esModule ? module : {
				default: module
			}
		}
		var _common = n(3),
			common = esModule_pack(_common);

		var TiandiMap_vec = new ol.layer.Tile({ //天地图矢量图层
			name: "天地图矢量图层",
			visible: true,
			source: new ol.source.XYZ({
				url: "http://t0.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=" + common.default.TiandituKey(),
				wrapX: false
			})
		});
		var TiandiMap_cva = new ol.layer.Tile({ //天地图矢量注记图层
			name: "天地图矢量注记图层",
			visible: true,
			source: new ol.source.XYZ({
				url: "http://t0.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=" + common.default.TiandituKey(),
				wrapX: false
			})
		});
		var TiandiMap_img = new ol.layer.Tile({ //天地图影像图层
			name: "天地图影像图层",
			visible: false,
			source: new ol.source.XYZ({
				url: "http://t0.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=" + common.default.TiandituKey(),
				wrapX: false
			})
		});
		var TiandiMap_cia = new ol.layer.Tile({ //天地图影像注记图层
			name: "天地图影像注记图层",
			visible: false,
			source: new ol.source.XYZ({
				url: "http://t0.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=" + common.default.TiandituKey(),
				wrapX: false
			})
		});
		var TiandiMap_ter = new ol.layer.Tile({ //天地图地形图层
			name: "天地图地形图层",
			visible: false,
			source: new ol.source.XYZ({
				url: "http://t0.tianditu.com/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=" + common.default.TiandituKey(),
				wrapX: false
			})
		});
		var TiandiMap_cta = new ol.layer.Tile({
			name: "天地图地形注记图层",
			visible: false,
			source: new ol.source.XYZ({
				url: "http://t0.tianditu.com/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=" + common.default.TiandituKey(),
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
		var layers = exports.layers = {
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
		pack.exports = layers; /* {
			layers: layers,
			alias: alias,
			mainpollColor: mainpollColor
		} */
	},
	/**
	 * 前端存储：storageUtils
	 * @param {Object} pack
	 * @param {Object} exports
	 * @param {Object} n
	 */
	function(pack, exports, n){
		"use strict";

		function esModule_pack(t) {
			return t && t.__esModule ? t : {
				default: t
			}
		}
		Object.defineProperty(exports, "__esModule", {
				value: !0
			}),
			exports.cookieUtil = exports.sessionStorageUtil = exports.localStorageUtil = void 0;

		var cookieUtil = exports.cookieUtil = {
			getCookie: function(t){
				if(document.cookie.length > 0){

				}
			},
			setCookie: function(t, e, n){

			},
			checkCookie: function(t, e){
				return !!this.getCookie(t);
			}
		},
		sessionStorageUtil = exports.sessionStorageUtil = {
			save: function(){

			},
			check: function(){

			},
			getValue: function(){

			},
			remove: function(){

			}
		},
		localStorageUtil= exports.localStorageUtil = {
			save: function(key, data){
				var storeData = JSON.stringify(data);
				try{
					localStorage.setItem(key, storeData)
				}catch (e){
					"QuotaExceededError" === e.name && (console.log("超出本地存储限额！"),
		            localStorage.clear(),
		            localStorage.setItem(key, storeData));
				}
			},
			check: function(key){
				return localStorage.getItem(key)
			},
			getValue: function(key){
				var storeData = localStorage.getItem(key),
					data = null;
				return data = JSON.parse(storeData),
					data
			},
			remove: function(key){
				localStorage.removeItem(key)
			}
		}
		exports.default = {
			localStorageUtil: localStorageUtil,
			sessionStorageUtil: sessionStorageUtil,
			cookieUtil: cookieUtil
		}
	},
	/**
	 * 请求接口
	 * @param {Object} pack
	 * @param {Object} exports
	 * @param {Object} n
	 */
	function(pack, exports, n){
		"use strict";

		function esModule_pack(t) {
			return t && t.__esModule ? t : {
				default: t
			}
		}
		function readDataFromLocalStorage(key, flag){
			 void 0 === flag && (flag = 0);
		        var data = storageUtils.localStorageUtil.getValue(key);
		        if (data) {
		            var time = data.time
		              , now = (new Date).getTime();
		            (new Date).getHours() >= 0 && (new Date).getHours() < 5 && flag > 1 && (flag = 1),
		            now - 60 * flag * 60 * 1e3 > time && (data = null),
		            (new Date).getHours() >= 5 && new Date(time).getDate() !== (new Date).getDate() && 24 === flag && (data = null)
		        }
		        return data;
		}
		Object.defineProperty(exports, "__esModule", {
				value: !0
			}),
			exports.getWindData = exports.getAQIData = exports.getServerData = void 0;
			//exports.getLocalFile = exports.getGzipData = exports.getTxtData = exports.getAqiData = exports.getServerData = exports.getData = void 0;

		var storageUtils = n(11),
			DateUtils = n(8),
		/**
		 * getWindData
		 * @param time 获取数据的时间节点
		 * @param item = "wind" , "temp" , "humidity"....  类型
		 * @param zoom = this._map.getZoom()
		 * @param callback
		 */
		getWindData = exports.getWindData = function(time, item, zoom, callback){
			var url = void 0;
				url =  '../data/current-' + item + '-surface-level-gfs-1p00.json';
			axios.get(url, {

			}).then(function (res) {
				if (res.data) {
					var data = res.data;
					callback(data);
				}
			});
		},
		/**
		 * getAQIData 获取空气站aqi数据
		 * @param time
		 * @param type1: POINT, CITY ;
		 * @param type2: REALTIME, FORCAST, history
		 * @param callback
		 */
		getAQIData = exports.getAQIData = function(time, type1, type2, callback) {
			var url;
			if(type1 == "CITY")
				url = '../data/cityaqidata.json';
			else
				url = '../data/stationaqidata.json';
			axios.get(url, {

			}).then(function(res){
				if(res.data && res.data[0].time){
					callback(res.data);
				}
			})
		},
		/**
		 * getServerData
		 * @param path 接口路径
		 * @param secret 密钥
		 * @param message 城市信息
		 * @param callback
		 */
		getServerData = exports.getServerData = function(path, secret, message, callBack, flag) {
			var url = void 0;
			if(secret == "MAPAPI_GETFURTUREHISTORY")
				url = '../data/'+ message.item +'FurtureHistoryData.json'
			else{
				url = '../data/forcast5DaysData.json';
			}
			var key = secret + JSON.stringify(message);
			var data = readDataFromLocalStorage(key, flag);
			data ? callBack(data) : (
				$.ajax({
					type: 'get',
					url: url,
					success: function(data){
						if(data.result){
							flag > 0 && (data.result.time = (new Date).getTime(), storageUtils.localStorageUtil.save(key, data.result)),
							callBack(data.result);
						}
					}
				})
			)
		};
		exports.default = {
			getServerData: getServerData,
			getAQIData: getAQIData,
			getWindData: getWindData
		}
	},

	function (pack, exports){
		"use strict";
		var alias = {
			date: ["日期", "&nbsp;"],
			time: ["小时", "H"],
			temp: ["温度", "℃"],
			humi: ["湿度", "%"],
			windSpeed: ["风速", "km/h"],
			windDirect: ["风向", "✤"],
			AQI: ["AQI", "&nbsp;"],
			pollute: ["主要污染物", "&nbsp;"]
		}
		var mainpollColor = {
			pm2_5: ['red', "#fff"],
			pm10: ['rgb(0, 146, 255)', "#fff"],
			no2: ['orange', "#000"],
			so2: ['yellow', "#000"],
			o3: ['lime', "#fff"],
			co: ['rgba(0, 0, 0, .25)', '#fff']
		}
		pack.exports = {
			alias: alias,
			mainpollColor: mainpollColor
		}
	},
]))
