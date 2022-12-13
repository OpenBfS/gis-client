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
exports.FeatureTable = void 0;
/**
 * featureTable module.
 * @module features/user/featureTable
 */
var userTable_1 = require("../../user/userTable");
var featureColumns_1 = require("./featureColumns");
var contentsDataType_1 = require("../../core/contents/contentsDataType");
/**
 * Represents a user feature table
 * @param  {string} tableName table name
 * @param  {array} columns   feature columns
 */
var FeatureTable = /** @class */ (function (_super) {
    __extends(FeatureTable, _super);
    function FeatureTable(tableName, geometryColumn, columns) {
        return _super.call(this, new featureColumns_1.FeatureColumns(tableName, geometryColumn, columns, false)) || this;
    }
    FeatureTable.prototype.copy = function () {
        return new FeatureTable(this.getTableName(), this.getGeometryColumnName(), this.getUserColumns().getColumns());
    };
    /**
     * Get the geometry column index
     * @return geometry column index
     */
    FeatureTable.prototype.getGeometryColumnIndex = function () {
        return this.getUserColumns().getGeometryIndex();
    };
    /**
     * {@inheritDoc}
     */
    FeatureTable.prototype.getUserColumns = function () {
        return _super.prototype.getUserColumns.call(this);
    };
    /**
     * Get the geometry feature column
     * @return geometry feature column
     */
    FeatureTable.prototype.getGeometryColumn = function () {
        return this.getUserColumns().getGeometryColumn();
    };
    /**
     * Get the geometry column name
     * @return geometry column name
     */
    FeatureTable.prototype.getGeometryColumnName = function () {
        return this.getUserColumns().getGeometryColumnName();
    };
    /**
     * Get the Id and Geometry Column names
     * @return column names
     */
    FeatureTable.prototype.getIdAndGeometryColumnNames = function () {
        return [this.getPkColumnName(), this.getGeometryColumnName()];
    };
    /**
     * {@inheritDoc}
     */
    FeatureTable.prototype.validateContents = function (contents) {
        // Verify the Contents have a features data type
        var dataType = contents.data_type;
        if (dataType === null || dataType === undefined || dataType !== contentsDataType_1.ContentsDataType.FEATURES) {
            throw new Error('The Contents of a '
                + 'FeatureTable'
                + ' must have a data type of '
                + contentsDataType_1.ContentsDataType.FEATURES);
        }
    };
    return FeatureTable;
}(userTable_1.UserTable));
exports.FeatureTable = FeatureTable;
//# sourceMappingURL=featureTable.js.map