/**
 * @author caip
 * @version 2019-05-28
 */

var DateUtils = function() {
	"use strict";
	var timeformat = function(date, convert) {
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
		getFormatDate  = function(time, format) {
			return time ? "string" == typeof time && time.constructor === String && (time = time.replace(/-/g, "/"),
					time = new Date(time)) : time = new Date,
				format || (format = "yyyy-MM-dd hh:mm:ss"),
				timeformat(time, format)
		},
		getSmpFormatDate  = function(time, isFormat) {
			var format = "";
			return format = !0 === isFormat || void 0 === isFormat ? "yyyy-MM-dd hh:mm:ss" : "yyyy-MM-dd",
				getFormatDate(time, format)
		},
		getSmpFormatNowDate = function(format) { //把当前时间转化成对应的格式
			return getSmpFormatDate(new Date, format)
		},
		getSmpFormatNowHour = function() {
			return getSmpFormatDate(new Date, !0).substr(0, 13) + ":00:00"
		},
		getPointTime  = function() {
			var t = new Date;
			return t.getMinutes() < 33 && t.setHours(t.getHours() - 1),
				t.setMinutes(0),
				t.setSeconds(0),
				getSmpFormatDate(t)
		},
		getSmpFormatDateByLong  = function(t, e) {
			return getSmpFormatDate(new Date(t), e)
		},

		getFormatDateByLong = function(t, e) {
			return getFormatDate(new Date(t), e)
		},
		getLongByDate = function(t) {
			return void 0 === t ? (new Date).getTime() : (t = t.replace(/-/g, "/"),
				new Date(t).getTime())
		},
		getDateByStr = function(dateStr) {
			return void 0 === dateStr ? new Date : (dateStr = dateStr.replace(/-/g, "/"),
				new Date(dateStr))
		},
		calTimeDiff = function(dateStr1, dateStr2) {
			var n = dateStr1.replace(/-/g, "/");
			n = new Date(n).getTime();

			var i = void 0;
			return void 0 === dateStr2 ? i = (new Date).getTime() : (i = dateStr2.replace(/-/g, "/"),
					i = new Date(i).getTime()),
				i - n
		},
		/**
		 * 用法：getFormatDateAdd(dateStr, 6)
		 * @param {Object} t
		 * @param {Object} e
		 */
		getFormatDateAdd = function(t, e) {
			var i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "yyyy-MM-dd hh:mm:ss",
				r = t.replace(/-/g, "/");
			return r = new Date(r),
				r.setDate(r.getDate() + e),
				timeformat(r, i)
		},
		getFormatDateHourAdd = function(t, e) {
			var i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "yyyy-MM-dd hh:mm:ss",
				r = t.replace(/-/g, "/");
			return r = new Date(r),
				r.setHours(r.getHours() + e),
				timeformat(r, i)
		},
		getDayFlag = function() {
			var t = (new Date).getHours();
			return t >= 6 && t < 18
		};
	return {
		timeformat: timeformat,
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
}();
