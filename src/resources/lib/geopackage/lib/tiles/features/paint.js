"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paint = void 0;
/**
 * Paint module.
 * @module tiles/features
 */
var Paint = /** @class */ (function () {
    function Paint() {
        this._color = '#000000FF';
        this._strokeWidth = 1.0;
    }
    Object.defineProperty(Paint.prototype, "color", {
        /**
         * Get the color
         * @returns {String} color String color in the format #RRGGBB or #RRGGBBAA
         */
        get: function () {
            return this._color;
        },
        /**
         * Set the color
         * @param {String} color String color in the format #RRGGBB or #RRGGBBAA
         */
        set: function (color) {
            this._color = color;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Paint.prototype, "colorRGBA", {
        /**
         * Get the color
         * @returns {String} color
         */
        get: function () {
            // assumes color is in the format #RRGGBB or #RRGGBBAA
            var red = parseInt(this.color.substr(1, 2), 16);
            var green = parseInt(this.color.substr(3, 2), 16);
            var blue = parseInt(this.color.substr(5, 2), 16);
            var alpha = 1.0;
            if (this.color.length > 7) {
                alpha = parseInt(this.color.substr(7, 2), 16) / 255;
            }
            return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Paint.prototype, "strokeWidth", {
        /**
         * Get the stroke width
         * @returns {Number} strokeWidth width in pixels
         */
        get: function () {
            return this._strokeWidth;
        },
        /**
         * Set the stroke width
         * @param {Number} strokeWidth width in pixels
         */
        set: function (strokeWidth) {
            this._strokeWidth = strokeWidth;
        },
        enumerable: false,
        configurable: true
    });
    return Paint;
}());
exports.Paint = Paint;
//# sourceMappingURL=paint.js.map