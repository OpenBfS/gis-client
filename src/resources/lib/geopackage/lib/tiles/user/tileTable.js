"use strict";
/**
 * @module tiles/user/tileTable
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
exports.TileTable = void 0;
var userTable_1 = require("../../user/userTable");
var tileColumn_1 = require("./tileColumn");
var tileColumns_1 = require("./tileColumns");
var uniqueConstraint_1 = require("../../db/table/uniqueConstraint");
var contentsDataType_1 = require("../../core/contents/contentsDataType");
/**
 * `TileTable` models [tile pyramid user tables](https://www.geopackage.org/spec121/index.html#tiles_user_tables).
 *
 * @class
 * @param {string} tableName
 * @param {module:tiles/user/tileColumn~TileColumn[]} columns
 */
var TileTable = /** @class */ (function (_super) {
    __extends(TileTable, _super);
    /**
     * Constructor
     * @param tableName  table name
     * @param columns columns
     */
    function TileTable(tableName, columns) {
        var _this = _super.call(this, new tileColumns_1.TileColumns(tableName, columns, false)) || this;
        // Build a unique constraint on zoom level, tile column, and tile data
        var uniqueConstraint = new uniqueConstraint_1.UniqueConstraint();
        uniqueConstraint.add(_this.getUserColumns().getZoomLevelColumn());
        uniqueConstraint.add(_this.getUserColumns().getTileColumnColumn());
        uniqueConstraint.add(_this.getUserColumns().getTileRowColumn());
        // Add the unique constraint
        _this.addConstraint(uniqueConstraint);
        return _this;
    }
    /**
     * {@inheritDoc}
     */
    TileTable.prototype.copy = function () {
        return new TileTable(this.getTableName(), this.columns._columns);
    };
    /**
     * {@inheritDoc}
     */
    TileTable.prototype.getDataType = function () {
        return contentsDataType_1.ContentsDataType.TILES;
    };
    /**
     * {@inheritDoc}
     */
    TileTable.prototype.getUserColumns = function () {
        return _super.prototype.getUserColumns.call(this);
    };
    /**
     * {@inheritDoc}
     */
    TileTable.prototype.createUserColumns = function (columns) {
        return new tileColumns_1.TileColumns(this.getTableName(), columns, true);
    };
    /**
     * Get the zoom level column index
     * @return zoom level index
     */
    TileTable.prototype.getZoomLevelColumnIndex = function () {
        return this.getUserColumns().getZoomLevelIndex();
    };
    /**
     * Get the zoom level column
     * @return tile column
     */
    TileTable.prototype.getZoomLevelColumn = function () {
        return this.getUserColumns().getZoomLevelColumn();
    };
    /**
     * Get the tile column column index
     * @return tile column index
     */
    TileTable.prototype.getTileColumnColumnIndex = function () {
        return this.getUserColumns().getTileColumnIndex();
    };
    /**
     * Get the tile column column
     * @return tile column
     */
    TileTable.prototype.getTileColumnColumn = function () {
        return this.getUserColumns().getTileColumnColumn();
    };
    /**
     * Get the tile row column index
     * @return tile row index
     */
    TileTable.prototype.getTileRowColumnIndex = function () {
        return this.getUserColumns().getTileRowIndex();
    };
    /**
     * Get the tile row column
     * @return tile column
     */
    TileTable.prototype.getTileRowColumn = function () {
        return this.getUserColumns().getTileRowColumn();
    };
    /**
     * Get the tile data column index
     * @return tile data index
     */
    TileTable.prototype.getTileDataColumnIndex = function () {
        return this.getUserColumns().getTileDataIndex();
    };
    /**
     * Get the tile data column
     * @return tile column
     */
    TileTable.prototype.getTileDataColumn = function () {
        return this.getUserColumns().getTileDataColumn();
    };
    /**
     * Create the required table columns, starting at the provided index
     * @param startingIndex starting index
     * @return tile columns
     */
    TileTable.createRequiredColumns = function (startingIndex) {
        if (startingIndex === void 0) { startingIndex = 0; }
        var columns = [];
        columns.push(tileColumn_1.TileColumn.createIdColumn(startingIndex++));
        columns.push(tileColumn_1.TileColumn.createZoomLevelColumn(startingIndex++));
        columns.push(tileColumn_1.TileColumn.createTileColumnColumn(startingIndex++));
        columns.push(tileColumn_1.TileColumn.createTileRowColumn(startingIndex++));
        columns.push(tileColumn_1.TileColumn.createTileDataColumn(startingIndex));
        return columns;
    };
    /**
     * {@inheritDoc}
     */
    TileTable.prototype.validateContents = function (contents) {
        // Verify the Contents have a tiles data type
        var dataType = contents.data_type;
        if (dataType === null || dataType === undefined || dataType !== contentsDataType_1.ContentsDataType.TILES) {
            throw new Error('The Contents of a TileTable must have a data type of tiles');
        }
    };
    /**
     * Id column name, Requirement 52
     */
    TileTable.COLUMN_ID = tileColumns_1.TileColumns.ID;
    /**
     * Zoom level column name, Requirement 53
     */
    TileTable.COLUMN_ZOOM_LEVEL = tileColumns_1.TileColumns.ZOOM_LEVEL;
    /**
     * Tile column column name, Requirement 54
     */
    TileTable.COLUMN_TILE_COLUMN = tileColumns_1.TileColumns.TILE_COLUMN;
    /**
     * Tile row column name, Requirement 55
     */
    TileTable.COLUMN_TILE_ROW = tileColumns_1.TileColumns.TILE_ROW;
    /**
     * Tile ID column name, implied requirement
     */
    TileTable.COLUMN_TILE_DATA = tileColumns_1.TileColumns.TILE_DATA;
    return TileTable;
}(userTable_1.UserTable));
exports.TileTable = TileTable;
//# sourceMappingURL=tileTable.js.map