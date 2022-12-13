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
exports.TileColumns = void 0;
var geoPackageDataType_1 = require("../../db/geoPackageDataType");
var userColumns_1 = require("../../user/userColumns");
/**
 * `TileColumn` models columns in [user tile pyramid tables]{@link module:tiles/user/tileTable~TileTable}.
 *
 * @class
 * @extends UserColumn
 */
var TileColumns = /** @class */ (function (_super) {
    __extends(TileColumns, _super);
    /**
     * Constructor
     * @param tableName table name
     * @param columns columns
     * @param custom custom column specification
     */
    function TileColumns(tableName, columns, custom) {
        var _this = _super.call(this, tableName, columns, custom) || this;
        /**
         * Zoom level column index
         */
        _this.zoomLevelIndex = -1;
        /**
         * Tile column column index
         */
        _this.tileColumnIndex = -1;
        /**
         * Tile row column index
         */
        _this.tileRowIndex = -1;
        /**
         * Tile data column index
         */
        _this.tileDataIndex = -1;
        _this.updateColumns();
        return _this;
    }
    /**
     * {@inheritDoc}
     */
    TileColumns.prototype.copy = function () {
        var tileColumns = new TileColumns(this._tableName, this._columns, this._custom);
        tileColumns.zoomLevelIndex = this.zoomLevelIndex;
        tileColumns.tileColumnIndex = this.tileColumnIndex;
        tileColumns.tileRowIndex = this.tileRowIndex;
        tileColumns.tileDataIndex = this.tileDataIndex;
        return tileColumns;
    };
    /**
     * {@inheritDoc}
     */
    TileColumns.prototype.updateColumns = function () {
        _super.prototype.updateColumns.call(this);
        // Find the required columns
        var zoomLevel = this.getColumnIndex(TileColumns.ZOOM_LEVEL, false);
        if (!this.isCustom()) {
            this.missingCheck(zoomLevel, TileColumns.ZOOM_LEVEL);
        }
        if (zoomLevel !== null) {
            this.typeCheck(geoPackageDataType_1.GeoPackageDataType.INTEGER, this.getColumnForIndex(zoomLevel));
            this.zoomLevelIndex = zoomLevel;
        }
        var tileColumn = this.getColumnIndex(TileColumns.TILE_COLUMN, false);
        if (!this.isCustom()) {
            this.missingCheck(tileColumn, TileColumns.TILE_COLUMN);
        }
        if (tileColumn != null) {
            this.typeCheck(geoPackageDataType_1.GeoPackageDataType.INTEGER, this.getColumnForIndex(tileColumn));
            this.tileColumnIndex = tileColumn;
        }
        var tileRow = this.getColumnIndex(TileColumns.TILE_ROW, false);
        if (!this.isCustom()) {
            this.missingCheck(tileRow, TileColumns.TILE_ROW);
        }
        if (tileRow != null) {
            this.typeCheck(geoPackageDataType_1.GeoPackageDataType.INTEGER, this.getColumnForIndex(tileRow));
            this.tileRowIndex = tileRow;
        }
        var tileData = this.getColumnIndex(TileColumns.TILE_DATA, false);
        if (!this.isCustom()) {
            this.missingCheck(tileData, TileColumns.TILE_DATA);
        }
        if (tileData != null) {
            this.typeCheck(geoPackageDataType_1.GeoPackageDataType.BLOB, this.getColumnForIndex(tileData));
            this.tileDataIndex = tileData;
        }
    };
    /**
     * Get the zoom level index
     * @return zoom level index
     */
    TileColumns.prototype.getZoomLevelIndex = function () {
        return this.zoomLevelIndex;
    };
    /**
     * Set the zoom level index
     * @param zoomLevelIndex zoom level index
     */
    TileColumns.prototype.setZoomLevelIndex = function (zoomLevelIndex) {
        this.zoomLevelIndex = zoomLevelIndex;
    };
    /**
     * Check if has a zoom level column
     * @return true if has a zoom level column
     */
    TileColumns.prototype.hasZoomLevelColumn = function () {
        return this.zoomLevelIndex >= 0;
    };
    /**
     * Get the zoom level column
     * @return zoom level column
     */
    TileColumns.prototype.getZoomLevelColumn = function () {
        var column = null;
        if (this.hasZoomLevelColumn()) {
            column = this.getColumnForIndex(this.zoomLevelIndex);
        }
        return column;
    };
    /**
     * Get the tile column index
     * @return tile column index
     */
    TileColumns.prototype.getTileColumnIndex = function () {
        return this.tileColumnIndex;
    };
    /**
     * Set the tile column index
     *
     * @param tileColumnIndex
     *            tile column index
     */
    TileColumns.prototype.setTileColumnIndex = function (tileColumnIndex) {
        this.tileColumnIndex = tileColumnIndex;
    };
    /**
     * Check if has a tile column column
     * @return true if has a tile column column
     */
    TileColumns.prototype.hasTileColumnColumn = function () {
        return this.tileColumnIndex >= 0;
    };
    /**
     * Get the tile column column
     * @return tile column column
     */
    TileColumns.prototype.getTileColumnColumn = function () {
        var column = null;
        if (this.hasTileColumnColumn()) {
            column = this.getColumnForIndex(this.tileColumnIndex);
        }
        return column;
    };
    /**
     * Get the tile row index
     * @return tile row index
     */
    TileColumns.prototype.getTileRowIndex = function () {
        return this.tileRowIndex;
    };
    /**
     * Set the tile row index
     * @param tileRowIndex tile row index
     */
    TileColumns.prototype.setTileRowIndex = function (tileRowIndex) {
        this.tileRowIndex = tileRowIndex;
    };
    /**
     * Check if has a tile row column
     * @return true if has a tile row column
     */
    TileColumns.prototype.hasTileRowColumn = function () {
        return this.tileRowIndex >= 0;
    };
    /**
     * Get the tile row column
     * @return tile row column
     */
    TileColumns.prototype.getTileRowColumn = function () {
        var column = null;
        if (this.hasTileRowColumn()) {
            column = this.getColumnForIndex(this.tileRowIndex);
        }
        return column;
    };
    /**
     * Get the tile data index
     * @return tile data index
     */
    TileColumns.prototype.getTileDataIndex = function () {
        return this.tileDataIndex;
    };
    /**
     * Set the tile data index
     * @param tileDataIndex tile data index
     */
    TileColumns.prototype.setTileDataIndex = function (tileDataIndex) {
        this.tileDataIndex = tileDataIndex;
    };
    /**
     * Check if has a tile data column
     * @return true if has a tile data column
     */
    TileColumns.prototype.hasTileDataColumn = function () {
        return this.tileDataIndex >= 0;
    };
    /**
     * Get the tile data column
     *
     * @return tile data column
     */
    TileColumns.prototype.getTileDataColumn = function () {
        var column = null;
        if (this.hasTileDataColumn()) {
            column = this.getColumnForIndex(this.tileDataIndex);
        }
        return column;
    };
    /**
     * Id column name, Requirement 52
     */
    TileColumns.ID = 'id';
    /**
     * Zoom level column name, Requirement 53
     */
    TileColumns.ZOOM_LEVEL = 'zoom_level';
    /**
     * Tile column column name, Requirement 54
     */
    TileColumns.TILE_COLUMN = 'tile_column';
    /**
     * Tile row column name, Requirement 55
     */
    TileColumns.TILE_ROW = 'tile_row';
    /**
     * Tile ID column name, implied requirement
     */
    TileColumns.TILE_DATA = 'tile_data';
    return TileColumns;
}(userColumns_1.UserColumns));
exports.TileColumns = TileColumns;
//# sourceMappingURL=tileColumns.js.map