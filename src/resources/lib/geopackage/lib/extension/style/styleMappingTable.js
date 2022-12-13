"use strict";
/**
 * @memberOf module:extension/style
 * @class StyleMappingTable
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
exports.StyleMappingTable = void 0;
var userMappingTable_1 = require("../relatedTables/userMappingTable");
var geoPackageDataType_1 = require("../../db/geoPackageDataType");
var userColumn_1 = require("../../user/userColumn");
/**
 * Contains style mapping table factory and utility methods
 * @extends UserMappingTable
 * @param  {string} tableName table name
 * @param  {module:user/userColumn~UserColumn[]} columns   style mapping columns
 * @constructor
 */
var StyleMappingTable = /** @class */ (function (_super) {
    __extends(StyleMappingTable, _super);
    function StyleMappingTable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Get the geometry type name column index
     * @return int
     */
    StyleMappingTable.prototype.getGeometryTypeNameColumnIndex = function () {
        return this.getColumnIndex(StyleMappingTable.COLUMN_GEOMETRY_TYPE_NAME);
    };
    /**
     * Get the geometry type name column
     * @return {module:user/userColumn~UserColumn}
     */
    StyleMappingTable.prototype.getGeometryTypeNameColumn = function () {
        return this.getColumnWithColumnName(StyleMappingTable.COLUMN_GEOMETRY_TYPE_NAME);
    };
    /**
     * Creates a user mapping table with the minimum required columns followed by the additional columns
     * @param  {string} tableName name of the table
     * @return {module:extension/relatedTables~UserMappingTable}
     */
    StyleMappingTable.create = function (tableName) {
        return new StyleMappingTable(tableName, StyleMappingTable.createColumns(), null);
    };
    /**
     * Create the columns
     * @return {module:user/userColumn~UserColumn[]}
     */
    StyleMappingTable.createColumns = function () {
        var columns = userMappingTable_1.UserMappingTable.createRequiredColumns();
        var index = columns.length;
        columns.push(userColumn_1.UserColumn.createColumn(index, StyleMappingTable.COLUMN_GEOMETRY_TYPE_NAME, geoPackageDataType_1.GeoPackageDataType.TEXT, false));
        return columns;
    };
    StyleMappingTable.COLUMN_GEOMETRY_TYPE_NAME = 'geometry_type_name';
    return StyleMappingTable;
}(userMappingTable_1.UserMappingTable));
exports.StyleMappingTable = StyleMappingTable;
//# sourceMappingURL=styleMappingTable.js.map