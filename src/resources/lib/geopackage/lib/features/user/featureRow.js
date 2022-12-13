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
exports.FeatureRow = void 0;
var userRow_1 = require("../../user/userRow");
var featureColumn_1 = require("./featureColumn");
var geometryData_1 = require("../../geom/geometryData");
/**
 * featureRow module.
 * @module features/user/featureRow
 */
/**
 * Feature Row containing the values from a single result set row
 * @param  {FeatureTable} featureTable feature table
 * @param  {Array} columnTypes  column types
 * @param  {Array} values       values
 */
var FeatureRow = /** @class */ (function (_super) {
    __extends(FeatureRow, _super);
    function FeatureRow(featureTable, columnTypes, values) {
        var _this = _super.call(this, featureTable, columnTypes, values) || this;
        _this.featureTable = featureTable;
        return _this;
    }
    Object.defineProperty(FeatureRow.prototype, "geometryColumnIndex", {
        /**
         * Get the geometry column index
         * @return {Number} geometry column index
         */
        get: function () {
            return this.featureTable.getGeometryColumnIndex();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FeatureRow.prototype, "geometryColumn", {
        /**
         * Get the geometry column
         * @return {FeatureColumn} geometry column
         */
        get: function () {
            return this.featureTable.getGeometryColumn();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FeatureRow.prototype, "geometry", {
        /**
         * Get the geometry
         * @return {Buffer} geometry data
         */
        get: function () {
            return this.getValueWithIndex(this.featureTable.getGeometryColumnIndex());
        },
        /**
         * set the geometry
         * @param {Buffer} geometryData geometry data
         */
        set: function (geometryData) {
            this.setValueWithIndex(this.featureTable.getGeometryColumnIndex(), geometryData);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FeatureRow.prototype, "geometryType", {
        /**
         * Get the geometry's type
         * @return {String} geometry data
         */
        get: function () {
            var geometryType = null;
            var geometry = this.getValueWithIndex(this.featureTable.getGeometryColumnIndex());
            if (geometry !== null) {
                geometryType = geometry.toGeoJSON().type;
            }
            return geometryType;
        },
        enumerable: false,
        configurable: true
    });
    FeatureRow.prototype.toObjectValue = function (index, value) {
        var column = this.getColumnWithIndex(index);
        if ((column instanceof featureColumn_1.FeatureColumn && column.isGeometry() && value && value instanceof Buffer) ||
            value instanceof Uint8Array) {
            return new geometryData_1.GeometryData(value);
        }
        return _super.prototype.toObjectValue.call(this, index, value);
    };
    FeatureRow.prototype.getValueWithColumnName = function (columnName) {
        var value = this.values[columnName];
        var column = this.getColumnWithColumnName(columnName);
        if (value !== undefined && value !== null && column instanceof featureColumn_1.FeatureColumn && column.isGeometry() && value.toData) {
            return value.toData();
        }
        return _super.prototype.getValueWithColumnName.call(this, columnName);
    };
    return FeatureRow;
}(userRow_1.UserRow));
exports.FeatureRow = FeatureRow;
//# sourceMappingURL=featureRow.js.map