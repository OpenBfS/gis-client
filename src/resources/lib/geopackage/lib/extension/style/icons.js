"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Icons = void 0;
/**
 * @memberOf module:extension/style
 * @class Icons
 */
/**
 * Icons constructor
 * @constructor
 */
var Icons = /** @class */ (function () {
    function Icons(tableIcons) {
        if (tableIcons === void 0) { tableIcons = false; }
        this.defaultIcon = null;
        this.icons = new Map();
        this.tableIcons = tableIcons;
    }
    Icons.prototype.setDefault = function (iconRow) {
        if (iconRow !== null && iconRow !== undefined) {
            iconRow.setTableIcon(this.tableIcons);
        }
        this.defaultIcon = iconRow;
    };
    Icons.prototype.getDefault = function () {
        return this.defaultIcon;
    };
    Icons.prototype.setIcon = function (iconRow, geometryType) {
        if (geometryType === void 0) { geometryType = null; }
        if (geometryType !== null) {
            if (iconRow !== null && iconRow !== undefined) {
                iconRow.setTableIcon(this.tableIcons);
                this.icons.set(geometryType, iconRow);
            }
            else {
                this.icons.delete(geometryType);
            }
        }
        else {
            this.setDefault(iconRow);
        }
    };
    Icons.prototype.getIcon = function (geometryType) {
        if (geometryType === void 0) { geometryType = null; }
        var iconRow = null;
        if (geometryType !== null && this.icons.has(geometryType)) {
            iconRow = this.icons.get(geometryType);
        }
        if (iconRow === null || iconRow === undefined || geometryType === null) {
            iconRow = this.getDefault();
        }
        return iconRow;
    };
    Icons.prototype.isEmpty = function () {
        return this.icons.size === 0 && this.defaultIcon === null;
    };
    Icons.prototype.getGeometryTypes = function () {
        return Array.from(this.icons.keys());
    };
    return Icons;
}());
exports.Icons = Icons;
//# sourceMappingURL=icons.js.map