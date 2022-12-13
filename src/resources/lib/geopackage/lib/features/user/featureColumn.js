"use strict";
/**
 * @module features/user/featureColumn
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
exports.FeatureColumn = void 0;
var userColumn_1 = require("../../user/userColumn");
var geoPackageDataType_1 = require("../../db/geoPackageDataType");
var geometryType_1 = require("./geometryType");
var userTableDefaults_1 = require("../../user/userTableDefaults");
/**
 * Represents a user feature column
 * @class
 * @extends UserColumn
 */
var FeatureColumn = /** @class */ (function (_super) {
    __extends(FeatureColumn, _super);
    function FeatureColumn(index, name, dataType, max, notNull, defaultValue, primaryKey, geometryType, autoincrement) {
        var _this = _super.call(this, index, name, dataType, max, notNull, defaultValue, primaryKey, autoincrement) || this;
        _this.geometryType = geometryType;
        _this.type = _this.getTypeName(name, dataType, geometryType);
        return _this;
    }
    /**
     *  Create a new primary key column
     *
     *  @param {Number} index column index
     *  @param {string} name  column name
     *  @param {boolean} autoincrement  column name
     *
     *  @return feature column
     */
    FeatureColumn.createPrimaryKeyColumn = function (index, name, autoincrement) {
        if (autoincrement === void 0) { autoincrement = userTableDefaults_1.UserTableDefaults.DEFAULT_AUTOINCREMENT; }
        return new FeatureColumn(index, name, geoPackageDataType_1.GeoPackageDataType.INTEGER, undefined, true, undefined, true, undefined, autoincrement);
    };
    /**
     *  Create a new geometry column
     *
     *  @param {Number} index        column index
     *  @param {string} name         column name
     *  @param {GeometryType} type
     *  @param {Boolean} notNull      not null
     *  @param {Object} defaultValue default value or nil
     *
     *  @return feature column
     */
    FeatureColumn.createGeometryColumn = function (index, name, type, notNull, defaultValue) {
        if ((type === null || type === undefined)) {
            throw new Error('Geometry Type is required to create column: ' + name);
        }
        return new FeatureColumn(index, name, geoPackageDataType_1.GeoPackageDataType.BLOB, undefined, notNull, defaultValue, false, type, false);
    };
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
    FeatureColumn.createColumn = function (index, name, type, notNull, defaultValue, max, autoincrement) {
        if (notNull === void 0) { notNull = false; }
        return new FeatureColumn(index, name, type, max, notNull, defaultValue, false, undefined, autoincrement);
    };
    /**
     * Get the type name from the data and geometry type
     * @param name column name
     * @param dataType data type
     * @param geometryType  geometry type
     * @return type name
     */
    FeatureColumn.prototype.getTypeName = function (name, dataType, geometryType) {
        var type;
        if (geometryType !== null && geometryType !== undefined) {
            type = geometryType_1.GeometryType.nameFromType(geometryType);
        }
        else {
            type = _super.prototype.getTypeName.call(this, name, dataType);
        }
        return type;
    };
    /**
     * Attempt to get the geometry type of the table column
     * @param tableColumn table column
     * @return geometry type
     */
    FeatureColumn.getGeometryTypeFromTableColumn = function (tableColumn) {
        var geometryType = null;
        if (tableColumn.isDataType(geoPackageDataType_1.GeoPackageDataType.BLOB)) {
            geometryType = geometryType_1.GeometryType.fromName(tableColumn.type);
        }
        return geometryType;
    };
    /**
     * Copy the column
     * @return copied column
     */
    FeatureColumn.prototype.copy = function () {
        return new FeatureColumn(this.index, this.name, this.dataType, this.max, this.notNull, this.defaultValue, this.primaryKey, this.geometryType, this.autoincrement);
    };
    /**
     * Determine if this column is a geometry
     *
     * @return true if a geometry column
     */
    FeatureColumn.prototype.isGeometry = function () {
        return this.geometryType !== null;
    };
    /**
     * When a geometry column, gets the geometry type
     * @return geometry type
     */
    FeatureColumn.prototype.getGeometryType = function () {
        return this.geometryType;
    };
    return FeatureColumn;
}(userColumn_1.UserColumn));
exports.FeatureColumn = FeatureColumn;
//# sourceMappingURL=featureColumn.js.map