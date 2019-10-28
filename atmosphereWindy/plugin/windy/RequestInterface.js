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
            getAQIData = function(time, type1, type2, callback) {
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
            getServerData = function(path, secret, message, callBack, flag) {
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

    return {
        getServerData: getServerData,
        getAQIData: getAQIData,
        getWindData: getWindData
    }


})));
