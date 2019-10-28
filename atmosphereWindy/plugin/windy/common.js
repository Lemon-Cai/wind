/**
 * 仅限于风场的通用配置
 *  @author cp
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
            typeof define === 'function' && define.amd ? define(factory) :
                    (global.common = factory());
}(this, (function () {
    'use strict';

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
    var getDirection = function getDirection(uMs, vMs, angleConvention) {
        if (angleConvention.endsWith('CCW')) {
            vMs = vMs > 0 ? vMs = -vMs : Math.abs(vMs);
        }

        var velocityAbs = Math.sqrt(Math.pow(uMs, 2) + Math.pow(vMs, 2));
        var velocityDir = Math.atan2(uMs / velocityAbs, vMs / velocityAbs);
        var velocityDirToDegrees = velocityDir * 180 / Math.PI + 180;

        if (angleConvention === 'bearingCW' || angleConvention === 'meteoCCW') {
            velocityDirToDegrees += 180;
            if (velocityDirToDegrees >= 360) velocityDirToDegrees -= 360;
        }

        return velocityDirToDegrees;
    };
    /**
     * cp
     * @param {Object} grid
     */
    var getWindDegrees = function getWindDegrees(grid){
        var degree = void 0;
        grid && (
                degree = 5 * Math.round(((Math.atan2(-grid[0], -grid[1])/(2 * Math.PI) * 360) + 360) % 360 /5 )
        )
        return degree;
    }

    var getSpeed = function getSpeed(uMs, vMs, unit) {
        var velocityAbs = Math.sqrt(Math.pow(uMs, 2) + Math.pow(vMs, 2));

        if (unit === 'k/h') {
            return meterSec2kilometerHour(velocityAbs);
        } else if (unit === 'kt') {
            return meterSec2Knots(velocityAbs);
        } else {
            return velocityAbs;
        }
    };

    var meterSec2Knots = function meterSec2Knots(meters) {
        return meters / 0.514;
    };

    var meterSec2kilometerHour = function meterSec2kilometerHour(meters) {
        return meters * 3.6;
    };

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
        return keyArray[index];
    }

    //经纬度转墨卡托
    var lonlat2mercator = function (lonlat) {
        var mercator = {
            x: 0,
            y: 0
        };
        var x = lonlat.x * 20037508.34 / 180;
        var y = Math.log(Math.tan((90 + lonlat.y) * Math.PI / 360)) / (Math.PI / 180);
        y = y * 20037508.34 / 180;
        mercator.x = x;
        mercator.y = y;
        return mercator;
    }
    return  {
        lonlat2mercator: lonlat2mercator,
        getWindDegrees: getWindDegrees,
        getDirection: getDirection,
        getSpeed: getSpeed,
        createDOM: createDOM,
        TiandituKey: TiandituKey,
        clearCanvas: clearCanvas,
        createCanvas: createCanvas
    }


})));

