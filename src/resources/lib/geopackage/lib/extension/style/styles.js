"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Styles = void 0;
/**
 * Styles constructor
 * @constructor
 */
var Styles = /** @class */ (function () {
    function Styles(tableStyles) {
        if (tableStyles === void 0) { tableStyles = false; }
        this.defaultStyle = null;
        this.styles = new Map();
        this.tableStyles = tableStyles;
    }
    Styles.prototype.setDefault = function (styleRow) {
        if (styleRow !== null && styleRow !== undefined) {
            styleRow.setTableStyle(this.tableStyles);
        }
        this.defaultStyle = styleRow;
    };
    Styles.prototype.getDefault = function () {
        return this.defaultStyle;
    };
    Styles.prototype.setStyle = function (styleRow, geometryType) {
        if (geometryType === void 0) { geometryType = null; }
        if (geometryType !== null) {
            if (styleRow !== null && styleRow !== undefined) {
                styleRow.setTableStyle(this.tableStyles);
                this.styles.set(geometryType, styleRow);
            }
            else {
                this.styles.delete(geometryType);
            }
        }
        else {
            this.setDefault(styleRow);
        }
    };
    Styles.prototype.getStyle = function (geometryType) {
        if (geometryType === void 0) { geometryType = null; }
        var styleRow = null;
        if (geometryType !== null) {
            styleRow = this.styles.get(geometryType);
        }
        if (styleRow === null || styleRow === undefined || geometryType === null) {
            styleRow = this.getDefault();
        }
        return styleRow;
    };
    Styles.prototype.isEmpty = function () {
        return this.styles.size === 0 && this.defaultStyle === null;
    };
    Styles.prototype.getGeometryTypes = function () {
        return Array.from(this.styles.keys());
    };
    return Styles;
}());
exports.Styles = Styles;
//# sourceMappingURL=styles.js.map