"use strict";
/**
 * @module tiles/user/tileColumn
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
exports.TileColumn = void 0;
var userColumn_1 = require("../../user/userColumn");
var geoPackageDataType_1 = require("../../db/geoPackageDataType");
var userTableDefaults_1 = require("../../user/userTableDefaults");
/**
 * `TileColumn` models columns in [user tile pyramid tables]{@link module:tiles/user/tileTable~TileTable}.
 *
 * @class
 * @extends UserColumn
 */
var TileColumn = /** @class */ (function (_super) {
    __extends(TileColumn, _super);
    function TileColumn(index, name, dataType, max, notNull, defaultValue, primaryKey, autoincrement) {
        return _super.call(this, index, name, dataType, max, notNull, defaultValue, primaryKey, autoincrement) || this;
    }
    /**
     * Create an id column
     * @param  {number} index Index
     * @param  {boolean} autoincrement Autoincrement
     */
    TileColumn.createIdColumn = function (index, autoincrement) {
        if (autoincrement === void 0) { autoincrement = userTableDefaults_1.UserTableDefaults.DEFAULT_AUTOINCREMENT; }
        return new TileColumn(index, TileColumn.COLUMN_ID, geoPackageDataType_1.GeoPackageDataType.INTEGER, null, false, null, true, autoincrement);
    };
    /**
     * Create a zoom level column
     * @param  {number} index Index
     */
    TileColumn.createZoomLevelColumn = function (index) {
        return new TileColumn(index, TileColumn.COLUMN_ZOOM_LEVEL, geoPackageDataType_1.GeoPackageDataType.INTEGER, null, true, null, false, false);
    };
    /**
     *  Create a tile column column
     *
     *  @param {number} index column index
     */
    TileColumn.createTileColumnColumn = function (index) {
        return new TileColumn(index, TileColumn.COLUMN_TILE_COLUMN, geoPackageDataType_1.GeoPackageDataType.INTEGER, null, true, null, false, false);
    };
    /**
     *  Create a tile row column
     *
     *  @param {number} index column index
     *
     */
    TileColumn.createTileRowColumn = function (index) {
        return new TileColumn(index, TileColumn.COLUMN_TILE_ROW, geoPackageDataType_1.GeoPackageDataType.INTEGER, null, true, null, false, false);
    };
    /**
     *  Create a tile data column
     *
     *  @param {number} index column index
     */
    TileColumn.createTileDataColumn = function (index) {
        return new TileColumn(index, TileColumn.COLUMN_TILE_DATA, geoPackageDataType_1.GeoPackageDataType.BLOB, null, true, null, false, false);
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
    TileColumn.createColumn = function (index, name, type, notNull, defaultValue, max, autoincrement) {
        if (notNull === void 0) { notNull = false; }
        return new TileColumn(index, name, type, max, notNull, defaultValue, false, autoincrement);
    };
    TileColumn.COLUMN_ID = 'id';
    TileColumn.COLUMN_ZOOM_LEVEL = 'zoom_level';
    TileColumn.COLUMN_TILE_COLUMN = 'tile_column';
    TileColumn.COLUMN_TILE_ROW = 'tile_row';
    TileColumn.COLUMN_TILE_DATA = 'tile_data';
    return TileColumn;
}(userColumn_1.UserColumn));
exports.TileColumn = TileColumn;
//# sourceMappingURL=tileColumn.js.map