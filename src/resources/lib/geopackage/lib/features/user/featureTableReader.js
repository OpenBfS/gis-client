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
exports.FeatureTableReader = void 0;
/**
 * featureTableReader module.
 * @module features/user/featureTableReader
 */
var geometryColumnsDao_1 = require("../columns/geometryColumnsDao");
var featureTable_1 = require("./featureTable");
var userTableReader_1 = require("../../user/userTableReader");
var featureColumn_1 = require("./featureColumn");
var geometryColumns_1 = require("../columns/geometryColumns");
/**
 * Reads the metadata from an existing feature table
 * @class FeatureTableReader
 */
var FeatureTableReader = /** @class */ (function (_super) {
    __extends(FeatureTableReader, _super);
    function FeatureTableReader(tableNameOrGeometryColumns) {
        var _this = _super.call(this, tableNameOrGeometryColumns instanceof geometryColumns_1.GeometryColumns
            ? tableNameOrGeometryColumns.table_name
            : tableNameOrGeometryColumns) || this;
        tableNameOrGeometryColumns instanceof geometryColumns_1.GeometryColumns
            ? (_this.columnName = tableNameOrGeometryColumns.column_name)
            : undefined;
        return _this;
    }
    FeatureTableReader.prototype.readFeatureTable = function (geoPackage) {
        if (this.columnName === null || this.columnName === undefined) {
            var gcd = new geometryColumnsDao_1.GeometryColumnsDao(geoPackage);
            this.columnName = gcd.queryForTableName(this.table_name).column_name;
        }
        return this.readTable(geoPackage.database);
    };
    /**
     * @inheritDoc
     */
    FeatureTableReader.prototype.createTable = function (tableName, columns) {
        return new featureTable_1.FeatureTable(tableName, this.columnName, columns);
    };
    /**
     * @inheritDoc
     */
    FeatureTableReader.prototype.createColumn = function (tableColumn) {
        return new featureColumn_1.FeatureColumn(tableColumn.index, tableColumn.name, tableColumn.dataType, tableColumn.max, tableColumn.notNull, tableColumn.defaultValue, tableColumn.primaryKey, featureColumn_1.FeatureColumn.getGeometryTypeFromTableColumn(tableColumn), tableColumn.autoincrement);
    };
    return FeatureTableReader;
}(userTableReader_1.UserTableReader));
exports.FeatureTableReader = FeatureTableReader;
//# sourceMappingURL=featureTableReader.js.map