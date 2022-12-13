"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureStyle = void 0;
/**
 * FeatureStyle constructor
 * @param {module:extension/style.StyleRow} styleRow
 * @param {module:extension/style.IconRow} iconRow
 * @constructor
 */
var FeatureStyle = /** @class */ (function () {
    function FeatureStyle(styleRow, iconRow) {
        this.styleRow = styleRow;
        this.iconRow = iconRow;
    }
    Object.defineProperty(FeatureStyle.prototype, "style", {
        /**
         * Get style
         * @returns {module:extension/style.StyleRow}
         */
        get: function () {
            return this.styleRow;
        },
        /**
         * Set style
         * @param {module:extension/style.StyleRow} styleRow
         */
        set: function (styleRow) {
            this.styleRow = styleRow;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns true if has style
     * @returns {Boolean}
     */
    FeatureStyle.prototype.hasStyle = function () {
        return !!this.styleRow;
    };
    Object.defineProperty(FeatureStyle.prototype, "icon", {
        /**
         * Get icon
         * @returns {module:extension/style.IconRow}
         */
        get: function () {
            return this.iconRow;
        },
        /**
         * Set icon
         * @param {module:extension/style.IconRow} iconRow
         */
        set: function (iconRow) {
            this.iconRow = iconRow;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns true if has icon
     * @returns {Boolean}
     */
    FeatureStyle.prototype.hasIcon = function () {
        return !!this.iconRow;
    };
    /**
     * Determine if an icon exists and should be used. Returns false when an
     * icon does not exist or when both a table level icon and row level style
     * exist.
     * @return true if the icon exists and should be used over a style
     */
    FeatureStyle.prototype.useIcon = function () {
        return this.hasIcon() && (!this.iconRow.isTableIcon() || !this.hasStyle() || this.styleRow.isTableStyle());
    };
    return FeatureStyle;
}());
exports.FeatureStyle = FeatureStyle;
//# sourceMappingURL=featureStyle.js.map