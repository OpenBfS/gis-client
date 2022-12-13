"use strict";
/**
 * @module user/custom
 */
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
exports.UserCustomColumn = void 0;
var userColumn_1 = require("../userColumn");
var geoPackageDataType_1 = require("../../db/geoPackageDataType");
var userTableDefaults_1 = require("../userTableDefaults");
/**
 * Create a new user custom columnd
 *  @param {Number} index        column index
 *  @param {string} name         column name
 *  @param {module:db/geoPackageDataType~GPKGDataType} dataType  data type
 *  @param {Number} max max value
 *  @param {Boolean} notNull      not null
 *  @param {Object} defaultValue default value or nil
 *  @param {Boolean} primaryKey primary key
 *  @param {Boolean} autoincrement autoincrement
 */
var UserCustomColumn = /** @class */ (function (_super) {
    __extends(UserCustomColumn, _super);
    function UserCustomColumn(index, name, dataType, max, notNull, defaultValue, primaryKey, autoincrement) {
        var _this = _super.call(this, index, name, dataType, max, notNull, defaultValue, primaryKey, autoincrement) || this;
        // eslint-disable-next-line eqeqeq
        if (dataType == null) {
            throw new Error('Data type is required to create column: ' + name);
        }
        return _this;
    }
    /**
     *  Create a new column
     *
     *  @param {Number} index        column index
     *  @param {string} name         column name
     *  @param {GeoPackageDataType} type data type
     *  @param {Number} [max] max value
     *  @param {Boolean} [notNull]      not null
     *  @param {Object} [defaultValue] default value or nil
     *  @param {Object} [max] max value or nil
     *  @param {Boolean} [autoincrement] autoincrement or nil
     *
     *  @return {UserCustomColumn} created column
     */
    UserCustomColumn.createColumn = function (index, name, type, notNull, defaultValue, max, autoincrement) {
        if (notNull === void 0) { notNull = false; }
        return new UserCustomColumn(index, name, type, max, notNull, defaultValue, false, autoincrement);
    };
    /**
     * Create a new primary key column
     * @param index
     * @param name
     * @param autoincrement
     */
    UserCustomColumn.createPrimaryKeyColumn = function (index, name, autoincrement) {
        if (autoincrement === void 0) { autoincrement = userTableDefaults_1.UserTableDefaults.DEFAULT_AUTOINCREMENT; }
        return new UserCustomColumn(index, name, geoPackageDataType_1.GeoPackageDataType.INTEGER, undefined, undefined, undefined, true, autoincrement);
    };
    return UserCustomColumn;
}(userColumn_1.UserColumn));
exports.UserCustomColumn = UserCustomColumn;
//# sourceMappingURL=userCustomColumn.js.map