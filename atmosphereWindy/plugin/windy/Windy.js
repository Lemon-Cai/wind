(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
            typeof define === 'function' && define.amd ? define(factory) :
                    (global.Windy = factory());
}(this, (function () {
    'use strict';

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
        MIN_VELOCITY_INTENSITY = 0, //velocity at which particle intensity is minimum (m/s)
        MAX_VELOCITY_INTENSITY = 15,
        FRAME_RATE = 15,
        FRAME_TIME = 1000 / FRAME_RATE,
        MAX_PARTICLE_AGE = 90,
        PARTICLE_MULTIPLIER = 0.002, //粒子放大系数
        PARTICLE_LINE_WIDTH = 1, //默认的粒子线宽
        NULL_WIND_VECTOR = [NaN, NaN, null], //风场矢量为空时的值
        VELOCITY_SCALE = 0.000016666666666666667, //粒子速率放大系数
        OVERLAY_ALPHA = Math.floor(0.4 * 255),  								// overlay transparency (on scale [0, 255])
        TRANSPARENT_BLACK = [0, 0, 0, 0],
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
                    this.angleConvention = options.angleConvention || 'bearingCCW',
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
                    //cancelAnimationFrame(animationLoop);
                    //clearTimeout(animationLoop);
                    columns = [],
                            //grid = void 0;
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

                function percent(t, e, n) {
                    return t * (n - e) + e
                }

                function isNotNull(t) {
                    return null !== t && void 0 !== t
                }

                function isValue(x) {
                    return x !== null && x !== undefined;
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
                                    var color = scale.scale.gradient(scalar, OVERLAY_ALPHA)
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

               /* function windIntensityColorScaleZq(t, e) {
                    a._opacity && (l = a._opacity);
                    var n = a._startcolor,
                            i = a._endcolor,
                            r = new p.gradientColor(n, i, t, l);
                    return r.indexFor = function(t) {
                        return Math.floor(Math.min(t, e) / e * (r.length - 1))
                    },
                            r
                }*/

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
                    "wind" === this._type && !0 === this._overlayflag && (config = colorConfig.execute(this._type)),
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
                            $self.interpolateGrid(e, $self.buildBounds(bounds, width, height),mapBounds, $self._overlayProduct, function(bounds, field) {
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
            getPointData: function(coordinates, item) {

                var gridValue = void 0;
                this._windy.vector && ("wind" === item ? (gridValue = this._windgrid.interpolate(coordinates[0], coordinates[1])) : (gridValue = this.overlayfield.interpolate(coordinates[0], coordinates[1])))

                if (gridValue && !isNaN(gridValue[0]) && !isNaN(gridValue[1]) && gridValue[2]) {
                    return {
                        direction: common.getDirection(gridValue[0], gridValue[1], this.angleConvention || 'bearingCCW'),
                        speed: common.getSpeed(gridValue[0], gridValue[1], 'k/h'),
                        level: getWindLevel(common.getSpeed(gridValue[0], gridValue[1], 'k/h')),
                        directionStr: getWindDirectionStr(common.getWindDegrees(gridValue))
                        //directionStr: getWindDirectionStr(Math.abs(getDirection(gridValue[0], gridValue[1], this.options.angleConvention || 'bearingCCW')))
                    };
                } /* else {
                    return {
                        name: that._windy._overlayProduct.name,
                        val: gridValue ? that._windy._overlayProduct.units[0].conversion(gridValue).toFixed(that._windy._overlayProduct.units[0].precision) : "-",
                        unit: that._windy._overlayProduct.units[0].label
                    }
                } */
            },
            getWindByLatlng: function(coordinates, item){
                var pi = 2 * Math.PI;
                if(void 0 !== this._windgrid){
                    var gridValue = this._windgrid.interpolate(coordinates[0], coordinates[1]);
                    if(null !== gridValue){
                        var degree = Math.atan2(-gridValue[0], -gridValue[1]) / pi * 360,
                              o = 5 * Math.round((degree + 360) % 360 / 5);
                        return {
                            angle: o,
                            direction: common.getDirection(gridValue[0], gridValue[1], this.angleConvention || 'bearingCCW'),
                            speed: 3.6 * gridValue[2],
                            level: getWindLevel(3.6 * gridValue[2]),
                            directionStr: getWindDirectionStr(o)
                        }
                    }
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

    return Windy;
})));
