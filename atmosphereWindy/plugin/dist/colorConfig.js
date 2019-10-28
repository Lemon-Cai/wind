var colorConfig = function () {
	"use strict";
	
	/**
	 * Constructs a toggler for the specified product's units, storing the toggle state on the element having
	 * the specified id. For example, given a product having units ["m/s", "mph"], the object returned by this
	 * method sets the element's "data-index" attribute to 0 for m/s and 1 for mph. Calling value() returns the
	 * currently active units object. Calling next() increments the index.
	 */
	var createUnitToggle = function createUnitToggle(id, product) {
		var units = product.units, size = units.length;
		var index = +(d3.select(id).node() && d3.select(id).attr("data-index") || 0) % size;
		return {
			value: function() {
				return units[index];
			},
			next: function() {
				d3.select(id).node() && d3.select(id).attr("data-index", index = ((index + 1) % size));
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
	
	var l = function l(t) {
		return d[t.toLowerCase()]
	}
	
	var BOUNDARY = 0.45,
		fadeToWhite = colorInterpolator(sinebowColor(1.0, 0), [255, 255, 255]),
		d = {
			aqi: {
			
			},
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
					gradient: /*function (t, e) {
						return extendedSinebowColor(Math.min(t, 50) / 50, e)
					},*/
					segmentedColorScale([
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
					]),/*segmentedColorScale([
						
						[-40, [238, 238, 238, 234]],
						[-30, [255, 170, 255, 234]],
						[-20, [145, 9, 145, 234]],
						[-15, [36, 24, 106, 234]],
						[-10, [85, 78, 177, 234]],
						[-5,[62, 121, 198, 234]],
						[0, [75, 182, 152, 234]],
						[5, [89, 208, 73, 234]],
						[10, [190, 228, 61, 234]],
						[15, [235, 215, 53, 234]],
						[20, [234, 164, 62, 234]],
						[25, [229, 109, 83, 234]],
						[30, [190, 48, 102, 234]],
						[40, [107, 21, 39, 254]],
						[50, [43, 0, 1, 254]]
					]),*/
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
						"textColor":["#FFF", "#FFF","#FFF","#FFF","#FFF","#FFF","#FFF","#FFF","#FFF","#FFF","#FFF"]
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
						/*[99500,[40,9,119,0.6]],
						[99900,[61,25,83,0.6]],
						[100300,[110,39,69,0.6]],
						[100700,[151,96,171,0.6]],
						[101000,[63,197,211,0.6]],
						[101400,[21,88,169,0.6]],
						[101900,[22,114,77,0.6]],
						[102300,[79,161,25,0.6]],
						[102700,[213,233,52,0.6]],
						[103100,[236,178,26,0.6]],
						[103500,[230,77,37,0.6]],
						[104000,[144,44,55,0.6]]*/
					
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
					precision: 0
				}],
				scale: {
					bounds: [0, 50],
					gradient: segmentedColorScale([
						[0, [82, 71, 141, 0.00]],
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
							[0, [82, 71, 141, 0.00]],
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
						"textColor":["#FFF","#FFF","#FFF","#FFF","#FFF","#000","#000","#000","#000","#000","#000","#FFF","#FFF","#FFF","#FFF"]
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
	//e.default = l
	
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
		
		execute: l
	}
	return colorConfig;
}();


/*
var colorConfig = function () {
  //"use strict";
  
  /!*Object.defineProperty(e, "__esModule", {
    value: !0
  }),
    e.Product = this.l;*!/
  var colorconfiguration = this;
  
  var BOUNDARY = 0.45;
  var fadeToWhite = colorInterpolator(sinebowColor(1.0, 0), [255, 255, 255]);
  
  colorconfiguration.u = .45,
  colorconfiguration.c = colorconfiguration.n(colorconfiguration.i(1, 0), [255, 255, 255]),
  colorconfiguration.d = {
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
          bounds: [0, 50],
          gradient: function (t, e) {
            return colorconfiguration.r(Math.min(t, 50) / 50, e)
          }
        }
      },
      temp: {
        filed: "scalar",
        type: "temp",
        name: "温度",
        units: [{
          label: "°C",
          conversion: function (t) {
            return t - 273.15
          },
          precision: 1
        }],
        scale: {
          bounds: [193, 328],
          gradient: colorconfiguration.s([
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
          ])
        }
      },
      humi: {
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
          gradient: colorconfiguration.s([
            [0, [230, 165, 30]],
            [25, [120, 100, 95]],
            [60, [40, 44, 92]],
            [75, [21, 13, 193]],
            [90, [75, 63, 235]],
            [100, [25, 255, 255]]
          ])
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
          gradient: colorconfiguration.s([
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
          ])
        }
      },
      pres: {
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
          bounds: [8e4, 103e3],
          gradient: colorconfiguration.s([
            [8e4, [156, 197, 203]],
            [99e3, [138, 197, 200]],
            [1e5, [74, 178, 180]],
            [101e3, [62, 105, 142]],
            [102e3, [180, 168, 68]],
            [103e3, [104, 66, 89]]
          ])
        }
      },
      apcp: {
        filed: "scalar",
        type: "apcp",
        name: "降雨",
        units: [{
          label: "mm",
          conversion: function (t) {
            return t
          },
          precision: 0
        }],
        scale: {
          bounds: [0, 50],
          gradient: colorconfiguration.s([
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
          ])
        }
      }
    };
  // e.default = this.l
  /!*return {
    ld: l
  }*!/
}
colorConfig.prototype.n = function (t, e) {     //colorInterpolator(start, end)
  var n = t[0],
    i = t[1],
    r = t[2],
    o = e[0] - n,
    a = e[1] - i,
    s = e[2] - r;
  return function (t, e) {
    return [Math.floor(n + t * o), Math.floor(i + t * a), Math.floor(r + t * s), e]
  }
}

colorConfig.prototype.i = function (t, e) {     //sinebowColor(hue, a)
  var colorconfiguration = this;
  var n = 2 * Math.PI,
    i = t * n * 5 / 6;
  i *= .75;
  var r = Math.sin(i),
    o = Math.cos(i);
  return [Math.floor(255 * Math.max(0, -o)), Math.floor(255 * Math.max(r, 0)), Math.floor(255 * Math.max(o, 0, -r)),
    e
  ]
}

colorConfig.prototype.r = function (t, e) {   //extendedSinebowColor(i, a)
  var colorconfiguration = this;
  return t <= u ? colorconfiguration.i(t / u, e) : colorconfiguration.c((t - u) / (1 - u), e)
}

colorConfig.prototype.o = function (t, e, n) {      //clamp(x, low, high)
  var colorconfiguration = this;
  return Math.max(e, Math.min(t, n))
}

colorConfig.prototype.a = function (t, e, n) {      //proportion(x, low, high)
  var colorconfiguration = this;
  return (colorconfiguration.o(t, e, n) - e) / (n - e)
}

colorConfig.prototype.s = function (t) {      //segmentedColorScale(segments)
  var colorconfiguration = this;
  for (var e = [], i = [], r = [], o = 0; o < t.length - 1; o++)
    e.push(t[o + 1][0]),
      i.push(colorconfiguration.n(t[o][1], t[o + 1][1])),
      r.push([t[o][0], t[o + 1][0]]);
  return function (t, n) {
    var o = void 0;
    for (o = 0; o < e.length - 1 && !(t <= e[o]); o++)
      ;
    var s = r[o];
    return i[o](colorconfiguration.a(t, s[0], s[1]), n)
  }
}

colorConfig.prototype.l = function (t) {
  var colorconfiguration = this;
  return colorconfiguration.d[t.toLowerCase()]
}
*/
