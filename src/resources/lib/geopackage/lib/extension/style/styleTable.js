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
exports.StyleTable = void 0;
/**
 * @memberOf module:extension/style
 * @class StyleTable
 */
var attributesTable_1 = require("../../attributes/attributesTable");
var relationType_1 = require("../relatedTables/relationType");
var userColumn_1 = require("../../user/userColumn");
var geoPackageDataType_1 = require("../../db/geoPackageDataType");
/**
 * Icon Requirements Class Media Table
 * @param  {string} tableName table name
 * @param  {module:user/userColumn~UserColumn[]} columns   media columns
 * @constructor
 */
var StyleTable = /** @class */ (function (_super) {
    __extends(StyleTable, _super);
    function StyleTable() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.TABLE_TYPE = 'media';
        _this.data_type = relationType_1.RelationType.ATTRIBUTES.dataType;
        _this.relation_name = relationType_1.RelationType.ATTRIBUTES.name;
        return _this;
    }
    /**
     * Get the name column index
     * @return int
     */
    StyleTable.prototype.getNameColumnIndex = function () {
        return this.getColumnIndex(StyleTable.COLUMN_NAME);
    };
    /**
     * Get the name column
     * @return {module:user/userColumn~UserColumn}
     */
    StyleTable.prototype.getNameColumn = function () {
        return this.getColumnWithColumnName(StyleTable.COLUMN_NAME);
    };
    /**
     * Get the description column index
     * @return int
     */
    StyleTable.prototype.getDescriptionColumnIndex = function () {
        return this.getColumnIndex(StyleTable.COLUMN_DESCRIPTION);
    };
    /**
     * Get the description column
     * @return {module:user/userColumn~UserColumn}
     */
    StyleTable.prototype.getDescriptionColumn = function () {
        return this.getColumnWithColumnName(StyleTable.COLUMN_DESCRIPTION);
    };
    /**
     * Get the color column index
     * @return int
     */
    StyleTable.prototype.getColorColumnIndex = function () {
        return this.getColumnIndex(StyleTable.COLUMN_COLOR);
    };
    /**
     * Get the color column
     * @return {module:user/userColumn~UserColumn}
     */
    StyleTable.prototype.getColorColumn = function () {
        return this.getColumnWithColumnName(StyleTable.COLUMN_COLOR);
    };
    /**
     * Get the opacity column index
     * @return int
     */
    StyleTable.prototype.getOpacityColumnIndex = function () {
        return this.getColumnIndex(StyleTable.COLUMN_OPACITY);
    };
    /**
     * Get the opacity column
     * @return {module:user/userColumn~UserColumn}
     */
    StyleTable.prototype.getOpacityColumn = function () {
        return this.getColumnWithColumnName(StyleTable.COLUMN_OPACITY);
    };
    /**
     * Get the width column index
     * @return int
     */
    StyleTable.prototype.getWidthColumnIndex = function () {
        return this.getColumnIndex(StyleTable.COLUMN_WIDTH);
    };
    /**
     * Get the width column
     * @return {module:user/userColumn~UserColumn}
     */
    StyleTable.prototype.getWidthColumn = function () {
        return this.getColumnWithColumnName(StyleTable.COLUMN_WIDTH);
    };
    /**
     * Get the fill_color column index
     * @return int
     */
    StyleTable.prototype.getFillColorColumnIndex = function () {
        return this.getColumnIndex(StyleTable.COLUMN_FILL_COLOR);
    };
    /**
     * Get the fill_color column
     * @return {module:user/userColumn~UserColumn}
     */
    StyleTable.prototype.getFillColorColumn = function () {
        return this.getColumnWithColumnName(StyleTable.COLUMN_FILL_COLOR);
    };
    /**
     * Get the fill_opacity column index
     * @return int
     */
    StyleTable.prototype.getFillOpacityColumnIndex = function () {
        return this.getColumnIndex(StyleTable.COLUMN_FILL_OPACITY);
    };
    /**
     * Get the fill_opacity column
     * @return {module:user/userColumn~UserColumn}
     */
    StyleTable.prototype.getFillOpacityColumn = function () {
        return this.getColumnWithColumnName(StyleTable.COLUMN_FILL_OPACITY);
    };
    /**
     * Create a media table with a minimum required columns followed by the additional columns
     * @return {module:extension/style.StyleTable}
     */
    StyleTable.create = function () {
        return new StyleTable(StyleTable.TABLE_NAME, StyleTable.createColumns());
    };
    /**
     * Create the columns
     * @return {module:user/custom~UserCustomColumn[]}
     */
    StyleTable.createColumns = function () {
        var columns = [];
        var index = 0;
        columns.push(userColumn_1.UserColumn.createPrimaryKeyColumn(index++, StyleTable.COLUMN_ID));
        columns.push(userColumn_1.UserColumn.createColumn(index++, StyleTable.COLUMN_NAME, geoPackageDataType_1.GeoPackageDataType.TEXT, false));
        columns.push(userColumn_1.UserColumn.createColumn(index++, StyleTable.COLUMN_DESCRIPTION, geoPackageDataType_1.GeoPackageDataType.TEXT, false));
        columns.push(userColumn_1.UserColumn.createColumn(index++, StyleTable.COLUMN_COLOR, geoPackageDataType_1.GeoPackageDataType.TEXT, false));
        columns.push(userColumn_1.UserColumn.createColumn(index++, StyleTable.COLUMN_OPACITY, geoPackageDataType_1.GeoPackageDataType.REAL, false));
        columns.push(userColumn_1.UserColumn.createColumn(index++, StyleTable.COLUMN_WIDTH, geoPackageDataType_1.GeoPackageDataType.REAL, false));
        columns.push(userColumn_1.UserColumn.createColumn(index++, StyleTable.COLUMN_FILL_COLOR, geoPackageDataType_1.GeoPackageDataType.TEXT, false));
        columns.push(userColumn_1.UserColumn.createColumn(index, StyleTable.COLUMN_FILL_OPACITY, geoPackageDataType_1.GeoPackageDataType.REAL, false));
        return columns;
    };
    StyleTable.TABLE_NAME = 'nga_style';
    StyleTable.COLUMN_ID = 'id';
    StyleTable.COLUMN_NAME = 'name';
    StyleTable.COLUMN_DESCRIPTION = 'description';
    StyleTable.COLUMN_COLOR = 'color';
    StyleTable.COLUMN_OPACITY = 'opacity';
    StyleTable.COLUMN_WIDTH = 'width';
    StyleTable.COLUMN_FILL_COLOR = 'fill_color';
    StyleTable.COLUMN_FILL_OPACITY = 'fill_opacity';
    return StyleTable;
}(attributesTable_1.AttributesTable));
exports.StyleTable = StyleTable;
//# sourceMappingURL=styleTable.js.map