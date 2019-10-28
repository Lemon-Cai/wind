	function sortObj(t, e) {		// 		sortObj 升序还是降序
		return function(n, i) {
			var r = n[t],
				o = i[t];
			return "DESC" === e ? o - r : r - o
		}
	}

	function getAqiColor(t) {		//获得aqi的颜色		getAqiColor	--- returnAQIColor
		return t <= 0 ? "#f0f0f0" : t <= 50 ? "#43ce17" : t <= 100 ? "#efdc31" : t <= 150 ? "#fa0" : t <= 200 ? "#ff401a" :
			t <= 300 ? "#d20040" : "#9c0a4e"
	}

	function getAQIlevel(t) {		//获得aqi等级 ---	getAqiLevel   getAQIlevel		u
		return t <= 0 ? "无" : t <= 50 ? "优" : t <= 100 ? "良" : t <= 150 ? "轻度污染" : t <= 200 ? "中度污染" : t <= 300 ? "重度污染" :
			"严重污染"
	}

	function getWindDirectionStr(t) {		//获得风向 ---- getWindDirectionStr
		var e = "";
		return null == t ? e = "-" : t <= 22.5 || t >= 337.5 ? e = "北风" : t > 22.5 && t <= 67.5 ? e = "东北风" : t > 67.5 &&
			t <= 112.5 ? e = "东风" : t > 112.5 && t <= 157.5 ? e = "东南风" : t > 157.5 && t <= 202.5 ? e = "南风" : t > 202.5 && t <=
			247.5 ? e = "西南风" : t > 247.5 && t <= 292.5 ? e = "西风" : t > 292.5 && t <= 337.5 && (e = "西北风"),
			e
		
	}

	function getWindLevel(t) { 	//获得风速等级 --- getWindLevel		l
		return t < 1 ? 0 : t <= 5 ? 1 : t <= 11 ? 2 : t <= 19 ? 3 : t <= 28 ? 4 : t <= 38 ? 5 : t <= 49 ? 6 : t <= 61 ? 7 :
			t <= 74 ? 8 : t <= 88 ? 9 : t <= 102 ? 10 : t <= 117 ? 11 : t <= 133 ? 12 : t <= 149 ? 13 : t <= 166 ? 14 : t <=
			183 ? 15 : t <= 201 ? 16 : t <= 220 ? 17 : 18
	}

	function getAQIIndex(t) {		// get aqi		u
		return t <= 0 ? 0 : t <= 50 ? 1 : t <= 100 ? 2 : t <= 150 ? 3 : t <= 200 ? 4 : t <= 300 ? 5 : 6
	}

	function getColorByLevel(t) {			// according to the index to get color		c
		return 0 === t ? "#BEBEBE" : 1 === t ? "#43ce17" : 2 === t ? "#efdc31" : 3 === t ? "#fa0" : 4 === t ? "#ff401a" :
			5 === t ? "#d20040" : "#9c0a4e"
	}

	function getComplexIndex(t) {			// get  complexindex 综合指数 d
		return t <= 5 ? 1 : t <= 6 ? 2 : t <= 8 ? 3 : t <= 9 ? 4 : t <= 10 ? 5 : 6
	}

	function getPM25Level(t) {			// get pm2_5		h
		return 0 === t ? 0 : t <= 35 ? 1 : t <= 75 ? 2 : t <= 115 ? 3 : t <= 150 ? 4 : t <= 250 ? 5 : 6
	}

	function getPM10Level(t) {			// get pm10			f
		return 0 === t ? 0 : t <= 50 ? 1 : t <= 150 ? 2 : t <= 250 ? 3 : t <= 350 ? 4 : t <= 420 ? 5 : 6
	}

	function getSO2Level(t) {		// get  so2		p
		return 0 === t ? 0 : t <= 50 ? 1 : t <= 150 ? 2 : t <= 475 ? 3 : t <= 800 ? 4 : t <= 1600 ? 5 : 6
	}

	function getNO2Level(t) {		// get no2	m
		return 0 === t ? 0 : t <= 40 ? 1 : t <= 80 ? 2 : t <= 180 ? 3 : t <= 280 ? 4 : t <= 565 ? 5 : 6
	}

	function getO3Level(t) {		//获得 o3 or o3_8h		g
		return 0 === t ? 0 : t <= 100 ? 1 : t <= 160 ? 2 : t <= 215 ? 3 : t <= 265 ? 4 : t <= 800 ? 5 : 6
	}

	function getCOLevel(t) {		//get co	v
		return 0 === t ? 0 : t <= 2 ? 1 : t <= 4 ? 2 : t <= 14 ? 3 : t <= 24 ? 4 : t <= 36 ? 5 : 6
	}

	function getTEMPLevel(t) {		//获得temp的 Index		y
		return t <= 0 ? 1 : t <= 8 ? 2 : t <= 16 ? 3 : t <= 24 ? 4 : t <= 32 ? 5 : 6
	}

	function getHUMILevel(t) {		// get humi		_
		var e = void 0;
		return 0 === t ? e = 0 : t <= 20 ? e = 1 : t <= 40 ? e = 2 : t <= 60 ? e = 3 : t <= 80 ? e = 4 : t <= 100 && (e =
				5),
			e
	}

	function getIndexByPollName(t, e) {		//	getIndexByPollName		b
		var n = 0;
		switch (e) {
			case "aqi": 
				n = getAQIIndex(t);
				break;
			case "so2":
				n = getSO2Level(t);
				break;
			case "no2":
				n = getNO2Level(t);
				break;
			case "co":
				n = getCOLevel(t);
				break;
			case "o3":
			case "o3_8h":
				n = getO3Level(t);
				break;
			case "pm2_5":
				n = getPM25Level(t);
				break;
			case "pm10":
				n = getPM10Level(t);
				break;
			case "aqi":
				n = getAQIlevel(t);
				break;
			case "complexindex":
				n = d(t);
				break;
			case "humi":
				n = getHUMILevel(t);
				break;
			case "temp":
				n = getTEMPLevel(t);
				break;
			default:
				n = 0
		}
		return n
	}

	function returnColorByPollName(t, e) {		//调用 获取返回颜色	returnColorByPollName			x
		return getColorByLevel(getIndexByPollName(t, e))	
	}

	
	
	function getColor(value, type) {
	    var color;
	    if(type.toLowerCase() == "aqi"){
	    	value <= 0? color = '#999':value <= 50?color='#43ce17':value<=100?color = '#efdc31':value <= 150?color = '#fa0':value <= 200? color = '#ff401a':value <= 300?color = '#d20040':color = '#9c0a4e';
	       
	        return color;
	    }else if(type.toLowerCase() == "so2"){
	    	value<=0?color = '#999':value <= 50?color = '#43ce17':value <= 150?color = '#efdc31':value <= 475?color = '#fa0':value <= 800?color = '#ff401a':value <= 1600?color = '#d20040':color = '#9c0a4e';
	      
	        return color;
	    }else if(type.toLowerCase() == "no2"){
	    	value <= 0?color = '#999':value <= 40?color = '#43ce17':value <= 80?color = '#efdc31':value <= 180?color = '#fa0':value <= 280?color = '#ff401a':value <= 565?color = '#d20040':color = '#9c0a4e';
	        
	        return color;
	    }else if(type.toLowerCase() == "co"){
	    	value <= 0?color = '#999':value <= 2?color = '#43ce17':value <= 4?color = '#efdc31':value <= 14?color = '#fa0':value <= 24?color = '#ff401a':value <= 36?color = '#d20040':color = '#9c0a4e';
	       
	        return color;
	    }else if(type.toLowerCase() == "o3"){
	    	value <= 0?color = '#999':value <= 100?color = '#43ce17':value <= 160?color = '#efdc31':value <= 215?color = '#fa0':value <= 265?color = '#ff401a':value <= 800?color = '#d20040':color = '#9c0a4e';
	       
	        return color;
	    }else if(type.toLowerCase() == "pm10"){
	    	value <= 0?color = '#999':value <= 50?color = '#43ce17':value <= 150?color = '#efdc31':value <= 250?color = '#fa0':value <= 350?color = '#ff401a':value <= 420?color = '#d20040':color = '#9c0a4e';
	       
	        return color;
	    }else {
	    	value <= 0?color = '#999':value <= 35?color = '#43ce17':value <= 75?color = '#efdc31':value <= 115?color = '#fa0':value <= 150?color = '#ff401a':value <= 250?color = '#d20040':color = '#9c0a4e';
	       
	        return color;
	    }

	}
	
	