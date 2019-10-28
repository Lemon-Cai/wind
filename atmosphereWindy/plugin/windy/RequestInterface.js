(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
            typeof define === 'function' && define.amd ? define(factory) :
                    (global.RequestInterface = factory());
}(this, (function () {
    'use strict';


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

    var storageUtils = {
        cookieUtil: {
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
        sessionStorageUtil: {
            save: function(){

            },
            check: function(){

            },
            getValue: function(){

            },
            remove: function(){

            }
        },
        localStorageUtil: {
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
    },
            /**
             * getWindData
             * @param time 获取数据的时间节点
             * @param item = "wind" , "temp" , "humidity"....  类型
             * @param zoom = this._map.getZoom()
             * @param callback
             */
           getWindData = function(time, item, zoom, callback){
                time = time == void 0 ? DateUtils.getSmpFormatNowDate() : time; 
				var UTCtime = DateUtils.getFormatDateHourAdd(time, -8, "yyyyMMddhh") + "00",
					UTCday = UTCtime.substr(0, 8),
					UTChour = UTCtime.substr(8, 2);
				
				if(item == "temp"){
					item = "temperature"
				}else if(item == "humidity"){
					item = "Humidity"
				}else if(item == "pressure"){
					item = "Pressure"
				}
				var	url;
				if(zoom < 5){
					for(var list = ["00", "03", "06", "09", "12", "15", "18", "21"], p = 0; p < list.length; p++){
						if(UTChour >= list[p] && UTChour < list[p+1]){
							UTChour = list[p];
							break;
						}
						if(p === list.length - 1){
							UTChour = list[p];
							break;
						}
					}
					
					url =  "/lidarnet.web/ExtModelData/GFS/json/globe/hour/" + UTCday + "/gfs.pgrb2.1p00.f0" + UTChour + ".glb."+ UTCday +"."+ titleCase(item) +".json"
				}else{
					url =  "/lidarnet.web/ExtModelData/GFS/json/china/hour/" + UTCday + "/gfs.pgrb2.0p25.f0" + UTChour + ".chn."+ UTCday +"."+ titleCase(item) +".json"
				}
				
				axios.get(url).then(function (res) {
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
            getAQIData = function(time, type1, type2, callback) {
               var url;
				/*if(type1 == "CITY")
					url = $ctxStatic + '/gbq/modules/air/AtmoWindy/data/cityaqidata.json';
				else
					url = $ctxStatic + '/gbq/modules/air/AtmoWindy/data/stationaqidata.json';*/
				var time1 = void 0 === time ?  ((new Date).getMinutes() < 35 ? new Date((new Date).setHours((new Date).getHours() - 1)).format().substring(0,13) + ":00" : new Date().format().substring(0,13) + ":00") : time;
				url = $ctx + '/atmoWindy/nationalWindy/getAQIData?time='+ time1 +'&type='+ type1 +'';
				$.ajax({
					  type: "get",
					  url: url,
					  dataTpye: 'json',
					  success: function (res) {
						  res = JSON.parse(res)
						  if(res.data && res.msg == "success"){
							  var data = res.data;
							  callback(data);
						  }
					  },
					  error: function (xhr, type, errorThrown) {
						console.log("其他异常:", type)
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
            getServerData = function(path, secret, message, callBack, flag) {
               var url = void 0,
					key = void 0;
				if(secret == "GETFURTUREHISTORY"){
					//url =  $ctxStatic + '/gbq/modules/air/AtmoWindy/data/futureHistoryData.json'				
				}else{
					//url = $ctxStatic + '/gbq/modules/air/AtmoWindy/data/forcast5DaysData.json';
				}
				url = $ctx + '/atmoWindy/nationalWindy/getServerData?secret='+ secret +'&cityCode='+message.cityCode+'&item='+ message.item +'&type='+ that._type +'';
				key = secret + JSON.stringify(message);
				var data = readDataFromLocalStorage(key, flag);
				data ? callBack(data.result) : (
					$.ajax({
						type: 'get',
						url: url,
						success: function(data){
							if(data = JSON.parse(data),
									data.result && data.msg == "success"){
								flag > 0 && (data.time = (new Date).getTime(), storageUtils.localStorageUtil.save(key, data)),
								callBack(data.result);
							}
							
						}
					})
				)
            };

    return {
        getServerData: getServerData,
        getAQIData: getAQIData,
        getWindData: getWindData
    }


})));
