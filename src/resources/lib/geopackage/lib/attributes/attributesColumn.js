"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributesColumn = void 0;
/**
 * @module user/custom
 */
var userColumn_1 = require("../user/userColumn");
var geoPackageDataType_1 = require("../db/geoPackageDataType");
var userTableDefaults_1 = require("../user/userTableDefaults");
/**
 * Attribute Column
 */
var AttributesColumn = /** @class */ (function (_super) {
    __extends(AttributesColumn, _super);
    function AttributesColumn(index, name, dataType, max, notNull, defaultValue, primaryKey, autoincrement) {
        var _this = _super.call(this, index, name, dataType, max, notNull, defaultValue, primaryKey, autoincrement) || this;
        // eslint-disable-next-line eqeqeq
        if (dataType === null) {
            throw new Error('Data type is required to create column: ' + name);
        }
        return _this;
    }
    /**
     * Create a new column
     * @param index
     * @param name
     * @param type
     * @param notNull
     * @param defaultValue
     * @param max
     * @param autoincrement
     */
    AttributesColumn.createColumn = function (index, name, type, notNull, defaultValue, max, autoincrement) {
        if (notNull === void 0) { notNull = false; }
        return new AttributesColumn(index, name, type, max, notNull, defaultValue, false, autoincrement);
    };
    /**
     * Create a new primary key column
     * @param index
     * @param name
     * @param autoincrement
     */
    AttributesColumn.createPrimaryKeyColumn = function (index, name, autoincrement) {
        if (autoincrement === void 0) { autoincrement = userTableDefaults_1.UserTableDefaults.DEFAULT_AUTOINCREMENT; }
        return new AttributesColumn(index, name, geoPackageDataType_1.GeoPackageDataType.INTEGER, undefined, undefined, undefined, true, autoincrement);
    };
    AttributesColumn.prototype.copy = function () {
        return new AttributesColumn(this.index, this.name, this.dataType, this.max, this.notNull, this.defaultValue, this.primaryKey, this.autoincrement);
    };
    return AttributesColumn;
}(userColumn_1.UserColumn));
exports.AttributesColumn = AttributesColumn;
//# sourceMappingURL=attributesColumn.js.map