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
exports.MediaTable = void 0;
/**
 * mediaTable module.
 * @module extension/relatedTables
 */
var userRelatedTable_1 = require("./userRelatedTable");
var relationType_1 = require("./relationType");
var userColumn_1 = require("../../user/userColumn");
var geoPackageDataType_1 = require("../../db/geoPackageDataType");
/**
 * Media Requirements Class User-Defined Related Data Table
 * @class
 * @extends UserRelatedTable
 * @param  {string} tableName table name
 * @param  {module:user/userColumn~UserColumn[]} columns   media columns
 * @param {string[]} requiredColumns required column names
 */
var MediaTable = /** @class */ (function (_super) {
    __extends(MediaTable, _super);
    function MediaTable(tableName, columns, requiredColumns) {
        var _this = _super.call(this, tableName, MediaTable.RELATION_TYPE.name, MediaTable.RELATION_TYPE.dataType, columns, requiredColumns) || this;
        _this.TABLE_TYPE = 'media';
        return _this;
    }
    Object.defineProperty(MediaTable.prototype, "tableType", {
        get: function () {
            return this.TABLE_TYPE;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MediaTable.prototype, "dataColumn", {
        /**
         * Get the data column
         * @return {module:user/userColumn~UserColumn}
         */
        get: function () {
            return this.getColumnWithColumnName(MediaTable.COLUMN_DATA);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MediaTable.prototype, "contentTypeColumn", {
        /**
         * Get the content type column
         * @return {module:user/userColumn~UserColumn}
         */
        get: function () {
            return this.getColumnWithColumnName(MediaTable.COLUMN_CONTENT_TYPE);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Create a media table with a minimum required columns followed by the additional columns
     * @param  {string} tableName         name of the table
     * @param  {module:user/userColumn~UserColumn[]} [additionalColumns] additional columns
     * @return {module:extension/relatedTables~MediaTable}
     */
    MediaTable.create = function (tableName, additionalColumns) {
        var columns = MediaTable.createRequiredColumns();
        if (additionalColumns) {
            columns = columns.concat(additionalColumns);
        }
        return new MediaTable(tableName, columns, MediaTable.requiredColumns());
    };
    /**
     * Get the required columns
     * @param  {string} [idColumnName=id] id column name
     * @return {string[]}
     */
    MediaTable.requiredColumns = function (idColumnName) {
        if (idColumnName === void 0) { idColumnName = MediaTable.COLUMN_ID; }
        var requiredColumns = [];
        requiredColumns.push(idColumnName);
        requiredColumns.push(MediaTable.COLUMN_DATA);
        requiredColumns.push(MediaTable.COLUMN_CONTENT_TYPE);
        return requiredColumns;
    };
    /**
     * Get the number of required columns
     * @return {Number}
     */
    MediaTable.numRequiredColumns = function () {
        return MediaTable.requiredColumns().length;
    };
    /**
     * Create the required columns
     * @param  {Number} [startingIndex=0] starting index of the required columns
     * @param  {string} [idColumnName=id]  id column name
     * @return {module:user/userColumn~UserColumn[]}
     */
    MediaTable.createRequiredColumns = function (startingIndex, idColumnName) {
        if (startingIndex === void 0) { startingIndex = 0; }
        if (idColumnName === void 0) { idColumnName = MediaTable.COLUMN_ID; }
        return [
            MediaTable.createIdColumn(startingIndex++, idColumnName),
            MediaTable.createDataColumn(startingIndex++),
            MediaTable.createContentTypeColumn(startingIndex++),
        ];
    };
    /**
     * Create the primary key id column
     * @param  {Number} index        index of the column
     * @param  {string} idColumnName name of the id column
     * @return {module:user/userColumn~UserColumn}
     */
    MediaTable.createIdColumn = function (index, idColumnName) {
        return userColumn_1.UserColumn.createPrimaryKeyColumn(index, idColumnName);
    };
    /**
     * Create the data column
     * @param  {Number} index        index of the column
     * @return {module:user/userColumn~UserColumn}
     */
    MediaTable.createDataColumn = function (index) {
        return userColumn_1.UserColumn.createColumn(index, MediaTable.COLUMN_DATA, geoPackageDataType_1.GeoPackageDataType.BLOB, true);
    };
    /**
     * Create the content type column
     * @param  {Number} index        index of the column
     * @return {module:user/userColumn~UserColumn}
     */
    MediaTable.createContentTypeColumn = function (index) {
        return userColumn_1.UserColumn.createColumn(index, MediaTable.COLUMN_CONTENT_TYPE, geoPackageDataType_1.GeoPackageDataType.TEXT, true);
    };
    MediaTable.RELATION_TYPE = relationType_1.RelationType.MEDIA;
    MediaTable.COLUMN_ID = 'id';
    MediaTable.COLUMN_DATA = 'data';
    MediaTable.COLUMN_CONTENT_TYPE = 'content_type';
    return MediaTable;
}(userRelatedTable_1.UserRelatedTable));
exports.MediaTable = MediaTable;
//# sourceMappingURL=mediaTable.js.map